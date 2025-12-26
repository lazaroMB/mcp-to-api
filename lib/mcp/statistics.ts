'use server';

import { createClient } from '@/lib/supabase/server';

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
 * Uses a database function with SECURITY DEFINER to bypass RLS
 */
export async function trackToolUsage(stats: ToolUsageStats) {
  try {
    // Use regular client - the database function will handle RLS bypass
    const supabase = await createClient();
    
    const { error } = await supabase.rpc('insert_mcp_tool_usage_stat', {
      p_mcp_tool_id: stats.mcpToolId || null,
      p_mcp_id: stats.mcpId,
      p_tool_name: stats.toolName,
      p_request_arguments: stats.requestArguments || null,
      p_success: stats.success,
      p_response_status: stats.responseStatus || null,
      p_response_time_ms: stats.responseTimeMs,
      p_api_id: stats.apiId || null,
      p_error_message: stats.errorMessage || null,
      p_client_ip: stats.clientIp || null,
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
