export default function UsersPage() {
  const users = [
    { id: 1, name: "John Doe", email: "john@example.com", role: "Admin", status: "Active" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", role: "User", status: "Active" },
    { id: 3, name: "Bob Johnson", email: "bob@example.com", role: "User", status: "Inactive" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black dark:text-zinc-50">
            Users
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Manage your users and permissions
          </p>
        </div>
        <button className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200">
          Add User
        </button>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                  <td className="px-6 py-4 text-sm font-medium text-black dark:text-zinc-50">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                    {user.role}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        user.status === "Active"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm">
                    <button className="text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
