import { NextRequest, NextResponse } from 'next/server';

/**
 * Catch-all route for /.well-known/*
 * Handles OAuth discovery requests that clients construct incorrectly
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const pathString = path.join('/');
    const url = new URL(request.url);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || url.origin;
    
    // Handle patterns like:
    // /.well-known/oauth-protected-resource/api/mcp/pepe
    // /.well-known/oauth-authorization-server/api/mcp/pepe
    // /.well-known/openid-configuration/api/mcp/pepe
    
    const mcpSlugMatch = pathString.match(/api\/mcp\/([^\/]+)/);
    if (mcpSlugMatch && mcpSlugMatch[1]) {
      const mcpSlug = mcpSlugMatch[1];
      
      if (pathString.includes('oauth-protected-resource')) {
        return NextResponse.redirect(
          `${baseUrl}/api/oauth/${mcpSlug}/.well-known/oauth-protected-resource`,
          307
        );
      } else if (pathString.includes('oauth-authorization-server')) {
        return NextResponse.redirect(
          `${baseUrl}/api/oauth/${mcpSlug}/.well-known/oauth-authorization-server`,
          307
        );
      } else if (pathString.includes('openid-configuration')) {
        return NextResponse.redirect(
          `${baseUrl}/api/oauth/${mcpSlug}/.well-known/openid-configuration`,
          307
        );
      }
    }
    
    // If no match, return 404 with helpful message
    return NextResponse.json(
      {
        error: 'Not found',
        message: 'OAuth discovery endpoint not found. Use /api/oauth/[mcpSlug]/.well-known/[type]',
        attemptedPath: `/.well-known/${pathString}`,
      },
      { status: 404 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
