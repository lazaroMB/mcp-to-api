import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceRoleClient } from '@/lib/supabase/api';
import { getMCPBySlug } from '@/app/admin/mcps/mcp-actions';

/**
 * Debug endpoint to check stored tokens
 * GET /api/debug/tokens/[mcpSlug]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ mcpSlug: string }> }
) {
  try {
    const { mcpSlug } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Get MCP
    const mcp = await getMCPBySlug(mcpSlug);
    if (!mcp) {
      return NextResponse.json(
        { error: 'MCP not found' },
        { status: 404 }
      );
    }
    
    // Use service role to see all tokens
    const supabaseService = createServiceRoleClient();
    
    // Get all tokens for this user and MCP
    const { data: userTokens, error: userTokensError } = await supabaseService
      .from('oauth_tokens')
      .select('*')
      .eq('mcp_id', mcp.id)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);
    
    // Also check for the specific refresh token being looked up
    const refreshTokenToCheck = request.nextUrl.searchParams.get('refresh_token');
    let refreshTokenCheck = null;
    if (refreshTokenToCheck) {
      const { data: refreshTokenData, error: refreshTokenError } = await supabaseService
        .from('oauth_tokens')
        .select('*')
        .eq('refresh_token', refreshTokenToCheck)
        .maybeSingle();
      refreshTokenCheck = {
        found: !!refreshTokenData,
        error: refreshTokenError?.message,
        data: refreshTokenData ? {
          id: refreshTokenData.id,
          mcp_id: refreshTokenData.mcp_id,
          user_id: refreshTokenData.user_id,
          hasRefreshToken: !!refreshTokenData.refresh_token,
          refreshTokenPrefix: refreshTokenData.refresh_token?.substring(0, 20) + '...',
          revokedAt: refreshTokenData.revoked_at,
          expiresAt: refreshTokenData.expires_at,
          createdAt: refreshTokenData.created_at,
        } : null,
      };
    }
    
    // Get all tokens for this MCP (if user is owner)
    let allTokens = null;
    if (mcp.user_id === user.id) {
      const { data: allTokensData } = await supabaseService
        .from('oauth_tokens')
        .select('*')
        .eq('mcp_id', mcp.id)
        .order('created_at', { ascending: false })
        .limit(20);
      allTokens = allTokensData;
    }
    
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
      },
      mcp: {
        id: mcp.id,
        slug: mcp.slug,
        name: mcp.name,
      },
      userTokens: userTokens?.map(t => ({
        id: t.id,
        hasAccessToken: !!t.access_token,
        accessTokenPrefix: t.access_token?.substring(0, 20) + '...',
        hasRefreshToken: !!t.refresh_token,
        refreshTokenPrefix: t.refresh_token?.substring(0, 20) + '...',
        expiresAt: t.expires_at,
        revokedAt: t.revoked_at,
        createdAt: t.created_at,
        scopes: t.scopes,
      })) || [],
      allTokens: allTokens?.map(t => ({
        id: t.id,
        userId: t.user_id,
        hasAccessToken: !!t.access_token,
        hasRefreshToken: !!t.refresh_token,
        refreshTokenPrefix: t.refresh_token?.substring(0, 20) + '...',
        expiresAt: t.expires_at,
        revokedAt: t.revoked_at,
        createdAt: t.created_at,
      })) || null,
      userTokensError: userTokensError?.message || null,
      isOwner: mcp.user_id === user.id,
      refreshTokenCheck: refreshTokenCheck,
      note: refreshTokenToCheck 
        ? `Checked for refresh token: ${refreshTokenToCheck.substring(0, 20)}...`
        : 'Add ?refresh_token=YOUR_TOKEN to check a specific refresh token',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
