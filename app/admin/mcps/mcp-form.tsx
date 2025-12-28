'use client';

import { useState, useEffect } from 'react';
import { MCP, MCPFormData, MCPVisibility } from '@/lib/types/mcp';
import { generateSlug } from '@/lib/utils/slug';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { RadioGroup, Radio } from '@/components/ui/radio-group';

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
    visibility: (mcp?.visibility as MCPVisibility) || 'private',
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
        <Alert variant="error">
          {error}
        </Alert>
      )}

      <Field>
        <FieldLabel htmlFor="name">
          Name *
        </FieldLabel>
        <Input
          type="text"
          id="name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter MCP name"
        />
      </Field>

      <Field>
        <div className="flex items-center justify-between">
          <FieldLabel htmlFor="slug">
            Slug *
          </FieldLabel>
          {!mcp && (
            <Label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={autoGenerateSlug}
                onCheckedChange={(checked) => setAutoGenerateSlug(checked === true)}
              />
              Auto-generate from name
            </Label>
          )}
        </div>
        <Input
          type="text"
          id="slug"
          required
          value={formData.slug}
          onChange={(e) => {
            setFormData({ ...formData, slug: e.target.value });
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
            id="is_enabled"
            checked={formData.is_enabled}
            onCheckedChange={(checked) => setFormData({ ...formData, is_enabled: checked === true })}
          />
          <Label htmlFor="is_enabled" className="text-sm font-medium">
            Enable MCP
          </Label>
        </div>
        <FieldDescription>
          If disabled, the MCP will appear as non-existent when accessed via API
        </FieldDescription>
      </Field>

      <Field>
        <FieldLabel>
          Visibility *
        </FieldLabel>
        <RadioGroup
          value={formData.visibility}
          onValueChange={(value) => setFormData({ ...formData, visibility: value as MCPVisibility })}
          className="space-y-2"
        >
          <div className="flex items-center gap-2">
            <Radio value="public" id="visibility-public" />
            <Label htmlFor="visibility-public" className="text-sm font-medium cursor-pointer">
              Public
            </Label>
          </div>
          <FieldDescription className="ml-6">
            Accessible to everyone without authorization
          </FieldDescription>
          <div className="flex items-center gap-2">
            <Radio value="private" id="visibility-private" />
            <Label htmlFor="visibility-private" className="text-sm font-medium cursor-pointer">
              Private
            </Label>
          </div>
          <FieldDescription className="ml-6">
            Requires access grant and OAuth authorization
          </FieldDescription>
        </RadioGroup>
      </Field>

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? 'Saving...' : mcp ? 'Update MCP' : 'Create MCP'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
