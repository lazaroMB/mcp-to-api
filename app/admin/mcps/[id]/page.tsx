import { getMCP } from '../actions';
import { getMCPTools } from '../tools-actions';
import { getAPIs } from '@/app/admin/api/actions';
import { getMCPStatistics, getMCPToolStatistics } from '../statistics-actions';
import type { ToolStatistics, MCPStatistics } from '../statistics-types';
import MCPDetail from '../mcp-detail';
import { notFound } from 'next/navigation';
import { MCPTool } from '@/lib/types/mcp';
import { API } from '@/lib/types/api';

export default async function MCPDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ timeRange?: string }>;
}) {
  const { id } = await params;
  const { timeRange = 'all' } = await searchParams;
  
  // Validate timeRange
  const validTimeRange = ['24h', '7d', '30d', 'all'].includes(timeRange) 
    ? (timeRange as '24h' | '7d' | '30d' | 'all')
    : 'all';

  const mcp = await getMCP(id);

  if (!mcp) {
    notFound();
  }

  let tools: MCPTool[] = [];
  let apis: API[] = [];
  let toolStats = null;
  let mcpStats = null;
  let error = null;

  try {
    [tools, apis, toolStats, mcpStats] = await Promise.all([
      getMCPTools(id),
      getAPIs(),
      getMCPToolStatistics(id, validTimeRange).catch(() => null),
      getMCPStatistics(id, validTimeRange).catch(() => null),
    ]);
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load MCP details';
  }

  return (
    <MCPDetail
      mcp={mcp}
      initialTools={tools}
      apis={apis}
      error={error}
      toolStats={toolStats || []}
      mcpStats={mcpStats}
      timeRange={validTimeRange}
    />
  );
}
