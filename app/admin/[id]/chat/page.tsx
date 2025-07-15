
import { createChatGroup, getChatGroups, getEmployees, updateChatGroup, deleteChatGroup } from "@/lib/actions";
import type { ChatGroup, Employee } from "@/lib/types";
import { ChatPageClient } from "./chat-page-client";

export default async function AdminChatPage() {
  const chatGroups: ChatGroup[] = await getChatGroups();
  const employees: Employee[] = await getEmployees();

  return (
    <ChatPageClient 
      chatGroups={chatGroups}
      employees={employees}
      createChatGroupAction={createChatGroup}
      updateChatGroupAction={updateChatGroup}
      deleteChatGroupAction={deleteChatGroup}
    />
  );
}
