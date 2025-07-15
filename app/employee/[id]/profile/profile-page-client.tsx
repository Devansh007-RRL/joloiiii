
"use client";

import { useRef, useState } from 'react';
import type { Employee } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from '@/components/ui/button';
import { Camera, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type ProfilePageClientProps = {
    employee: Employee;
    updateAvatarAction: (employeeId: string, avatarDataUri: string) => Promise<Employee | null>;
}

export function ProfilePageClient({ employee, updateAvatarAction }: ProfilePageClientProps) {
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    // Local state for avatar to show preview immediately
    const [avatarSrc, setAvatarSrc] = useState(employee.avatar);

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
            setAvatarSrc(base64String); // Optimistic UI update
            try {
                await updateAvatarAction(employee.id, base64String);
                toast({ title: 'Profile Picture Updated', description: 'Your new avatar has been saved.' });
            } catch (error) {
                setAvatarSrc(employee.avatar); // Revert on error
                toast({ variant: 'destructive', title: 'Upload Failed', description: 'Could not update your profile picture.' });
            } finally {
                setIsUploading(false);
            }
        };
        reader.onerror = () => {
            toast({ variant: 'destructive', title: 'Read Error', description: 'Could not read the selected file.' });
            setIsUploading(false);
        };
    };

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
                <p className="text-muted-foreground">View and manage your account details.</p>
            </div>
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Avatar className="h-20 w-20">
                                <AvatarImage src={avatarSrc} alt={employee.name} />
                                <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <Button
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
                        <div>
                            <CardTitle className="text-2xl">{employee.name}</CardTitle>
                            <CardDescription>@{employee.username}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" value={employee.name} readOnly />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input id="username" value={employee.username} readOnly />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="position">Position</Label>
                        <Input id="position" value={employee.position} readOnly />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="text" value={employee.password || "Not set"} readOnly />
                        <p className="text-xs text-muted-foreground">This is the password set by your administrator.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
