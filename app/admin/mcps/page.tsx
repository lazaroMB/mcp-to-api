import { getMCPs } from './actions';
import MCPsList from './mcps-list';

export default async function MCPsPage() {
  let mcps = [];
  let error = null;

  try {
    mcps = await getMCPs();
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load MCPs';
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black dark:text-zinc-50">
            MCP's
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Manage your MCP configurations
          </p>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400">
          {error}
        </div>
      ) : (
        <MCPsList initialMCPs={mcps} />
      )}
    </div>
  );
}
