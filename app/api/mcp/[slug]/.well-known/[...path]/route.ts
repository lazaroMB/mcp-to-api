import { NextRequest, NextResponse } from 'next/server';
import { getBaseUrl } from '@/lib/utils/url';

/**
 * Catch-all route for /api/mcp/[slug]/.well-known/*
 * Redirects to the correct OAuth endpoint
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; path?: string[] }> }
) {
  try {
    const { slug, path } = await params;
    const url = new URL(request.url);
    const baseUrl = getBaseUrl(request);
    
    // Determine the well-known type from the path
    // e.g., /api/mcp/pepe/.well-known/openid-configuration
    const pathString = path?.join('/') || '';
    
    if (pathString.includes('openid-configuration') || pathString === 'openid-configuration') {
      return NextResponse.redirect(
        `${baseUrl}/api/oauth/${slug}/.well-known/openid-configuration`,
        307
      );
    } else if (pathString.includes('oauth-protected-resource') || pathString === 'oauth-protected-resource') {
      return NextResponse.redirect(
        `${baseUrl}/api/oauth/${slug}/.well-known/oauth-protected-resource`,
        307
      );
    } else if (pathString.includes('oauth-authorization-server') || pathString === 'oauth-authorization-server') {
      return NextResponse.redirect(
        `${baseUrl}/api/oauth/${slug}/.well-known/oauth-authorization-server`,
        307
      );
    }
    
    // Default redirect to protected resource metadata
    return NextResponse.redirect(
      `${baseUrl}/api/oauth/${slug}/.well-known/oauth-protected-resource`,
      307
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
