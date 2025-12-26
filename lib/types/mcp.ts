export interface MCP {
  id: string;
  created_at: string;
  name: string;
  slug: string;
}

export interface MCPFormData {
  name: string;
  slug: string;
}

export interface MCPTool {
  id: string;
  mcp_id: string;
  created_at: string;
  updated_at: string;
  name: string;
  description: string | null;
  input_schema: Record<string, any>;
  uri: string;
}

export interface MCPToolFormData {
  name: string;
  description: string;
  input_schema: Record<string, any>;
  uri: string;
}

export interface MCPResource {
  id: string;
  mcp_id: string;
  created_at: string;
  updated_at: string;
  uri: string;
  name: string;
  description: string | null;
  mime_type: string | null;
  tool_id: string | null;
}

export interface MCPResourceFormData {
  uri: string;
  name: string;
  description: string;
  mime_type: string;
  tool_id: string | null;
}
