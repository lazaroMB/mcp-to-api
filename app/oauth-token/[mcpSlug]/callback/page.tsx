'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardPanel } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { getBaseUrl } from '@/lib/utils/url';

export default function OAuthCallbackPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const mcpSlug = params.mcpSlug as string;
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exchanged, setExchanged] = useState(false);

  useEffect(() => {
    // Prevent double execution (React strict mode)
    if (exchanged || loading) {
      return;
    }
    
    const exchangeCode = async () => {
      // Set both flags immediately to prevent race conditions
      setExchanged(true);
      setLoading(true);
      
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const errorParam = searchParams.get('error');

        if (errorParam) {
          setError(`Authorization error: ${errorParam}`);
          setLoading(false);
          return;
        }

        if (!code) {
          setError('No authorization code received');
          setLoading(false);
          return;
        }

        // Get stored values
        const storedState = sessionStorage.getItem(`mcp_${mcpSlug}_state`);
        const codeVerifier = sessionStorage.getItem(`mcp_${mcpSlug}_code_verifier`);

        if (state !== storedState) {
          setError('State mismatch - possible CSRF attack');
          setLoading(false);
          return;
        }

        if (!codeVerifier) {
          setError('Code verifier not found in session. Please try the authorization flow again.');
          setLoading(false);
          return;
        }

        // Exchange code for token
        const baseUrl = getBaseUrl();
        const clientId = `${baseUrl}/api/oauth/${mcpSlug}/clients/cursor-client`;
        const redirectUri = `${baseUrl}/oauth-token/${mcpSlug}/callback`;

        const formData = new URLSearchParams();
        formData.set('grant_type', 'authorization_code');
        formData.set('code', code);
        formData.set('redirect_uri', redirectUri);
        formData.set('client_id', clientId);
        formData.set('code_verifier', codeVerifier);
        formData.set('resource', `${baseUrl}/api/mcp/${mcpSlug}`);

        // Add timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
        
        let response;
        try {
          response = await fetch(`${baseUrl}/api/oauth/${mcpSlug}/token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData,
            signal: controller.signal,
          });
        } catch (fetchError: any) {
          clearTimeout(timeoutId);
          if (fetchError.name === 'AbortError') {
            throw new Error('Token exchange timed out after 30 seconds. Please try again.');
          }
          throw fetchError;
        }
        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          
          // Provide more helpful error message
          let errorMessage = errorData.error_description || errorData.error || 'Failed to exchange code for token';
          if (errorData.error === 'invalid_grant') {
            errorMessage += '. The authorization code may have expired (10 minutes) or already been used. Please try authorizing again.';
          }
          throw new Error(errorMessage);
        }

        const tokenData = await response.json();
        setToken(tokenData.access_token);

        // Clean up session storage
        sessionStorage.removeItem(`mcp_${mcpSlug}_state`);
        sessionStorage.removeItem(`mcp_${mcpSlug}_code_verifier`);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to get token';
        setError(errorMessage);
        setExchanged(false); // Allow retry on error
      } finally {
        setLoading(false);
      }
    };

    exchangeCode();
  }, [mcpSlug, searchParams, exchanged]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Exchanging authorization code for token...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>OAuth Token</CardTitle>
        </CardHeader>
        <CardPanel className="space-y-4">
          {error && (
            <div className="space-y-4">
              <Alert variant="error">
                {error}
              </Alert>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Common causes:
                </p>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  <li>Authorization code expired (valid for 10 minutes)</li>
                  <li>Code was already used (try authorizing again)</li>
                  <li>Session storage was cleared (refresh the token page)</li>
                  <li>PKCE verification failed (code verifier mismatch)</li>
                </ul>
                <Button
                  onClick={() => {
                    window.location.href = `/oauth-token/${mcpSlug}`;
                  }}
                  variant="outline"
                  className="mt-4"
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {token && (
            <div className="space-y-4">
              <Alert variant="default" className="bg-green-50 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400">
                Token obtained successfully!
              </Alert>
              <div className="rounded-lg bg-zinc-100 dark:bg-zinc-800 p-4">
                <p className="text-sm font-medium mb-2">Access Token:</p>
                <pre className="text-xs overflow-x-auto break-all">{token}</pre>
              </div>
              <div className="rounded-lg bg-zinc-100 dark:bg-zinc-800 p-4">
                <p className="text-sm font-medium mb-2">Add this to your Cursor MCP configuration (.cursor/mcp.json):</p>
                <pre className="text-xs overflow-x-auto">
{`{
  "mcpServers": {
    "${mcpSlug}": {
      "url": "${getBaseUrl()}/api/mcp/${mcpSlug}",
      "headers": {
        "Authorization": "Bearer ${token}"
      }
    }
  }
}`}
                </pre>
              </div>
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(token);
                }}
                variant="outline"
              >
                Copy Token
              </Button>
            </div>
          )}
        </CardPanel>
      </Card>
    </div>
  );
}
