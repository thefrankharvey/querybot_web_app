import "server-only";

import { createServerSupabase } from "@/app/api/supabase/server";
import { isDashboardProjectId } from "./project-dashboard-route";
import { SmartMatchProjectError } from "./smart-match-projects.server";

// A newly submitted search can establish a missing relation. Historical names
// alone cannot establish which saved search belongs to an older dashboard.
export async function getLegacySearchProject(input: {
  userId: string;
  selection: unknown;
  writerProjectId: unknown;
  projectName: unknown;
  lastIndex: string;
}): Promise<string | null> {
  const selected = input.selection as {
    dashboardProjectId?: unknown;
    writerProjectId?: unknown;
  } | null;
  if (
    input.lastIndex !== "0" ||
    !selected ||
    selected.writerProjectId !== null ||
    typeof selected.dashboardProjectId !== "string" ||
    !isDashboardProjectId(selected.dashboardProjectId) ||
    (typeof input.writerProjectId === "string" && input.writerProjectId.trim())
  )
    return null;

  const { data, error } = await createServerSupabase()
    .from("dashboard_projects")
    .select("id,project_name,writer_project_id")
    .eq("id", selected.dashboardProjectId)
    .eq("user_id", input.userId)
    .maybeSingle();
  if (error)
    throw new SmartMatchProjectError(
      "Unable to check this project. Please try again.",
      503,
    );
  if (!data) throw new SmartMatchProjectError("Project not found.", 404);
  if (data.writer_project_id) {
    throw new SmartMatchProjectError(
      "This project now has saved traits. Select it again before searching.",
      409,
    );
  }
  if (
    typeof input.projectName !== "string" ||
    data.project_name.trim().toLowerCase() !==
      input.projectName.trim().toLowerCase()
  )
    throw new SmartMatchProjectError(
      "This project changed. Select it again before searching.",
      409,
    );
  return data.id;
}

export async function linkLegacySearchProfile(
  userId: string,
  dashboardId: string,
  writerProjectId: unknown,
) {
  if (
    typeof writerProjectId !== "string" ||
    !isDashboardProjectId(writerProjectId)
  ) {
    throw new SmartMatchProjectError(
      "The search did not return a saved project. Please try again.",
      502,
    );
  }
  const store = createServerSupabase();
  // Content deduplication can return an older search. Do not share one profile
  // between distinct dashboards, even if their historical names were the same.
  const existing = await store
    .from("dashboard_projects")
    .select("id")
    .eq("user_id", userId)
    .eq("writer_project_id", writerProjectId)
    .neq("id", dashboardId)
    .limit(1)
    .maybeSingle();
  if (existing.error) {
    throw new SmartMatchProjectError(
      "Unable to check the saved search's project. Please try again.",
      503,
    );
  }
  if (existing.data) {
    throw new SmartMatchProjectError(
      "This saved search already belongs to another project. Select that project to use its profile.",
      409,
    );
  }
  const { data, error } = await store
    .from("dashboard_projects")
    .update({ writer_project_id: writerProjectId })
    .eq("id", dashboardId)
    .eq("user_id", userId)
    .is("writer_project_id", null)
    .select("id")
    .maybeSingle();
  if (error)
    throw new SmartMatchProjectError(
      "Search saved, but its project profile could not be linked. Please try again.",
      503,
    );
  if (data) return;

  // A simultaneous request may have already attached the same search.
  const latest = await store
    .from("dashboard_projects")
    .select("writer_project_id")
    .eq("id", dashboardId)
    .eq("user_id", userId)
    .maybeSingle();
  if (latest.error)
    throw new SmartMatchProjectError(
      "Unable to check the saved project profile. Please try again.",
      503,
    );
  if (latest.data?.writer_project_id !== writerProjectId) {
    throw new SmartMatchProjectError(
      "This project's profile changed. Reload the project before searching again.",
      409,
    );
  }
}
