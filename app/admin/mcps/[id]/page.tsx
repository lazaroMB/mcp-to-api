import { getMCP } from '../actions';
import { getMCPTools } from '../tools-actions';
import { getAPIs } from '@/app/admin/api/actions';
import MCPDetail from '../mcp-detail';
import { notFound } from 'next/navigation';

export default async function MCPDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const mcp = await getMCP(id);

  if (!mcp) {
    notFound();
  }

  let tools = [];
  let apis = [];
  let error = null;

  try {
    [tools, apis] = await Promise.all([
      getMCPTools(id),
      getAPIs(),
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
    />
  );
}
