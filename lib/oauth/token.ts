import jwt from 'jsonwebtoken';
import { createHash, randomBytes } from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { createServiceRoleClient } from '@/lib/supabase/api';

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXT_PUBLIC_JWT_SECRET || 'change-me-in-production-use-strong-secret';
const TOKEN_EXPIRY = 3600; // 1 hour
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 3600; // 7 days

/**
 * Generate PKCE code verifier and challenge
 */
export function generatePKCE(): { codeVerifier: string; codeChallenge: string; codeChallengeMethod: 'S256' } {
  const codeVerifier = randomBytes(32).toString('base64url');
  const codeChallenge = createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');
  
  return {
    codeVerifier,
    codeChallenge,
    codeChallengeMethod: 'S256',
  };
}

/**
 * Verify PKCE code verifier against challenge
 */
export function verifyPKCE(codeVerifier: string, codeChallenge: string): boolean {
  const computedChallenge = createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');
  
  return computedChallenge === codeChallenge;
}

/**
 * Generate access token
 */
export async function generateAccessToken(
  mcpId: string,
  userId: string,
  scopes: string[],
  clientId?: string
): Promise<{ access_token: string; expires_in: number; refresh_token?: string }> {
  const now = Math.floor(Date.now() / 1000);
  const expiresIn = TOKEN_EXPIRY;
  
  const token = jwt.sign(
    {
      sub: userId,
      aud: mcpId, // Audience is the MCP ID
      scope: scopes.join(' '),
      client_id: clientId,
      iat: now,
      exp: now + expiresIn,
    },
    JWT_SECRET,
    { algorithm: 'HS256' }
  );
  
  // Generate refresh token
  const refreshToken = randomBytes(32).toString('base64url');
  
  // Store tokens in database
  // Use service role client to bypass RLS (tokens are validated by the token itself)
  // This is required because token exchange is a public endpoint without user authentication
  let supabase;
  try {
    supabase = createServiceRoleClient();
  } catch (error) {
    // Service role client is required for token operations
    // This endpoint is public and doesn't have an authenticated user session
    throw new Error(
      `OAuth token generation requires SUPABASE_SERVICE_ROLE_KEY environment variable. ` +
      `This is needed because token exchange is a public endpoint that must bypass RLS. ` +
      `Error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
  
  const expiresAt = new Date((now + expiresIn) * 1000).toISOString();
  const refreshExpiresAt = new Date((now + REFRESH_TOKEN_EXPIRY) * 1000).toISOString();
  
  const { error: insertError } = await supabase.from('oauth_tokens').insert({
    mcp_id: mcpId,
    user_id: userId,
    access_token: token,
    refresh_token: refreshToken,
    token_type: 'Bearer',
    expires_at: expiresAt,
    scopes,
    client_id: clientId,
  });
  
  if (insertError) {
    throw new Error(`Failed to store tokens: ${insertError.message} (code: ${insertError.code})`);
  }
  
  return {
    access_token: token,
    expires_in: expiresIn,
    refresh_token: refreshToken,
  };
}

/**
 * Validate access token
 */
export async function validateAccessToken(
  token: string,
  mcpId: string
): Promise<{ valid: boolean; userId?: string; scopes?: string[]; error?: string; hasRefreshToken?: boolean }> {
  try {
    // Verify JWT
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Check audience matches MCP
    if (decoded.aud !== mcpId) {
      return { valid: false, error: 'Token audience mismatch' };
    }
    
    // Check token in database (for revocation)
    // Use service role client to bypass RLS (token validation is done by the token itself, not user session)
    let supabase;
    try {
      supabase = createServiceRoleClient();
    } catch (error) {
      // Fall back to regular client, but this may fail if there's no authenticated user
      // (e.g., when validating tokens from public endpoints)
      supabase = await createClient();
    }
    
    const { data } = await supabase
      .from('oauth_tokens')
      .select('user_id, scopes, revoked_at, expires_at, refresh_token')
      .eq('access_token', token)
      .maybeSingle();
      
    if (!data) {
      return { valid: false, error: 'Token not found' };
    }
    
    if (data.revoked_at) {
      return { valid: false, error: 'Token revoked' };
    }
    
    if (new Date(data.expires_at) < new Date()) {
      return { 
        valid: false, 
        error: 'Token expired',
        hasRefreshToken: !!data.refresh_token 
      };
    }
    
    return {
      valid: true,
      userId: decoded.sub,
      scopes: decoded.scope?.split(' ') || data.scopes || [],
    };
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      // Try to check if refresh token exists for this expired token
      try {
        const supabase = createServiceRoleClient();
        const { data } = await supabase
          .from('oauth_tokens')
          .select('refresh_token')
          .eq('access_token', token)
          .maybeSingle();
        return { 
          valid: false, 
          error: 'Token expired',
          hasRefreshToken: !!data?.refresh_token 
        };
      } catch {
        return { valid: false, error: 'Token expired' };
      }
    }
    if (error.name === 'JsonWebTokenError') {
      return { valid: false, error: 'Invalid token' };
    }
    return { valid: false, error: error.message || 'Token validation failed' };
  }
}

/**
 * Revoke access token
 */
export async function revokeAccessToken(token: string): Promise<void> {
  // Use service role client to bypass RLS (token revocation may be called from public endpoints)
  let supabase;
  try {
    supabase = createServiceRoleClient();
  } catch (error) {
    // Fall back to regular client if service role not available
    supabase = await createClient();
  }
  
  const { error } = await supabase
    .from('oauth_tokens')
    .update({ revoked_at: new Date().toISOString() })
    .eq('access_token', token);
    
  if (error) {
    throw new Error(`Failed to revoke token: ${error.message}`);
  }
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(
  refreshToken: string,
  mcpId: string
): Promise<{ access_token: string; expires_in: number }> {
  const supabase = await createClient();
  
  // Find token by refresh token
  const { data, error } = await supabase
    .from('oauth_tokens')
    .select('mcp_id, user_id, scopes, client_id, revoked_at, access_token')
    .eq('refresh_token', refreshToken)
    .maybeSingle();
    
  if (error || !data) {
    throw new Error('Invalid refresh token');
  }
  
  if (data.revoked_at) {
    throw new Error('Refresh token revoked');
  }
  
  if (data.mcp_id !== mcpId) {
    throw new Error('Refresh token MCP mismatch');
  }
  
  // Revoke old token
  await revokeAccessToken(data.access_token || '');
  
  // Generate new token
  return await generateAccessToken(
    data.mcp_id,
    data.user_id,
    data.scopes || [],
    data.client_id || undefined
  );
}
