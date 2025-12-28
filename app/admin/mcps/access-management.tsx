'use client';

import { useState, useEffect } from 'react';
import { MCPAccess } from '@/lib/types/mcp';
import { getAccessGrants, grantAccess, grantAccessByEmail, revokeAccess, searchUsers } from './access-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel } from '@/components/ui/field';
import { Alert } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface AccessManagementProps {
  mcpId: string;
}

export default function AccessManagement({ mcpId }: AccessManagementProps) {
  const [accessGrants, setAccessGrants] = useState<MCPAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ id: string; email: string }>>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadAccessGrants();
  }, [mcpId]);

  const loadAccessGrants = async () => {
    try {
      setLoading(true);
      const grants = await getAccessGrants(mcpId);
      setAccessGrants(grants);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load access grants');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchEmail.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const results = await searchUsers(searchEmail);
      setSearchResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search users');
    } finally {
      setSearching(false);
    }
  };

  const handleGrantAccess = async (userId: string, userEmail: string) => {
    try {
      setError(null);
      setSuccess(null);
      await grantAccess(mcpId, userId);
      setSuccess(`Access granted to ${userEmail}`);
      setSearchEmail('');
      setSearchResults([]);
      await loadAccessGrants();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to grant access');
    }
  };

  const handleGrantAccessByEmail = async () => {
    if (!searchEmail.trim() || !searchEmail.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      await grantAccessByEmail(mcpId, searchEmail.trim());
      setSuccess(`Access granted to ${searchEmail}`);
      setSearchEmail('');
      setSearchResults([]);
      await loadAccessGrants();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to grant access');
    }
  };

  const handleRevokeAccess = async (userId: string, userEmail: string) => {
    if (!confirm(`Revoke access for ${userEmail}?`)) {
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      await revokeAccess(mcpId, userId);
      setSuccess(`Access revoked for ${userEmail}`);
      await loadAccessGrants();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke access');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Access Management</h2>
        <p className="text-sm text-muted-foreground">
          Grant or revoke access to this private MCP. Users with access will need to complete OAuth authorization.
        </p>
      </div>

      {error && (
        <Alert variant="error">
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="default" className="bg-green-50 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400">
          {success}
        </Alert>
      )}

      <div className="space-y-4">
        <Field>
          <FieldLabel>Grant Access by User Email</FieldLabel>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="Enter user email address..."
              value={searchEmail}
              onChange={(e) => {
                setSearchEmail(e.target.value);
                if (e.target.value.trim().length >= 2) {
                  handleSearch();
                } else {
                  setSearchResults([]);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (searchEmail.trim() && searchEmail.includes('@')) {
                    handleGrantAccessByEmail();
                  } else {
                    handleSearch();
                  }
                }
              }}
            />
            <Button
              type="button"
              onClick={handleGrantAccessByEmail}
              disabled={!searchEmail.trim() || !searchEmail.includes('@')}
            >
              Grant Access
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Enter an email address to grant access. You can also search for users by typing their email.
          </p>
        </Field>

        {searchResults.length > 0 && (
          <div className="border rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium mb-2">Search Results:</p>
            {searchResults.map((user) => {
              const hasAccess = accessGrants.some((grant) => grant.user_id === user.id);
              return (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-2 border rounded hover:bg-zinc-50 dark:hover:bg-zinc-800"
                >
                  <span className="text-sm font-medium">{user.email}</span>
                  {hasAccess ? (
                    <span className="text-sm text-muted-foreground">Already has access</span>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleGrantAccess(user.id, user.email)}
                    >
                      Grant Access
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Current Access Grants</h3>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : accessGrants.length === 0 ? (
          <p className="text-sm text-muted-foreground">No access grants yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User Email</TableHead>
                <TableHead>Granted At</TableHead>
                <TableHead>Expires At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accessGrants.map((grant) => (
                <TableRow key={grant.id}>
                  <TableCell>
                    {grant.user_email || grant.user_id.substring(0, 8) + '...'}
                  </TableCell>
                  <TableCell>
                    {new Date(grant.granted_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {grant.expires_at
                      ? new Date(grant.expires_at).toLocaleDateString()
                      : 'Never'}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleRevokeAccess(grant.user_id, grant.user_email || 'user')
                      }
                    >
                      Revoke
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
