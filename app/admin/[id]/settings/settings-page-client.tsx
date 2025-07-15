
"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import type { OfficeSettings } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { MapPin, Target } from "lucide-react";

const settingsSchema = z.object({
  latitude: z.coerce.number().min(-90, "Invalid latitude").max(90, "Invalid latitude"),
  longitude: z.coerce.number().min(-180, "Invalid longitude").max(180, "Invalid longitude"),
  clockInRadius: z.coerce.number().min(50, "Radius must be at least 50 meters").max(5000, "Radius cannot exceed 5000 meters"),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

type SettingsPageClientProps = {
  initialSettings: OfficeSettings;
  updateSettingsAction: (settings: OfficeSettings) => Promise<void>;
};

export function SettingsPageClient({ initialSettings, updateSettingsAction }: SettingsPageClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
  });

  useEffect(() => {
    if (initialSettings) {
      form.reset({
        latitude: initialSettings.officeLocation.latitude,
        longitude: initialSettings.officeLocation.longitude,
        clockInRadius: initialSettings.clockInRadius,
      });
    }
  }, [initialSettings, form]);

  const onSubmit: SubmitHandler<SettingsFormValues> = async (data) => {
    const newSettings: OfficeSettings = {
      officeLocation: {
        latitude: data.latitude,
        longitude: data.longitude,
      },
      clockInRadius: data.clockInRadius,
    };
    await updateSettingsAction(newSettings);
    toast({
      title: "Settings Updated",
      description: "Office location and clock-in radius have been saved.",
    });
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage application-wide settings.</p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Clock-In Settings</CardTitle>
              <CardDescription>
                Define the office location and the allowed radius for employees to clock in.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-medium flex items-center gap-2"><MapPin className="h-5 w-5" /> Office Location</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7">
                  <FormField
                    control={form.control}
                    name="latitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Latitude</FormLabel>
                        <FormControl>
                          <Input type="number" step="any" placeholder="e.g. 19.0760" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="longitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Longitude</FormLabel>
                        <FormControl>
                          <Input type="number" step="any" placeholder="e.g. 72.8777" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="space-y-2">
                 <h3 className="font-medium flex items-center gap-2"><Target className="h-5 w-5" /> Clock-in Radius</h3>
                <div className="pl-7">
                    <FormField
                        control={form.control}
                        name="clockInRadius"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Radius</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="e.g. 500" {...field} />
                            </FormControl>
                            <FormDescription>The maximum allowed distance (in meters) from the office to clock in.</FormDescription>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button type="submit" disabled={form.formState.isSubmitting || !form.formState.isDirty}>
                {form.formState.isSubmitting ? "Saving..." : "Save Settings"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}
