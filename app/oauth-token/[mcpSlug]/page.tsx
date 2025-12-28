'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardPanel } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel } from '@/components/ui/field';

export default function OAuthTokenPage() {
  const params = useParams();
  const mcpSlug = params.mcpSlug as string;
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [authorizationUrl, setAuthorizationUrl] = useState<string | null>(null);

  useEffect(() => {
    // Generate PKCE and authorization URL
    const generateAuthUrl = async () => {
      try {
        const baseUrl = window.location.origin;
        
        // Generate PKCE using Web Crypto API (browser)
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        const codeVerifier = btoa(String.fromCharCode(...array))
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=/g, '');
        
        // Generate code challenge
        const encoder = new TextEncoder();
        const data = encoder.encode(codeVerifier);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const codeChallenge = btoa(String.fromCharCode(...hashArray))
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=/g, '');
        
        // Store code verifier in sessionStorage
        sessionStorage.setItem(`mcp_${mcpSlug}_code_verifier`, codeVerifier);
        
        // Generate state
        const stateArray = new Uint8Array(16);
        crypto.getRandomValues(stateArray);
        const state = btoa(String.fromCharCode(...stateArray))
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=/g, '');
        sessionStorage.setItem(`mcp_${mcpSlug}_state`, state);
        
        // Get client ID (use a default one or register)
        const clientId = `${baseUrl}/api/oauth/${mcpSlug}/clients/cursor-client`;
        const redirectUri = `${baseUrl}/oauth-token/${mcpSlug}/callback`;
        
        const authUrl = new URL(`${baseUrl}/api/oauth/${mcpSlug}/authorize`);
        authUrl.searchParams.set('response_type', 'code');
        authUrl.searchParams.set('client_id', clientId);
        authUrl.searchParams.set('redirect_uri', redirectUri);
        authUrl.searchParams.set('scope', 'mcp:tools mcp:resources');
        authUrl.searchParams.set('state', state);
        authUrl.searchParams.set('code_challenge', codeChallenge);
        authUrl.searchParams.set('code_challenge_method', 'S256');
        authUrl.searchParams.set('resource', `${baseUrl}/api/mcp/${mcpSlug}`);
        
        setAuthorizationUrl(authUrl.toString());
      } catch (err) {
        setError('Failed to generate authorization URL: ' + (err instanceof Error ? err.message : String(err)));
      }
    };
    
    generateAuthUrl();
  }, [mcpSlug]);

  const handleAuthorize = () => {
    if (authorizationUrl) {
      window.location.href = authorizationUrl;
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Get OAuth Token for MCP: {mcpSlug}</CardTitle>
        </CardHeader>
        <CardPanel className="space-y-4">
          {error && (
            <Alert variant="error">
              {error}
            </Alert>
          )}

          {token ? (
            <div className="space-y-4">
              <Alert variant="default" className="bg-green-50 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400">
                Token obtained successfully!
              </Alert>
              <Field>
                <FieldLabel>Access Token</FieldLabel>
                <Input
                  readOnly
                  value={token}
                  className="font-mono text-sm"
                />
              </Field>
              <div className="rounded-lg bg-zinc-100 dark:bg-zinc-800 p-4">
                <p className="text-sm font-medium mb-2">Add this to your MCP configuration:</p>
                <pre className="text-xs overflow-x-auto">
{`{
  "mcpServers": {
    "${mcpSlug}": {
      "url": "${window.location.origin}/api/mcp/${mcpSlug}",
      "headers": {
        "Authorization": "Bearer ${token}"
      }
    }
  }
}`}
                </pre>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Click the button below to authorize and get an access token for this MCP server.
              </p>
              <Button
                onClick={handleAuthorize}
                disabled={!authorizationUrl || loading}
                className="w-full"
              >
                {loading ? 'Loading...' : 'Authorize and Get Token'}
              </Button>
            </div>
          )}
        </CardPanel>
      </Card>
    </div>
  );
}
