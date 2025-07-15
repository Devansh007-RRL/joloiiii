
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { Employee } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { Label } from "@/components/ui/label";

const employeeEditSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  position: z.string().min(2, { message: "Position must be at least 2 characters." }),
  salary: z.coerce.number().min(0, { message: "Salary must be a non-negative number." }),
});

type EmployeeFormValues = z.infer<typeof employeeEditSchema>;
type EmployeeUpdateData = Omit<Employee, 'id' | 'avatar' | 'username' | 'password'>;


type EditEmployeeFormProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onUpdateEmployee: (id: string, data: EmployeeUpdateData) => Promise<Employee | null>;
  employee: Employee | null;
};

export function EditEmployeeForm({ isOpen, onOpenChange, onUpdateEmployee, employee }: EditEmployeeFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeEditSchema),
  });
  
  useEffect(() => {
    if (employee) {
      form.reset({
        name: employee.name,
        position: employee.position,
        salary: employee.salary,
      });
    }
  }, [employee, form, isOpen]);

  const onSubmit: SubmitHandler<EmployeeFormValues> = async (data) => {
    if (!employee) return;
    
    await onUpdateEmployee(employee.id, data);
    toast({
        title: "Employee Updated",
        description: `${data.name}'s details have been successfully updated.`,
    });
    onOpenChange(false);
    router.refresh();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Employee Details</DialogTitle>
          <DialogDescription>
            Update the details for {employee?.name}. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        {employee && (
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                        <Input disabled value={employee.username} />
                    </FormControl>
                </FormItem>
                <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g. John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Position</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g. Software Engineer" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="salary"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Salary (INR per month)</FormLabel>
                    <FormControl>
                        <Input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="e.g. 50000"
                        {...field}
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <div className="space-y-2">
                    <Label>Password</Label>
                    <Input readOnly value={employee.password || 'Not Set'} />
                    <p className="text-xs text-muted-foreground">
                        This is the password set during creation. It cannot be changed here.
                    </p>
                </div>
                <DialogFooter>
                <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
                </DialogFooter>
            </form>
            </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
