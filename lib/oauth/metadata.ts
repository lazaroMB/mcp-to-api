import { getMCPBySlug } from '@/app/admin/mcps/mcp-actions';
import { ProtectedResourceMetadata, AuthorizationServerMetadata } from '@/lib/types/oauth';
import { getBaseUrl } from '@/lib/utils/url';

/**
 * Generate Protected Resource Metadata (RFC 9728)
 */
export async function getProtectedResourceMetadata(
  mcpSlug: string
): Promise<ProtectedResourceMetadata | null> {
  const mcp = await getMCPBySlug(mcpSlug);
  
  if (!mcp) {
    return null;
  }
  
  const baseUrl = getBaseUrl();
  const authServerUrl = `${baseUrl}/api/oauth/${mcpSlug}`;
  const resourceUrl = `${baseUrl}/api/mcp/${mcpSlug}`;
  
  return {
    resource: resourceUrl,
    authorization_servers: [authServerUrl],
    scopes_supported: ['mcp:tools', 'mcp:resources'],
    bearer_methods_supported: ['header'],
  };
}

/**
 * Generate Authorization Server Metadata (RFC 8414)
 */
export async function getAuthorizationServerMetadata(
  mcpSlug: string
): Promise<AuthorizationServerMetadata | null> {
  const mcp = await getMCPBySlug(mcpSlug);
  
  if (!mcp) {
    return null;
  }
  
  const baseUrl = getBaseUrl();
  const issuer = `${baseUrl}/api/oauth/${mcpSlug}`;
  
  return {
    issuer,
    authorization_endpoint: `${issuer}/authorize`,
    token_endpoint: `${issuer}/token`,
    introspection_endpoint: `${issuer}/introspect`,
    registration_endpoint: `${issuer}/register`,
    scopes_supported: ['mcp:tools', 'mcp:resources'],
    response_types_supported: ['code'],
    code_challenge_methods_supported: ['S256'],
    client_id_metadata_document_supported: true,
    // OpenID Connect Discovery fields (required for OIDC compatibility)
    jwks_uri: `${issuer}/.well-known/jwks.json`,
    subject_types_supported: ['public'],
    id_token_signing_alg_values_supported: ['HS256', 'RS256'],
  };
}
