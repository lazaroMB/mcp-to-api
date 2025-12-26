'use client';

import { useState } from 'react';
import { API } from '@/lib/types/api';
import APIForm from './api-form';

interface APIsListProps {
  initialAPIs: API[];
}

export default function APIsList({ initialAPIs }: APIsListProps) {
  const [apis, setApis] = useState<API[]>(initialAPIs);
  const [showForm, setShowForm] = useState(false);
  const [editingAPI, setEditingAPI] = useState<API | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = () => {
    setEditingAPI(null);
    setShowForm(true);
  };

  const handleEdit = (api: API) => {
    setEditingAPI(api);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this API? This action cannot be undone.')) {
      return;
    }

    setDeletingId(id);
    setError(null);
    try {
      const response = await fetch(`/admin/api/api?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete API');
      }

      setApis(apis.filter((api) => api.id !== id));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete API');
    } finally {
      setDeletingId(null);
    }
  };

  const handleFormSuccess = async () => {
    setShowForm(false);
    setEditingAPI(null);
    // Refresh the list
    const response = await fetch('/admin/api/api');
    if (response.ok) {
      const data = await response.json();
      setApis(data);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingAPI(null);
  };

  if (showForm) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-6 text-xl font-semibold text-black dark:text-zinc-50">
          {editingAPI ? 'Edit API' : 'Create New API'}
        </h2>
        <APIForm api={editingAPI} onSuccess={handleFormSuccess} onCancel={handleFormCancel} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="font-medium mb-1">Error deleting API</p>
              <p>{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-4 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        </div>
      )}
      <div className="flex justify-end">
        <button
          onClick={handleCreate}
          className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
        >
          Create API
        </button>
      </div>

      {apis.length === 0 ? (
        <div className="rounded-lg border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-zinc-600 dark:text-zinc-400">
            No APIs found. Create your first API to get started.
          </p>
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
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    URL
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    Description
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
                {apis.map((api) => (
                  <tr key={api.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                    <td className="px-6 py-4 text-sm font-medium text-black dark:text-zinc-50">
                      {api.name}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          api.method === 'GET'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                            : api.method === 'POST'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : api.method === 'PUT' || api.method === 'PATCH'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : api.method === 'DELETE'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400'
                        }`}
                      >
                        {api.method}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                      <code className="rounded bg-zinc-100 px-2 py-1 text-xs dark:bg-zinc-800">
                        {api.url}
                      </code>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                      {api.description || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                      {new Date(api.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 text-right text-sm">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleEdit(api)}
                          className="text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(api.id)}
                          disabled={deletingId === api.id}
                          className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed dark:text-red-400 dark:hover:text-red-300"
                        >
                          {deletingId === api.id ? 'Deleting...' : 'Delete'}
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
