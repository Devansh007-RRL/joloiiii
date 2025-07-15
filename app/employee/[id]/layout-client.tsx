
"use client";

import { usePathname } from "next/navigation";
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
import { LayoutDashboard, CalendarDays, Plane, LogOut, User, BookText, MessagesSquare, FolderKanban } from "lucide-react";
import { LogoIcon } from "@/components/logo";
import type { Employee } from "@/lib/types";

type EmployeeIdLayoutClientProps = {
  children: React.ReactNode;
  params: { id: string };
  employee: Employee;
  hasUnreadChats: boolean;
}

export function EmployeeIdLayoutClient({ children, params, employee, hasUnreadChats }: EmployeeIdLayoutClientProps) {
  const pathname = usePathname();

  const employeeUser = {
    name: employee.name,
    username: employee.username,
    avatarUrl: employee.avatar
  };

  const menuItems = [
    { href: `/employee/${employee.id}`, label: "Dashboard", icon: LayoutDashboard },
    { href: `/employee/${employee.id}/day-diary`, label: "Daily Report", icon: BookText },
    { href: `/employee/${employee.id}/projects`, label: "My Projects", icon: FolderKanban },
    { href: `/employee/${employee.id}/attendance`, label: "Attendance", icon: CalendarDays },
    { href: `/employee/${employee.id}/leaves`, label: "Leave Requests", icon: Plane },
    { href: `/employee/${employee.id}/profile`, label: "Profile", icon: User },
    { href: `/employee/${employee.id}/chat`, label: "Chat", icon: MessagesSquare },
  ];

  const getIsActive = (href: string) => {
    // Exact match for the dashboard, prefix match for others.
    if (href === `/employee/${employee.id}`) {
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
               <p className="text-xs text-sidebar-foreground/70">Employee Portal</p>
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
        <Header user={employeeUser}/>
        <main className="flex-1 p-6 md:p-8">
            <div className="mx-auto w-full max-w-7xl">
                {children}
            </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
