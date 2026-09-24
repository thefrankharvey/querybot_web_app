import { redirect } from "next/navigation";

import { getProjectDashboardHrefById } from "@/app/utils/project-profile";

// Preserve existing project links while profile editing is deferred.
export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  redirect(getProjectDashboardHrefById(projectId));
}
