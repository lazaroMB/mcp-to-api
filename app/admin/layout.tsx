import Link from "next/link";
import AdminNav from "./admin-nav";
import { requireAuth } from "@/lib/auth/middleware";
import LogoutButton from "./logout-button";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireAuth();

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-black">
      {/* Sidebar */}
      <aside className="relative flex w-64 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex h-16 items-center border-b border-zinc-200 px-6 dark:border-zinc-800">
          <h1 className="text-xl font-semibold text-black dark:text-zinc-50">
            Admin Panel
          </h1>
        </div>
        <nav className="flex-1 p-4">
          <AdminNav />
        </nav>
        <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
          <div className="mb-2 text-xs text-zinc-500 dark:text-zinc-400">
            {user.email}
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <div className="h-16 border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex h-full items-center justify-between px-6">
            <h2 className="text-lg font-medium text-black dark:text-zinc-50">
              Admin Space
            </h2>
          </div>
        </div>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
