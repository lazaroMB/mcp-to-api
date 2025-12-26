import { getMCP } from '../actions';
import { getMCPTools, getMCPResources } from '../tools-actions';
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
  let resources = [];
  let error = null;

  try {
    [tools, resources] = await Promise.all([
      getMCPTools(id),
      getMCPResources(id),
    ]);
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load MCP details';
  }

  return (
    <MCPDetail
      mcp={mcp}
      initialTools={tools}
      initialResources={resources}
      error={error}
    />
  );
}
