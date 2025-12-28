'use client';

import { useState } from 'react';
import { generateMCPConfig, generateClaudeDesktopConfig } from '@/lib/utils/mcp-config';

interface MCPConfigViewProps {
  mcpSlug: string;
  mcpVisibility?: 'public' | 'private';
}

export default function MCPConfigView({ mcpSlug, mcpVisibility = 'public' }: MCPConfigViewProps) {
  const [configType, setConfigType] = useState<'http' | 'claude'>('http');
  const [copied, setCopied] = useState(false);

  const config = configType === 'http'
    ? generateMCPConfig(mcpSlug, mcpVisibility)
    : generateClaudeDesktopConfig(mcpSlug, mcpVisibility);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(config);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // Silently handle copy errors
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium text-black dark:text-zinc-50">
            MCP Client Configuration
          </h4>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
            Use this configuration to connect to this MCP server
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={configType}
            onChange={(e) => setConfigType(e.target.value as 'http' | 'claude')}
            className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs text-black focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-50 dark:focus:ring-zinc-50"
          >
            <option value="http">HTTP/SSE</option>
            <option value="claude">Claude Desktop</option>
          </select>
          <button
            onClick={handleCopy}
            className="rounded-lg bg-black px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      <div className="relative">
        <pre className="overflow-x-auto rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs dark:border-zinc-800 dark:bg-zinc-900">
          <code className="text-zinc-800 dark:text-zinc-200">{config}</code>
        </pre>
      </div>

      <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 dark:bg-blue-900/20 dark:border-blue-800">
        <p className="text-xs text-blue-800 dark:text-blue-300">
          <strong>Endpoint URL:</strong>{' '}
          <code className="bg-blue-100 dark:bg-blue-900/40 px-1 rounded">
            {typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/api/mcp/{mcpSlug}
          </code>
        </p>
        {mcpVisibility === 'private' && (
          <div className="mt-2 space-y-2">
            <p className="text-xs text-blue-700 dark:text-blue-400">
              <strong>🔒 This is a private MCP.</strong> OAuth authorization is required.
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              <strong>Automatic OAuth:</strong> Most MCP clients (like Cursor) should automatically handle OAuth when they receive a 401 response. The client will:
            </p>
            <ol className="text-xs text-blue-600 dark:text-blue-400 list-decimal list-inside ml-2 space-y-1">
              <li>Make a request to the MCP endpoint</li>
              <li>Receive a 401 with <code className="bg-blue-100 dark:bg-blue-900/40 px-1 rounded">WWW-Authenticate</code> header</li>
              <li>Discover OAuth endpoints from the metadata URL</li>
              <li>Complete the OAuth flow automatically</li>
              <li>Use the token for subsequent requests</li>
            </ol>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
              <strong>Manual Token (if automatic OAuth doesn't work):</strong> If your client doesn't support automatic OAuth, you can{' '}
              <a
                href={`/oauth-token/${mcpSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline hover:text-blue-800 dark:hover:text-blue-200"
              >
                get a token manually
              </a>
              {' '}and add it to the configuration:
            </p>
            <pre className="text-xs bg-blue-100 dark:bg-blue-900/40 p-2 rounded mt-1 overflow-x-auto">
              <code>{`"headers": {
  "Authorization": "Bearer YOUR_TOKEN_HERE"
}`}</code>
            </pre>
          </div>
        )}
        {configType === 'http' && (
          <p className="mt-2 text-xs text-blue-700 dark:text-blue-400">
            This configuration is for HTTP/SSE-based MCP clients. Add this to your MCP client configuration file (e.g., <code className="bg-blue-100 dark:bg-blue-900/40 px-1 rounded">.cursor/mcp.json</code>).
          </p>
        )}
        {configType === 'claude' && (
          <p className="mt-2 text-xs text-blue-700 dark:text-blue-400">
            Add this to your Claude Desktop configuration file (usually at{' '}
            <code className="bg-blue-100 dark:bg-blue-900/40 px-1 rounded">
              ~/Library/Application Support/Claude/claude_desktop_config.json
            </code>
            ).
          </p>
        )}
      </div>
    </div>
  );
}
