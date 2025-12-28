import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getMCPBySlug } from '@/app/admin/mcps/mcp-actions';
import { checkMCPAccess } from '@/lib/auth/mcp-access';
import { getBaseUrl } from '@/lib/utils/url';
import { randomBytes } from 'crypto';

/**
 * Generate authorization code
 */
function generateAuthorizationCode(): string {
  return randomBytes(32).toString('base64url');
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ mcpSlug: string }> }
) {
  try {
    const { mcpSlug } = await params;
    const searchParams = request.nextUrl.searchParams;
    
    // Validate required parameters
    const responseType = searchParams.get('response_type');
    const clientId = searchParams.get('client_id');
    const redirectUri = searchParams.get('redirect_uri');
    const scope = searchParams.get('scope');
    const state = searchParams.get('state');
    const codeChallenge = searchParams.get('code_challenge');
    const codeChallengeMethod = searchParams.get('code_challenge_method');
    const resource = searchParams.get('resource');
    
    // Validate parameters
    if (responseType !== 'code') {
      return NextResponse.json(
        { error: 'unsupported_response_type', error_description: 'Only authorization_code flow is supported' },
        { status: 400 }
      );
    }
    
    // Provide defaults for missing parameters (with warnings)
    const finalScope = scope || 'mcp:tools mcp:resources'; // Default to all scopes if not provided
    const finalState = state || 'default-state-' + Date.now(); // Generate state if missing (security risk, but allows flow to work)
    
    // Only require absolutely essential parameters
    if (!clientId || !redirectUri || !codeChallenge) {
      const missing = [];
      if (!clientId) missing.push('client_id');
      if (!redirectUri) missing.push('redirect_uri');
      if (!codeChallenge) missing.push('code_challenge');
      
      // If this is a browser request (has Accept: text/html), show a user-friendly error page
      const acceptHeader = request.headers.get('accept') || '';
      if (acceptHeader.includes('text/html')) {
        const baseUrl = getBaseUrl(request);
        const debugUrl = `${baseUrl}/api/oauth/${mcpSlug}/debug`;
        const receivedParams = Object.fromEntries(searchParams.entries());
        
        const errorHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>Authorization Error</title>
  <style>
    body { font-family: system-ui; max-width: 800px; margin: 50px auto; padding: 20px; }
    .error { background: #fee; border: 1px solid #fcc; padding: 15px; border-radius: 5px; }
    .warning { background: #ffe; border: 1px solid #fcc; padding: 15px; border-radius: 5px; margin-top: 20px; }
    .info { background: #eef; border: 1px solid #ccf; padding: 15px; border-radius: 5px; margin-top: 20px; }
    .received { background: #fff; border: 1px solid #ddd; padding: 15px; border-radius: 5px; margin-top: 20px; }
    code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; font-family: monospace; }
    pre { background: #f5f5f5; padding: 10px; border-radius: 5px; overflow-x: auto; }
    a { color: #0066cc; }
  </style>
</head>
<body>
  <h1>Authorization Error</h1>
  <div class="error">
    <strong>Missing required parameters:</strong> ${missing.join(', ')}
  </div>
  
  <div class="received">
    <strong>Parameters received:</strong>
    <pre>${JSON.stringify(receivedParams, null, 2)}</pre>
  </div>
  
  <div class="info">
    <p><strong>This authorization request is missing required OAuth parameters.</strong></p>
    <p>This usually means the MCP client didn't construct the authorization URL correctly.</p>
    
    <p><strong>Required parameters:</strong></p>
    <ul>
      <li><code>response_type=code</code> ${responseType ? '✓' : '✗'}</li>
      <li><code>client_id</code> ${clientId ? '✓' : '✗'}</li>
      <li><code>redirect_uri</code> ${redirectUri ? '✓' : '✗'}</li>
      <li><code>scope</code> ${scope ? '✓' : '✗'} ${!scope ? '(will use default: mcp:tools mcp:resources)' : ''}</li>
      <li><code>state</code> ${state ? '✓' : '✗'} ${!state ? '(will be generated, but CSRF protection is reduced)' : ''}</li>
      <li><code>code_challenge</code> ${codeChallenge ? '✓' : '✗'}</li>
      <li><code>code_challenge_method=S256</code> ${codeChallengeMethod ? '✓' : '✗'}</li>
      <li><code>resource</code> ${resource ? '✓' : '✗'}</li>
    </ul>
    
    <p><strong>Next steps:</strong></p>
    <ul>
      <li>Check the MCP client logs to see what URL it's constructing</li>
      <li>Verify the client is implementing PKCE (code_challenge generation)</li>
      <li>Ensure the client is including all required parameters</li>
      <li>See <a href="${debugUrl}" target="_blank">debug endpoint</a> for example authorization URL</li>
    </ul>
    
    <p><strong>Note:</strong> The MCP client should automatically construct this URL after receiving a 401 response from the MCP endpoint. If you're seeing this page, the client's OAuth implementation may need to be updated.</p>
  </div>
</body>
</html>
        `;
        return new NextResponse(errorHtml, {
          status: 400,
          headers: { 'Content-Type': 'text/html' },
        });
      }
      
      return NextResponse.json(
        { 
          error: 'invalid_request', 
          error_description: `Missing required parameters: ${missing.join(', ')}. Received: ${JSON.stringify(Object.fromEntries(searchParams.entries()))}` 
        },
        { status: 400 }
      );
    }
    
    if (codeChallengeMethod !== 'S256') {
      return NextResponse.json(
        { error: 'invalid_request', error_description: 'Only S256 code challenge method is supported' },
        { status: 400 }
      );
    }
    
    // Get MCP
    const mcp = await getMCPBySlug(mcpSlug);
    if (!mcp) {
      return NextResponse.json(
        { error: 'invalid_resource', error_description: 'MCP not found' },
        { status: 404 }
      );
    }
    
    // Check if MCP is private (public MCPs don't need authorization)
    if (mcp.visibility === 'public') {
      // For public MCPs, we can still issue tokens but they're not required
      // Redirect back with a code (simplified flow)
      const code = generateAuthorizationCode();
      const redirectUrl = new URL(redirectUri);
      redirectUrl.searchParams.set('code', code);
      redirectUrl.searchParams.set('state', finalState);
      return NextResponse.redirect(redirectUrl.toString());
    }
    
    // For private MCPs, require authentication
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Redirect to login with return URL (preserve all query parameters)
      const loginUrl = new URL('/login', request.nextUrl.origin);
      loginUrl.searchParams.set('redirect', request.url);
      return NextResponse.redirect(loginUrl.toString());
    }
    
    // Check if user has access
    const accessCheck = await checkMCPAccess(mcpSlug, user.id);
    
    if (!accessCheck.hasAccess) {
      const errorDescription = accessCheck.reason || 'Access not granted to this MCP';
      return NextResponse.json(
        { error: 'access_denied', error_description: errorDescription },
        { status: 403 }
      );
    }
    
    // Store authorization code
    const code = generateAuthorizationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    const codeData = {
      code,
      client_id: clientId,
      redirect_uri: redirectUri,
      code_challenge: codeChallenge,
      code_challenge_method: codeChallengeMethod,
      scope: finalScope,
      resource: resource || `${getBaseUrl(request)}/api/mcp/${mcpSlug}`,
      user_id: user.id,
      mcp_id: mcp.id,
      expires_at: expiresAt.toISOString(),
    };
    
    const { error: insertError } = await supabase.from('oauth_authorization_codes').insert(codeData);
    
    if (insertError) {
      return NextResponse.json(
        { 
          error: 'server_error', 
          error_description: `Failed to store authorization code: ${insertError.message} (code: ${insertError.code}). ` +
            `This may be due to database permissions or missing environment variables.`
        },
        { status: 500 }
      );
    }
    
    // Redirect back to client with authorization code
    const redirectUrl = new URL(redirectUri);
    redirectUrl.searchParams.set('code', code);
    redirectUrl.searchParams.set('state', finalState);
    
    return NextResponse.redirect(redirectUrl.toString());
  } catch (error) {
    return NextResponse.json(
      { error: 'server_error', error_description: 'An error occurred during authorization' },
      { status: 500 }
    );
  }
}
