import { NextRequest, NextResponse } from 'next/server';
import { getBaseUrl } from '@/lib/utils/url';

/**
 * Redirect route for /authorize
 * Extracts MCP slug from query parameters and redirects to the correct OAuth authorize endpoint
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    
    // Try to extract MCP slug from resource parameter
    // OAuth clients should include resource parameter like: resource=http://localhost:3000/api/mcp/pepe
    const resource = searchParams.get('resource');
    
    if (resource) {
      // Extract slug from resource URL
      // e.g., http://localhost:3000/api/mcp/pepe -> pepe
      const match = resource.match(/\/api\/mcp\/([^\/\?]+)/);
      if (match && match[1]) {
        const mcpSlug = match[1];
        const baseUrl = getBaseUrl(request);
        
        // Reconstruct the authorize URL with all query parameters
        const authorizeUrl = new URL(`${baseUrl}/api/oauth/${mcpSlug}/authorize`);
        searchParams.forEach((value, key) => {
          authorizeUrl.searchParams.set(key, value);
        });
        
        return NextResponse.redirect(authorizeUrl.toString(), 307);
      }
    }
    
    // If we can't determine the MCP slug, return an error
    return NextResponse.json(
      {
        error: 'invalid_request',
        error_description: 'Missing or invalid resource parameter. The resource parameter must be a valid MCP endpoint URL (e.g., http://localhost:3000/api/mcp/[slug])',
      },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
