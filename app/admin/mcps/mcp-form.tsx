'use client';

import { useState, useEffect } from 'react';
import { MCP, MCPFormData } from '@/lib/types/mcp';
import { generateSlug } from '@/lib/utils/slug';

interface MCPFormProps {
  mcp?: MCP | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function MCPForm({ mcp, onSuccess, onCancel }: MCPFormProps) {
  const [formData, setFormData] = useState<MCPFormData>({
    name: mcp?.name || '',
    slug: mcp?.slug || '',
    is_enabled: mcp?.is_enabled ?? true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoGenerateSlug, setAutoGenerateSlug] = useState(!mcp);

  useEffect(() => {
    if (autoGenerateSlug && formData.name) {
      setFormData((prev) => ({
        ...prev,
        slug: generateSlug(formData.name),
      }));
    }
  }, [formData.name, autoGenerateSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        mcp ? `/admin/mcps/api?id=${mcp.id}` : '/admin/mcps/api',
        {
          method: mcp ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save MCP');
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
          placeholder="Enter MCP name"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label
            htmlFor="slug"
            className="block text-sm font-medium text-black dark:text-zinc-50"
          >
            Slug *
          </label>
          {!mcp && (
            <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              <input
                type="checkbox"
                checked={autoGenerateSlug}
                onChange={(e) => setAutoGenerateSlug(e.target.checked)}
                className="rounded border-zinc-300"
              />
              Auto-generate from name
            </label>
          )}
        </div>
        <input
          type="text"
          id="slug"
          required
          value={formData.slug}
          onChange={(e) => {
            setFormData({ ...formData, slug: e.target.value });
            setAutoGenerateSlug(false);
          }}
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-black focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-50 dark:focus:ring-zinc-50"
          placeholder="Enter MCP slug"
        />
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
          URL-friendly identifier (lowercase, hyphens only)
        </p>
      </div>

      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.is_enabled}
            onChange={(e) => setFormData({ ...formData, is_enabled: e.target.checked })}
            className="rounded border-zinc-300"
          />
          <span className="text-sm font-medium text-black dark:text-zinc-50">
            Enable MCP
          </span>
        </label>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
          If disabled, the MCP will appear as non-existent when accessed via API
        </p>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
        >
          {isSubmitting ? 'Saving...' : mcp ? 'Update MCP' : 'Create MCP'}
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
