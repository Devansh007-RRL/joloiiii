
import { getChatGroupById, getMessagesForGroup, sendMessageAsAdmin, markChatGroupAsRead } from "@/lib/actions";
import { notFound } from "next/navigation";
import { ChatInterface } from "@/components/chat/chat-interface";
import type { ChatGroup, ChatMessage } from "@/lib/types";
import { revalidatePath } from "next/cache";

type AdminChatGroupPageProps = {
  params: { id: string, groupId: string }
}

export default async function AdminChatGroupPage({ params }: AdminChatGroupPageProps) {
  await markChatGroupAsRead(params.id, params.groupId);

  const group: ChatGroup | undefined = await getChatGroupById(params.groupId);
  if (!group) {
    notFound();
  }

  const messages: ChatMessage[] = await getMessagesForGroup(params.groupId);

  const handleSendMessage = async (text: string) => {
    "use server";
    await sendMessageAsAdmin(params.groupId, params.id, text);
  }
  
  return (
    <ChatInterface
      group={group}
      messages={messages}
      onSendMessage={handleSendMessage}
      currentUserId={params.id}
      isSendingDisabled={false}
    />
  );
}
