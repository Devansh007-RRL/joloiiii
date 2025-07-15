
import { getProjectsByEmployee, addProject, updateProject, deleteProject } from "@/lib/actions";
import { getEmployeeById } from "@/lib/actions";
import { notFound } from "next/navigation";
import { ProjectsPageClient } from "./projects-page-client";

type ProjectsPageProps = {
  params: { id: string }
}

export default async function EmployeeProjectsPage({ params }: ProjectsPageProps) {
    const employee = await getEmployeeById(params.id);
    if (!employee) {
        notFound();
    }

    const projects = await getProjectsByEmployee(params.id);

    return (
        <ProjectsPageClient 
            employee={employee}
            initialProjects={projects}
            addProjectAction={addProject}
            updateProjectAction={updateProject}
            deleteProjectAction={deleteProject}
        />
    )
}
