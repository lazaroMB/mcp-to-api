import { getDashboardStatistics } from './mcps/statistics-actions';
import type { DashboardStatistics } from './mcps/statistics-types';
import StatisticsCards from './statistics-cards';
import { Alert } from '@/components/ui/alert';
import { Card, CardHeader, CardTitle, CardPanel } from '@/components/ui/card';

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
        <h1 className="text-3xl font-bold">
          Dashboard
        </h1>
        <p className="mt-2 text-muted-foreground">
          Welcome to the admin dashboard
        </p>
      </div>

      {/* Stats Grid */}
      {error ? (
        <Alert variant="error">
          {error}
        </Alert>
      ) : stats ? (
        <StatisticsCards stats={stats} />
      ) : null}

      {/* Top Tools */}
      {stats && stats.topTools.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Most Used Tools</CardTitle>
          </CardHeader>
          <CardPanel>
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
          </CardPanel>
        </Card>
      )}
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
    <div className="flex items-start justify-between border-b pb-4 last:border-0">
      <div>
        <p className="font-medium">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {description}
        </p>
      </div>
      <p className="text-sm text-muted-foreground">{time}</p>
    </div>
  );
}
