import Link from "next/link";
import { requireAuth } from "@/lib/auth/middleware";
import LogoutButton from "./logout-button";
import AdminLayoutClient from "./admin-layout-client";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireAuth();

  return <AdminLayoutClient userEmail={user.email || ''}>{children}</AdminLayoutClient>;
}
