'use server';

import { createClient } from '@/lib/supabase/server';
import { createServiceRoleClient } from '@/lib/supabase/api';
import { getMCPBySlug } from '@/app/admin/mcps/mcp-actions';
import { MCPAccess } from '@/lib/types/mcp';

export interface AccessCheckResult {
  hasAccess: boolean;
  reason?: string;
  isOwner?: boolean;
}

/**
 * Check if a user has access to an MCP
 * @param mcpSlug - The slug of the MCP
 * @param userId - The user ID to check (null for unauthenticated users)
 * @returns Access check result
 */
export async function checkMCPAccess(
  mcpSlug: string,
  userId: string | null
): Promise<AccessCheckResult> {
  // Use getMCPBySlug which already handles service role client and RLS
  const mcp = await getMCPBySlug(mcpSlug);
  
  if (!mcp) {
    return { hasAccess: false, reason: 'MCP not found' };
  }
  
  // Get service role client for access grant check
  let supabaseService;
  try {
    supabaseService = createServiceRoleClient();
  } catch (error) {
    supabaseService = await createClient();
  }
  
  if (!mcp.is_enabled) {
    return { hasAccess: false, reason: 'MCP is disabled' };
  }
  
  // Public MCPs are accessible to everyone
  if (mcp.visibility === 'public') {
    return { hasAccess: true, isOwner: mcp.user_id === userId || false };
  }
  
  // Private MCPs require authentication and access grant
  if (!userId) {
    return { hasAccess: false, reason: 'Authentication required' };
  }
  
  // Owner always has access
  if (mcp.user_id === userId) {
    return { hasAccess: true, isOwner: true };
  }
  
  // Check access grant in mcp_access table
  // Use service role client to bypass RLS, but filter by user_id manually
  const { data: access, error: accessError } = await supabaseService
    .from('mcp_access')
    .select('id, expires_at, revoked_at, user_id')
    .eq('mcp_id', mcp.id)
    .eq('user_id', userId)
    .maybeSingle();
    
  if (accessError) {
    return { hasAccess: false, reason: `Error checking access: ${accessError.message}` };
  }
  
  // If no access grant found, deny access
  if (!access) {
    return { hasAccess: false, reason: 'Access not granted. Please ask the MCP owner to grant you access.' };
  }
  
  // Check if access has been revoked
  if (access.revoked_at) {
    return { hasAccess: false, reason: 'Access has been revoked' };
  }
  
  // Check if access has expired (if expires_at is set)
  if (access.expires_at && new Date(access.expires_at) < new Date()) {
    return { hasAccess: false, reason: 'Access has expired' };
  }
  
  // Access is valid
  return { hasAccess: true, isOwner: false };
}

/**
 * Grant access to an MCP for a user
 * @param mcpId - The MCP ID
 * @param userId - The user ID to grant access to
 * @param grantedBy - The user ID granting the access
 * @param expiresAt - Optional expiration date
 */
export async function grantMCPAccess(
  mcpId: string,
  userId: string,
  grantedBy: string,
  expiresAt?: Date
): Promise<void> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('mcp_access')
    .upsert({
      mcp_id: mcpId,
      user_id: userId,
      granted_by: grantedBy,
      expires_at: expiresAt?.toISOString() || null,
      revoked_at: null,
    }, {
      onConflict: 'mcp_id,user_id',
    });
    
  if (error) {
    throw new Error(`Failed to grant access: ${error.message}`);
  }
}

/**
 * Revoke access to an MCP for a user
 * @param mcpId - The MCP ID
 * @param userId - The user ID to revoke access from
 */
export async function revokeMCPAccess(
  mcpId: string,
  userId: string
): Promise<void> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('mcp_access')
    .update({ revoked_at: new Date().toISOString() })
    .eq('mcp_id', mcpId)
    .eq('user_id', userId);
    
  if (error) {
    throw new Error(`Failed to revoke access: ${error.message}`);
  }
}

/**
 * Get all access grants for an MCP
 * @param mcpId - The MCP ID
 * @returns Array of access grants with user information
 */
export async function getMCPAccessGrants(mcpId: string): Promise<MCPAccess[]> {
  const supabase = await createClient();
  
  // Query access grants with MCP name join
  const { data, error } = await supabase
    .from('mcp_access')
    .select(`
      *,
      mcp:mcp!mcp_access_mcp_id_fkey(name)
    `)
    .eq('mcp_id', mcpId)
    .is('revoked_at', null)
    .order('granted_at', { ascending: false });
    
  if (error) {
    throw new Error(`Failed to fetch access grants: ${error.message}`);
  }
  
  // Get user emails using the database function
  const userEmails: Record<string, string> = {};
  const uniqueUserIds = [...new Set((data || []).map((item: any) => item.user_id).filter(Boolean))];
  
  for (const userId of uniqueUserIds) {
    try {
      const { data: emailData, error: emailError } = await supabase
        .rpc('get_user_email', { user_uuid: userId });
      
      if (!emailError && emailData) {
        userEmails[userId] = emailData as string;
      }
    } catch (err) {
      // If function doesn't exist or fails, continue without email
      // This is expected if the migration hasn't been run yet
    }
  }
  
  // Transform the data to match MCPAccess interface
  return (data || []).map((item: any) => ({
    id: item.id,
    mcp_id: item.mcp_id,
    user_id: item.user_id,
    granted_by: item.granted_by,
    granted_at: item.granted_at,
    expires_at: item.expires_at,
    revoked_at: item.revoked_at,
    created_at: item.created_at,
    user_email: userEmails[item.user_id],
    mcp_name: item.mcp?.name,
  }));
}

/**
 * Check if a user is the owner of an MCP
 * @param mcpId - The MCP ID
 * @param userId - The user ID to check
 */
export async function isMCPOwner(mcpId: string, userId: string): Promise<boolean> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('mcp')
    .select('user_id')
    .eq('id', mcpId)
    .eq('user_id', userId)
    .single();
    
  if (error || !data) {
    return false;
  }
  
  return true;
}
