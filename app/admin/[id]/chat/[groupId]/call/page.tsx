
import { getChatGroupById } from "@/lib/actions";
import { notFound } from "next/navigation";
import { CallInterface } from "@/components/chat/call-interface";

type AdminCallPageProps = {
  params: { groupId: string }
}

export default async function AdminCallPage({ params }: AdminCallPageProps) {
  const group = await getChatGroupById(params.groupId);
  if (!group) {
    notFound();
  }

  return <CallInterface groupName={group.name} />;
}
