import { notFound } from "next/navigation";

import { QueryDashboardShell } from "@/app/(app)/query-dashboard/components/query-dashboard-shell";
import { getDashboardProject } from "@/app/utils/project-dashboard-data";

export default async function ProjectDashboardPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const project = await getDashboardProject(projectId);
  if (!project) notFound();

  return (
    <QueryDashboardShell
      key={project.id}
      dashboardProjectId={project.id}
      projectName={project.project_name}
      writerProjectId={project.writer_project_id}
    />
  );
}
