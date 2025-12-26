'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MCP } from '@/lib/types/mcp';
import MCPForm from './mcp-form';
import MCPConfigView from './mcp-config-view';

interface MCPsListProps {
  initialMCPs: MCP[];
}

export default function MCPsList({ initialMCPs }: MCPsListProps) {
  const [mcps, setMcps] = useState<MCP[]>(initialMCPs);
  const [showForm, setShowForm] = useState(false);
  const [editingMCP, setEditingMCP] = useState<MCP | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCreate = () => {
    setEditingMCP(null);
    setShowForm(true);
  };

  const handleEdit = (mcp: MCP) => {
    setEditingMCP(mcp);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this MCP? This action cannot be undone.')) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`/admin/mcps/api?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete MCP');
      }

      setMcps(mcps.filter((mcp) => mcp.id !== id));
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete MCP');
    } finally {
      setDeletingId(null);
    }
  };

  const handleFormSuccess = async () => {
    setShowForm(false);
    setEditingMCP(null);
    // Refresh the list
    const response = await fetch('/admin/mcps/api');
    if (response.ok) {
      const data = await response.json();
      setMcps(data);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingMCP(null);
  };

  if (showForm) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-6 text-xl font-semibold text-black dark:text-zinc-50">
          {editingMCP ? 'Edit MCP' : 'Create New MCP'}
        </h2>
        <MCPForm mcp={editingMCP} onSuccess={handleFormSuccess} onCancel={handleFormCancel} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={handleCreate}
          className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
        >
          Create MCP
        </button>
      </div>

      {mcps.length === 0 ? (
        <div className="rounded-lg border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-zinc-600 dark:text-zinc-400">No MCPs found. Create your first MCP to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {mcps.map((mcp) => (
            <div
              key={mcp.id}
              className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="border-b border-zinc-200 p-4 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-black dark:text-zinc-50">{mcp.name}</h3>
                      {!mcp.is_enabled && (
                        <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                          Disabled
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                      <code className="rounded bg-zinc-100 px-2 py-1 text-xs dark:bg-zinc-800">
                        {mcp.slug}
                      </code>
                      {' • '}
                      Created: {new Date(mcp.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/mcps/${mcp.id}`}
                      className="rounded-lg bg-black px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
                    >
                      Configure
                    </Link>
                    <button
                      onClick={() => handleEdit(mcp)}
                      className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(mcp.id)}
                      disabled={deletingId === mcp.id}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      {deletingId === mcp.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <MCPConfigView mcpSlug={mcp.slug} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
