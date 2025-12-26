'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { MCPTool, MCPToolFormData, MCPResource, MCPResourceFormData } from '@/lib/types/mcp';

// Tools
export async function getMCPTools(mcpId: string): Promise<MCPTool[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('mcp_tools')
    .select('*')
    .eq('mcp_id', mcpId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch MCP tools: ${error.message}`);
  }

  return data || [];
}

export async function getMCPTool(id: string): Promise<MCPTool | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('mcp_tools')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to fetch MCP tool: ${error.message}`);
  }

  return data;
}

export async function createMCPTool(mcpId: string, formData: MCPToolFormData): Promise<MCPTool> {
  const supabase = await createClient();
  
  // Generate URI if not provided
  const uri = formData.uri || `tool://${formData.name}`;
  
  const { data, error } = await supabase
    .from('mcp_tools')
    .insert({
      mcp_id: mcpId,
      name: formData.name,
      description: formData.description || null,
      input_schema: formData.input_schema || {},
      uri: uri,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create MCP tool: ${error.message}`);
  }

  revalidatePath(`/admin/mcps/${mcpId}`);
  return data;
}

export async function updateMCPTool(id: string, mcpId: string, formData: MCPToolFormData): Promise<MCPTool> {
  const supabase = await createClient();
  
  // Generate URI if not provided
  const uri = formData.uri || `tool://${formData.name}`;
  
  const { data, error } = await supabase
    .from('mcp_tools')
    .update({
      name: formData.name,
      description: formData.description || null,
      input_schema: formData.input_schema || {},
      uri: uri,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update MCP tool: ${error.message}`);
  }

  revalidatePath(`/admin/mcps/${mcpId}`);
  return data;
}

export async function deleteMCPTool(id: string, mcpId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('mcp_tools')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete MCP tool: ${error.message}`);
  }

  revalidatePath(`/admin/mcps/${mcpId}`);
}

// Resources
export async function getMCPResources(mcpId: string): Promise<MCPResource[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('mcp_resources')
    .select('*')
    .eq('mcp_id', mcpId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch MCP resources: ${error.message}`);
  }

  return data || [];
}

export async function getMCPResource(id: string): Promise<MCPResource | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('mcp_resources')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to fetch MCP resource: ${error.message}`);
  }

  return data;
}

export async function createMCPResource(mcpId: string, formData: MCPResourceFormData): Promise<MCPResource> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('mcp_resources')
    .insert({
      mcp_id: mcpId,
      uri: formData.uri,
      name: formData.name,
      description: formData.description || null,
      mime_type: formData.mime_type || null,
      tool_id: formData.tool_id || null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create MCP resource: ${error.message}`);
  }

  revalidatePath(`/admin/mcps/${mcpId}`);
  return data;
}

export async function updateMCPResource(id: string, mcpId: string, formData: MCPResourceFormData): Promise<MCPResource> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('mcp_resources')
    .update({
      uri: formData.uri,
      name: formData.name,
      tool_id: formData.tool_id || null,
      description: formData.description || null,
      mime_type: formData.mime_type || null,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update MCP resource: ${error.message}`);
  }

  revalidatePath(`/admin/mcps/${mcpId}`);
  return data;
}

export async function deleteMCPResource(id: string, mcpId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('mcp_resources')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete MCP resource: ${error.message}`);
  }

  revalidatePath(`/admin/mcps/${mcpId}`);
}
