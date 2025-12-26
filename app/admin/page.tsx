import { getDashboardStatistics } from './mcps/statistics-actions';
import type { DashboardStatistics } from './mcps/statistics-types';
import StatisticsCards from './statistics-cards';

export default async function AdminDashboard() {
  let stats;
  let error = null;

  try {
    stats = await getDashboardStatistics('all');
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load statistics';
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-black dark:text-zinc-50">
          Dashboard
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Welcome to the admin dashboard
        </p>
      </div>

      {/* Stats Grid */}
      {error ? (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400">
          {error}
        </div>
      ) : stats ? (
        <StatisticsCards stats={stats} />
      ) : null}

      {/* Top Tools */}
      {stats && stats.topTools.length > 0 && (
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-xl font-semibold text-black dark:text-zinc-50">
            Most Used Tools
          </h2>
          <div className="space-y-4">
            {stats.topTools.map((tool, index) => (
              <ActivityItem
                key={index}
                title={tool.toolName}
                description={`${tool.mcpName} • ${tool.callCount.toLocaleString()} calls`}
                time={`#${index + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  change,
  changeType,
}: {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative";
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
        {title}
      </p>
      <p className="mt-2 text-2xl font-bold text-black dark:text-zinc-50">
        {value}
      </p>
      <p
        className={`mt-2 text-sm ${
          changeType === "positive"
            ? "text-green-600 dark:text-green-400"
            : "text-red-600 dark:text-red-400"
        }`}
      >
        {change} from last month
      </p>
    </div>
  );
}

function ActivityItem({
  title,
  description,
  time,
}: {
  title: string;
  description: string;
  time: string;
}) {
  return (
    <div className="flex items-start justify-between border-b border-zinc-200 pb-4 last:border-0 dark:border-zinc-800">
      <div>
        <p className="font-medium text-black dark:text-zinc-50">{title}</p>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {description}
        </p>
      </div>
      <p className="text-sm text-zinc-500 dark:text-zinc-500">{time}</p>
    </div>
  );
}
