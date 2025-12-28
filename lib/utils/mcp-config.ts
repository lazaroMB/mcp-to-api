import { getBaseUrl } from './url';

/**
 * Generates MCP client configuration JSON for a given MCP
 * 
 * Note: For private MCPs, the client should automatically handle OAuth
 * when it receives a 401 response with WWW-Authenticate header.
 * No token should be included in the configuration - the client will
 * discover and complete the OAuth flow automatically.
 */
export function generateMCPConfig(mcpSlug: string, visibility: 'public' | 'private' = 'public', baseUrl: string = ''): string {
  // Use the provided baseUrl or get it from the utility function
  const serverUrl = baseUrl || getBaseUrl();
  const mcpEndpoint = `${serverUrl}/api/mcp/${mcpSlug}`;

  const config: any = {
    mcpServers: {
      [mcpSlug]: {
        url: mcpEndpoint,
      },
    },
  };

  // For private MCPs, the client should handle OAuth automatically
  // We don't include a token here - the client will:
  // 1. Make a request to the MCP endpoint
  // 2. Receive a 401 with WWW-Authenticate header
  // 3. Discover OAuth endpoints from the resource_metadata URL
  // 4. Complete the OAuth flow automatically
  // 5. Use the token for subsequent requests

  return JSON.stringify(config, null, 2);
}

/**
 * Generates Claude Desktop MCP configuration
 * 
 * Note: For private MCPs, the client should automatically handle OAuth
 * when it receives a 401 response with WWW-Authenticate header.
 * No token should be included in the configuration - the client will
 * discover and complete the OAuth flow automatically.
 */
export function generateClaudeDesktopConfig(mcpSlug: string, visibility: 'public' | 'private' = 'public', baseUrl: string = ''): string {
  const serverUrl = baseUrl || getBaseUrl();
  const mcpEndpoint = `${serverUrl}/api/mcp/${mcpSlug}`;

  const config: any = {
    mcpServers: {
      [mcpSlug]: {
        url: mcpEndpoint,
      },
    },
  };

  // For private MCPs, the client should handle OAuth automatically
  // We don't include a token here - the client will:
  // 1. Make a request to the MCP endpoint
  // 2. Receive a 401 with WWW-Authenticate header
  // 3. Discover OAuth endpoints from the resource_metadata URL
  // 4. Complete the OAuth flow automatically
  // 5. Use the token for subsequent requests

  return JSON.stringify(config, null, 2);
}
