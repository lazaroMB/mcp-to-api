'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ToolStatistics, MCPStatistics } from './statistics-types';

interface ToolStatisticsSectionProps {
  mcpId: string;
  toolStats: ToolStatistics[];
  mcpStats: MCPStatistics;
  timeRange: '24h' | '7d' | '30d' | 'all';
}

export default function ToolStatisticsSection({
  mcpId,
  toolStats,
  mcpStats,
  timeRange,
}: ToolStatisticsSectionProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleTimeRangeChange = (newRange: '24h' | '7d' | '30d' | 'all') => {
    const params = new URLSearchParams(searchParams.toString());
    if (newRange === 'all') {
      params.delete('timeRange');
    } else {
      params.set('timeRange', newRange);
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-black dark:text-zinc-50">
          Tool Usage Statistics
        </h2>
        <select
          value={timeRange}
          onChange={(e) => handleTimeRangeChange(e.target.value as any)}
          className="rounded border border-zinc-300 bg-white px-3 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
        >
          <option value="24h">Last 24 hours</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="all">All time</option>
        </select>
      </div>

      {/* MCP Overview Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Total Calls</p>
          <p className="text-2xl font-bold text-black dark:text-zinc-50">
            {mcpStats.totalToolCalls}
          </p>
        </div>
        <div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Success Rate</p>
          <p
            className={`text-2xl font-bold ${
              mcpStats.successRate >= 95
                ? 'text-green-600 dark:text-green-400'
                : mcpStats.successRate >= 80
                ? 'text-yellow-600 dark:text-yellow-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {mcpStats.successRate.toFixed(1)}%
          </p>
        </div>
        <div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Avg Response</p>
          <p className="text-2xl font-bold text-black dark:text-zinc-50">
            {mcpStats.avgResponseTimeMs.toFixed(0)}ms
          </p>
        </div>
        <div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Most Used</p>
          <p className="text-lg font-semibold text-black dark:text-zinc-50">
            {mcpStats.mostUsedTool?.name || 'N/A'}
          </p>
        </div>
      </div>

      {/* Tool Statistics Table */}
      {toolStats.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="px-4 py-2 text-left text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  Tool Name
                </th>
                <th className="px-4 py-2 text-right text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  Total Calls
                </th>
                <th className="px-4 py-2 text-right text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  Success Rate
                </th>
                <th className="px-4 py-2 text-right text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  Avg Response
                </th>
                <th className="px-4 py-2 text-right text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  Last Called
                </th>
              </tr>
            </thead>
            <tbody>
              {toolStats.map((stat) => (
                <tr
                  key={stat.toolId}
                  className="border-b border-zinc-100 dark:border-zinc-800"
                >
                  <td className="px-4 py-2 font-medium text-black dark:text-zinc-50">
                    {stat.toolName}
                  </td>
                  <td className="px-4 py-2 text-right text-black dark:text-zinc-50">
                    {stat.totalCalls}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <span
                      className={
                        stat.successRate >= 95
                          ? 'text-green-600 dark:text-green-400'
                          : stat.successRate >= 80
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : 'text-red-600 dark:text-red-400'
                      }
                    >
                      {stat.successRate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right text-black dark:text-zinc-50">
                    {stat.avgResponseTimeMs.toFixed(0)}ms
                  </td>
                  <td className="px-4 py-2 text-right text-sm text-zinc-600 dark:text-zinc-400">
                    {stat.lastCalledAt
                      ? new Date(stat.lastCalledAt).toLocaleString()
                      : 'Never'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-8 text-center text-zinc-500 dark:text-zinc-400">
          No tool usage statistics available for the selected time range.
        </div>
      )}
    </div>
  );
}
