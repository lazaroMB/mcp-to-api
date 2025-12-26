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
    .eq('is_enabled', true) // Only return enabled MCPs
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found (or disabled)
    }
    throw new Error(`Failed to fetch MCP: ${error.message}`);
  }

  // Double check is_enabled in case RLS doesn't filter it
  if (!data?.is_enabled) {
    return null; // Return null if disabled, so it appears as non-existent
  }

  return data;
}

export async function getMCPToolsBySlug(slug: string): Promise<MCPTool[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('mcp')
    .select(`
      id,
      is_enabled,
      mcp_tools!inner (
        id,
        name,
        description,
        input_schema,
        uri,
        created_at,
        updated_at,
        is_enabled
      )
    `)
    .eq('slug', slug)
    .eq('is_enabled', true) // Only return tools for enabled MCPs
    .eq('mcp_tools.is_enabled', true) // Only return enabled tools
    .single();

  if (error) {
    throw new Error(`Failed to fetch MCP tools: ${error.message}`);
  }

  // Double check is_enabled
  if (!data?.is_enabled) {
    return []; // Return empty array if MCP is disabled
  }

  // Filter out disabled tools
  const tools = (data?.mcp_tools || []) as MCPTool[];
  return tools.filter(tool => tool.is_enabled);
}

export async function getMCPToolByName(slug: string, toolName: string): Promise<MCPTool | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('mcp')
    .select(`
      id,
      is_enabled,
      mcp_tools!inner (
        id,
        name,
        description,
        input_schema,
        uri,
        created_at,
        updated_at,
        is_enabled
      )
    `)
    .eq('slug', slug)
    .eq('is_enabled', true) // Only return tools for enabled MCPs
    .eq('mcp_tools.name', toolName)
    .eq('mcp_tools.is_enabled', true) // Only return enabled tools
    .single();

  if (error || !data?.is_enabled || !data?.mcp_tools || (Array.isArray(data.mcp_tools) && data.mcp_tools.length === 0)) {
    return null;
  }

  const tools = Array.isArray(data.mcp_tools) ? data.mcp_tools : [data.mcp_tools];
  const tool = tools[0] as MCPTool;
  
  // Double check tool is enabled
  if (!tool.is_enabled) {
    return null;
  }
  
  return tool;
}

export async function getMCPToolMapping(slug: string, toolName: string): Promise<{
  tool: MCPTool;
  mapping: MCPToolAPIMapping | null;
  api: API | null;
} | null> {
  const supabase = await createClient();
  
  // First, get the MCP (only if enabled)
  const { data: mcp, error: mcpError } = await supabase
    .from('mcp')
    .select('id, is_enabled')
    .eq('slug', slug)
    .eq('is_enabled', true) // Only return mappings for enabled MCPs
    .single();

  if (mcpError || !mcp || !mcp.is_enabled) {
    return null;
  }

  // Get the tool (only if enabled)
  const { data: tool, error: toolError } = await supabase
    .from('mcp_tools')
    .select('*')
    .eq('mcp_id', mcp.id)
    .eq('name', toolName)
    .eq('is_enabled', true) // Only return enabled tools
    .single();

  if (toolError || !tool || !tool.is_enabled) {
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
        is_enabled: tool.is_enabled,
      },
      mapping: null,
      api: null,
    };
  }

  // Get the API (only if enabled)
  const { data: api, error: apiError } = await supabase
    .from('api')
    .select('*')
    .eq('id', mapping.api_id)
    .eq('is_enabled', true) // Only return enabled APIs
    .single();

  if (apiError || !api || !api.is_enabled) {
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
        is_enabled: tool.is_enabled,
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
      is_enabled: tool.is_enabled,
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
      is_enabled: api.is_enabled,
    },
  };
}
