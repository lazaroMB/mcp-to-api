# MCP Tool Consumption Statistics - Feature Proposal

## Overview

This proposal outlines the implementation of statistics tracking for MCP tool consumption. The feature will track every time an MCP tool is called, store usage metrics, and display them in the admin dashboard.

## Goals

1. **Track Tool Usage**: Record every tool call with timestamp, success/failure status, and response time
2. **Aggregate Statistics**: Provide aggregated metrics (total calls, success rate, average response time)
3. **Dashboard Integration**: Display statistics in the admin dashboard with visualizations
4. **Per-Tool Analytics**: Show individual tool statistics in the MCP detail page
5. **Time-based Filtering**: Support filtering statistics by time period (last 24h, 7d, 30d, all time)

## Database Schema

### New Table: `mcp_tool_usage_stats`

```sql
CREATE TABLE public.mcp_tool_usage_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mcp_tool_id UUID NOT NULL REFERENCES mcp_tools(id) ON DELETE CASCADE,
  mcp_id UUID NOT NULL REFERENCES mcp(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Request details
  tool_name TEXT NOT NULL,
  request_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  request_arguments JSONB, -- Store the arguments passed to the tool
  
  -- Response details
  success BOOLEAN NOT NULL,
  response_status INTEGER, -- HTTP status code from API
  response_time_ms INTEGER, -- Response time in milliseconds
  error_message TEXT, -- Error message if failed
  
  -- Additional metadata
  api_id UUID REFERENCES api(id) ON DELETE SET NULL,
  client_ip TEXT, -- Optional: for tracking client location
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_mcp_tool_usage_stats_tool_id ON mcp_tool_usage_stats(mcp_tool_id);
CREATE INDEX idx_mcp_tool_usage_stats_mcp_id ON mcp_tool_usage_stats(mcp_id);
CREATE INDEX idx_mcp_tool_usage_stats_timestamp ON mcp_tool_usage_stats(request_timestamp DESC);
CREATE INDEX idx_mcp_tool_usage_stats_user_id ON mcp_tool_usage_stats(user_id);
CREATE INDEX idx_mcp_tool_usage_stats_success ON mcp_tool_usage_stats(success);

-- RLS Policies
ALTER TABLE mcp_tool_usage_stats ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see stats for their own MCPs
CREATE POLICY "Users can view their own tool usage stats"
  ON mcp_tool_usage_stats
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM mcp
      WHERE mcp.id = mcp_tool_usage_stats.mcp_id
      AND mcp.user_id = auth.uid()
    )
  );

-- Policy: System can insert stats (via service role)
-- Note: This would be handled via service role key in server actions
```

### Optional: Aggregated Stats Table (for performance)

For better query performance on large datasets, we could create a materialized view or aggregated table:

```sql
-- Materialized view for daily aggregated stats
CREATE MATERIALIZED VIEW mcp_tool_usage_daily_stats AS
SELECT
  mcp_tool_id,
  mcp_id,
  DATE(request_timestamp) as stat_date,
  COUNT(*) as total_calls,
  COUNT(*) FILTER (WHERE success = true) as successful_calls,
  COUNT(*) FILTER (WHERE success = false) as failed_calls,
  AVG(response_time_ms) as avg_response_time_ms,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY response_time_ms) as median_response_time_ms,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY response_time_ms) as p95_response_time_ms,
  MIN(response_time_ms) as min_response_time_ms,
  MAX(response_time_ms) as max_response_time_ms
FROM mcp_tool_usage_stats
GROUP BY mcp_tool_id, mcp_id, DATE(request_timestamp);

CREATE UNIQUE INDEX ON mcp_tool_usage_daily_stats(mcp_tool_id, stat_date);
```

## API Changes

### 1. Update Tool Call Handler

**File**: `app/api/mcp/[slug]/route.ts`

Add statistics tracking in the `tools/call` handler:

```typescript
// After successful API call (around line 259-273)
const startTime = Date.now();
const apiResponse = await callMappedAPI(api, {
  payload: apiPayload,
});
const responseTime = Date.now() - startTime;

// Track statistics
await trackToolUsage({
  mcpToolId: tool.id,
  mcpId: mcp.id,
  toolName: toolRequest.name,
  requestArguments: toolArguments,
  success: apiResponse.status >= 200 && apiResponse.status < 300,
  responseStatus: apiResponse.status,
  responseTimeMs: responseTime,
  apiId: api.id,
  errorMessage: apiResponse.status >= 400 ? apiResponse.data?.message : null,
});
```

