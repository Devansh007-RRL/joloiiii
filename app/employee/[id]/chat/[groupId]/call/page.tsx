
import { getChatGroupById, getEmployeeById } from "@/lib/actions";
import { notFound } from "next/navigation";
import { CallInterface } from "@/components/chat/call-interface";

type EmployeeCallPageProps = {
  params: { id: string, groupId: string }
}

export default async function EmployeeCallPage({ params }: EmployeeCallPageProps) {
  const employee = await getEmployeeById(params.id);
  const group = await getChatGroupById(params.groupId);
  
  if (!employee || !group) {
    notFound();
  }

  // Security check: ensure employee is a member of the group
  if (!group.members.includes(employee.id)) {
    notFound();
  }

  return <CallInterface groupName={group.name} />;
}
