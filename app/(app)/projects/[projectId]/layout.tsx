import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { ProjectWorkspace } from "@/app/components/projects/project-workspace";
import { getDashboardProject } from "@/app/utils/project-dashboard-data";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const project = await getDashboardProject(projectId);
  if (!project) notFound();
  return (
    <ProjectWorkspace key={project.id} project={project}>
      {children}
    </ProjectWorkspace>
  );
}