Also track failed calls (validation errors, not found, etc.):

```typescript
// In error handlers, track failed attempts
await trackToolUsage({
  mcpToolId: tool?.id,
  mcpId: mcp.id,
  toolName: toolRequest.name,
  requestArguments: toolRequest.arguments || {},
  success: false,
  responseStatus: 400, // or appropriate error code
  responseTimeMs: Date.now() - startTime,
  errorMessage: errorResponse.error.message,
});
```

### 2. Create Statistics Tracking Function

**New File**: `lib/mcp/statistics.ts`

```typescript
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

export async function trackToolUsage(stats: ToolUsageStats) {
  try {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from('mcp_tool_usage_stats')
      .insert({
        mcp_tool_id: stats.mcpToolId,
        mcp_id: stats.mcpId,
        tool_name: stats.toolName,
        request_arguments: stats.requestArguments || null,
        success: stats.success,
        response_status: stats.responseStatus || null,
        response_time_ms: stats.responseTimeMs,
        api_id: stats.apiId || null,
        error_message: stats.errorMessage || null,
        client_ip: stats.clientIp || null,
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
```

## Backend Implementation

### 1. Statistics Server Actions

**New File**: `app/admin/mcps/statistics-actions.ts`

```typescript
'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth/middleware';

export interface ToolStatistics {
  toolId: string;
  toolName: string;
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  successRate: number;
  avgResponseTimeMs: number;
  lastCalledAt: string | null;
}

export interface MCPStatistics {
  mcpId: string;
  totalToolCalls: number;
  totalTools: number;
  mostUsedTool: {
    name: string;
    callCount: number;
  } | null;
  successRate: number;
  avgResponseTimeMs: number;
}

export interface TimeRange {
  start: Date;
  end: Date;
}

// Get statistics for all tools in an MCP
export async function getMCPToolStatistics(
  mcpId: string,
  timeRange?: TimeRange
): Promise<ToolStatistics[]> {
  await requireAuth();
  const supabase = await createClient();

  let query = supabase
    .from('mcp_tool_usage_stats')
    .select('*')
    .eq('mcp_id', mcpId);

  if (timeRange) {
    query = query
      .gte('request_timestamp', timeRange.start.toISOString())
      .lte('request_timestamp', timeRange.end.toISOString());
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch tool statistics: ${error.message}`);
  }

  // Aggregate by tool
  const toolStatsMap = new Map<string, ToolStatistics>();

  data?.forEach((stat) => {
    const existing = toolStatsMap.get(stat.mcp_tool_id) || {
      toolId: stat.mcp_tool_id,
      toolName: stat.tool_name,
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      successRate: 0,
      avgResponseTimeMs: 0,
      lastCalledAt: null,
      responseTimes: [] as number[],
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
  timeRange?: TimeRange
): Promise<MCPStatistics> {
  await requireAuth();
  const supabase = await createClient();

  const [toolStats, toolsData] = await Promise.all([
    getMCPToolStatistics(mcpId, timeRange),
    supabase
      .from('mcp_tools')
      .select('id, name')
      .eq('mcp_id', mcpId),
  ]);

  const totalToolCalls = toolStats.reduce((sum, stat) => sum + stat.totalCalls, 0);
  const totalSuccessful = toolStats.reduce((sum, stat) => sum + stat.successfulCalls, 0);
  const allResponseTimes = toolStats.flatMap((stat) => {
    // We'd need to fetch individual stats for response times
    // For now, use average
    return stat.avgResponseTimeMs > 0 ? [stat.avgResponseTimeMs] : [];
  });

  const mostUsedTool = toolStats.reduce(
    (max, stat) => (stat.totalCalls > max.callCount ? { name: stat.toolName, callCount: stat.totalCalls } : max),
    { name: '', callCount: 0 }
  );

  return {
    mcpId,
    totalToolCalls,
    totalTools: toolsData.data?.length || 0,
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
  timeRange?: TimeRange
): Promise<{
  totalToolCalls: number;
  totalMCPs: number;
  totalTools: number;
  overallSuccessRate: number;
  topTools: Array<{ toolName: string; mcpName: string; callCount: number }>;
}> {
  await requireAuth();
  const supabase = await createClient();

  // Implementation similar to above but across all MCPs
  // ...
}
```

## Frontend Implementation

### 1. Update Admin Dashboard

**File**: `app/admin/page.tsx`

Add statistics cards and charts:

```typescript
import { getDashboardStatistics } from '@/app/admin/mcps/statistics-actions';
import StatisticsCards from './statistics-cards';
import ToolUsageChart from './tool-usage-chart';

export default async function AdminDashboard() {
  const stats = await getDashboardStatistics();

  return (
    <div className="space-y-6">
      {/* ... existing header ... */}
      
      <StatisticsCards stats={stats} />
      <ToolUsageChart stats={stats} />
      
      {/* ... existing content ... */}
    </div>
  );
}
```

### 2. Add Statistics to MCP Detail Page

**File**: `app/admin/mcps/[id]/page.tsx`

```typescript
import { getMCPStatistics, getMCPToolStatistics } from '../statistics-actions';

// In the component:
const [mcpStats, toolStats] = await Promise.all([
  getMCPStatistics(id),
  getMCPToolStatistics(id),
]);
```

**File**: `app/admin/mcps/mcp-detail.tsx`

Add a statistics section:

```typescript
import ToolStatisticsSection from './tool-statistics-section';

// In the component:
<ToolStatisticsSection 
  mcpId={mcp.id}
  toolStats={toolStats}
  mcpStats={mcpStats}
/>
```

### 3. New Components

**New File**: `app/admin/statistics-cards.tsx`

```typescript
'use client';

interface StatisticsCardsProps {
  stats: {
    totalToolCalls: number;
    totalMCPs: number;
    totalTools: number;
    overallSuccessRate: number;
  };
}

export default function StatisticsCards({ stats }: StatisticsCardsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Tool Calls"
        value={stats.totalToolCalls.toLocaleString()}
        description="All time"
      />
      <StatCard
        title="Active MCPs"
        value={stats.totalMCPs.toString()}
        description="Configured MCPs"
      />
      <StatCard
        title="Total Tools"
        value={stats.totalTools.toString()}
        description="Available tools"
      />
      <StatCard
        title="Success Rate"
        value={`${stats.overallSuccessRate.toFixed(1)}%`}
        description="Overall success rate"
      />
    </div>
  );
}
```

**New File**: `app/admin/mcps/tool-statistics-section.tsx`

```typescript
'use client';

import { useState } from 'react';
import { ToolStatistics, MCPStatistics } from '../statistics-actions';

interface ToolStatisticsSectionProps {
  mcpId: string;
  toolStats: ToolStatistics[];
  mcpStats: MCPStatistics;
}

export default function ToolStatisticsSection({
  mcpId,
  toolStats,
  mcpStats,
}: ToolStatisticsSectionProps) {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | 'all'>('7d');

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-black dark:text-zinc-50">
          Tool Usage Statistics
        </h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as any)}
          className="rounded border border-zinc-300 bg-white px-3 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-800"
        >
          <option value="24h">Last 24 hours</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="all">All time</option>
        </select>
      </div>

      {/* MCP Overview Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Total Calls</p>
          <p className="text-2xl font-bold text-black dark:text-zinc-50">
            {mcpStats.totalToolCalls}
          </p>
        </div>
        <div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Success Rate</p>
          <p className="text-2xl font-bold text-black dark:text-zinc-50">
            {mcpStats.successRate.toFixed(1)}%
          </p>
        </div>
        <div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Avg Response</p>
          <p className="text-2xl font-bold text-black dark:text-zinc-50">
            {mcpStats.avgResponseTimeMs.toFixed(0)}ms
          </p>
        </div>
        <div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Most Used</p>
          <p className="text-lg font-semibold text-black dark:text-zinc-50">
            {mcpStats.mostUsedTool?.name || 'N/A'}
          </p>
        </div>
      </div>

      {/* Tool Statistics Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800">
              <th className="px-4 py-2 text-left text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Tool Name
              </th>
              <th className="px-4 py-2 text-right text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Total Calls
              </th>
              <th className="px-4 py-2 text-right text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Success Rate
              </th>
              <th className="px-4 py-2 text-right text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Avg Response
              </th>
              <th className="px-4 py-2 text-right text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Last Called
              </th>
            </tr>
          </thead>
          <tbody>
            {toolStats.map((stat) => (
              <tr
                key={stat.toolId}
                className="border-b border-zinc-100 dark:border-zinc-800"
              >
                <td className="px-4 py-2 font-medium text-black dark:text-zinc-50">
                  {stat.toolName}
                </td>
                <td className="px-4 py-2 text-right text-black dark:text-zinc-50">
                  {stat.totalCalls}
                </td>
                <td className="px-4 py-2 text-right">
                  <span
                    className={
                      stat.successRate >= 95
                        ? 'text-green-600 dark:text-green-400'
                        : stat.successRate >= 80
                        ? 'text-yellow-600 dark:text-yellow-400'
                        : 'text-red-600 dark:text-red-400'
                    }
                  >
                    {stat.successRate.toFixed(1)}%
                  </span>
                </td>
                <td className="px-4 py-2 text-right text-black dark:text-zinc-50">
                  {stat.avgResponseTimeMs.toFixed(0)}ms
                </td>
                <td className="px-4 py-2 text-right text-sm text-zinc-600 dark:text-zinc-400">
                  {stat.lastCalledAt
                    ? new Date(stat.lastCalledAt).toLocaleString()
                    : 'Never'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

## Type Definitions

**Update**: `lib/types/mcp.ts`

```typescript
export interface MCPToolUsageStats {
  id: string;
  mcp_tool_id: string;
  mcp_id: string;
  user_id: string | null;
  tool_name: string;
  request_timestamp: string;
  request_arguments: Record<string, any> | null;
  success: boolean;
  response_status: number | null;
  response_time_ms: number;
  error_message: string | null;
  api_id: string | null;
  client_ip: string | null;
  created_at: string;
}
```

## Implementation Steps

### Phase 1: Database Setup
1. ✅ Create `mcp_tool_usage_stats` table
2. ✅ Create indexes for performance
3. ✅ Set up RLS policies
4. ✅ (Optional) Create materialized view for aggregated stats

### Phase 2: Backend Tracking
1. ✅ Create `lib/mcp/statistics.ts` with `trackToolUsage` function
2. ✅ Update `app/api/mcp/[slug]/route.ts` to track tool calls
3. ✅ Handle both successful and failed calls
4. ✅ Test statistics tracking in development

### Phase 3: Statistics Queries
1. ✅ Create `app/admin/mcps/statistics-actions.ts`
2. ✅ Implement `getMCPToolStatistics`
3. ✅ Implement `getMCPStatistics`
4. ✅ Implement `getDashboardStatistics`

### Phase 4: Frontend Components
1. ✅ Create `app/admin/statistics-cards.tsx`
2. ✅ Create `app/admin/mcps/tool-statistics-section.tsx`
3. ✅ Update `app/admin/page.tsx` to show dashboard stats
4. ✅ Update `app/admin/mcps/[id]/page.tsx` to fetch and pass stats
5. ✅ Update `app/admin/mcps/mcp-detail.tsx` to display stats

### Phase 5: Testing & Polish
1. ✅ Test with various scenarios (success, failure, edge cases)
2. ✅ Verify performance with large datasets
3. ✅ Add loading states and error handling
4. ✅ Add time range filtering
5. ✅ (Optional) Add charts/visualizations using a charting library

## Performance Considerations

1. **Async Tracking**: Statistics tracking should be non-blocking and not affect tool call performance
2. **Indexing**: Proper indexes on frequently queried columns
3. **Aggregation**: Consider using materialized views or scheduled aggregation for large datasets
4. **Pagination**: For statistics tables with many rows, implement pagination
5. **Caching**: Cache aggregated statistics for dashboard views

## Future Enhancements

1. **Real-time Updates**: WebSocket or Server-Sent Events for live statistics
2. **Export Functionality**: CSV/JSON export of statistics
3. **Alerts**: Notify admins when success rate drops below threshold
4. **Advanced Analytics**: Trend analysis, predictions, anomaly detection
5. **Per-User Statistics**: Track which users are using which tools
6. **Geographic Analytics**: If client IP is tracked, show usage by region
7. **Cost Tracking**: If APIs have costs, track and display cost per tool call

## Testing Checklist

- [ ] Tool call tracking works for successful calls
- [ ] Tool call tracking works for failed calls
- [ ] Statistics are correctly aggregated
- [ ] Time range filtering works correctly
- [ ] RLS policies prevent unauthorized access
- [ ] Performance is acceptable with large datasets
- [ ] Dashboard displays correct statistics
- [ ] MCP detail page shows tool statistics
- [ ] Error handling doesn't break tool calls
- [ ] Statistics persist correctly after tool deletion
