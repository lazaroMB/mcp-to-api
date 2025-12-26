export interface MCP {
  id: string;
  created_at: string;
  name: string;
  slug: string;
  is_enabled: boolean;
}

export interface MCPFormData {
  name: string;
  slug: string;
  is_enabled: boolean;
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
  is_enabled: boolean;
}

export interface MCPToolFormData {
  name: string;
  description: string;
  input_schema: Record<string, any>;
  uri: string;
  is_enabled: boolean;
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

export interface MCPToolUsageStats {
  id: string;
  mcp_tool_id: string;
  mcp_id: string;
  user_id: string | null;
  tool_name: string;
  request_timestamp: string;
  request_arguments: Record<string, any> | null;
  success: boolean;
  response_status: number | null;
  response_time_ms: number;
  error_message: string | null;
  api_id: string | null;
  client_ip: string | null;
  created_at: string;
}
