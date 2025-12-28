'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { API, APIFormData } from '@/lib/types/api';
import { requireAuth } from '@/lib/auth/middleware';
import { parseOpenAPIToAPIs } from '@/lib/utils/openapi-parser';

export async function getAPIs(): Promise<API[]> {
  await requireAuth();
  const supabase = await createClient();
  // RLS will automatically filter by user_id
  // Note: We don't filter by is_enabled here because admins should see all APIs
  const { data, error } = await supabase
    .from('api')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch APIs: ${error.message}`);
  }

  return data || [];
}

export async function getAPI(id: string): Promise<API | null> {
  await requireAuth();
  const supabase = await createClient();
  // RLS will automatically filter by user_id
  const { data, error } = await supabase
    .from('api')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to fetch API: ${error.message}`);
  }

  return data;
}

export async function createAPI(formData: APIFormData): Promise<API> {
  await requireAuth();
  const supabase = await createClient();
  // Trigger will automatically set user_id
  const { data, error } = await supabase
    .from('api')
    .insert({
      name: formData.name,
      description: formData.description || null,
      method: formData.method,
      url: formData.url,
      headers: formData.headers || [],
      cookies: formData.cookies || [],
      url_params: formData.url_params || [],
      payload_schema: formData.payload_schema || null,
      is_enabled: formData.is_enabled ?? true,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create API: ${error.message}`);
  }

  revalidatePath('/admin/api');
  return data;
}

export async function updateAPI(id: string, formData: APIFormData): Promise<API> {
  await requireAuth();
  const supabase = await createClient();
  // RLS will automatically ensure user owns this API
  const { data, error } = await supabase
    .from('api')
    .update({
      name: formData.name,
      description: formData.description || null,
      method: formData.method,
      url: formData.url,
      headers: formData.headers || [],
      cookies: formData.cookies || [],
      url_params: formData.url_params || [],
      payload_schema: formData.payload_schema || null,
      is_enabled: formData.is_enabled ?? true,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update API: ${error.message}`);
  }

  revalidatePath('/admin/api');
  return data;
}

export async function deleteAPI(id: string): Promise<void> {
  await requireAuth();
  const supabase = await createClient();
  
  // Check if API is used in any tool mappings
  const { data: mappings, error: mappingsError } = await supabase
    .from('mcp_tool_api_mapping')
    .select('id, mcp_tool_id')
    .eq('api_id', id);

  if (mappingsError) {
    throw new Error(`Failed to check API usage: ${mappingsError.message}`);
  }

  if (mappings && mappings.length > 0) {
    // Get tool and MCP information for each mapping
    const usageDetails: string[] = [];
    
    for (const mapping of mappings) {
      // Get the tool
      const { data: tool } = await supabase
        .from('mcp_tools')
        .select('id, name, mcp_id')
        .eq('id', mapping.mcp_tool_id)
        .single();

      if (tool) {
        // Get the MCP
        const { data: mcp } = await supabase
          .from('mcp')
          .select('id, name, slug')
          .eq('id', tool.mcp_id)
          .single();

        if (mcp) {
          usageDetails.push(`MCP "${mcp.name}" (${mcp.slug}) - Tool "${tool.name}"`);
        } else {
          usageDetails.push(`Tool "${tool.name}"`);
        }
      } else {
        usageDetails.push('Unknown tool');
      }
    }

    throw new Error(
      `Cannot delete API: It is currently used in ${mappings.length} tool mapping(s): ${usageDetails.join(', ')}. ` +
      `Please remove or update these mappings before deleting the API.`
    );
  }

  // RLS will automatically ensure user owns this API
  const { error } = await supabase
    .from('api')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete API: ${error.message}`);
  }

  revalidatePath('/admin/api');
}

export interface ImportResult {
  success: boolean;
  imported: number;
  errors: string[];
}

export async function importOpenAPI(openAPIUrl: string): Promise<ImportResult> {
  await requireAuth();
  const supabase = await createClient();
  
  const result: ImportResult = {
    success: true,
    imported: 0,
    errors: [],
  };

  try {
    // Parse OpenAPI spec
    const apiFormDataList = await parseOpenAPIToAPIs(openAPIUrl);

    if (apiFormDataList.length === 0) {
      result.errors.push('No endpoints found in OpenAPI specification');
      result.success = false;
      return result;
    }

    // Insert all APIs
    for (const formData of apiFormDataList) {
      try {
        const { error } = await supabase
          .from('api')
          .insert({
            name: formData.name,
            description: formData.description || null,
            method: formData.method,
            url: formData.url,
            headers: formData.headers || [],
            cookies: formData.cookies || [],
            url_params: formData.url_params || [],
            payload_schema: formData.payload_schema || null,
            is_enabled: formData.is_enabled ?? true,
          });

        if (error) {
          result.errors.push(`Failed to import "${formData.name}": ${error.message}`);
        } else {
          result.imported++;
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        result.errors.push(`Failed to import "${formData.name}": ${errorMessage}`);
      }
    }

    if (result.imported > 0) {
      revalidatePath('/admin/api');
    }

    if (result.errors.length > 0 && result.imported === 0) {
      result.success = false;
    }
  } catch (error) {
    result.success = false;
    result.errors.push(error instanceof Error ? error.message : 'Failed to import OpenAPI specification');
  }

  return result;
}
