import { notFound } from "next/navigation";
import { getDashboardProject } from "@/app/utils/project-dashboard-data";
import { ProjectProfileClient } from "./project-profile-client";

export default async function ProjectProfilePage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const project = await getDashboardProject(projectId);
  if (!project) notFound();
  return <ProjectProfileClient key={project.id} project={project} />;
}
