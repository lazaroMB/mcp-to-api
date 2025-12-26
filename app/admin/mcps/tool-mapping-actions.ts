'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { MCPToolAPIMapping, MappingFormData, MappingConfig } from '@/lib/types/mapping';
import { requireAuth } from '@/lib/auth/middleware';

export async function getToolMapping(toolId: string): Promise<MCPToolAPIMapping | null> {
  await requireAuth();
  const supabase = await createClient();
  // RLS will automatically filter by user_id
  const { data, error } = await supabase
    .from('mcp_tool_api_mapping')
    .select('*')
    .eq('mcp_tool_id', toolId)
    .maybeSingle(); // Use maybeSingle to get one or null

  if (error) {
    throw new Error(`Failed to fetch tool mapping: ${error.message}`);
  }

  return data;
}

// Keep this for backward compatibility with API routes
export async function getToolMappings(toolId: string): Promise<MCPToolAPIMapping[]> {
  const mapping = await getToolMapping(toolId);
  return mapping ? [mapping] : [];
}

export async function getMapping(id: string): Promise<MCPToolAPIMapping | null> {
  await requireAuth();
  const supabase = await createClient();
  // RLS will automatically filter by user_id
  const { data, error } = await supabase
    .from('mcp_tool_api_mapping')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to fetch mapping: ${error.message}`);
  }

  return data;
}

export async function createMapping(toolId: string, formData: MappingFormData): Promise<MCPToolAPIMapping> {
  await requireAuth();
  const supabase = await createClient();
  
  // Check if a mapping already exists for this tool
  const existing = await getToolMapping(toolId);
  if (existing) {
    // Update existing mapping instead of creating a new one
    return updateMapping(existing.id, toolId, formData);
  }

  // Trigger will automatically set user_id
  const { data, error } = await supabase
    .from('mcp_tool_api_mapping')
    .insert({
      mcp_tool_id: toolId,
      api_id: formData.api_id,
      mapping_config: formData.mapping_config || { field_mappings: [] },
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create mapping: ${error.message}`);
  }

  // Get the tool to find the mcp_id for revalidation
  const { data: tool } = await supabase
    .from('mcp_tools')
    .select('mcp_id')
    .eq('id', toolId)
    .single();

  if (tool) {
    revalidatePath(`/admin/mcps/${tool.mcp_id}`);
  }
  return data;
}

export async function updateMapping(id: string, toolId: string, formData: MappingFormData): Promise<MCPToolAPIMapping> {
  await requireAuth();
  const supabase = await createClient();
  // RLS will automatically ensure user owns this mapping
  const { data, error } = await supabase
    .from('mcp_tool_api_mapping')
    .update({
      api_id: formData.api_id,
      mapping_config: formData.mapping_config || { field_mappings: [] },
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update mapping: ${error.message}`);
  }

  // Get the tool to find the mcp_id for revalidation
  const { data: tool } = await supabase
    .from('mcp_tools')
    .select('mcp_id')
    .eq('id', toolId)
    .single();

  if (tool) {
    revalidatePath(`/admin/mcps/${tool.mcp_id}`);
  }
  return data;
}

export async function deleteMapping(id: string, toolId: string): Promise<void> {
  await requireAuth();
  const supabase = await createClient();
  // RLS will automatically ensure user owns this mapping
  const { error } = await supabase
    .from('mcp_tool_api_mapping')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete mapping: ${error.message}`);
  }

  // Get the tool to find the mcp_id for revalidation
  const { data: tool } = await supabase
    .from('mcp_tools')
    .select('mcp_id')
    .eq('id', toolId)
    .single();

  if (tool) {
    revalidatePath(`/admin/mcps/${tool.mcp_id}`);
  }
}
