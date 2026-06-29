import { notFound, redirect } from "next/navigation";

import { getProjectProfileRouteData } from "@/app/utils/project-profile-data";
import { getProjectProfileHrefById } from "@/app/utils/project-profile";
import { ProjectProfileClient } from "./project-profile-client";

export default async function ProjectProfilePage({
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
    redirect(getProjectProfileHrefById(routeData.profile.projectId));
  }

  return (
    <ProjectProfileClient
      hasProfileMetadata={routeData.hasProfileMetadata}
      initialProfile={routeData.profile}
      source={routeData.source}
    />
  );
}
