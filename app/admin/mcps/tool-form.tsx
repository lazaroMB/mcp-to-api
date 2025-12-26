'use client';

import { useState, useEffect } from 'react';
import { MCPTool, MCPToolFormData } from '@/lib/types/mcp';

interface ToolFormProps {
  mcpId: string;
  tool?: MCPTool | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ToolForm({ mcpId, tool, onSuccess, onCancel }: ToolFormProps) {
  const [formData, setFormData] = useState<MCPToolFormData>({
    name: tool?.name || '',
    description: tool?.description || '',
    input_schema: tool?.input_schema || {},
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [schemaText, setSchemaText] = useState(
    JSON.stringify(formData.input_schema, null, 2)
  );

  useEffect(() => {
    setSchemaText(JSON.stringify(formData.input_schema, null, 2));
  }, [formData.input_schema]);

  const handleSchemaChange = (text: string) => {
    setSchemaText(text);
    try {
      const parsed = JSON.parse(text);
      setFormData({ ...formData, input_schema: parsed });
    } catch {
      // Invalid JSON, but we'll validate on submit
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate JSON schema
      let parsedSchema = formData.input_schema;
      if (schemaText.trim()) {
        try {
          parsedSchema = JSON.parse(schemaText);
        } catch {
          throw new Error('Invalid JSON schema');
        }
      }

      const response = await fetch(
        tool ? `/admin/mcps/${mcpId}/tools/api?id=${tool.id}` : `/admin/mcps/${mcpId}/tools/api`,
        {
          method: tool ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            input_schema: parsedSchema,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save tool');
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
          placeholder="e.g., read_file"
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
          placeholder="Tool description"
        />
      </div>

      <div>
        <label
          htmlFor="input_schema"
          className="block text-sm font-medium text-black dark:text-zinc-50 mb-2"
        >
          Input Schema (JSON) *
        </label>
        <textarea
          id="input_schema"
          required
          value={schemaText}
          onChange={(e) => handleSchemaChange(e.target.value)}
          rows={10}
          className="w-full font-mono rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-black focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-50 dark:focus:ring-zinc-50"
          placeholder='{"type": "object", "properties": {...}}'
        />
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
          JSON Schema defining the tool's input parameters
        </p>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
        >
          {isSubmitting ? 'Saving...' : tool ? 'Update Tool' : 'Create Tool'}
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
