
import { getChatGroupById, getMessagesForGroup, getEmployeeById, sendMessage, markChatGroupAsRead } from "@/lib/actions";
import { notFound } from "next/navigation";
import { ChatInterface } from "@/components/chat/chat-interface";
import type { ChatGroup, ChatMessage } from "@/lib/types";
import { revalidatePath } from "next/cache";

type EmployeeChatGroupPageProps = {
  params: { id: string, groupId: string }
}

export default async function EmployeeChatGroupPage({ params }: EmployeeChatGroupPageProps) {
  await markChatGroupAsRead(params.id, params.groupId);

  const employee = await getEmployeeById(params.id);
  const group: ChatGroup | undefined = await getChatGroupById(params.groupId);
  
  if (!employee || !group) {
    notFound();
  }

  // Security check: ensure employee is a member of the group
  if (!group.members.includes(employee.id)) {
    notFound();
  }

  const messages: ChatMessage[] = await getMessagesForGroup(params.groupId);
  
  const handleSendMessage = async (text: string) => {
    "use server";
    await sendMessage(params.groupId, params.id, text);
  }
  
  return (
    <ChatInterface
      group={group}
      messages={messages}
      onSendMessage={handleSendMessage}
      currentUserId={employee.id}
    />
  );
}
