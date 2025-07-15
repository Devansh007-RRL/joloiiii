
import { AdminLayoutClient } from "./layout-client";
import { getAdminProfileById, getUnreadChatStatus } from "@/lib/actions";
import { notFound } from "next/navigation";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const adminProfile = await getAdminProfileById(params.id);
  if (!adminProfile) {
    notFound();
  }

  const hasUnreadChats = await getUnreadChatStatus(params.id);

  return (
    <AdminLayoutClient adminProfile={adminProfile} hasUnreadChats={hasUnreadChats}>
      {children}
    </AdminLayoutClient>
  );
}
