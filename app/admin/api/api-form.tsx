'use client';

import { useState, useEffect } from 'react';
import { API, APIFormData, KeyValuePair, HTTPMethod } from '@/lib/types/api';
import AddToMCPDialog from './add-to-mcp-dialog';

interface APIFormProps {
  api?: API | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function APIForm({ api, onSuccess, onCancel }: APIFormProps) {
  const [formData, setFormData] = useState<APIFormData>({
    name: api?.name || '',
    description: api?.description || '',
    method: api?.method || 'GET',
    url: api?.url || '',
    headers: api?.headers || [],
    cookies: api?.cookies || [],
    url_params: api?.url_params || [],
    payload_schema: api?.payload_schema || null,
    is_enabled: api?.is_enabled ?? true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [schemaText, setSchemaText] = useState(
    api?.payload_schema ? JSON.stringify(api.payload_schema, null, 2) : ''
  );
  const [addToMCPDialogOpen, setAddToMCPDialogOpen] = useState(false);

  const methods: HTTPMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

  const handleAddHeader = () => {
    setFormData({
      ...formData,
      headers: [...formData.headers, { name: '', value: '' }],
    });
  };

  const handleRemoveHeader = (index: number) => {
    setFormData({
      ...formData,
      headers: formData.headers.filter((_, i) => i !== index),
    });
  };

  const handleHeaderChange = (index: number, field: 'name' | 'value', value: string) => {
    const newHeaders = [...formData.headers];
    newHeaders[index] = { ...newHeaders[index], [field]: value };
    setFormData({ ...formData, headers: newHeaders });
  };

  const handleAddCookie = () => {
    setFormData({
      ...formData,
      cookies: [...formData.cookies, { name: '', value: '' }],
    });
  };

  const handleRemoveCookie = (index: number) => {
    setFormData({
      ...formData,
      cookies: formData.cookies.filter((_, i) => i !== index),
    });
  };

  const handleCookieChange = (index: number, field: 'name' | 'value', value: string) => {
    const newCookies = [...formData.cookies];
    newCookies[index] = { ...newCookies[index], [field]: value };
    setFormData({ ...formData, cookies: newCookies });
  };

  const handleAddUrlParam = () => {
    setFormData({
      ...formData,
      url_params: [...formData.url_params, { name: '', value: '' }],
    });
  };

  const handleRemoveUrlParam = (index: number) => {
    setFormData({
      ...formData,
      url_params: formData.url_params.filter((_, i) => i !== index),
    });
  };

  const handleUrlParamChange = (index: number, field: 'name' | 'value', value: string) => {
    const newUrlParams = [...formData.url_params];
    newUrlParams[index] = { ...newUrlParams[index], [field]: value };
    setFormData({ ...formData, url_params: newUrlParams });
  };

  const handleSchemaChange = (text: string) => {
    setSchemaText(text);
    try {
      const parsed = text.trim() ? JSON.parse(text) : null;
      setFormData({ ...formData, payload_schema: parsed });
    } catch {
      // Invalid JSON, but we'll validate on submit
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate and clean empty key-value pairs
      const cleanHeaders = formData.headers.filter((h) => h.name.trim() || h.value.trim());
      const cleanCookies = formData.cookies.filter((c) => c.name.trim() || c.value.trim());
      const cleanUrlParams = formData.url_params.filter((p) => p.name.trim() || p.value.trim());

      // Validate JSON schema if provided
      let parsedSchema = formData.payload_schema;
      if (schemaText.trim()) {
        try {
          parsedSchema = JSON.parse(schemaText);
        } catch {
          throw new Error('Invalid JSON schema');
        }
      } else {
        parsedSchema = null;
      }

      const response = await fetch(
        api ? `/admin/api/api?id=${api.id}` : '/admin/api/api',
        {
          method: api ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            headers: cleanHeaders,
            cookies: cleanCookies,
            url_params: cleanUrlParams,
            payload_schema: parsedSchema,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save API');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
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
            placeholder="API endpoint name"
          />
        </div>

        <div>
          <label
            htmlFor="method"
            className="block text-sm font-medium text-black dark:text-zinc-50 mb-2"
          >
            Method *
          </label>
          <select
            id="method"
            required
            value={formData.method}
            onChange={(e) => setFormData({ ...formData, method: e.target.value as HTTPMethod })}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-black focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-50 dark:focus:ring-zinc-50"
          >
            {methods.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label
          htmlFor="url"
          className="block text-sm font-medium text-black dark:text-zinc-50 mb-2"
        >
          URL *
        </label>
        <input
          type="text"
          id="url"
          required
          value={formData.url}
          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-black focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-50 dark:focus:ring-zinc-50"
          placeholder="https://api.example.com/endpoint"
        />
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
          You can use <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">{"{variableName}"}</code> in the URL to reference payload fields.
        </p>
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
          placeholder="API description"
        />
      </div>

      {/* Headers */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-black dark:text-zinc-50">
            Headers
          </label>
          <button
            type="button"
            onClick={handleAddHeader}
            className="text-sm text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            + Add Header
          </button>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-500 mb-2">
          Use <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">{"{variableName}"}</code> in header values to reference payload fields. 
          Example: <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">Bearer {"{token}"}</code> will be replaced with the value of <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">token</code> from the payload.
        </p>
        <div className="space-y-2">
          {formData.headers.map((header, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={header.name}
                onChange={(e) => handleHeaderChange(index, 'name', e.target.value)}
                placeholder="Header name"
                className="flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-black focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-50 dark:focus:ring-zinc-50"
              />
              <input
                type="text"
                value={header.value}
                onChange={(e) => handleHeaderChange(index, 'value', e.target.value)}
                placeholder="Header value (use {var} for variables)"
                className="flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-black focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-50 dark:focus:ring-zinc-50"
              />
              <button
                type="button"
                onClick={() => handleRemoveHeader(index)}
                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
              >
                Remove
              </button>
            </div>
          ))}
          {formData.headers.length === 0 && (
            <p className="text-sm text-zinc-500 dark:text-zinc-500">No headers added</p>
          )}
        </div>
      </div>

      {/* Cookies */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-black dark:text-zinc-50">
            Cookies
          </label>
          <button
            type="button"
            onClick={handleAddCookie}
            className="text-sm text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            + Add Cookie
          </button>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-500 mb-2">
          Use <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">{"{variableName}"}</code> in cookie values to reference payload fields. 
          Example: <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">{"{sessionId}"}</code> will be replaced with the value of <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">sessionId</code> from the payload.
        </p>
        <div className="space-y-2">
          {formData.cookies.map((cookie, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={cookie.name}
                onChange={(e) => handleCookieChange(index, 'name', e.target.value)}
                placeholder="Cookie name"
                className="flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-black focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-50 dark:focus:ring-zinc-50"
              />
              <input
                type="text"
                value={cookie.value}
                onChange={(e) => handleCookieChange(index, 'value', e.target.value)}
                placeholder="Cookie value (use {var} for variables)"
                className="flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-black focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-50 dark:focus:ring-zinc-50"
              />
              <button
                type="button"
                onClick={() => handleRemoveCookie(index)}
                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
              >
                Remove
              </button>
            </div>
          ))}
          {formData.cookies.length === 0 && (
            <p className="text-sm text-zinc-500 dark:text-zinc-500">No cookies added</p>
          )}
        </div>
      </div>

      {/* URL Parameters */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-black dark:text-zinc-50">
            URL Parameters
          </label>
          <button
            type="button"
            onClick={handleAddUrlParam}
            className="text-sm text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            + Add Parameter
          </button>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-500 mb-2">
          Use <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">{"{variableName}"}</code> in parameter values to reference payload fields. 
          Example: <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">{"{userId}"}</code> will be replaced with the value of <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">userId</code> from the payload.
        </p>
        <div className="space-y-2">
          {formData.url_params.map((param, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={param.name}
                onChange={(e) => handleUrlParamChange(index, 'name', e.target.value)}
                placeholder="Parameter name"
                className="flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-black focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-50 dark:focus:ring-zinc-50"
              />
              <input
                type="text"
                value={param.value}
                onChange={(e) => handleUrlParamChange(index, 'value', e.target.value)}
                placeholder="Parameter value (use {var} for variables)"
                className="flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-black focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-50 dark:focus:ring-zinc-50"
              />
              <button
                type="button"
                onClick={() => handleRemoveUrlParam(index)}
                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
              >
                Remove
              </button>
            </div>
          ))}
          {formData.url_params.length === 0 && (
            <p className="text-sm text-zinc-500 dark:text-zinc-500">No URL parameters added</p>
          )}
        </div>
      </div>

      {/* Payload Schema */}
      <div>
        <label
          htmlFor="payload_schema"
          className="block text-sm font-medium text-black dark:text-zinc-50 mb-2"
        >
          Payload Schema (JSON)
        </label>
        <textarea
          id="payload_schema"
          value={schemaText}
          onChange={(e) => handleSchemaChange(e.target.value)}
          rows={10}
          className="w-full font-mono rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-black focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-50 dark:focus:ring-zinc-50"
          placeholder='{"type": "object", "properties": {...}}'
        />
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
          JSON Schema for request payload (optional, mainly for POST/PUT/PATCH)
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
            Enable API
          </span>
        </label>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
          If disabled, the API will not be available when queried
        </p>
      </div>

      <div className="flex gap-3 pt-4">
        {api && (
          <button
            type="button"
            onClick={() => setAddToMCPDialogOpen(true)}
            disabled={isSubmitting}
            className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
          >
            Add to MCP
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
        >
          {isSubmitting ? 'Saving...' : api ? 'Update API' : 'Create API'}
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

      {api && (
        <AddToMCPDialog
          api={api}
          open={addToMCPDialogOpen}
          onOpenChange={setAddToMCPDialogOpen}
        />
      )}
    </form>
  );
}
