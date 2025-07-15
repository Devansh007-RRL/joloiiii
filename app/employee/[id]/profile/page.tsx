
import { getEmployeeById, updateEmployeeAvatar } from "@/lib/actions";
import { notFound } from "next/navigation";
import { ProfilePageClient } from "./profile-page-client";

type EmployeeProfilePageProps = {
  params: { id: string }
}

export default async function EmployeeProfilePage({ params }: EmployeeProfilePageProps) {
  const employee = await getEmployeeById(params.id);

  if (!employee) {
    notFound();
  }

  return (
     <ProfilePageClient employee={employee} updateAvatarAction={updateEmployeeAvatar} />
  );
}
