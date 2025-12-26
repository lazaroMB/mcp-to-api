'use client';

import { useState } from 'react';
import { MCPTool } from '@/lib/types/mcp';
import ToolForm from './tool-form';
import ToolMappingSection from './tool-mapping-section';
import { MCPToolAPIMapping, API } from '@/lib/types/mapping';

interface ToolsSectionProps {
  mcpId: string;
  initialTools: MCPTool[];
  apis: API[];
  onUpdate: (tools: MCPTool[]) => void;
}

export default function ToolsSection({
  mcpId,
  initialTools,
  apis,
  onUpdate,
}: ToolsSectionProps) {
  const [tools, setTools] = useState<MCPTool[]>(initialTools);
  const [showForm, setShowForm] = useState(false);
  const [editingTool, setEditingTool] = useState<MCPTool | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCreate = () => {
    setEditingTool(null);
    setShowForm(true);
  };

  const handleEdit = (tool: MCPTool) => {
    setEditingTool(tool);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tool?')) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`/admin/mcps/${mcpId}/tools/api?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete tool');
      }

      const updatedTools = tools.filter((tool) => tool.id !== id);
      setTools(updatedTools);
      onUpdate(updatedTools);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete tool');
    } finally {
      setDeletingId(null);
    }
  };

  const handleFormSuccess = async () => {
    setShowForm(false);
    setEditingTool(null);
    const response = await fetch(`/admin/mcps/${mcpId}/tools/api`);
    if (response.ok) {
      const data = await response.json();
      setTools(data);
      onUpdate(data);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingTool(null);
  };

  return (
    <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="border-b border-zinc-200 p-6 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-black dark:text-zinc-50">
              Tools
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Manage tools (functions/capabilities) for this MCP
            </p>
          </div>
          {!showForm && (
            <button
              onClick={handleCreate}
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
            >
              Add Tool
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        {showForm ? (
          <ToolForm
            mcpId={mcpId}
            tool={editingTool}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        ) : tools.length === 0 ? (
          <p className="text-center text-zinc-600 dark:text-zinc-400">
            No tools configured. Add your first tool to get started.
          </p>
        ) : (
          <div className="space-y-6">
            {tools.map((tool) => (
              <div key={tool.id} className="space-y-4">
                <div className="flex items-start justify-between rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
                  <div className="flex-1">
                    <h3 className="font-medium text-black dark:text-zinc-50">
                      {tool.name}
                    </h3>
                    {tool.description && (
                      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                        {tool.description}
                      </p>
                    )}
                    <div className="mt-2">
                      <details className="text-xs">
                        <summary className="cursor-pointer text-zinc-500 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300">
                          View Input Schema
                        </summary>
                        <pre className="mt-2 overflow-auto rounded bg-zinc-100 p-2 dark:bg-zinc-800">
                          {JSON.stringify(tool.input_schema, null, 2)}
                        </pre>
                      </details>
                    </div>
                  </div>
                  <div className="ml-4 flex gap-2">
                    <button
                      onClick={() => handleEdit(tool)}
                      className="text-sm text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(tool.id)}
                      disabled={deletingId === tool.id}
                      className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50 dark:text-red-400 dark:hover:text-red-300"
                    >
                      {deletingId === tool.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
                <ToolMappingSection
                  tool={tool}
                  initialMappings={[]}
                  apis={apis}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
