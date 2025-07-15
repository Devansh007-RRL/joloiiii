
"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ChatGroup, Employee } from "@/lib/types";
import { useEffect } from "react";

const groupSchema = z.object({
  name: z.string().min(3, { message: "Group name must be at least 3 characters." }),
  topic: z.string().min(5, { message: "Topic must be at least 5 characters." }),
  memberIds: z.array(z.string()).min(1, "Please select at least one member."),
});

type GroupFormValues = z.infer<typeof groupSchema>;

type EditChatGroupFormProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onUpdateGroup: (id: string, name: string, topic: string, memberIds: string[]) => Promise<any>;
  employees: Employee[];
  group: ChatGroup | null;
};

export function EditChatGroupForm({ isOpen, onOpenChange, onUpdateGroup, employees, group }: EditChatGroupFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<GroupFormValues>({
    resolver: zodResolver(groupSchema),
    defaultValues: { name: "", topic: "", memberIds: [] },
  });

  useEffect(() => {
    if (group) {
      form.reset({
        name: group.name,
        topic: group.topic,
        memberIds: group.members,
      });
    }
  }, [group, form, isOpen]);

  const onSubmit: SubmitHandler<GroupFormValues> = async (data) => {
    if (!group) return;
    await onUpdateGroup(group.id, data.name, data.topic, data.memberIds);
    toast({
        title: "Group Updated",
        description: `The "${data.name}" group has been updated.`,
    });
    form.reset();
    onOpenChange(false);
    router.refresh();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Chat Group</DialogTitle>
          <DialogDescription>
            Update the name, topic, and members for this group.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Project Phoenix" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Topic / Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g. Discussion about the upcoming project launch." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="memberIds"
              render={() => (
                <FormItem>
                  <div className="mb-2">
                    <FormLabel>Members</FormLabel>
                    <FormDescription>
                      Select the employees who should be part of this group.
                    </FormDescription>
                  </div>
                  <ScrollArea className="h-40 w-full rounded-md border p-4">
                    {employees.map((employee) => (
                      <FormField
                        key={employee.id}
                        control={form.control}
                        name="memberIds"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={employee.id}
                              className="flex flex-row items-start space-x-3 space-y-0 mb-4"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(employee.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), employee.id])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== employee.id
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {employee.name}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </ScrollArea>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
