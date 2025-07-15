
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';
import { authenticateEmployee, authenticateAdmin } from '@/lib/actions';

const employeeLoginSchema = z.object({
  username: z.string().min(1, { message: "Username is required." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type EmployeeLoginFormValues = z.infer<typeof employeeLoginSchema>;

const adminLoginSchema = z.object({
  username: z.string().min(1, { message: "Username is required." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;

function EmployeeLoginForm() {
    const router = useRouter();
    const { toast } = useToast();
    const [showPassword, setShowPassword] = useState(false);
    const form = useForm<EmployeeLoginFormValues>({
        resolver: zodResolver(employeeLoginSchema),
        defaultValues: { username: "", password: "" },
    });
    
    const onSubmit: SubmitHandler<EmployeeLoginFormValues> = async (data) => {
        const employee = await authenticateEmployee(data.username, data.password);

        if (employee) {
            toast({ title: "Login Successful", description: "Redirecting to your dashboard." });
            router.push(`/employee/${employee.id}`);
        } else {
            toast({ variant: "destructive", title: "Login Failed", description: "Invalid employee credentials." });
            form.reset();
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                 <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                            <Input type="text" placeholder="alice" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <div className="relative">
                           <FormControl>
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              {...field}
                              className="pr-10"
                            />
                          </FormControl>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:bg-transparent"
                            onClick={() => setShowPassword((prev) => !prev)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                            <span className="sr-only">
                              {showPassword ? "Hide password" : "Show password"}
                            </span>
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Logging in..." : "Login"}
                </Button>
            </form>
        </Form>
    );
}

function AdminLoginForm() {
    const router = useRouter();
    const { toast } = useToast();
    const [showPassword, setShowPassword] = useState(false);
    const form = useForm<AdminLoginFormValues>({
        resolver: zodResolver(adminLoginSchema),
        defaultValues: { username: "", password: "" },
    });

    const onSubmit: SubmitHandler<AdminLoginFormValues> = async (data) => {
        const admin = await authenticateAdmin(data.username, data.password);
        if (admin) {
            toast({ title: "Login Successful", description: "Redirecting to admin dashboard." });
            router.push(`/admin/${admin.id}/dashboard`);
        } else {
            toast({ variant: "destructive", title: "Login Failed", description: "Invalid admin credentials." });
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                 <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input type="text" placeholder="admin" {...field} />
                          </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                           <div className="relative">
                              <FormControl>
                                <Input
                                  type={showPassword ? "text" : "password"}
                                  placeholder="••••••••"
                                  {...field}
                                  className="pr-10"
                                />
                              </FormControl>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:bg-transparent"
                                onClick={() => setShowPassword((prev) => !prev)}
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                                <span className="sr-only">
                                  {showPassword ? "Hide password" : "Show password"}
                                </span>
                              </Button>
                            </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                   {form.formState.isSubmitting ? "Logging in..." : "Login as Admin"}
                </Button>
            </form>
        </Form>
    );
}

export function LoginForm() {
  return (
    <Tabs defaultValue="employee" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="employee">Employee</TabsTrigger>
        <TabsTrigger value="admin">Admin</TabsTrigger>
      </TabsList>
      <TabsContent value="employee" className="pt-6">
        <EmployeeLoginForm />
      </TabsContent>
      <TabsContent value="admin" className="pt-6">
        <AdminLoginForm />
      </TabsContent>
    </Tabs>
  );
}
