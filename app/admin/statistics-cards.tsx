'use client';

import { DashboardStatistics } from './mcps/statistics-types';

interface StatisticsCardsProps {
  stats: DashboardStatistics;
}

export default function StatisticsCards({ stats }: StatisticsCardsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Tool Calls"
        value={stats.totalToolCalls.toLocaleString()}
        description="All time"
      />
      <StatCard
        title="Active MCPs"
        value={stats.totalMCPs.toString()}
        description="Configured MCPs"
      />
      <StatCard
        title="Total Tools"
        value={stats.totalTools.toString()}
        description="Available tools"
      />
      <StatCard
        title="Success Rate"
        value={`${stats.overallSuccessRate.toFixed(1)}%`}
        description="Overall success rate"
        changeType={stats.overallSuccessRate >= 95 ? 'positive' : stats.overallSuccessRate >= 80 ? 'neutral' : 'negative'}
      />
    </div>
  );
}

function StatCard({
  title,
  value,
  description,
  changeType,
}: {
  title: string;
  value: string;
  description: string;
  changeType?: 'positive' | 'negative' | 'neutral';
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
        {title}
      </p>
      <p
        className={`mt-2 text-2xl font-bold ${
          changeType === 'positive'
            ? 'text-green-600 dark:text-green-400'
            : changeType === 'negative'
            ? 'text-red-600 dark:text-red-400'
            : 'text-black dark:text-zinc-50'
        }`}
      >
        {value}
      </p>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-500">
        {description}
      </p>
    </div>
  );
}
