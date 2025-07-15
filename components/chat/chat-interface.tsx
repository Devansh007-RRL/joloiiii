
"use client";

import { useState, useRef, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, parseISO } from "date-fns";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Send, Loader2, Phone, Video } from "lucide-react";
import type { ChatGroup, ChatMessage } from "@/lib/types";

const messageSchema = z.object({
  text: z.string().min(1, "Message cannot be empty."),
});

type MessageFormValues = z.infer<typeof messageSchema>;

type ChatInterfaceProps = {
  group: ChatGroup;
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  currentUserId: string;
  isSendingDisabled?: boolean;
};

export function ChatInterface({ group, messages, onSendMessage, currentUserId, isSendingDisabled = false }: ChatInterfaceProps) {
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [optimisticMessages, setOptimisticMessages] = useState(messages);
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const form = useForm<MessageFormValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: { text: "" },
  });

  useEffect(() => {
    setOptimisticMessages(messages);
  }, [messages]);

  useEffect(() => {
    // Scroll to the bottom when messages change
    if (scrollAreaRef.current) {
      const scrollableView = scrollAreaRef.current.querySelector("div");
      if (scrollableView) {
        scrollableView.scrollTop = scrollableView.scrollHeight;
      }
    }
  }, [optimisticMessages]);

  const onSubmit: SubmitHandler<MessageFormValues> = async (data) => {
    if (isSendingDisabled) return;
    
    // Optimistic update
    const tempId = Date.now().toString();
    const newMessage = {
      id: tempId,
      groupId: group.id,
      employeeId: currentUserId,
      employeeName: 'You', // Placeholder
      employeeAvatar: '', // Placeholder
      text: data.text,
      createdAt: new Date().toISOString(),
    };
    setOptimisticMessages(prev => [...prev, newMessage]);
    
    form.reset();
    
    try {
      await onSendMessage(data.text);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error Sending Message",
        description: "Your message could not be sent. Please try again.",
      });
      // Revert optimistic update on failure
      setOptimisticMessages(prev => prev.filter(m => m.id !== tempId));
    }
  };
  
  return (
    <Card className="flex flex-col h-[calc(100vh_-_10rem)] max-h-[800px]">
      <CardHeader className="border-b p-4 flex flex-row items-center justify-between">
        <div>
            <CardTitle>{group.name}</CardTitle>
            <CardDescription>{group.topic}</CardDescription>
        </div>
        <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="icon" aria-label="Start audio call">
                <Link href={`${pathname}/call`}>
                    <Phone className="h-5 w-5" />
                </Link>
            </Button>
            <Button asChild variant="outline" size="icon" aria-label="Start video call">
                <Link href={`${pathname}/call`}>
                    <Video className="h-5 w-5" />
                </Link>
            </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="p-6 space-y-4">
            {optimisticMessages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex items-start gap-3",
                  message.employeeId === currentUserId && "justify-end"
                )}
              >
                {message.employeeId !== currentUserId && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={message.employeeAvatar} alt={message.employeeName} />
                    <AvatarFallback>{message.employeeName.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
                <div className={cn(
                  "p-3 rounded-lg max-w-sm",
                   message.employeeId === currentUserId
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className={cn(
                      "text-xs mt-1",
                      message.employeeId === currentUserId 
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    )}
                  >
                     {message.employeeId !== currentUserId ? `${message.employeeName} at ` : ''}
                     {isClient ? format(parseISO(message.createdAt), 'p') : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-4 border-t">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full items-center gap-2">
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input
                      placeholder={isSendingDisabled ? "You are viewing as an admin." : "Type a message..."}
                      autoComplete="off"
                      disabled={form.formState.isSubmitting || isSendingDisabled}
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit" size="icon" disabled={form.formState.isSubmitting || isSendingDisabled}>
              {form.formState.isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                  <Send className="h-4 w-4" />
              )}
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </Form>
      </CardFooter>
    </Card>
  );
}
