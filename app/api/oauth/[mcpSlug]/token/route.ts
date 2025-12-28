import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getMCPBySlug } from '@/app/admin/mcps/mcp-actions';
import { generateAccessToken, verifyPKCE } from '@/lib/oauth/token';
import { OAuthToken } from '@/lib/types/oauth';
import { getBaseUrl } from '@/lib/utils/url';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ mcpSlug: string }> }
) {
  const startTime = Date.now();
  
  let mcpSlug: string | undefined;
  try {
    const resolvedParams = await params;
    mcpSlug = resolvedParams.mcpSlug;
    
    const body = await request.formData();
    
    const grantType = body.get('grant_type');
    const code = body.get('code');
    const redirectUri = body.get('redirect_uri');
    const clientId = body.get('client_id');
    const codeVerifier = body.get('code_verifier');
    const refreshToken = body.get('refresh_token');
    const resource = body.get('resource');
    
    // Get MCP
    const mcp = await getMCPBySlug(mcpSlug);
    if (!mcp) {
      return NextResponse.json(
        { error: 'invalid_resource', error_description: 'MCP not found' },
        { status: 404 }
      );
    }
    
    if (grantType === 'authorization_code') {
      // Validate required parameters
      const missingParams = [];
      if (!code) missingParams.push('code');
      if (!redirectUri) missingParams.push('redirect_uri');
      if (!clientId) missingParams.push('client_id');
      if (!codeVerifier) missingParams.push('code_verifier');
      
      if (missingParams.length > 0) {
        return NextResponse.json(
          { 
            error: 'invalid_request', 
            error_description: `Missing required parameters: ${missingParams.join(', ')}` 
          },
          { status: 400 }
        );
      }
      
      // Get authorization code from database
      // Use service role client to bypass RLS (authorization codes are temporary and validated by code itself)
      // This is required because token exchange is a public endpoint without user authentication
      const { createServiceRoleClient } = await import('@/lib/supabase/api');
      let supabase;
      try {
        supabase = createServiceRoleClient();
      } catch (error) {
        // Service role client is required for token exchange
        return NextResponse.json(
          { 
            error: 'server_error', 
            error_description: `OAuth token exchange requires SUPABASE_SERVICE_ROLE_KEY environment variable. ` +
              `This is needed because token exchange is a public endpoint that must bypass RLS. ` +
              `Error: ${error instanceof Error ? error.message : String(error)}`
          },
          { status: 500 }
        );
      }
      
      // Try to find the code (with retry for eventual consistency)
      let authCode = null;
      let codeError = null;
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts && !authCode) {
        const { data, error } = await supabase
          .from('oauth_authorization_codes')
          .select('*')
          .eq('code', code as string)
          .maybeSingle();
        
        if (data) {
          authCode = data;
          break;
        }
        
        codeError = error;
        attempts++;
        
        // If not found and not the last attempt, wait a bit (for eventual consistency)
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 100 * attempts));
        }
      }
        
      if (codeError || !authCode) {
        // Also check if code exists but is used/expired (using service role to bypass RLS)
        const { data: anyCode } = await supabase
          .from('oauth_authorization_codes')
          .select('used_at, expires_at, user_id, mcp_id, created_at')
          .eq('code', code as string)
          .maybeSingle();
        
        if (anyCode) {
          if (anyCode.used_at) {
            return NextResponse.json(
              { error: 'invalid_grant', error_description: 'Authorization code has already been used' },
              { status: 400 }
            );
          }
          if (new Date(anyCode.expires_at) < new Date()) {
            return NextResponse.json(
              { error: 'invalid_grant', error_description: 'Authorization code has expired' },
              { status: 400 }
            );
          }
        }
        
        return NextResponse.json(
          { error: 'invalid_grant', error_description: `Invalid or expired authorization code. ${codeError ? `Error: ${codeError.message}` : 'Code not found in database.'} Please try authorizing again.` },
          { status: 400 }
        );
      }
      
      // Check if already used
      if (authCode.used_at) {
        return NextResponse.json(
          { error: 'invalid_grant', error_description: 'Authorization code has already been used' },
          { status: 400 }
        );
      }
      
      // Check expiration
      if (new Date(authCode.expires_at) < new Date()) {
        return NextResponse.json(
          { error: 'invalid_grant', error_description: 'Authorization code expired' },
          { status: 400 }
        );
      }
      
      // Verify PKCE
      const pkceValid = verifyPKCE(codeVerifier as string, authCode.code_challenge);
      
      if (!pkceValid) {
        return NextResponse.json(
          { error: 'invalid_grant', error_description: 'Invalid code verifier (PKCE verification failed)' },
          { status: 400 }
        );
      }
      
      // Verify redirect URI matches (allow trailing slash differences)
      const normalizedAuthRedirect = authCode.redirect_uri.replace(/\/$/, '');
      const normalizedRequestRedirect = (redirectUri as string).replace(/\/$/, '');
      if (normalizedAuthRedirect !== normalizedRequestRedirect) {
        return NextResponse.json(
          { error: 'invalid_grant', error_description: `Redirect URI mismatch. Expected: ${authCode.redirect_uri}, Got: ${redirectUri}` },
          { status: 400 }
        );
      }
      
      // Verify client ID matches
      if (authCode.client_id !== clientId) {
        return NextResponse.json(
          { error: 'invalid_client', error_description: `Client ID mismatch. Expected: ${authCode.client_id}, Got: ${clientId}` },
          { status: 400 }
        );
      }
      
      // Mark code as used atomically using UPDATE with WHERE clause
      // This ensures only one request can mark it as used
      const now = new Date().toISOString();
      const { data: updateResult, error: updateError } = await supabase
        .from('oauth_authorization_codes')
        .update({ used_at: now })
        .eq('code', code)
        .is('used_at', null) // Only update if not already used
        .select('id, used_at')
        .maybeSingle();
      
      if (updateError) {
        return NextResponse.json(
          { error: 'server_error', error_description: 'Failed to process authorization code' },
          { status: 500 }
        );
      }
      
      // If updateResult is null, the code was already used by another request
      if (!updateResult || !updateResult.used_at) {
        // Re-fetch to get the actual used_at timestamp
        const { data: recheckCode } = await supabase
          .from('oauth_authorization_codes')
          .select('used_at')
          .eq('code', code)
          .single();
        
        if (recheckCode?.used_at) {
          return NextResponse.json(
            { error: 'invalid_grant', error_description: 'Authorization code has already been used' },
            { status: 400 }
          );
        }
        
        // This shouldn't happen, but handle it
        return NextResponse.json(
          { error: 'invalid_grant', error_description: 'Authorization code is invalid or already used' },
          { status: 400 }
        );
      }
      
      // Generate access token
      const scopes = authCode.scope.split(' ');
      
      let tokenData;
      try {
        tokenData = await generateAccessToken(
          mcp.id,
          authCode.user_id,
          scopes,
          clientId as string
        );
      } catch (error) {
        return NextResponse.json(
          { 
            error: 'server_error', 
            error_description: `Failed to generate token: ${error instanceof Error ? error.message : String(error)}` 
          },
          { status: 500 }
        );
      }
      
      const response: OAuthToken = {
        access_token: tokenData.access_token,
        token_type: 'Bearer',
        expires_in: tokenData.expires_in,
        refresh_token: tokenData.refresh_token,
        scope: authCode.scope,
      };
      
      return NextResponse.json(response, {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
          'Pragma': 'no-cache',
        },
      });
    } else if (grantType === 'refresh_token') {
      // Handle refresh token flow
      if (!refreshToken) {
        return NextResponse.json(
          { error: 'invalid_request', error_description: 'Missing refresh_token' },
          { status: 400 }
        );
      }
      
      try {
        // Use service role client to bypass RLS for token lookup
        // This is required because token refresh is a public endpoint without user authentication
        const { createServiceRoleClient } = await import('@/lib/supabase/api');
        let supabase;
        try {
          supabase = createServiceRoleClient();
        } catch (error) {
          // Service role client is required for token refresh
          return NextResponse.json(
            { 
              error: 'server_error', 
              error_description: `OAuth token refresh requires SUPABASE_SERVICE_ROLE_KEY environment variable. ` +
                `This is needed because token refresh is a public endpoint that must bypass RLS. ` +
                `Error: ${error instanceof Error ? error.message : String(error)}`
            },
            { status: 500 }
          );
        }
        
        // Find token by refresh token
        const refreshTokenStr = refreshToken as string;
        
        // First, try to find the token by refresh_token
        // Also check for revoked tokens to provide better error messages
        const { data: tokenData, error: tokenError } = await supabase
          .from('oauth_tokens')
          .select('mcp_id, user_id, scopes, client_id, revoked_at, access_token, refresh_token, expires_at, created_at')
          .eq('refresh_token', refreshTokenStr)
          .maybeSingle();
        
        // If not found, also check if it exists but is revoked
        if (!tokenData && !tokenError) {
          const { data: revokedData } = await supabase
            .from('oauth_tokens')
            .select('id, revoked_at, created_at, mcp_id')
            .eq('refresh_token', refreshTokenStr)
            .maybeSingle();
          
          if (revokedData) {
            return NextResponse.json(
              { error: 'invalid_grant', error_description: 'Refresh token has been revoked. Please obtain a new token by re-authorizing.' },
              { status: 400 }
            );
          }
        }
        
        if (tokenError) {
          return NextResponse.json(
            { error: 'invalid_grant', error_description: `Invalid refresh token: ${tokenError.message}` },
            { status: 400 }
          );
        }
        
        if (!tokenData) {
          // Check if token exists but is revoked (including revoked tokens)
          const { data: revokedToken } = await supabase
            .from('oauth_tokens')
            .select('id, revoked_at, created_at, mcp_id')
            .eq('refresh_token', refreshTokenStr)
            .maybeSingle();
          
          if (revokedToken) {
            return NextResponse.json(
              { error: 'invalid_grant', error_description: 'Refresh token has been revoked. Please obtain a new token by re-authorizing.' },
              { status: 400 }
            );
          }
          
          return NextResponse.json(
            { 
              error: 'invalid_grant', 
              error_description: 'Invalid refresh token: Token not found in database. The refresh token may have expired, been revoked, or never existed. Please obtain a new token by re-authorizing.',
            },
            { status: 400 }
          );
        }
        
        // Verify MCP matches
        if (tokenData.mcp_id !== mcp.id) {
          return NextResponse.json(
            { error: 'invalid_grant', error_description: 'Refresh token MCP mismatch' },
            { status: 400 }
          );
        }
        
        // Check if token is revoked
        if (tokenData.revoked_at) {
          return NextResponse.json(
            { error: 'invalid_grant', error_description: 'Refresh token revoked' },
            { status: 400 }
          );
        }
        
        // Revoke old access token (mark as revoked)
        const now = new Date().toISOString();
        if (tokenData.access_token) {
          const { error: revokeError } = await supabase
            .from('oauth_tokens')
            .update({ revoked_at: now })
            .eq('access_token', tokenData.access_token);
          
          if (revokeError) {
            // Continue anyway - we'll still issue a new token
          }
        }
        
        // Generate new access token (this will create a new entry in oauth_tokens)
        const newTokenData = await generateAccessToken(
          mcp.id,
          tokenData.user_id,
          tokenData.scopes || [],
          tokenData.client_id || undefined
        );
        
        // Also revoke the old refresh token (token rotation)
        await supabase
          .from('oauth_tokens')
          .update({ revoked_at: now })
          .eq('refresh_token', refreshToken as string);
        
        const response: OAuthToken = {
          access_token: newTokenData.access_token,
          token_type: 'Bearer',
          expires_in: newTokenData.expires_in,
          refresh_token: newTokenData.refresh_token, // Return new refresh token (rotate)
          scope: (tokenData.scopes || []).join(' '),
        };
        
        return NextResponse.json(response, {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store',
            'Pragma': 'no-cache',
          },
        });
      } catch (error) {
        return NextResponse.json(
          { 
            error: 'server_error', 
            error_description: `Failed to refresh token: ${error instanceof Error ? error.message : String(error)}` 
          },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'unsupported_grant_type', error_description: 'Only authorization_code and refresh_token are supported' },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'server_error', 
        error_description: `An error occurred during token exchange: ${error instanceof Error ? error.message : String(error)}` 
      },
      { status: 500 }
    );
  }
}
