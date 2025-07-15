
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import type { ChatGroup } from "@/lib/types";
import { format, parseISO } from "date-fns";

type ChatListPageClientProps = {
  chatGroups: ChatGroup[];
  employeeId: string;
};

export function ChatListPageClient({ chatGroups, employeeId }: ChatListPageClientProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const sortedGroups = chatGroups.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Chat Groups</h1>
        <p className="text-muted-foreground">Join a group to discuss topics with your colleagues.</p>
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle>Available Groups</CardTitle>
            <CardDescription>Click on a group to join the discussion.</CardDescription>
        </CardHeader>
        <CardContent>
            {sortedGroups.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sortedGroups.map((group) => (
                        <Link 
                            key={group.id} 
                            href={`/employee/${employeeId}/chat/${group.id}`} 
                            className="block p-4 rounded-lg border bg-card text-card-foreground shadow-sm hover:bg-muted/50 transition-colors"
                        >
                            <div className="flex items-start gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground flex-shrink-0">
                                    <MessageSquare className="h-5 w-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold truncate">{group.name}</p>
                                    <p className="text-sm text-muted-foreground truncate">{group.topic}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Created on {isClient ? format(parseISO(group.createdAt), 'MMM dd, yyyy') : ''}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 text-muted-foreground">
                    <MessageSquare className="mx-auto h-12 w-12 mb-4" />
                    <p>No chat groups have been created yet.</p>
                    <p className="text-xs">Ask an administrator to create one.</p>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
