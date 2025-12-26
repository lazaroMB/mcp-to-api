'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MCP } from '@/lib/types/mcp';
import MCPForm from './mcp-form';
import MCPConfigView from './mcp-config-view';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardPanel } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Empty, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

interface MCPsListProps {
  initialMCPs: MCP[];
}

export default function MCPsList({ initialMCPs }: MCPsListProps) {
  const [mcps, setMcps] = useState<MCP[]>(initialMCPs);
  const [showForm, setShowForm] = useState(false);
  const [editingMCP, setEditingMCP] = useState<MCP | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCreate = () => {
    setEditingMCP(null);
    setShowForm(true);
  };

  const handleEdit = (mcp: MCP) => {
    setEditingMCP(mcp);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const response = await fetch(`/admin/mcps/api?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete MCP');
      }

      setMcps(mcps.filter((mcp) => mcp.id !== id));
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete MCP');
    } finally {
      setDeletingId(null);
    }
  };

  const handleFormSuccess = async () => {
    setShowForm(false);
    setEditingMCP(null);
    // Refresh the list
    const response = await fetch('/admin/mcps/api');
    if (response.ok) {
      const data = await response.json();
      setMcps(data);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingMCP(null);
  };

  if (showForm) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{editingMCP ? 'Edit MCP' : 'Create New MCP'}</CardTitle>
        </CardHeader>
        <CardPanel>
          <MCPForm mcp={editingMCP} onSuccess={handleFormSuccess} onCancel={handleFormCancel} />
        </CardPanel>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleCreate}>
          Create MCP
        </Button>
      </div>

      {mcps.length === 0 ? (
        <Empty>
          <EmptyTitle>No MCPs found</EmptyTitle>
          <EmptyDescription>Create your first MCP to get started.</EmptyDescription>
        </Empty>
      ) : (
        <div className="space-y-4">
          {mcps.map((mcp) => (
            <Card key={mcp.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle>{mcp.name}</CardTitle>
                      {!mcp.is_enabled && (
                        <Badge variant="destructive">Disabled</Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      <code className="rounded bg-muted px-2 py-1 text-xs">
                        {mcp.slug}
                      </code>
                      {' • '}
                      Created: {new Date(mcp.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" render={<Link href={`/admin/mcps/${mcp.id}`}>Configure</Link>} />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(mcp)}
                    >
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger
                        className={cn(buttonVariants({ size: "sm", variant: "destructive-outline" }))}
                        disabled={deletingId === mcp.id}
                      >
                        {deletingId === mcp.id ? 'Deleting...' : 'Delete'}
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the MCP
                            and all associated tools and resources.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogClose
                            className={cn(buttonVariants({ variant: "outline" }))}
                          >
                            Cancel
                          </AlertDialogClose>
                          <AlertDialogClose
                            className={cn(buttonVariants({ variant: "destructive" }))}
                            onClick={() => handleDelete(mcp.id)}
                          >
                            Delete
                          </AlertDialogClose>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardPanel>
                <MCPConfigView mcpSlug={mcp.slug} />
              </CardPanel>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
