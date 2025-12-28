import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validateAccessToken } from '@/lib/oauth/token';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ mcpSlug: string }> }
) {
  try {
    const { mcpSlug } = await params;
    const body = await request.formData();
    
    const token = body.get('token') as string;
    const clientId = body.get('client_id') as string;
    const clientSecret = body.get('client_secret') as string;
    
    if (!token) {
      return NextResponse.json(
        { error: 'invalid_request', error_description: 'Missing token parameter' },
        { status: 400 }
      );
    }
    
    // Get MCP to validate against
    const { getMCPBySlug } = await import('@/app/admin/mcps/mcp-actions');
    const mcp = await getMCPBySlug(mcpSlug);
    
    if (!mcp) {
      return NextResponse.json(
        { error: 'invalid_resource', error_description: 'MCP not found' },
        { status: 404 }
      );
    }
    
    // Validate token
    const validation = await validateAccessToken(token, mcp.id);
    
    if (!validation.valid) {
      return NextResponse.json({
        active: false,
      });
    }
    
    // Get token details from database
    // Use service role client to bypass RLS (token introspection is a public endpoint)
    const { createServiceRoleClient } = await import('@/lib/supabase/api');
    let supabase;
    try {
      supabase = createServiceRoleClient();
    } catch (error) {
      // Fall back to regular client if service role not available
      supabase = await createClient();
    }
    
    const { data: tokenData } = await supabase
      .from('oauth_tokens')
      .select('user_id, scopes, expires_at, client_id')
      .eq('access_token', token)
      .maybeSingle();
    
    if (!tokenData) {
      return NextResponse.json({
        active: false,
      });
    }
    
    // Return introspection response (RFC 7662)
    return NextResponse.json({
      active: true,
      scope: tokenData.scopes?.join(' ') || '',
      client_id: tokenData.client_id,
      sub: tokenData.user_id,
      exp: Math.floor(new Date(tokenData.expires_at).getTime() / 1000),
      aud: mcp.id,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'server_error', error_description: 'An error occurred during token introspection' },
      { status: 500 }
    );
  }
}
