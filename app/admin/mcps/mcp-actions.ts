'use server';

import { createClient } from '@/lib/supabase/server';
import { MCP, MCPTool, MCPResource } from '@/lib/types/mcp';
import { MCPToolAPIMapping } from '@/lib/types/mapping';
import { API } from '@/lib/types/api';

export async function getMCPBySlug(slug: string): Promise<MCP | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('mcp')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to fetch MCP: ${error.message}`);
  }

  return data;
}

export async function getMCPToolsBySlug(slug: string): Promise<MCPTool[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('mcp')
    .select(`
      id,
      mcp_tools (
        id,
        name,
        description,
        input_schema,
        uri,
        created_at,
        updated_at
      )
    `)
    .eq('slug', slug)
    .single();

  if (error) {
    throw new Error(`Failed to fetch MCP tools: ${error.message}`);
  }

  return (data?.mcp_tools || []) as MCPTool[];
}

export async function getMCPToolByName(slug: string, toolName: string): Promise<MCPTool | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('mcp')
    .select(`
      id,
      mcp_tools!inner (
        id,
        name,
        description,
        input_schema,
        uri,
        created_at,
        updated_at
      )
    `)
    .eq('slug', slug)
    .eq('mcp_tools.name', toolName)
    .single();

  if (error || !data?.mcp_tools || (Array.isArray(data.mcp_tools) && data.mcp_tools.length === 0)) {
    return null;
  }

  const tools = Array.isArray(data.mcp_tools) ? data.mcp_tools : [data.mcp_tools];
  return tools[0] as MCPTool;
}

export async function getMCPToolMapping(slug: string, toolName: string): Promise<{
  tool: MCPTool;
  mapping: MCPToolAPIMapping | null;
  api: API | null;
} | null> {
  const supabase = await createClient();
  
  // First, get the MCP
  const { data: mcp, error: mcpError } = await supabase
    .from('mcp')
    .select('id')
    .eq('slug', slug)
    .single();

  if (mcpError || !mcp) {
    return null;
  }

  // Get the tool
  const { data: tool, error: toolError } = await supabase
    .from('mcp_tools')
    .select('*')
    .eq('mcp_id', mcp.id)
    .eq('name', toolName)
    .single();

  if (toolError || !tool) {
    return null;
  }

  // Get the mapping for this tool
  const { data: mapping, error: mappingError } = await supabase
    .from('mcp_tool_api_mapping')
    .select('*')
    .eq('mcp_tool_id', tool.id)
    .maybeSingle();

  if (mappingError || !mapping) {
    return {
      tool: {
        id: tool.id,
        mcp_id: tool.mcp_id,
        created_at: tool.created_at,
        updated_at: tool.updated_at,
        name: tool.name,
        description: tool.description,
        input_schema: tool.input_schema,
        uri: tool.uri,
      },
      mapping: null,
      api: null,
    };
  }

  // Get the API
  const { data: api, error: apiError } = await supabase
    .from('api')
    .select('*')
    .eq('id', mapping.api_id)
    .single();

  if (apiError || !api) {
    return {
      tool: {
        id: tool.id,
        mcp_id: tool.mcp_id,
        created_at: tool.created_at,
        updated_at: tool.updated_at,
        name: tool.name,
        description: tool.description,
        input_schema: tool.input_schema,
        uri: tool.uri,
      },
      mapping: {
        id: mapping.id,
        created_at: mapping.created_at,
        updated_at: mapping.updated_at,
        mcp_tool_id: mapping.mcp_tool_id,
        api_id: mapping.api_id,
        mapping_config: mapping.mapping_config,
      },
      api: null,
    };
  }

  return {
    tool: {
      id: tool.id,
      mcp_id: tool.mcp_id,
      created_at: tool.created_at,
      updated_at: tool.updated_at,
      name: tool.name,
      description: tool.description,
      input_schema: tool.input_schema,
      uri: tool.uri,
    },
    mapping: {
      id: mapping.id,
      created_at: mapping.created_at,
      updated_at: mapping.updated_at,
      mcp_tool_id: mapping.mcp_tool_id,
      api_id: mapping.api_id,
      mapping_config: mapping.mapping_config,
    },
    api: {
      id: api.id,
      created_at: api.created_at,
      updated_at: api.updated_at,
      name: api.name,
      description: api.description,
      method: api.method,
      url: api.url,
      headers: api.headers,
      cookies: api.cookies,
      url_params: api.url_params,
      payload_schema: api.payload_schema,
    },
  };
}
