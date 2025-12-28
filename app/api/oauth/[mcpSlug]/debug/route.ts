import { NextRequest, NextResponse } from 'next/server';
import { getMCPBySlug } from '@/app/admin/mcps/mcp-actions';
import { getAuthorizationServerMetadata, getProtectedResourceMetadata } from '@/lib/oauth/metadata';

/**
 * Debug endpoint to help troubleshoot OAuth flow
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ mcpSlug: string }> }
) {
  try {
    const { mcpSlug } = await params;
    const mcp = await getMCPBySlug(mcpSlug);
    
    if (!mcp) {
      return NextResponse.json({ error: 'MCP not found' }, { status: 404 });
    }
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
    const prm = await getProtectedResourceMetadata(mcpSlug);
    const asm = await getAuthorizationServerMetadata(mcpSlug);
    
    // Generate example PKCE values
    const { randomBytes, createHash } = await import('crypto');
    const codeVerifier = randomBytes(32).toString('base64url');
    const codeChallenge = createHash('sha256')
      .update(codeVerifier)
      .digest('base64url');
    
    const exampleState = randomBytes(16).toString('base64url');
    const exampleClientId = `${baseUrl}/api/oauth/${mcpSlug}/clients/example-client`;
    const exampleRedirectUri = 'http://localhost:3000/callback';
    
    const exampleAuthUrl = new URL(`${baseUrl}/api/oauth/${mcpSlug}/authorize`);
    exampleAuthUrl.searchParams.set('response_type', 'code');
    exampleAuthUrl.searchParams.set('client_id', exampleClientId);
    exampleAuthUrl.searchParams.set('redirect_uri', exampleRedirectUri);
    exampleAuthUrl.searchParams.set('scope', 'mcp:tools mcp:resources');
    exampleAuthUrl.searchParams.set('state', exampleState);
    exampleAuthUrl.searchParams.set('code_challenge', codeChallenge);
    exampleAuthUrl.searchParams.set('code_challenge_method', 'S256');
    exampleAuthUrl.searchParams.set('resource', `${baseUrl}/api/mcp/${mcpSlug}`);
    
    return NextResponse.json({
      mcp: {
        name: mcp.name,
        slug: mcpSlug,
        visibility: mcp.visibility,
      },
      endpoints: {
        protectedResourceMetadata: prm ? `${baseUrl}/api/oauth/${mcpSlug}/.well-known/oauth-protected-resource` : null,
        authorizationServerMetadata: asm ? `${baseUrl}/api/oauth/${mcpSlug}/.well-known/oauth-authorization-server` : null,
        openidConfiguration: `${baseUrl}/api/oauth/${mcpSlug}/.well-known/openid-configuration`,
        authorize: `${baseUrl}/api/oauth/${mcpSlug}/authorize`,
        token: `${baseUrl}/api/oauth/${mcpSlug}/token`,
        register: `${baseUrl}/api/oauth/${mcpSlug}/register`,
      },
      example: {
        codeVerifier,
        codeChallenge,
        state: exampleState,
        authorizationUrl: exampleAuthUrl.toString(),
        note: 'Use these example values to test the OAuth flow. The client should generate its own PKCE values.',
      },
      clientRequirements: {
        requiredParameters: [
          'response_type=code',
          'client_id (URL or Client ID Metadata Document)',
          'redirect_uri',
          'scope=mcp:tools mcp:resources',
          'state (random value for CSRF protection)',
          'code_challenge (PKCE S256 challenge)',
          'code_challenge_method=S256',
          'resource (MCP server URI)',
        ],
        flow: [
          '1. Get 401 from MCP endpoint',
          '2. Discover Protected Resource Metadata',
          '3. Discover Authorization Server Metadata',
          '4. Generate PKCE code_verifier and code_challenge',
          '5. Construct authorization URL with all parameters',
          '6. Open browser to authorization URL',
          '7. User authorizes',
          '8. Exchange authorization code for access token',
          '9. Use access token in Authorization header',
        ],
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
