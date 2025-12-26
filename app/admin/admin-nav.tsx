"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/mcps", label: "MCP's" },
    { href: "/admin/api", label: "API" },
  ];

  return (
    <ul className="space-y-2">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href));
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`block rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-zinc-100 text-black dark:bg-zinc-800 dark:text-zinc-50"
                  : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
