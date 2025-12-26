'use client';

import { useState } from 'react';
import { MCPResource, MCPResourceFormData } from '@/lib/types/mcp';

interface ResourceFormProps {
  mcpId: string;
  resource?: MCPResource | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ResourceForm({
  mcpId,
  resource,
  onSuccess,
  onCancel,
}: ResourceFormProps) {
  const [formData, setFormData] = useState<MCPResourceFormData>({
    uri: resource?.uri || '',
    name: resource?.name || '',
    description: resource?.description || '',
    mime_type: resource?.mime_type || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        resource
          ? `/admin/mcps/${mcpId}/resources/api?id=${resource.id}`
          : `/admin/mcps/${mcpId}/resources/api`,
        {
          method: resource ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save resource');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400">
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="uri"
          className="block text-sm font-medium text-black dark:text-zinc-50 mb-2"
        >
          URI *
        </label>
        <input
          type="text"
          id="uri"
          required
          value={formData.uri}
          onChange={(e) => setFormData({ ...formData, uri: e.target.value })}
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-black focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-50 dark:focus:ring-zinc-50"
          placeholder="e.g., file:///path/to/resource"
        />
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
          Unique resource identifier (URI)
        </p>
      </div>

      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-black dark:text-zinc-50 mb-2"
        >
          Name *
        </label>
        <input
          type="text"
          id="name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-black focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-50 dark:focus:ring-zinc-50"
          placeholder="Resource name"
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-black dark:text-zinc-50 mb-2"
        >
          Description
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-black focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-50 dark:focus:ring-zinc-50"
          placeholder="Resource description"
        />
      </div>

      <div>
        <label
          htmlFor="mime_type"
          className="block text-sm font-medium text-black dark:text-zinc-50 mb-2"
        >
          MIME Type
        </label>
        <input
          type="text"
          id="mime_type"
          value={formData.mime_type}
          onChange={(e) => setFormData({ ...formData, mime_type: e.target.value })}
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-black focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-50 dark:focus:ring-zinc-50"
          placeholder="e.g., text/plain, application/json"
        />
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
          Optional MIME type for the resource
        </p>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
        >
          {isSubmitting ? 'Saving...' : resource ? 'Update Resource' : 'Create Resource'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
