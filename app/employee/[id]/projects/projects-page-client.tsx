
"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, FolderKanban, MoreVertical, Pencil, Trash2, FileText } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import type { Project, Employee } from "@/lib/types";
import { ProjectForm } from "@/components/employee/project-form";
import { Badge } from "@/components/ui/badge";

type ProjectsPageClientProps = {
    employee: Employee;
    initialProjects: Project[];
    addProjectAction: (project: Omit<Project, 'id' | 'createdAt'>) => Promise<Project>;
    updateProjectAction: (id: string, data: Partial<Omit<Project, 'id' | 'employeeId' | 'employeeName' | 'createdAt'>>) => Promise<Project | null>;
    deleteProjectAction: (id: string) => Promise<void>;
};

export function ProjectsPageClient({
    employee,
    initialProjects,
    addProjectAction,
    updateProjectAction,
    deleteProjectAction,
}: ProjectsPageClientProps) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
    const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
    const { toast } = useToast();

    const sortedProjects = initialProjects.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const handleEdit = (project: Project) => {
        setProjectToEdit(project);
        setIsFormOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!projectToDelete) return;
        await deleteProjectAction(projectToDelete.id);
        toast({
            variant: "destructive",
            title: "Project Deleted",
            description: `The project "${projectToDelete.projectName}" has been deleted.`,
        });
        setProjectToDelete(null);
    };
    
    const getStatusVariant = (status: Project['status']) => {
        switch (status) {
        case 'Completed':
            return 'success';
        case 'In Progress':
            return 'default';
        case 'On Hold':
            return 'secondary';
        default:
            return 'default';
        }
    };

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Projects</h1>
                    <p className="text-muted-foreground">Manage your ongoing and completed projects.</p>
                </div>
                <Button onClick={() => { setProjectToEdit(null); setIsFormOpen(true); }}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Project
                </Button>
            </div>

            {sortedProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedProjects.map((project) => (
                        <Card key={project.id} className="flex flex-col">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <CardTitle className="pr-8">{project.projectName}</CardTitle>
                                     <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onSelect={() => handleEdit(project)}>
                                                <Pencil className="mr-2 h-4 w-4" /> Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => setProjectToDelete(project)} className="text-destructive focus:text-destructive">
                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <CardDescription>Created on {format(parseISO(project.createdAt), "MMM dd, yyyy")}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <p className="text-sm text-muted-foreground line-clamp-3">{project.description}</p>
                            </CardContent>
                            <CardFooter className="flex justify-between items-center">
                                <Badge variant={getStatusVariant(project.status)}>{project.status}</Badge>
                                {project.fileName && (
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <FileText className="h-3 w-3" />
                                        <span className="truncate max-w-[120px]">{project.fileName}</span>
                                    </div>
                                )}
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
                    <FolderKanban className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No Projects Added Yet</h3>
                    <p className="mb-4 mt-2 text-sm text-muted-foreground">Get started by adding your first project.</p>
                    <Button onClick={() => setIsFormOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Project
                    </Button>
                </div>
            )}

            <ProjectForm
                isOpen={isFormOpen}
                onOpenChange={setIsFormOpen}
                employee={employee}
                projectToEdit={projectToEdit}
                addProjectAction={addProjectAction}
                updateProjectAction={updateProjectAction}
            />
            
            <AlertDialog open={!!projectToDelete} onOpenChange={() => setProjectToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the project "{projectToDelete?.projectName}". This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
