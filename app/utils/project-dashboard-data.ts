import "server-only";

import { auth } from "@clerk/nextjs/server";
import { createServerSupabase } from "@/app/api/supabase/server";
import { isDashboardProjectId } from "@/app/utils/project-dashboard-route";

export async function getDashboardProject(projectId: string) {
  if (!isDashboardProjectId(projectId)) return null;
  const { userId } = await auth();
  if (!userId) return null;

  const { data, error } = await createServerSupabase()
    .from("dashboard_projects")
    .select("id,project_name,writer_project_id")
    .eq("id", projectId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error("Unable to load this project. Please try again.");
  return data as {
    id: string;
    project_name: string;
    writer_project_id: string | null;
  } | null;
}
