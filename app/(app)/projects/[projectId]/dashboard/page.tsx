import { notFound, redirect } from "next/navigation";

import { QueryDashboardShell } from "@/app/(app)/query-dashboard/components/query-dashboard-shell";
import { getProjectProfileRouteData } from "@/app/utils/project-profile-data";
import { getProjectDashboardHrefById } from "@/app/utils/project-profile";

export default async function ProjectDashboardPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  // Name-based links already identify the legacy dashboard. Its client data
  // comes from the signed-in user's saved records, not writer-project history.
  if (projectId.startsWith("name:")) {
    const projectName = projectId.slice(5).trim();
    if (!projectName) notFound();

    return (
      <QueryDashboardShell
        key={`name:${projectName}`}
        projectName={projectName}
        writerProjectId={null}
      />
    );
  }

  const routeData = await getProjectProfileRouteData(projectId);

  if (!routeData) {
    notFound();
  }

  if (
    routeData.source === "writer-project-api" &&
    !routeData.isCanonicalRoute
  ) {
    redirect(getProjectDashboardHrefById(routeData.profile.projectId));
  }

  return (
    <QueryDashboardShell
      key={routeData.profile.projectId}
      projectName={routeData.profile.projectName}
      writerProjectId={
        routeData.profile.writerProjectId ??
        routeData.profile.savedAgentWriterProjectId ??
        null
      }
    />
  );
}
