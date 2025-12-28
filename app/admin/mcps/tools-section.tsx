'use client';

import { useState, useEffect } from 'react';
import { MCPTool } from '@/lib/types/mcp';
import ToolForm from './tool-form';
import ToolMappingSection from './tool-mapping-section';
import { MCPToolAPIMapping } from '@/lib/types/mapping';
import { API } from '@/lib/types/api';

interface ToolsSectionProps {
  mcpId: string;
  initialTools: MCPTool[];
  apis: API[];
  onUpdate: (tools: MCPTool[]) => void;
  createdToolId?: string | null;
}

export default function ToolsSection({
  mcpId,
  initialTools,
  apis,
  onUpdate,
  createdToolId,
}: ToolsSectionProps) {
  const [tools, setTools] = useState<MCPTool[]>(initialTools);
  const [showForm, setShowForm] = useState(false);
  const [editingTool, setEditingTool] = useState<MCPTool | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // If a tool was just created, show it in edit mode
  useEffect(() => {
    if (createdToolId) {
      const createdTool = tools.find(t => t.id === createdToolId);
      if (createdTool) {
        setEditingTool(createdTool);
        setShowForm(true);
        // Scroll to the form
        setTimeout(() => {
          const formElement = document.querySelector('[data-slot="tool-form"]');
          if (formElement) {
            formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
    }
  }, [createdToolId, tools]);

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
              Tools & Resources
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Manage tools (functions/capabilities) for this MCP. Tools can be used as both tools (via tools/call) and resources (via resources/read).
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
          <div data-slot="tool-form">
            <ToolForm
              mcpId={mcpId}
              tool={editingTool}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </div>
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
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                    <code className="rounded bg-zinc-100 px-2 py-1 text-xs dark:bg-zinc-800">
                      {tool.uri}
                    </code>
                    <span className="ml-2 text-blue-600 dark:text-blue-400">(also available as resource)</span>
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    {(() => {
                      const schema = tool.input_schema || {};
                      const hasProperties = schema?.properties && Object.keys(schema.properties).length > 0;
                      if (!hasProperties) {
                        return (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                              ⚠️ No parameters defined
                            </span>
                            <p className="text-xs text-yellow-700 dark:text-yellow-400">
                              Edit this tool to add parameters to the input schema. Without parameters, the tool cannot accept arguments.
                            </p>
                          </div>
                        );
                      }
                      const paramCount = Object.keys(schema.properties).length;
                      return (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          ✓ {paramCount} parameter{paramCount !== 1 ? 's' : ''}
                        </span>
                      );
                    })()}
                  </div>
                  <div className="mt-2">
                    <details className="text-xs">
                      <summary className="cursor-pointer text-zinc-500 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300">
                        View Input Schema
                      </summary>
                      <div className="mt-2 space-y-2">
                        <pre className="overflow-auto rounded bg-zinc-100 p-2 dark:bg-zinc-800">
                          {JSON.stringify(tool.input_schema, null, 2)}
                        </pre>
                        {(() => {
                          const schema = tool.input_schema || {};
                          const properties = schema.properties || {};
                          const paramNames = Object.keys(properties);
                          if (paramNames.length > 0) {
                            return (
                              <div className="rounded bg-blue-50 border border-blue-200 p-2 dark:bg-blue-900/20 dark:border-blue-800">
                                <p className="text-xs font-medium text-blue-800 dark:text-blue-400 mb-1">
                                  Available Parameters:
                                </p>
                                <ul className="text-xs text-blue-700 dark:text-blue-300 list-disc list-inside">
                                  {paramNames.map((param) => {
                                    const prop = properties[param];
                                    return (
                                      <li key={param}>
                                        <code className="font-mono">{param}</code>
                                        {prop.type && ` (${prop.type})`}
                                        {prop.description && ` - ${prop.description}`}
                                      </li>
                                    );
                                  })}
                                </ul>
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
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
