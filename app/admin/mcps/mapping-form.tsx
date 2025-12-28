'use client';

import { useState, useEffect } from 'react';
import { MCPToolAPIMapping, MappingFormData, FieldMapping } from '@/lib/types/mapping';
import { MCPTool } from '@/lib/types/mcp';
import { API } from '@/lib/types/api';
import { extractFieldsFromSchema, type SchemaField } from '@/lib/utils/schema-fields';

interface MappingFormProps {
  tool: MCPTool;
  toolInputFields: string[];
  toolInputFieldsWithDesc?: SchemaField[];
  mapping: MCPToolAPIMapping | null;
  apis: API[];
  onSuccess: () => void;
  onCancel: () => void;
}

export default function MappingForm({
  tool,
  toolInputFields,
  toolInputFieldsWithDesc = [],
  mapping,
  apis,
  onSuccess,
  onCancel,
}: MappingFormProps) {
  const [formData, setFormData] = useState<MappingFormData>({
    api_id: mapping?.api_id || '',
    mapping_config: mapping?.mapping_config || { field_mappings: [] },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedAPI = apis.find((api) => api.id === formData.api_id);

  // Extract API payload fields from the selected API's payload_schema
  const apiPayloadFields: SchemaField[] = selectedAPI?.payload_schema
    ? extractFieldsFromSchema(selectedAPI.payload_schema)
    : [];
  
  // Create a map for quick lookup of descriptions
  const toolFieldMap = new Map(
    toolInputFieldsWithDesc.map(f => [f.name, f.description || ''])
  );
  const apiFieldMap = new Map(
    apiPayloadFields.map(f => [f.name, f.description || ''])
  );

  const handleAddMapping = () => {
    setFormData({
      ...formData,
      mapping_config: {
        ...formData.mapping_config,
        field_mappings: [
          ...formData.mapping_config.field_mappings,
          { tool_field: '', api_field: '', transformation: 'direct' },
        ],
      },
    });
  };

  const handleRemoveMapping = (index: number) => {
    const newMappings = formData.mapping_config.field_mappings.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      mapping_config: {
        ...formData.mapping_config,
        field_mappings: newMappings,
      },
    });
  };

  const handleMappingChange = (
    index: number,
    field: keyof FieldMapping,
    value: string
  ) => {
    const newMappings = [...formData.mapping_config.field_mappings];
    newMappings[index] = { ...newMappings[index], [field]: value };
    setFormData({
      ...formData,
      mapping_config: {
        ...formData.mapping_config,
        field_mappings: newMappings,
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate mappings
      const validMappings = formData.mapping_config.field_mappings.filter(
        (m) => m.tool_field && m.api_field
      );

      const response = await fetch(
        mapping
          ? `/admin/mcps/tools/${tool.id}/mappings/api?id=${mapping.id}`
          : `/admin/mcps/tools/${tool.id}/mappings/api`,
        {
          method: mapping ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            mapping_config: {
              ...formData.mapping_config,
              field_mappings: validMappings,
            },
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save mapping');
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
          htmlFor="api_id"
          className="block text-sm font-medium text-black dark:text-zinc-50 mb-2"
        >
          Select API *
        </label>
        <select
          id="api_id"
          required
          value={formData.api_id}
          onChange={(e) => setFormData({ ...formData, api_id: e.target.value })}
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-black focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-50 dark:focus:ring-zinc-50"
        >
          <option value="">Choose an API...</option>
          {apis.map((api) => (
            <option key={api.id} value={api.id}>
              {api.method} {api.name} - {api.url}
            </option>
          ))}
        </select>
      </div>

      {selectedAPI && (
        <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800 p-4 space-y-2">
          <p className="text-sm font-medium text-black dark:text-zinc-50">
            Selected API: {selectedAPI.method} {selectedAPI.name}
          </p>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            URL: <code className="bg-zinc-200 dark:bg-zinc-700 px-1 rounded">{selectedAPI.url}</code>
          </p>
          {apiPayloadFields.length > 0 ? (
            <p className="text-xs text-green-600 dark:text-green-400">
              ✓ Found {apiPayloadFields.length} field(s): {apiPayloadFields.map(f => f.name).join(', ')}
            </p>
          ) : selectedAPI.payload_schema ? (
            <div className="text-xs">
              <p className="text-yellow-600 dark:text-yellow-400 mb-1">
                ⚠️ No fields auto-detected in payload schema
              </p>
              <p className="text-yellow-600 dark:text-yellow-400 mb-2">
                Schema type: {typeof selectedAPI.payload_schema}, Keys: {selectedAPI.payload_schema ? Object.keys(selectedAPI.payload_schema).join(', ') : 'none'}
              </p>
              <details className="mt-1">
                <summary className="cursor-pointer text-zinc-500 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300">
                  View schema structure (raw JSON)
                </summary>
                <pre className="mt-1 overflow-auto rounded bg-zinc-100 dark:bg-zinc-700 p-2 text-xs max-h-40">
                  {JSON.stringify(selectedAPI.payload_schema, null, 2)}
                </pre>
              </details>
            </div>
          ) : (
            <p className="text-xs text-zinc-500 dark:text-zinc-500">
              No payload schema defined for this API
            </p>
          )}
        </div>
      )}

      {toolInputFields.length === 0 && tool.input_schema && (
        <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3">
          <p className="text-xs text-yellow-800 dark:text-yellow-400 mb-1">
            ⚠️ No tool fields auto-detected from input schema
          </p>
          <p className="text-xs text-yellow-700 dark:text-yellow-500 mb-2">
            Schema type: {typeof tool.input_schema}, Keys: {tool.input_schema ? Object.keys(tool.input_schema).join(', ') : 'none'}
          </p>
          <details>
            <summary className="cursor-pointer text-xs text-yellow-700 dark:text-yellow-500 hover:text-yellow-900 dark:hover:text-yellow-300">
              View tool input schema (raw JSON)
            </summary>
            <pre className="mt-1 overflow-auto rounded bg-yellow-100 dark:bg-yellow-900/40 p-2 text-xs max-h-40">
              {JSON.stringify(tool.input_schema, null, 2)}
            </pre>
          </details>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-black dark:text-zinc-50">
            Field Mappings
          </label>
          <button
            type="button"
            onClick={handleAddMapping}
            className="text-sm text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            + Add Mapping
          </button>
        </div>
        <div className="space-y-3">
          {formData.mapping_config.field_mappings.map((mapping, index) => (
            <div key={index} className="flex gap-2 items-start p-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
              <div className="flex-1 grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-zinc-600 dark:text-zinc-400 mb-1">
                    Tool Field
                  </label>
                  {toolInputFields.length > 0 ? (
                    <select
                      value={mapping.tool_field}
                      onChange={(e) => handleMappingChange(index, 'tool_field', e.target.value)}
                      className="w-full rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs text-black focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-50 dark:focus:ring-zinc-50"
                    >
                      <option value="">Select field...</option>
                      {toolInputFields.map((field) => {
                        const description = toolFieldMap.get(field);
                        return (
                          <option key={field} value={field} title={description}>
                            {field}{description ? ` - ${description}` : ''}
                          </option>
                        );
                      })}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={mapping.tool_field}
                      onChange={(e) => handleMappingChange(index, 'tool_field', e.target.value)}
                      placeholder="Enter tool field name"
                      className="w-full rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs text-black focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-50 dark:focus:ring-zinc-50"
                    />
                  )}
                  {toolInputFields.length === 0 && tool.input_schema && (
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                      No fields auto-detected. Enter manually.
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-zinc-600 dark:text-zinc-400 mb-1">
                    API Field
                  </label>
                  {apiPayloadFields.length > 0 ? (
                    <select
                      value={mapping.api_field}
                      onChange={(e) => handleMappingChange(index, 'api_field', e.target.value)}
                      className="w-full rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs text-black focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-50 dark:focus:ring-zinc-50"
                    >
                      <option value="">Select field...</option>
                      {apiPayloadFields.map((field) => {
                        const description = apiFieldMap.get(field.name);
                        return (
                          <option key={field.name} value={field.name} title={description}>
                            {field.name}{description ? ` - ${description}` : ''}
                          </option>
                        );
                      })}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={mapping.api_field}
                      onChange={(e) => handleMappingChange(index, 'api_field', e.target.value)}
                      placeholder="Enter API field name"
                      className="w-full rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs text-black focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-50 dark:focus:ring-zinc-50"
                    />
                  )}
                  {apiPayloadFields.length === 0 && selectedAPI?.payload_schema && (
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                      No fields auto-detected. Enter manually.
                    </p>
                  )}
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-zinc-600 dark:text-zinc-400 mb-1">
                    Transformation
                  </label>
                  <select
                    value={mapping.transformation}
                    onChange={(e) =>
                      handleMappingChange(
                        index,
                        'transformation',
                        e.target.value as 'direct' | 'constant' | 'expression'
                      )
                    }
                    className="w-full rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs text-black focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-50 dark:focus:ring-zinc-50"
                  >
                    <option value="direct">Direct (pass value as-is)</option>
                    <option value="constant">Constant (use fixed value)</option>
                    <option value="expression">Expression (transform value)</option>
                  </select>
                </div>
                {mapping.transformation === 'constant' && (
                  <div className="col-span-2">
                    <label className="block text-xs text-zinc-600 dark:text-zinc-400 mb-1">
                      Constant Value
                    </label>
                    <input
                      type="text"
                      value={mapping.value || ''}
                      onChange={(e) => handleMappingChange(index, 'value', e.target.value)}
                      placeholder="Enter constant value"
                      className="w-full rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs text-black focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-50 dark:focus:ring-zinc-50"
                    />
                  </div>
                )}
                {mapping.transformation === 'expression' && (
                  <div className="col-span-2">
                    <label className="block text-xs text-zinc-600 dark:text-zinc-400 mb-1">
                      Expression (JavaScript)
                    </label>
                    <input
                      type="text"
                      value={mapping.expression || ''}
                      onChange={(e) => handleMappingChange(index, 'expression', e.target.value)}
                      placeholder="e.g., value.toUpperCase()"
                      className="w-full rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs text-black focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-50 dark:focus:ring-zinc-50"
                    />
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                      Use `value` to reference the tool field value
                    </p>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleRemoveMapping(index)}
                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-xs"
              >
                Remove
              </button>
            </div>
          ))}
          {formData.mapping_config.field_mappings.length === 0 && (
            <p className="text-sm text-zinc-500 dark:text-zinc-500 text-center py-4">
              No field mappings added. Click "Add Mapping" to create one.
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
        >
          {isSubmitting ? 'Saving...' : mapping ? 'Update Mapping' : 'Create Mapping'}
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
