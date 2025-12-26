'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MCP, MCPTool, MCPResource } from '@/lib/types/mcp';
import ToolsSection from './tools-section';
import ResourcesSection from './resources-section';

interface MCPDetailProps {
  mcp: MCP;
  initialTools: MCPTool[];
  initialResources: MCPResource[];
  error: string | null;
}

export default function MCPDetail({
  mcp,
  initialTools,
  initialResources,
  error,
}: MCPDetailProps) {
  const [tools, setTools] = useState<MCPTool[]>(initialTools);
  const [resources, setResources] = useState<MCPResource[]>(initialResources);

  const handleToolsUpdate = (updatedTools: MCPTool[]) => {
    setTools(updatedTools);
  };

  const handleResourcesUpdate = (updatedResources: MCPResource[]) => {
    setResources(updatedResources);
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/mcps"
          className="mb-4 inline-flex items-center text-sm text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          ← Back to MCPs
        </Link>
        <div className="mt-4">
          <h1 className="text-3xl font-bold text-black dark:text-zinc-50">
            {mcp.name}
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            <code className="rounded bg-zinc-100 px-2 py-1 text-xs dark:bg-zinc-800">
              {mcp.slug}
            </code>
          </p>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-500">
            Created: {new Date(mcp.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400">
          {error}
        </div>
      )}

      <ToolsSection mcpId={mcp.id} initialTools={tools} onUpdate={handleToolsUpdate} />
      <ResourcesSection
        mcpId={mcp.id}
        initialResources={resources}
        onUpdate={handleResourcesUpdate}
      />
    </div>
  );
}
