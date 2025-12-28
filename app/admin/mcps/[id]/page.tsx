import { getMCP } from '../actions';
import { getMCPTools } from '../tools-actions';
import { getAPIs } from '@/app/admin/api/actions';
import { getMCPStatistics, getMCPToolStatistics } from '../statistics-actions';
import { addAPIToMCP } from '../api-to-tool-actions';
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
  searchParams: Promise<{ timeRange?: string; apiId?: string }>;
}) {
  const { id } = await params;
  const urlParams = await searchParams;
  const { timeRange = 'all', apiId, createdToolId: createdToolIdFromUrl } = urlParams;
  
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
  let createdToolId: string | null = createdToolIdFromUrl || null;

  try {
    [tools, apis] = await Promise.all([
      getMCPTools(id),
      getAPIs(),
    ]);

    // If apiId is provided (and not already created), redirect to handle via client
    // We can't call server actions during render, so we'll let the client handle it
    if (apiId && !createdToolIdFromUrl) {
      // The client-side dialog will handle the creation via server action
      // For now, just show the page - the dialog will handle navigation
    }

    // Load statistics
    [toolStats, mcpStats] = await Promise.all([
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
      createdToolId={createdToolId}
    />
  );
}
