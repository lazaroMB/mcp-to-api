export default function MCPsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-black dark:text-zinc-50">
          MCP's
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Manage your MCP configurations
        </p>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-zinc-600 dark:text-zinc-400">
          MCP configurations will be displayed here.
        </p>
      </div>
    </div>
  );
}
