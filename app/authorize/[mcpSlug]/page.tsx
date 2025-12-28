'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardPanel } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';

export default function AuthorizePage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mcpName, setMcpName] = useState<string>('');

  const clientId = searchParams.get('client_id');
  const redirectUri = searchParams.get('redirect_uri');
  const scope = searchParams.get('scope');
  const state = searchParams.get('state');
  const codeChallenge = searchParams.get('code_challenge');
  const resource = searchParams.get('resource');

  useEffect(() => {
    // Extract MCP slug from resource URL
    if (resource) {
      const match = resource.match(/\/api\/mcp\/([^\/]+)/);
      if (match) {
        const mcpSlug = match[1];
        // Fetch MCP name
        fetch(`/api/mcp/${mcpSlug}`)
          .then(res => res.json())
          .then(data => {
            if (data.result?.serverInfo?.name) {
              setMcpName(data.result.serverInfo.name);
            }
            setLoading(false);
          })
          .catch(() => {
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [resource]);

  const handleAuthorize = () => {
    if (!redirectUri) {
      setError('Missing redirect_uri');
      return;
    }

    // Redirect back to the authorize endpoint with all parameters
    const authorizeUrl = new URL(window.location.href);
    authorizeUrl.pathname = authorizeUrl.pathname.replace('/authorize/', '/api/oauth/');
    authorizeUrl.pathname += '/authorize';
    
    // Preserve all query parameters
    window.location.href = authorizeUrl.toString();
  };

  const handleDeny = () => {
    if (!redirectUri) {
      setError('Missing redirect_uri');
      return;
    }

    const redirectUrl = new URL(redirectUri);
    redirectUrl.searchParams.set('error', 'access_denied');
    redirectUrl.searchParams.set('error_description', 'User denied the request');
    if (state) {
      redirectUrl.searchParams.set('state', state);
    }
    window.location.href = redirectUrl.toString();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Authorize Access</CardTitle>
        </CardHeader>
        <CardPanel className="space-y-4">
          {error && (
            <Alert variant="error">
              {error}
            </Alert>
          )}

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              <strong>{clientId || 'An application'}</strong> is requesting access to:
            </p>
            <div className="rounded-lg bg-zinc-100 dark:bg-zinc-800 p-3">
              <p className="font-medium">{mcpName || resource || 'MCP Server'}</p>
            </div>
          </div>

          {scope && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Requested Permissions:</p>
              <div className="space-y-1">
                {scope.split(' ').map((s) => (
                  <div key={s} className="text-sm text-muted-foreground">
                    • {s}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleAuthorize}
              className="flex-1"
            >
              Authorize
            </Button>
            <Button
              onClick={handleDeny}
              variant="outline"
              className="flex-1"
            >
              Deny
            </Button>
          </div>
        </CardPanel>
      </Card>
    </div>
  );
}
