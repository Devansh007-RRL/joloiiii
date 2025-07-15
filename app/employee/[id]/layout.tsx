
import { getEmployeeById, getUnreadChatStatus } from "@/lib/actions";
import { notFound } from "next/navigation";
import { EmployeeIdLayoutClient } from "./layout-client";

export default async function EmployeeIdLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const employee = await getEmployeeById(params.id);

  if (!employee) {
    notFound();
  }

  const hasUnreadChats = await getUnreadChatStatus(params.id);
  
  return (
    <EmployeeIdLayoutClient 
      params={params}
      employee={employee}
      hasUnreadChats={hasUnreadChats}
    >
      {children}
    </EmployeeIdLayoutClient>
  );
}
