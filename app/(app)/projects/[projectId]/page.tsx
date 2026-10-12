import { redirect } from "next/navigation";
import { getProjectDashboardHrefById } from "@/app/utils/project-dashboard-route";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  redirect(getProjectDashboardHrefById(projectId));
}
