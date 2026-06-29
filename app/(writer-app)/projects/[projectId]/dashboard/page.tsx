import { notFound, redirect } from "next/navigation";

import { QueryDashboardShell } from "@/app/(writer-app)/query-dashboard/components/query-dashboard-shell";
import { getProjectProfileRouteData } from "@/app/utils/project-profile-data";
import { getProjectDashboardHrefById } from "@/app/utils/project-profile";

export default async function ProjectDashboardPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const routeData = await getProjectProfileRouteData(projectId);

  if (!routeData) {
    notFound();
  }

  if (routeData.source === "writer-project-api" && !routeData.isCanonicalRoute) {
    redirect(getProjectDashboardHrefById(routeData.profile.projectId));
  }

  return (
    <QueryDashboardShell
      projectName={routeData.profile.projectName}
      writerProjectId={
        routeData.profile.writerProjectId ??
        routeData.profile.savedAgentWriterProjectId ??
        null
      }
    />
  );
}
