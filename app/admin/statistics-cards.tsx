'use client';

import { DashboardStatistics } from './mcps/statistics-types';
import { Card, CardHeader, CardTitle, CardDescription, CardPanel } from '@/components/ui/card';

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
    <Card>
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle
          className={`text-2xl ${
            changeType === 'positive'
              ? 'text-green-600 dark:text-green-400'
              : changeType === 'negative'
              ? 'text-red-600 dark:text-red-400'
              : ''
          }`}
        >
          {value}
        </CardTitle>
      </CardHeader>
      <CardPanel>
        <p className="text-sm text-muted-foreground">
          {description}
        </p>
      </CardPanel>
    </Card>
  );
}
