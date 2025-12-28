'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MCP, MCPTool } from '@/lib/types/mcp';
import { API } from '@/lib/types/api';
import ToolsSection from './tools-section';
import ToolStatisticsSection from './tool-statistics-section';
import AccessManagement from './access-management';
import { ToolStatistics, MCPStatistics } from './statistics-types';

interface MCPDetailProps {
  mcp: MCP;
  initialTools: MCPTool[];
  apis: API[];
  error: string | null;
  toolStats: ToolStatistics[] | null;
  mcpStats: MCPStatistics | null;
  timeRange: '24h' | '7d' | '30d' | 'all';
  createdToolId?: string | null;
}

export default function MCPDetail({
  mcp,
  initialTools,
  apis,
  error,
  toolStats,
  mcpStats,
  timeRange,
  createdToolId,
}: MCPDetailProps) {
  const [tools, setTools] = useState<MCPTool[]>(initialTools);

  const handleToolsUpdate = (updatedTools: MCPTool[]) => {
    setTools(updatedTools);
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
          <div className="mt-2">
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              mcp.visibility === 'public'
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
            }`}>
              {mcp.visibility === 'public' ? 'Public' : 'Private'}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Statistics Section */}
      {toolStats && mcpStats && (
        <ToolStatisticsSection
          mcpId={mcp.id}
          toolStats={toolStats}
          mcpStats={mcpStats}
          timeRange={timeRange}
        />
      )}

      {/* Access Management - Only show for private MCPs */}
      {mcp.visibility === 'private' && (
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <AccessManagement mcpId={mcp.id} />
        </div>
      )}

      <ToolsSection 
        mcpId={mcp.id} 
        initialTools={tools} 
        apis={apis} 
        onUpdate={handleToolsUpdate}
        createdToolId={createdToolId}
      />
    </div>
  );
}
