export default function AdminDashboard() {
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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value="1,234"
          change="+12%"
          changeType="positive"
        />
        <StatCard
          title="Active Sessions"
          value="567"
          change="+5%"
          changeType="positive"
        />
        <StatCard
          title="Revenue"
          value="$12,345"
          change="-2%"
          changeType="negative"
        />
        <StatCard
          title="Orders"
          value="89"
          change="+23%"
          changeType="positive"
        />
      </div>

      {/* Recent Activity */}
      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-4 text-xl font-semibold text-black dark:text-zinc-50">
          Recent Activity
        </h2>
        <div className="space-y-4">
          <ActivityItem
            title="New user registered"
            description="john.doe@example.com"
            time="2 minutes ago"
          />
          <ActivityItem
            title="Order completed"
            description="Order #12345"
            time="15 minutes ago"
          />
          <ActivityItem
            title="System backup completed"
            description="All systems operational"
            time="1 hour ago"
          />
        </div>
      </div>
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
