import { getAPIs } from './actions';
import APIsList from './apis-list';

export default async function APIPage() {
  let apis = [];
  let error = null;

  try {
    apis = await getAPIs();
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load APIs';
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black dark:text-zinc-50">
            APIs
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Manage your API endpoint configurations
          </p>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400">
          {error}
        </div>
      ) : (
        <APIsList initialAPIs={apis} />
      )}
    </div>
  );
}
