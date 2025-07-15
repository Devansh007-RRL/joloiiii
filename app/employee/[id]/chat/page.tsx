
import { getChatGroupsForEmployee, getEmployeeById } from "@/lib/actions";
import type { ChatGroup } from "@/lib/types";
import { ChatListPageClient } from "./chat-list-page-client";
import { notFound } from "next/navigation";

type EmployeeChatPageProps = {
    params: { id: string }
}

export default async function EmployeeChatPage({ params }: EmployeeChatPageProps) {
  const employee = await getEmployeeById(params.id);
  if (!employee) {
      notFound();
  }

  const chatGroups: ChatGroup[] = await getChatGroupsForEmployee(params.id);

  return (
    <ChatListPageClient 
      chatGroups={chatGroups}
      employeeId={params.id}
    />
  );
}
