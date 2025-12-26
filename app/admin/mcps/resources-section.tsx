'use client';

import { useState } from 'react';
import { MCPResource, MCPResourceFormData } from '@/lib/types/mcp';
import ResourceForm from './resource-form';

interface ResourcesSectionProps {
  mcpId: string;
  initialResources: MCPResource[];
  onUpdate: (resources: MCPResource[]) => void;
}

export default function ResourcesSection({
  mcpId,
  initialResources,
  onUpdate,
}: ResourcesSectionProps) {
  const [resources, setResources] = useState<MCPResource[]>(initialResources);
  const [showForm, setShowForm] = useState(false);
  const [editingResource, setEditingResource] = useState<MCPResource | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCreate = () => {
    setEditingResource(null);
    setShowForm(true);
  };

  const handleEdit = (resource: MCPResource) => {
    setEditingResource(resource);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`/admin/mcps/${mcpId}/resources/api?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete resource');
      }

      const updatedResources = resources.filter((resource) => resource.id !== id);
      setResources(updatedResources);
      onUpdate(updatedResources);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete resource');
    } finally {
      setDeletingId(null);
    }
  };

  const handleFormSuccess = async () => {
    setShowForm(false);
    setEditingResource(null);
    const response = await fetch(`/admin/mcps/${mcpId}/resources/api`);
    if (response.ok) {
      const data = await response.json();
      setResources(data);
      onUpdate(data);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingResource(null);
  };

  return (
    <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="border-b border-zinc-200 p-6 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-black dark:text-zinc-50">
              Resources
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Manage resources (data/entities) accessible through this MCP
            </p>
          </div>
          {!showForm && (
            <button
              onClick={handleCreate}
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
            >
              Add Resource
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        {showForm ? (
          <ResourceForm
            mcpId={mcpId}
            resource={editingResource}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        ) : resources.length === 0 ? (
          <p className="text-center text-zinc-600 dark:text-zinc-400">
            No resources configured. Add your first resource to get started.
          </p>
        ) : (
          <div className="space-y-4">
            {resources.map((resource) => (
              <div
                key={resource.id}
                className="flex items-start justify-between rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-black dark:text-zinc-50">
                    {resource.name}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    <code className="rounded bg-zinc-100 px-2 py-1 text-xs dark:bg-zinc-800">
                      {resource.uri}
                    </code>
                  </p>
                  {resource.description && (
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                      {resource.description}
                    </p>
                  )}
                  {resource.mime_type && (
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                      MIME Type: {resource.mime_type}
                    </p>
                  )}
                </div>
                <div className="ml-4 flex gap-2">
                  <button
                    onClick={() => handleEdit(resource)}
                    className="text-sm text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(resource.id)}
                    disabled={deletingId === resource.id}
                    className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50 dark:text-red-400 dark:hover:text-red-300"
                  >
                    {deletingId === resource.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
