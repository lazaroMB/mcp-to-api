'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth/middleware';
import { grantMCPAccess, revokeMCPAccess, getMCPAccessGrants, isMCPOwner } from '@/lib/auth/mcp-access';
import { revalidatePath } from 'next/cache';

/**
 * Grant access to an MCP for a user
 */
export async function grantAccess(mcpId: string, userId: string): Promise<void> {
  const { user } = await requireAuth();
  
  // Verify user is the owner
  const owner = await isMCPOwner(mcpId, user.id);
  if (!owner) {
    throw new Error('Only MCP owners can grant access');
  }
  
  await grantMCPAccess(mcpId, userId, user.id);
  revalidatePath(`/admin/mcps/${mcpId}`);
}

/**
 * Grant access to an MCP by user email
 */
export async function grantAccessByEmail(mcpId: string, email: string): Promise<void> {
  const { user } = await requireAuth();
  
  // Verify user is the owner
  const owner = await isMCPOwner(mcpId, user.id);
  if (!owner) {
    throw new Error('Only MCP owners can grant access');
  }
  
  // Get user ID by email
  const userId = await getUserIdByEmail(email);
  if (!userId) {
    throw new Error(`User with email ${email} not found`);
  }
  
  await grantMCPAccess(mcpId, userId, user.id);
  revalidatePath(`/admin/mcps/${mcpId}`);
}

/**
 * Revoke access to an MCP for a user
 */
export async function revokeAccess(mcpId: string, userId: string): Promise<void> {
  const { user } = await requireAuth();
  
  // Verify user is the owner
  const owner = await isMCPOwner(mcpId, user.id);
  if (!owner) {
    throw new Error('Only MCP owners can revoke access');
  }
  
  await revokeMCPAccess(mcpId, userId);
  revalidatePath(`/admin/mcps/${mcpId}`);
}

/**
 * Get all access grants for an MCP
 */
export async function getAccessGrants(mcpId: string) {
  const { user } = await requireAuth();
  
  // Verify user is the owner
  const owner = await isMCPOwner(mcpId, user.id);
  if (!owner) {
    throw new Error('Only MCP owners can view access grants');
  }
  
  return await getMCPAccessGrants(mcpId);
}

/**
 * Search for users by email to grant access
 */
export async function searchUsers(query: string): Promise<Array<{ id: string; email: string }>> {
  await requireAuth();
  const supabase = await createClient();
  
  if (!query || query.length < 2) {
    return [];
  }
  
  try {
    // Use the database function to search users
    const { data, error } = await supabase
      .rpc('search_users_by_email', { search_pattern: query });
    
    if (error) {
      // If function doesn't exist, fall back to empty array
      return [];
    }
    
    return (data || []).map((user: any) => ({
      id: user.id,
      email: user.email,
    }));
  } catch (err) {
    return [];
  }
}

/**
 * Get user ID by email
 */
export async function getUserIdByEmail(email: string): Promise<string | null> {
  await requireAuth();
  const supabase = await createClient();
  
  try {
    const { data, error } = await supabase
      .rpc('get_user_id_by_email', { user_email: email });
    
    if (error || !data) {
      return null;
    }
    
    return data as string;
  } catch (err) {
    return null;
  }
}
