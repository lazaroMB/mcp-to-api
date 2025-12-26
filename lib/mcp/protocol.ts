/**
 * MCP Protocol Types
 * Based on Model Context Protocol specification
 */

// JSON-RPC 2.0 Base Types
export interface JSONRPCRequest {
  jsonrpc: '2.0';
  id: string | number | null;
  method: string;
  params?: any;
}

export interface JSONRPCResponse {
  jsonrpc: '2.0';
  id: string | number | null;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

export interface MCPInitializeRequest {
  protocolVersion: string;
  capabilities?: {
    roots?: {
      listChanged?: boolean;
    };
    sampling?: Record<string, any>;
  };
  clientInfo?: {
    name: string;
    version: string;
  };
}

export interface MCPInitializeResponse {
  protocolVersion: string;
  capabilities: {
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
  };
  serverInfo: {
    name: string;
    version: string;
  };
}

export interface MCPTool {
  name: string;
  description?: string;
  inputSchema: {
    type: string;
    properties?: Record<string, any>;
    required?: string[];
  };
}

export interface MCPToolsListResponse {
  tools: MCPTool[];
}

export interface MCPCallToolRequest {
  name: string;
  arguments?: Record<string, any>;
}

export interface MCPCallToolResponse {
  content: Array<{
    type: 'text' | 'image' | 'resource';
    text?: string;
    data?: string;
    mimeType?: string;
    resource?: {
      uri: string;
      text?: string;
      mimeType?: string;
    };
  }>;
  isError?: boolean;
}

export interface MCPResource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
  // If resource is linked to a tool, include the tool's input schema as parameters
  params?: {
    type: string;
    properties?: Record<string, any>;
    required?: string[];
  };
}

export interface MCPResourcesListResponse {
  resources: MCPResource[];
}

export interface MCPReadResourceRequest {
  uri: string;
  // Parameters from the linked tool's input schema
  params?: Record<string, any>;
}

export interface MCPReadResourceResponse {
  contents: Array<{
    uri: string;
    mimeType?: string;
    text?: string;
    blob?: string;
  }>;
}

export interface MCPError {
  code: number;
  message: string;
  data?: any;
}
