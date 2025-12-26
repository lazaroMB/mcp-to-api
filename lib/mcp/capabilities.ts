import { MCPTool } from '@/lib/types/mcp';

/**
 * Dynamically determines MCP server capabilities based on configured tools
 * Tools are now used as both tools and resources
 */
export async function getDynamicCapabilities(
  tools: MCPTool[]
): Promise<{
  tools?: {
    listChanged?: boolean;
  };
  resources?: {
    subscribe?: boolean;
    listChanged?: boolean;
  };
  prompts?: {
    listChanged?: boolean;
  };
}> {
  const capabilities: {
    tools?: { listChanged?: boolean };
    resources?: { subscribe?: boolean; listChanged?: boolean };
    prompts?: { listChanged?: boolean };
  } = {};

  // Only advertise tools capability if tools exist
  if (tools && tools.length > 0) {
    capabilities.tools = {
      listChanged: true,
    };
    // Tools are also resources, so advertise resources capability too
    capabilities.resources = {
      subscribe: false, // We don't support subscriptions yet
      listChanged: true,
    };
  }

  // Prompts not implemented yet
  capabilities.prompts = {
    listChanged: false,
  };

  return capabilities;
}
