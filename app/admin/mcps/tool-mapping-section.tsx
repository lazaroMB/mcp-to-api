'use client';

import { useState, useEffect } from 'react';
import { MCPToolAPIMapping } from '@/lib/types/mapping';
import { MCPTool } from '@/lib/types/mcp';
import { API } from '@/lib/types/api';
import { extractFieldsFromSchema, type SchemaField } from '@/lib/utils/schema-fields';
import MappingForm from './mapping-form';

interface ToolMappingSectionProps {
  tool: MCPTool;
  initialMappings: MCPToolAPIMapping[];
  apis: API[];
}

export default function ToolMappingSection({
  tool,
  initialMappings,
  apis,
}: ToolMappingSectionProps) {
  const [mapping, setMapping] = useState<MCPToolAPIMapping | null>(
    initialMappings.length > 0 ? initialMappings[0] : null
  );

  useEffect(() => {
    // Fetch mapping when component mounts
    const fetchMapping = async () => {
      try {
        const response = await fetch(`/admin/mcps/tools/${tool.id}/mappings/api`);
        if (response.ok) {
          const data = await response.json();
          // Only take the first mapping if multiple exist
          setMapping(data.length > 0 ? data[0] : null);
        }
      } catch (error) {
        console.error('Failed to fetch mapping:', error);
      }
    };
    fetchMapping();
  }, [tool.id]);
  
  const [showForm, setShowForm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCreate = () => {
    setShowForm(true);
  };

  const handleEdit = () => {
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!mapping) return;
    
    if (!confirm('Are you sure you want to delete this mapping?')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/admin/mcps/tools/${tool.id}/mappings/api?id=${mapping.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete mapping');
      }

      setMapping(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete mapping');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFormSuccess = async () => {
    setShowForm(false);
    const response = await fetch(`/admin/mcps/tools/${tool.id}/mappings/api`);
    if (response.ok) {
      const data = await response.json();
      setMapping(data.length > 0 ? data[0] : null);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
  };

  const getAPIName = (apiId: string) => {
    const api = apis.find((a) => a.id === apiId);
    return api ? `${api.method} ${api.name}` : 'Unknown API';
  };

  // Extract tool input fields from the tool's input_schema
  const toolInputFields: SchemaField[] = extractFieldsFromSchema(tool.input_schema);

  return (
    <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="border-b border-zinc-200 p-6 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-black dark:text-zinc-50">
              API Mapping
            </h3>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Map this tool's inputs to an API payload
            </p>
          </div>
          {!showForm && !mapping && (
            <button
              onClick={handleCreate}
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
            >
              Add Mapping
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        {showForm ? (
          <MappingForm
            tool={tool}
            toolInputFields={toolInputFields.map(f => f.name)}
            toolInputFieldsWithDesc={toolInputFields}
            mapping={mapping}
            apis={apis}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        ) : !mapping ? (
          <div className="text-center py-8">
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              No API mapping configured. Add a mapping to connect this tool to an API.
            </p>
            <button
              onClick={handleCreate}
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
            >
              Add Mapping
            </button>
          </div>
        ) : (
          <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-black dark:text-zinc-50 mb-2">
                  {getAPIName(mapping.api_id)}
                </h4>
                <div className="mt-3 space-y-2">
                  {mapping.mapping_config.field_mappings.length > 0 ? (
                    mapping.mapping_config.field_mappings.map((fm, idx) => (
                      <div key={idx} className="text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                        <span className="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">
                          {fm.tool_field}
                        </span>
                        <span className="text-zinc-400">→</span>
                        <span className="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">
                          {fm.api_field}
                        </span>
                        {fm.transformation !== 'direct' && (
                          <span className="ml-2 text-xs text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">
                            {fm.transformation}
                          </span>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-zinc-500 dark:text-zinc-500">
                      No field mappings configured
                    </p>
                  )}
                </div>
              </div>
              <div className="ml-4 flex gap-2">
                <button
                  onClick={handleEdit}
                  className="text-sm text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50 dark:text-red-400 dark:hover:text-red-300"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
