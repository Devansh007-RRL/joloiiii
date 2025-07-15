
"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { AdminProfile } from "@/lib/types";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Camera, Eye, EyeOff, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const editAdminSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  username: z.string().min(3, "Username must be at least 3 characters."),
  password: z.string().optional().refine(val => !val || val.length >= 6, {
    message: "Password must be at least 6 characters.",
  }),
});

type EditAdminFormValues = z.infer<typeof editAdminSchema>;

type EditAdminFormProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onUpdateAdmin: (id: string, data: Partial<Omit<AdminProfile, 'id' | 'avatar'>>) => Promise<void>;
  onUpdateAvatar: (id: string, avatarDataUri: string) => Promise<void>;
  profile: AdminProfile | null;
  isEditingCurrentUser: boolean;
};

export function EditAdminForm({ isOpen, onOpenChange, onUpdateAdmin, onUpdateAvatar, profile, isEditingCurrentUser }: EditAdminFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [avatarSrc, setAvatarSrc] = useState(profile?.avatar);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<EditAdminFormValues>({
    resolver: zodResolver(editAdminSchema),
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name,
        username: profile.username,
        password: "",
      });
      setAvatarSrc(profile.avatar);
    }
  }, [profile, form, isOpen]);

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  const onSubmit: SubmitHandler<EditAdminFormValues> = async (data) => {
    if (!profile) return;
    
    const updateData: Partial<AdminProfile> = {
        name: data.name,
        username: data.username,
    };
    if (data.password) {
        updateData.password = data.password;
    }

    await onUpdateAdmin(profile.id, updateData);

    if (isEditingCurrentUser && data.password) {
        toast({
            title: "Credentials Updated",
            description: "You have been logged out for security. Please log in again.",
        });
        window.location.href = '/';
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!profile) return;
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
            await onUpdateAvatar(profile.id, base64String);
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
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Admin Profile</DialogTitle>
          <DialogDescription>
            Update details for {profile?.name}.
          </DialogDescription>
        </DialogHeader>
        {profile && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={avatarSrc} alt={profile.name} />
                            <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <Button
                            type="button"
                            size="icon"
                            className="absolute bottom-0 right-0 rounded-full h-6 w-6"
                            onClick={handleAvatarClick}
                            disabled={isUploading}
                        >
                            {isUploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Camera className="h-3 w-3" />}
                        </Button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept="image/png, image/jpeg, image/gif"
                        />
                    </div>
                    <div>
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

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
                    <FormLabel>New Password (Optional)</FormLabel>
                    <div className="relative">
                        <FormControl>
                            <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Leave blank to keep unchanged"
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
              <DialogFooter>
                <Button variant="outline" type="button" onClick={handleClose}>Cancel</Button>
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
