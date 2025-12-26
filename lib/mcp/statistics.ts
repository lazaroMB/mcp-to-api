'use server';

import { createServiceRoleClient } from '@/lib/supabase/api';

export interface ToolUsageStats {
  mcpToolId: string;
  mcpId: string;
  toolName: string;
  requestArguments?: Record<string, any>;
  success: boolean;
  responseStatus?: number;
  responseTimeMs: number;
  apiId?: string;
  errorMessage?: string | null;
  clientIp?: string;
}

/**
 * Track tool usage statistics
 * This function is non-blocking and will not throw errors to avoid breaking the main flow
 * Uses service role key to bypass RLS for statistics tracking
 */
export async function trackToolUsage(stats: ToolUsageStats) {
  try {
    // Use service role client to bypass RLS for statistics tracking
    const supabase = createServiceRoleClient();
    
    // Insert directly into the statistics table
    // Convert empty strings to null for UUID fields
    const mcpToolId = stats.mcpToolId && stats.mcpToolId.trim() !== '' ? stats.mcpToolId : null;
    const apiId = stats.apiId && stats.apiId.trim() !== '' ? stats.apiId : null;
    
    const { error } = await supabase
      .from('mcp_tool_usage_stats')
      .insert({
        mcp_tool_id: mcpToolId,
        mcp_id: stats.mcpId,
        tool_name: stats.toolName,
        request_arguments: stats.requestArguments || null,
        success: stats.success,
        response_status: stats.responseStatus || null,
        response_time_ms: stats.responseTimeMs,
        api_id: apiId,
        error_message: stats.errorMessage || null,
        client_ip: stats.clientIp || null,
        request_timestamp: new Date().toISOString(),
      });

    if (error) {
      console.error('Failed to track tool usage:', error);
      // Don't throw - statistics tracking should not break the main flow
    }
  } catch (err) {
    console.error('Error tracking tool usage:', err);
    // Silently fail - statistics are non-critical
  }
}
