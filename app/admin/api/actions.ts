'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { API, APIFormData } from '@/lib/types/api';
import { requireAuth } from '@/lib/auth/middleware';

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
