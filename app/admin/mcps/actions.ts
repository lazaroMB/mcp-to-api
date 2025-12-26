'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { MCP, MCPFormData } from '@/lib/types/mcp';
import { requireAuth } from '@/lib/auth/middleware';

export async function getMCPs(): Promise<MCP[]> {
  await requireAuth();
  const supabase = await createClient();
  // RLS will automatically filter by user_id
  const { data, error } = await supabase
    .from('mcp')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch MCPs: ${error.message}`);
  }

  return data || [];
}

export async function getMCP(id: string): Promise<MCP | null> {
  await requireAuth();
  const supabase = await createClient();
  // RLS will automatically filter by user_id
  const { data, error } = await supabase
    .from('mcp')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to fetch MCP: ${error.message}`);
  }

  return data;
}

export async function createMCP(formData: MCPFormData): Promise<MCP> {
  await requireAuth();
  const supabase = await createClient();
  // Trigger will automatically set user_id
  const { data, error } = await supabase
    .from('mcp')
    .insert({
      name: formData.name,
      slug: formData.slug,
      is_enabled: formData.is_enabled ?? true,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create MCP: ${error.message}`);
  }

  revalidatePath('/admin/mcps');
  return data;
}

export async function updateMCP(id: string, formData: MCPFormData): Promise<MCP> {
  await requireAuth();
  const supabase = await createClient();
  // RLS will automatically ensure user owns this MCP
  const { data, error } = await supabase
    .from('mcp')
    .update({
      name: formData.name,
      slug: formData.slug,
      is_enabled: formData.is_enabled ?? true,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update MCP: ${error.message}`);
  }

  revalidatePath('/admin/mcps');
  return data;
}

export async function deleteMCP(id: string): Promise<void> {
  await requireAuth();
  const supabase = await createClient();
  // RLS will automatically ensure user owns this MCP
  const { error } = await supabase
    .from('mcp')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete MCP: ${error.message}`);
  }

  revalidatePath('/admin/mcps');
}
