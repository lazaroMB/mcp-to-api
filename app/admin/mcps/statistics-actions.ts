'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth/middleware';
import type { ToolStatistics, MCPStatistics, DashboardStatistics } from './statistics-types';

export interface TimeRange {
  start: Date;
  end: Date;
}

/**
 * Get time range from string
 */
function getTimeRange(range: '24h' | '7d' | '30d' | 'all'): TimeRange | undefined {
  const now = new Date();
  switch (range) {
    case '24h':
      return { start: new Date(now.getTime() - 24 * 60 * 60 * 1000), end: now };
    case '7d':
      return { start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), end: now };
    case '30d':
      return { start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), end: now };
    case 'all':
      return undefined;
  }
}

// Get statistics for all tools in an MCP
export async function getMCPToolStatistics(
  mcpId: string,
  timeRange?: '24h' | '7d' | '30d' | 'all'
): Promise<ToolStatistics[]> {
  await requireAuth();
  const supabase = await createClient();

  const range = timeRange ? getTimeRange(timeRange) : undefined;

  let query = supabase
    .from('mcp_tool_usage_stats')
    .select('*')
    .eq('mcp_id', mcpId);

  if (range) {
    query = query
      .gte('request_timestamp', range.start.toISOString())
      .lte('request_timestamp', range.end.toISOString());
  }

  const { data, error } = await query.order('request_timestamp', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch tool statistics: ${error.message}`);
  }

  // Aggregate by tool
  const toolStatsMap = new Map<string, {
    toolId: string;
    toolName: string;
    totalCalls: number;
    successfulCalls: number;
    failedCalls: number;
    responseTimes: number[];
    lastCalledAt: string | null;
  }>();

  data?.forEach((stat) => {
    const existing = toolStatsMap.get(stat.mcp_tool_id) || {
      toolId: stat.mcp_tool_id,
      toolName: stat.tool_name,
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      responseTimes: [] as number[],
      lastCalledAt: null as string | null,
    };

    existing.totalCalls++;
    if (stat.success) {
      existing.successfulCalls++;
    } else {
      existing.failedCalls++;
    }
    if (stat.response_time_ms) {
      existing.responseTimes.push(stat.response_time_ms);
    }
    if (!existing.lastCalledAt || stat.request_timestamp > existing.lastCalledAt) {
      existing.lastCalledAt = stat.request_timestamp;
    }

    toolStatsMap.set(stat.mcp_tool_id, existing);
  });

  // Calculate final statistics
  return Array.from(toolStatsMap.values()).map((stat) => ({
    toolId: stat.toolId,
    toolName: stat.toolName,
    totalCalls: stat.totalCalls,
    successfulCalls: stat.successfulCalls,
    failedCalls: stat.failedCalls,
    successRate: stat.totalCalls > 0 ? (stat.successfulCalls / stat.totalCalls) * 100 : 0,
    avgResponseTimeMs:
      stat.responseTimes.length > 0
        ? stat.responseTimes.reduce((a, b) => a + b, 0) / stat.responseTimes.length
        : 0,
    lastCalledAt: stat.lastCalledAt,
  }));
}

// Get overall MCP statistics
export async function getMCPStatistics(
  mcpId: string,
  timeRange?: '24h' | '7d' | '30d' | 'all'
): Promise<MCPStatistics> {
  await requireAuth();
  const supabase = await createClient();

  const toolStats = await getMCPToolStatistics(mcpId, timeRange);

  const { data: toolsData, error: toolsError } = await supabase
    .from('mcp_tools')
    .select('id, name')
    .eq('mcp_id', mcpId);

  if (toolsError) {
    throw new Error(`Failed to fetch MCP tools: ${toolsError.message}`);
  }

  const totalToolCalls = toolStats.reduce((sum, stat) => sum + stat.totalCalls, 0);
  const totalSuccessful = toolStats.reduce((sum, stat) => sum + stat.successfulCalls, 0);
  const allResponseTimes = toolStats
    .filter((stat) => stat.avgResponseTimeMs > 0)
    .map((stat) => stat.avgResponseTimeMs);

  const mostUsedTool = toolStats.reduce(
    (max, stat) =>
      stat.totalCalls > max.callCount
        ? { name: stat.toolName, callCount: stat.totalCalls }
        : max,
    { name: '', callCount: 0 }
  );

  return {
    mcpId,
    totalToolCalls,
    totalTools: toolsData?.length || 0,
    mostUsedTool: mostUsedTool.callCount > 0 ? mostUsedTool : null,
    successRate: totalToolCalls > 0 ? (totalSuccessful / totalToolCalls) * 100 : 0,
    avgResponseTimeMs:
      allResponseTimes.length > 0
        ? allResponseTimes.reduce((a, b) => a + b, 0) / allResponseTimes.length
        : 0,
  };
}

// Get dashboard-wide statistics
export async function getDashboardStatistics(
  timeRange?: '24h' | '7d' | '30d' | 'all'
): Promise<DashboardStatistics> {
  await requireAuth();
  const supabase = await createClient();

  const range = timeRange ? getTimeRange(timeRange) : undefined;

  // Get all MCPs for the user
  const { data: mcps, error: mcpsError } = await supabase
    .from('mcp')
    .select('id, name')
    .order('created_at', { ascending: false });

  if (mcpsError) {
    throw new Error(`Failed to fetch MCPs: ${mcpsError.message}`);
  }

  const mcpIds = mcps?.map((m) => m.id) || [];

  // Get all tool usage stats
  let statsQuery = supabase
    .from('mcp_tool_usage_stats')
    .select('mcp_tool_id, mcp_id, tool_name, success, response_time_ms')
    .in('mcp_id', mcpIds);

  if (range) {
    statsQuery = statsQuery
      .gte('request_timestamp', range.start.toISOString())
      .lte('request_timestamp', range.end.toISOString());
  }

  const { data: stats, error: statsError } = await statsQuery;

  if (statsError) {
    throw new Error(`Failed to fetch statistics: ${statsError.message}`);
  }

  // Get all tools
  const { data: tools, error: toolsError } = await supabase
    .from('mcp_tools')
    .select('id, mcp_id')
    .in('mcp_id', mcpIds);

  if (toolsError) {
    throw new Error(`Failed to fetch tools: ${toolsError.message}`);
  }

  // Aggregate statistics
  const totalToolCalls = stats?.length || 0;
  const totalSuccessful = stats?.filter((s) => s.success).length || 0;
  const overallSuccessRate = totalToolCalls > 0 ? (totalSuccessful / totalToolCalls) * 100 : 0;

  // Get top tools
  const toolCallCounts = new Map<string, { toolName: string; mcpId: string; count: number }>();
  stats?.forEach((stat) => {
    const key = `${stat.mcp_tool_id}-${stat.tool_name}`;
    const existing = toolCallCounts.get(key) || {
      toolName: stat.tool_name,
      mcpId: stat.mcp_id,
      count: 0,
    };
    existing.count++;
    toolCallCounts.set(key, existing);
  });

  const topTools = Array.from(toolCallCounts.values())
    .map((tool) => {
      const mcp = mcps?.find((m) => m.id === tool.mcpId);
      return {
        toolName: tool.toolName,
        mcpName: mcp?.name || 'Unknown',
        callCount: tool.count,
      };
    })
    .sort((a, b) => b.callCount - a.callCount)
    .slice(0, 10); // Top 10

  return {
    totalToolCalls,
    totalMCPs: mcps?.length || 0,
    totalTools: tools?.length || 0,
    overallSuccessRate,
    topTools,
  };
}
