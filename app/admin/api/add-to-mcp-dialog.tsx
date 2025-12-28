'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API } from '@/lib/types/api';
import { MCP, MCPFormData } from '@/lib/types/mcp';
import { Dialog, DialogPopup, DialogHeader, DialogTitle, DialogDescription, DialogPanel, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { generateSlug } from '@/lib/utils/slug';

interface AddToMCPDialogProps {
  api: API;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddToMCPDialog({ api, open, onOpenChange }: AddToMCPDialogProps) {
  const router = useRouter();
  const [mcps, setMcps] = useState<MCP[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'select' | 'create'>('select');
  const [selectedMCPId, setSelectedMCPId] = useState<string>('');
  const [newMCPData, setNewMCPData] = useState<MCPFormData>({
    name: '',
    slug: '',
    is_enabled: true,
  });
  const [autoGenerateSlug, setAutoGenerateSlug] = useState(true);

  // Fetch MCPs when dialog opens
  useEffect(() => {
    if (open) {
      fetchMcps();
    }
  }, [open]);

  // Auto-generate slug from name
  useEffect(() => {
    if (autoGenerateSlug && newMCPData.name) {
      setNewMCPData((prev) => ({
        ...prev,
        slug: generateSlug(newMCPData.name),
      }));
    }
  }, [newMCPData.name, autoGenerateSlug]);

  const fetchMcps = async () => {
    try {
      const response = await fetch('/admin/mcps/api');
      if (response.ok) {
        const data = await response.json();
        setMcps(data);
      }
    } catch (error) {
      console.error('Failed to fetch MCPs:', error);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      let mcpId: string;

      if (mode === 'create') {
        // Create new MCP
        if (!newMCPData.name || !newMCPData.slug) {
          setError('Please fill in all required fields');
          setLoading(false);
          return;
        }

        const response = await fetch('/admin/mcps/api', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newMCPData),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to create MCP');
        }

        const newMCP = await response.json();
        mcpId = newMCP.id;
      } else {
        // Use selected MCP
        if (!selectedMCPId) {
          setError('Please select an MCP');
          setLoading(false);
          return;
        }
        mcpId = selectedMCPId;
      }

      // Call server action to add API to MCP
      const { addAPIToMCP } = await import('@/app/admin/mcps/api-to-tool-actions');
      const result = await addAPIToMCP(mcpId, api.id, 'all');

      if (!result.success) {
        throw new Error(result.error || 'Failed to add API to MCP');
      }

      // Navigate to MCP detail page with created tool ID
      onOpenChange(false);
      router.push(`/admin/mcps/${mcpId}?createdToolId=${result.toolId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPopup>
        <DialogHeader>
          <DialogTitle>Add API to MCP</DialogTitle>
          <DialogDescription>
            Create a new MCP or select an existing one to add this API as a tool.
          </DialogDescription>
        </DialogHeader>
        <DialogPanel>
          {error && (
            <Alert variant="error" className="mb-4">
              {error}
            </Alert>
          )}

          <div className="space-y-4">
            {/* Mode selection */}
            <div className="flex gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
              <button
                type="button"
                onClick={() => setMode('select')}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  mode === 'select'
                    ? 'bg-black text-white dark:bg-zinc-50 dark:text-black'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                }`}
              >
                Select Existing MCP
              </button>
              <button
                type="button"
                onClick={() => setMode('create')}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  mode === 'create'
                    ? 'bg-black text-white dark:bg-zinc-50 dark:text-black'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                }`}
              >
                Create New MCP
              </button>
            </div>

            {mode === 'select' ? (
              <Field>
                <FieldLabel htmlFor="mcp-select">Select MCP *</FieldLabel>
                <select
                  id="mcp-select"
                  value={selectedMCPId}
                  onChange={(e) => setSelectedMCPId(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-black focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-50 dark:focus:ring-zinc-50"
                >
                  <option value="">Choose an MCP...</option>
                  {mcps.map((mcp) => (
                    <option key={mcp.id} value={mcp.id}>
                      {mcp.name} ({mcp.slug})
                    </option>
                  ))}
                </select>
                {mcps.length === 0 && (
                  <FieldDescription>
                    No MCPs found. Create a new one instead.
                  </FieldDescription>
                )}
              </Field>
            ) : (
              <div className="space-y-4">
                <Field>
                  <FieldLabel htmlFor="mcp-name">Name *</FieldLabel>
                  <Input
                    type="text"
                    id="mcp-name"
                    required
                    value={newMCPData.name}
                    onChange={(e) => setNewMCPData({ ...newMCPData, name: e.target.value })}
                    placeholder="Enter MCP name"
                  />
                </Field>

                <Field>
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor="mcp-slug">Slug *</FieldLabel>
                    <Label className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={autoGenerateSlug}
                        onCheckedChange={(checked) => setAutoGenerateSlug(checked === true)}
                      />
                      Auto-generate from name
                    </Label>
                  </div>
                  <Input
                    type="text"
                    id="mcp-slug"
                    required
                    value={newMCPData.slug}
                    onChange={(e) => {
                      setNewMCPData({ ...newMCPData, slug: e.target.value });
                      setAutoGenerateSlug(false);
                    }}
                    placeholder="Enter MCP slug"
                  />
                  <FieldDescription>
                    URL-friendly identifier (lowercase, hyphens only)
                  </FieldDescription>
                </Field>

                <Field>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="mcp-enabled"
                      checked={newMCPData.is_enabled}
                      onCheckedChange={(checked) => setNewMCPData({ ...newMCPData, is_enabled: checked === true })}
                    />
                    <Label htmlFor="mcp-enabled" className="text-sm font-medium">
                      Enable MCP
                    </Label>
                  </div>
                  <FieldDescription>
                    If disabled, the MCP will appear as non-existent when accessed via API
                  </FieldDescription>
                </Field>
              </div>
            )}

            {/* API info preview */}
            <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800 p-4">
              <p className="text-sm font-medium text-black dark:text-zinc-50 mb-2">
                API to be added:
              </p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                <span className="font-medium">{api.method}</span> {api.name}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                {api.url}
              </p>
            </div>
          </div>
        </DialogPanel>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Processing...' : mode === 'create' ? 'Create & Configure' : 'Configure'}
          </Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  );
}
