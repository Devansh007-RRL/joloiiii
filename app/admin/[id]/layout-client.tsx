
"use client";

import { usePathname, useParams } from "next/navigation";
import Link from "next/link";

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Header } from "@/components/layout/header";
import { LayoutDashboard, Users, CalendarCheck2, LogOut, Plane, BookCheck, MessagesSquare, User, Download, Settings } from "lucide-react";
import { LogoIcon } from "@/components/logo";
import type { AdminProfile } from "@/lib/types";

type AdminLayoutClientProps = {
  children: React.ReactNode;
  adminProfile: AdminProfile;
  hasUnreadChats: boolean;
};

export function AdminLayoutClient({ children, adminProfile, hasUnreadChats }: AdminLayoutClientProps) {
  const pathname = usePathname();
  const params = useParams();
  const adminId = params.id as string;

  const adminUser = {
    name: adminProfile.name,
    username: adminProfile.username,
    avatarUrl: adminProfile.avatar
  }

  const menuItems = [
    { href: `/admin/${adminId}/dashboard`, label: "Dashboard", icon: LayoutDashboard },
    { href: `/admin/${adminId}/employees`, label: "Employees", icon: Users },
    { href: `/admin/${adminId}/leaves`, label: "Leave Requests", icon: Plane },
    { href: `/admin/${adminId}/attendance`, label: "Attendance", icon: CalendarCheck2 },
    { href: `/admin/${adminId}/diary-report`, label: "Day Diary Report", icon: BookCheck },
    { href: `/admin/${adminId}/chat`, label: "Chat", icon: MessagesSquare },
    { href: `/admin/${adminId}/export`, label: "Export Data", icon: Download },
    { href: `/admin/${adminId}/profile`, label: "Profile", icon: User },
    { href: `/admin/${adminId}/settings`, label: "Settings", icon: Settings },
  ];
  
  const getIsActive = (href: string) => {
    if (href.endsWith('/dashboard')) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <a href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <LogoIcon className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <h2 className="font-headline text-lg font-semibold text-sidebar-foreground">StaffSync</h2>
              <p className="text-xs text-sidebar-foreground/70">Admin Panel</p>
            </div>
          </a>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={getIsActive(item.href)}>
                  <Link href={item.href}>
                    <div className="relative">
                      <item.icon />
                      {item.label === 'Chat' && hasUnreadChats && (
                        <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
                        </span>
                      )}
                    </div>
                    {item.label}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
           <SidebarMenu>
             <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/"><LogOut />Logout</a>
                </SidebarMenuButton>
              </SidebarMenuItem>
           </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <Header user={adminUser}/>
        <main className="flex-1 p-6 md:p-8">
          <div className="mx-auto w-full max-w-7xl">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
