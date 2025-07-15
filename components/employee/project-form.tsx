
"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { Employee, Project } from "@/lib/types";
import { useEffect, useState, useRef } from "react";
import { UploadCloud, File as FileIcon, X } from "lucide-react";

const projectSchema = z.object({
  projectName: z.string().min(3, "Project name must be at least 3 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  status: z.enum(['In Progress', 'Completed', 'On Hold']),
  fileName: z.string().optional(),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

type ProjectFormProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  employee: Employee;
  projectToEdit: Project | null;
  addProjectAction: (project: Omit<Project, 'id' | 'createdAt'>) => Promise<Project>;
  updateProjectAction: (id: string, data: Partial<Omit<Project, 'id' | 'employeeId' | 'employeeName' | 'createdAt'>>) => Promise<Project | null>;
};

export function ProjectForm({
  isOpen, onOpenChange, employee, projectToEdit, addProjectAction, updateProjectAction,
}: ProjectFormProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | undefined>(projectToEdit?.fileName);

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      projectName: "",
      description: "",
      status: "In Progress",
      fileName: "",
    },
  });

  useEffect(() => {
    if (projectToEdit) {
      form.reset({
        projectName: projectToEdit.projectName,
        description: projectToEdit.description,
        status: projectToEdit.status,
        fileName: projectToEdit.fileName,
      });
      setSelectedFileName(projectToEdit.fileName);
    } else {
      form.reset({
        projectName: "",
        description: "",
        status: "In Progress",
        fileName: "",
      });
      setSelectedFileName(undefined);
    }
  }, [projectToEdit, form, isOpen]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
      form.setValue('fileName', file.name, { shouldValidate: true });
    }
  };
  
  const clearFile = () => {
      setSelectedFileName(undefined);
      form.setValue('fileName', undefined);
      if(fileInputRef.current) {
          fileInputRef.current.value = "";
      }
  };

  const onSubmit: SubmitHandler<ProjectFormValues> = async (data) => {
    try {
      if (projectToEdit) {
        await updateProjectAction(projectToEdit.id, data);
        toast({ title: "Project Updated", description: `"${data.projectName}" has been updated.` });
      } else {
        await addProjectAction({ ...data, employeeId: employee.id, employeeName: employee.name });
        toast({ title: "Project Added", description: `"${data.projectName}" has been added.` });
      }
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: error instanceof Error ? error.message : "Could not save project.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{projectToEdit ? "Edit Project" : "Add New Project"}</DialogTitle>
          <DialogDescription>
            {projectToEdit ? "Update the details of your project." : "Fill in the details for your new project."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="projectName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl><Input placeholder="e.g. Website Redesign" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea placeholder="Describe the project goals and your role." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="On Hold">On Hold</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
                <FormLabel>Attach File (Optional)</FormLabel>
                <FormControl>
                    <div>
                        <input
                            type="file"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                        />
                        {!selectedFileName ? (
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <UploadCloud className="mr-2 h-4 w-4" />
                                Upload a file
                            </Button>
                        ) : (
                            <div className="flex items-center justify-between rounded-md border p-2">
                                <div className="flex items-center gap-2 truncate">
                                    <FileIcon className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                                    <span className="text-sm truncate">{selectedFileName}</span>
                                </div>
                                <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={clearFile}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                </FormControl>
                <FormDescription>Attach any relevant document, image, or zip file.</FormDescription>
            </FormItem>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving..." : "Save Project"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
