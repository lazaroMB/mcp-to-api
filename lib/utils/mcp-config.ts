/**
 * Generates MCP client configuration JSON for a given MCP
 */
export function generateMCPConfig(mcpSlug: string, baseUrl: string = ''): string {
  // Use the current origin if baseUrl is not provided
  const serverUrl = baseUrl || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  const mcpEndpoint = `${serverUrl}/api/mcp/${mcpSlug}`;

  const config = {
    mcpServers: {
      [mcpSlug]: {
        url: mcpEndpoint,
        // Optional: Add authentication if needed
        // headers: {
        //   "Authorization": "Bearer YOUR_TOKEN"
        // }
      },
    },
  };

  return JSON.stringify(config, null, 2);
}

/**
 * Generates Claude Desktop MCP configuration
 */
export function generateClaudeDesktopConfig(mcpSlug: string, baseUrl: string = ''): string {
  const serverUrl = baseUrl || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  const mcpEndpoint = `${serverUrl}/api/mcp/${mcpSlug}`;

  const config = {
    mcpServers: {
      [mcpSlug]: {
        command: "npx",
        args: ["-y", "@modelcontextprotocol/server-everything"],
        env: {
          MCP_SERVER_URL: mcpEndpoint,
        },
      },
    },
  };

  return JSON.stringify(config, null, 2);
}
