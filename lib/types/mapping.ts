export interface FieldMapping {
  tool_field: string;
  api_field: string;
  transformation: 'direct' | 'constant' | 'expression';
  value?: string; // For constant transformation
  expression?: string; // For expression transformation
}

export interface MappingConfig {
  field_mappings: FieldMapping[];
  static_fields?: Record<string, string>;
  transformations?: Record<string, {
    type: 'json_path' | 'template' | 'function';
    config: Record<string, any>;
  }>;
}

export interface MCPToolAPIMapping {
  id: string;
  created_at: string;
  updated_at: string;
  mcp_tool_id: string;
  api_id: string;
  mapping_config: MappingConfig;
}

export interface MappingFormData {
  api_id: string;
  mapping_config: MappingConfig;
}
