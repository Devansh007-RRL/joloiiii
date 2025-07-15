
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { PlusCircle, MessageSquare, Users, MoreHorizontal, Pencil, Trash2, Calendar } from "lucide-react";
import type { ChatGroup, Employee } from "@/lib/types";
import { CreateChatGroupForm } from "@/components/admin/create-chat-group-form";
import { EditChatGroupForm } from "@/components/admin/edit-chat-group-form";
import { format, parseISO } from "date-fns";
import { useToast } from "@/hooks/use-toast";

type ChatPageClientProps = {
  chatGroups: ChatGroup[];
  employees: Employee[];
  createChatGroupAction: (name: string, topic: string, memberIds: string[]) => Promise<ChatGroup>;
  updateChatGroupAction: (id: string, name: string, topic: string, memberIds: string[]) => Promise<void>;
  deleteChatGroupAction: (id: string) => Promise<void>;
};

export function ChatPageClient({ chatGroups, employees, createChatGroupAction, updateChatGroupAction, deleteChatGroupAction }: ChatPageClientProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [groupToEdit, setGroupToEdit] = useState<ChatGroup | null>(null);
  const [groupToDelete, setGroupToDelete] = useState<ChatGroup | null>(null);
  const [isClient, setIsClient] = useState(false);
  
  const params = useParams();
  const adminId = params.id as string;

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const { toast } = useToast();
  const router = useRouter();

  const sortedGroups = chatGroups.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleDelete = async () => {
    if (!groupToDelete) return;
    await deleteChatGroupAction(groupToDelete.id);
    toast({
      variant: "destructive",
      title: "Group Deleted",
      description: `The "${groupToDelete.name}" group has been deleted.`,
    });
    setGroupToDelete(null);
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Chat Groups</h1>
          <p className="text-muted-foreground">Manage discussion groups for your employees.</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Group
        </Button>
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle>Available Groups</CardTitle>
            <CardDescription>Click on a group to view the discussion. Use the menu for more actions.</CardDescription>
        </CardHeader>
        <CardContent>
            {sortedGroups.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sortedGroups.map((group) => (
                        <div key={group.id} className="relative">
                            <Link
                                href={`/admin/${adminId}/chat/${group.id}`}
                                className="flex h-full flex-col rounded-lg border bg-card p-4 text-card-foreground shadow-sm transition-colors hover:bg-muted/50"
                            >
                                <div className="flex-1">
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                            <MessageSquare className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold pr-8 truncate">{group.name}</p>
                                            <p className="truncate text-sm text-muted-foreground">
                                                {group.topic}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1.5">
                                        <Users className="h-3 w-3" />
                                        <span>{group.members.length} Members</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="h-3 w-3" />
                                        <span>
                                            {isClient ? format(parseISO(group.createdAt), "MMM dd, yyyy") : ""}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                            <div className="absolute right-2 top-2">
                                <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onSelect={() => setGroupToEdit(group)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                    className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                    onSelect={() => setGroupToDelete(group)}
                                    >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 text-muted-foreground">
                    <MessageSquare className="mx-auto h-12 w-12 mb-4" />
                    <p>No chat groups have been created yet.</p>
                </div>
            )}
        </CardContent>
      </Card>

      <CreateChatGroupForm
        isOpen={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onCreateGroup={createChatGroupAction}
        employees={employees}
      />
      
      <EditChatGroupForm
        isOpen={!!groupToEdit}
        onOpenChange={() => setGroupToEdit(null)}
        onUpdateGroup={updateChatGroupAction}
        employees={employees}
        group={groupToEdit}
      />

      <AlertDialog open={!!groupToDelete} onOpenChange={() => setGroupToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the chat group
              and all of its messages.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
