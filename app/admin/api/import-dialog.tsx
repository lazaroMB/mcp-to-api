'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogPopup,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogPanel,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ImportDialogProps {
  onSuccess: () => void;
}

export default function ImportDialog({ onSuccess }: ImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ imported: number; errors: string[] } | null>(null);

  const handleImport = async () => {
    if (!url.trim()) {
      setError('Please enter an OpenAPI URL');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/admin/api/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to import OpenAPI specification');
      }

      setSuccess({
        imported: data.imported || 0,
        errors: data.errors || [],
      });

      if (data.imported > 0) {
        // Refresh the API list after a short delay
        setTimeout(() => {
          onSuccess();
          setOpen(false);
          setUrl('');
          setSuccess(null);
        }, 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import OpenAPI specification');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset state when dialog closes
      setUrl('');
      setError(null);
      setSuccess(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700">
        Import from OpenAPI
      </DialogTrigger>
      <DialogPopup>
        <DialogHeader>
          <DialogTitle>Import APIs from OpenAPI Specification</DialogTitle>
          <DialogDescription>
            Enter a URL to an OpenAPI (Swagger) specification file. All endpoints will be imported as APIs.
          </DialogDescription>
        </DialogHeader>
        <DialogPanel>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="openapi-url">OpenAPI URL</Label>
              <Input
                id="openapi-url"
                type="url"
                placeholder="https://api.example.com/openapi.json"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Supports both OpenAPI 3.x and Swagger 2.0 specifications
              </p>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400">
                <p className="font-medium mb-1">Import Error</p>
                <p>{error}</p>
              </div>
            )}

            {success && (
              <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400">
                <p className="font-medium mb-1">
                  Successfully imported {success.imported} API{success.imported !== 1 ? 's' : ''}
                </p>
                {success.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium mb-1">Some errors occurred:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {success.errors.map((err, idx) => (
                        <li key={idx}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogPanel>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={loading || !url.trim()}>
            {loading ? 'Importing...' : 'Import'}
          </Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  );
}
