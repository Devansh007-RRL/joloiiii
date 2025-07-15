import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserNav } from "@/components/layout/user-nav";

type HeaderProps = {
  user: {
    name: string;
    username: string;
    avatarUrl: string;
  }
};

export function Header({ user }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-4 border-b bg-background px-4 sm:px-6">
      <SidebarTrigger className="sm:hidden" />
      <div className="flex-1" />
      <UserNav name={user.name} username={user.username} avatarUrl={user.avatarUrl} />
    </header>
  );
}
