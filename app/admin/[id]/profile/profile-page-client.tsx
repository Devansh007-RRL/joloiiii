
"use client";

import type { AdminProfile } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import { Camera, Loader2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useRef, useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const editAdminSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  username: z.string().min(3, "Username must be at least 3 characters."),
  password: z.string().optional().refine(val => !val || val.length >= 6, {
    message: "Password must be at least 6 characters.",
  }),
});

type EditAdminFormValues = z.infer<typeof editAdminSchema>;

type ProfilePageClientProps = {
    adminProfile: AdminProfile;
    updateAdminProfileAction: (id: string, data: Partial<Omit<AdminProfile, 'id' | 'avatar'>>) => Promise<any>;
    updateAdminAvatarAction: (id: string, avatar: string) => Promise<any>;
}

export function ProfilePageClient({
    adminProfile,
    updateAdminProfileAction,
    updateAdminAvatarAction
}: ProfilePageClientProps) {
    const { toast } = useToast();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [avatarSrc, setAvatarSrc] = useState(adminProfile.avatar);
    const [showPassword, setShowPassword] = useState(false);

    const form = useForm<EditAdminFormValues>({
        resolver: zodResolver(editAdminSchema),
        defaultValues: {
            name: adminProfile.name,
            username: adminProfile.username,
            password: "",
        }
    });

    useEffect(() => {
        setAvatarSrc(adminProfile.avatar);
        form.reset({
            name: adminProfile.name,
            username: adminProfile.username,
            password: "",
        });
    }, [adminProfile, form]);

    const onSubmit: SubmitHandler<EditAdminFormValues> = async (data) => {
        const updateData: Partial<Omit<AdminProfile, 'id' | 'avatar'>> = {
            name: data.name,
            username: data.username,
        };
        if (data.password) {
            updateData.password = data.password;
        }

        try {
            await updateAdminProfileAction(adminProfile.id, updateData);
            toast({ title: 'Profile Updated', description: 'Your profile details have been saved.' });
            
            if (data.password) {
                toast({
                    title: "Credentials Updated",
                    description: "You have been logged out for security. Please log in again.",
                    duration: 5000,
                });
                setTimeout(() => {
                    window.location.href = '/';
                }, 2000);
            } else {
                router.refresh();
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: error instanceof Error ? error.message : 'Could not update profile.' });
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast({ variant: 'destructive', title: 'Invalid File Type', description: 'Please select an image file.' });
            return;
        }
        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            toast({ variant: 'destructive', title: 'File Too Large', description: 'Please select an image smaller than 2MB.' });
            return;
        }

        setIsUploading(true);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = async () => {
            const base64String = reader.result as string;
            try {
                await updateAdminAvatarAction(adminProfile.id, base64String);
                setAvatarSrc(base64String);
                toast({ title: 'Avatar Updated' });
                router.refresh();
            } catch (error) {
                toast({ variant: 'destructive', title: 'Upload Failed', description: 'Could not update avatar.' });
            } finally {
                setIsUploading(false);
            }
        };
    };

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Admin Profile</h1>
                <p className="text-muted-foreground">Manage your administrator account details.</p>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Details</CardTitle>
                            <CardDescription>Update your personal information and password.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <Avatar className="h-20 w-20">
                                        <AvatarImage src={avatarSrc} alt={adminProfile.name} />
                                        <AvatarFallback>{adminProfile.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <Button
                                        type="button"
                                        size="icon"
                                        className="absolute bottom-0 right-0 rounded-full h-7 w-7"
                                        onClick={handleAvatarClick}
                                        disabled={isUploading}
                                        aria-label="Change profile picture"
                                    >
                                        {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                                    </Button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        className="hidden"
                                        accept="image/png, image/jpeg, image/gif"
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>Full Name</FormLabel>
                                            <FormControl><Input {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                  control={form.control}
                                  name="username"
                                  render={({ field }) => (
                                      <FormItem>
                                          <FormLabel>Username</FormLabel>
                                          <FormControl><Input {...field} /></FormControl>
                                          <FormMessage />
                                      </FormItem>
                                  )}
                              />
                              <FormField
                                  control={form.control}
                                  name="password"
                                  render={({ field }) => (
                                      <FormItem>
                                          <FormLabel>New Password</FormLabel>
                                          <div className="relative">
                                              <FormControl>
                                                  <Input
                                                      type={showPassword ? "text" : "password"}
                                                      placeholder="Leave blank to keep current"
                                                      {...field}
                                                  />
                                              </FormControl>
                                              <Button
                                                  type="button"
                                                  variant="ghost"
                                                  size="icon"
                                                  className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
                                                  onClick={() => setShowPassword((p) => !p)}
                                              >
                                                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                              </Button>
                                          </div>
                                          <FormMessage />
                                      </FormItem>
                                  )}
                              />
                            </div>
                        </CardContent>
                        <CardFooter className="border-t px-6 py-4">
                            <Button type="submit" disabled={form.formState.isSubmitting || !form.formState.isDirty}>
                                {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </Form>
        </div>
    );
}
