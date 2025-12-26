'use client';

import { useState } from 'react';
import { MCP } from '@/lib/types/mcp';
import MCPForm from './mcp-form';

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
        <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    Slug
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    Created At
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {mcps.map((mcp) => (
                  <tr key={mcp.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                    <td className="px-6 py-4 text-sm font-medium text-black dark:text-zinc-50">
                      {mcp.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                      <code className="rounded bg-zinc-100 px-2 py-1 text-xs dark:bg-zinc-800">
                        {mcp.slug}
                      </code>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                      {new Date(mcp.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-6 py-4 text-right text-sm">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleEdit(mcp)}
                          className="text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(mcp.id)}
                          disabled={deletingId === mcp.id}
                          className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed dark:text-red-400 dark:hover:text-red-300"
                        >
                          {deletingId === mcp.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
