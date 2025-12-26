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
    uri: tool?.uri || '',
    is_enabled: tool?.is_enabled ?? true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [schemaText, setSchemaText] = useState(
    JSON.stringify(formData.input_schema, null, 2)
  );

  useEffect(() => {
    setSchemaText(JSON.stringify(formData.input_schema, null, 2));
  }, [formData.input_schema]);

  const [schemaErrors, setSchemaErrors] = useState<string[]>([]);
  const [schemaValid, setSchemaValid] = useState(true);

  const handleSchemaChange = (text: string) => {
    setSchemaText(text);
    try {
      const parsed = JSON.parse(text);
      setFormData({ ...formData, input_schema: parsed });
      
      // Check if it's simplified format (will be converted by validator)
      const keys = Object.keys(parsed);
      const isSimplifiedFormat = keys.length > 0 && 
        keys.every(key => typeof parsed[key] === 'string') &&
        !parsed.type &&
        !parsed.properties;

      if (isSimplifiedFormat) {
        // Simplified format - will be auto-converted, but show info
        setSchemaErrors([]);
        setSchemaValid(true);
        return;
      }
      
      // Validate schema structure
      if (parsed.type !== 'object') {
        setSchemaErrors(['Schema type must be "object"']);
        setSchemaValid(false);
      } else if (!parsed.properties || typeof parsed.properties !== 'object') {
        setSchemaErrors(['Schema must have a "properties" object']);
        setSchemaValid(false);
      } else {
        setSchemaErrors([]);
        setSchemaValid(true);
      }
    } catch (error) {
      setSchemaErrors([error instanceof Error ? error.message : 'Invalid JSON']);
      setSchemaValid(false);
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
          onChange={(e) => {
            const newName = e.target.value;
            setFormData({ 
              ...formData, 
              name: newName,
              // Auto-generate URI if empty or matches the pattern
              uri: formData.uri || `tool://${newName}`
            });
          }}
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-black focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-50 dark:focus:ring-zinc-50"
          placeholder="e.g., read_file"
        />
      </div>

      <div>
        <label
          htmlFor="uri"
          className="block text-sm font-medium text-black dark:text-zinc-50 mb-2"
        >
          URI (Resource Identifier) *
        </label>
        <input
          type="text"
          id="uri"
          required
          value={formData.uri}
          onChange={(e) => setFormData({ ...formData, uri: e.target.value })}
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-black focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-50 dark:focus:ring-zinc-50"
          placeholder="e.g., tool://read_file or coord://point"
        />
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
          Unique URI for accessing this tool as a resource. Auto-generated from name if left empty.
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
          placeholder="Tool description"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label
            htmlFor="input_schema"
            className="block text-sm font-medium text-black dark:text-zinc-50"
          >
            Input Schema (JSON) *
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                const exampleSchema = {
                  type: "object",
                  properties: {
                    x: {
                      type: "number",
                      description: "X coordinate or numeric value"
                    }
                  },
                  required: ["x"]
                };
                setSchemaText(JSON.stringify(exampleSchema, null, 2));
                setFormData({ ...formData, input_schema: exampleSchema });
                setSchemaErrors([]);
                setSchemaValid(true);
              }}
              className="text-xs text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              Example: Number (x)
            </button>
            <button
              type="button"
              onClick={() => {
                const exampleSchema = {
                  type: "object",
                  properties: {
                    value: {
                      type: "number",
                      description: "The value to process"
                    }
                  },
                  required: ["value"]
                };
                setSchemaText(JSON.stringify(exampleSchema, null, 2));
                setFormData({ ...formData, input_schema: exampleSchema });
                setSchemaErrors([]);
                setSchemaValid(true);
              }}
              className="text-xs text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              Example: Number (value)
            </button>
          </div>
        </div>
        <textarea
          id="input_schema"
          required
          value={schemaText}
          onChange={(e) => handleSchemaChange(e.target.value)}
          rows={12}
          className="w-full font-mono rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-black focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-50 dark:focus:ring-zinc-50"
          placeholder='{"type": "object", "properties": {...}}'
        />
        <div className="mt-2 space-y-1">
          <p className="text-xs text-zinc-500 dark:text-zinc-500">
            JSON Schema defining the tool's input parameters. Must include <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">type: "object"</code> and <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">properties</code>.
          </p>
          {schemaErrors.length > 0 && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-2 dark:bg-red-900/20 dark:border-red-800">
              <p className="text-xs font-medium text-red-800 dark:text-red-400 mb-1">
                Schema Validation Errors:
              </p>
              <ul className="text-xs text-red-700 dark:text-red-500 list-disc list-inside">
                {schemaErrors.map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </div>
          )}
          {schemaValid && (() => {
            try {
              const parsed = JSON.parse(schemaText);
              
              // Check if simplified format
              const keys = Object.keys(parsed);
              const isSimplifiedFormat = keys.length > 0 && 
                keys.every(key => typeof parsed[key] === 'string') &&
                !parsed.type &&
                !parsed.properties;

              if (isSimplifiedFormat) {
                return (
                  <div className="rounded-lg bg-blue-50 border border-blue-200 p-2 dark:bg-blue-900/20 dark:border-blue-800">
                    <p className="text-xs font-medium text-blue-800 dark:text-blue-400 mb-1">
                      ℹ️ Simplified format detected
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mb-2">
                      Your schema will be automatically converted to full JSON Schema format. 
                      {keys.length > 0 && ` Found ${keys.length} parameter${keys.length !== 1 ? 's' : ''}: ${keys.join(', ')}`}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        // Convert simplified format to full JSON Schema
                        const converted: any = {
                          type: 'object',
                          properties: {},
                          required: [],
                        };
                        
                        for (const [fieldName, value] of Object.entries(parsed)) {
                          const valueStr = value as string;
                          const validTypes = ['string', 'number', 'integer', 'boolean', 'array', 'object'];
                          
                          if (validTypes.includes(valueStr.toLowerCase())) {
                            converted.properties[fieldName] = {
                              type: valueStr.toLowerCase(),
                              description: `${fieldName} parameter`,
                            };
                          } else {
                            converted.properties[fieldName] = {
                              type: 'string',
                              description: valueStr,
                            };
                          }
                          converted.required.push(fieldName);
                        }
                        
                        const convertedText = JSON.stringify(converted, null, 2);
                        setSchemaText(convertedText);
                        setFormData({ ...formData, input_schema: converted });
                        setSchemaErrors([]);
                        setSchemaValid(true);
                      }}
                      className="text-xs text-blue-700 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-100 underline"
                    >
                      Convert to full JSON Schema format
                    </button>
                  </div>
                );
              }
              
              const hasProperties = parsed?.properties && Object.keys(parsed.properties).length > 0;
              if (!hasProperties && parsed?.type === 'object') {
                return (
                  <p className="text-xs text-yellow-600 dark:text-yellow-400">
                    ⚠️ Warning: No properties defined. The tool won't accept any parameters.
                  </p>
                );
              }
              if (hasProperties) {
                const propCount = Object.keys(parsed.properties).length;
                return (
                  <p className="text-xs text-green-600 dark:text-green-400">
                    ✓ Schema valid with {propCount} parameter{propCount !== 1 ? 's' : ''} defined.
                  </p>
                );
              }
            } catch {}
            return null;
          })()}
        </div>
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
            Enable Tool
          </span>
        </label>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
          If disabled, the tool will not be available when queried
        </p>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting || !schemaValid}
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
