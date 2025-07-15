
import { getAdminProfileById, updateAdminProfile, updateAdminAvatar } from "@/lib/actions";
import { ProfilePageClient } from "./profile-page-client";
import { notFound } from "next/navigation";

type AdminProfilePageProps = {
  params: { id: string };
};

export default async function AdminProfilePage({ params }: AdminProfilePageProps) {
  const adminProfile = await getAdminProfileById(params.id);

  if (!adminProfile) {
    notFound();
  }

  return (
     <ProfilePageClient
        adminProfile={adminProfile}
        updateAdminProfileAction={updateAdminProfile}
        updateAdminAvatarAction={updateAdminAvatar}
     />
  );
}
