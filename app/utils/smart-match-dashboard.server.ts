import "server-only";

import { createServerSupabase } from "@/app/api/supabase/server";
import { isDashboardProjectId } from "./project-dashboard-route";
import { SmartMatchProjectError } from "./smart-match-projects.server";
import { linkLegacySearchProfile } from "./smart-match-profile-link.server";
import type { DashboardProject } from "@/app/types";

export async function ensureSmartMatchDashboardProject(input: {
  userId: string;
  writerProjectId: unknown;
  projectName: unknown;
  dashboardProjectId?: unknown;
}): Promise<DashboardProject> {
  const { userId, writerProjectId, dashboardProjectId } = input;
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
  const columns = "id,project_name,writer_project_id";
  const attach = async (project: DashboardProject) => {
    if (!project.writer_project_id) {
      await linkLegacySearchProfile(userId, project.id, writerProjectId);
      return { ...project, writer_project_id: writerProjectId };
    }
    if (project.writer_project_id !== writerProjectId)
      throw new SmartMatchProjectError(
        "This project's profile changed. Select it again before searching.",
        409,
      );
    return project;
  };
  if (dashboardProjectId !== undefined && dashboardProjectId !== null) {
    if (
      typeof dashboardProjectId !== "string" ||
      !isDashboardProjectId(dashboardProjectId)
    )
      throw new SmartMatchProjectError("Project not found.", 404);
    const { data, error } = await store
      .from("dashboard_projects")
      .select(columns)
      .eq("user_id", userId)
      .eq("id", dashboardProjectId)
      .maybeSingle();
    if (error)
      throw new SmartMatchProjectError(
        "Unable to check the saved project. Please try again.",
        503,
      );
    if (!data) throw new SmartMatchProjectError("Project not found.", 404);
    return attach(data);
  }
  const read = () =>
    store
      .from("dashboard_projects")
      .select(columns)
      .eq("user_id", userId)
      .eq("writer_project_id", writerProjectId)
      .limit(2);
  const existing = await read();
  if (existing.error)
    throw new SmartMatchProjectError(
      "Unable to check the saved project. Please try again.",
      503,
    );
  if ((existing.data?.length ?? 0) > 1)
    throw new SmartMatchProjectError(
      "This search belongs to more than one project. Choose the project you want to use.",
      409,
    );
  if (existing.data?.[0]) return existing.data[0];
  // An interrupted manual creation can save its writer profile before the
  // dashboard link finishes. Their shared UUID identifies that exact project.
  const pending = await store
    .from("dashboard_projects")
    .select(columns)
    .eq("user_id", userId)
    .eq("id", writerProjectId)
    .maybeSingle();
  if (pending.error)
    throw new SmartMatchProjectError(
      "Unable to check the saved project. Please try again.",
      503,
    );
  if (pending.data) return attach(pending.data);
  const name =
    typeof input.projectName === "string" ? input.projectName.trim() : "";
  if (!name)
    throw new SmartMatchProjectError("A project name is required.", 400);
  // The committed writer UUID is stable across retries and pagination. Reuse it
  // for new dashboard identity, and preserve existing titles on conflict.
  const inserted = await store.from("dashboard_projects").upsert(
    {
      id: writerProjectId,
      user_id: userId,
      scope_key: `writer:${writerProjectId}`,
      project_name: name,
      writer_project_id: writerProjectId,
    },
    { onConflict: "user_id,scope_key", ignoreDuplicates: true },
  );
  if (inserted.error)
    throw new SmartMatchProjectError(
      "Search saved, but its project could not be created. Run the search again to finish.",
      503,
    );
  const saved = await read();
  if (saved.error || saved.data?.length !== 1)
    throw new SmartMatchProjectError(
      "Unable to load the saved project. Run the search again to finish.",
      503,
    );
  return saved.data[0];
}
