import "server-only";

import { createServerSupabase } from "@/app/api/supabase/server";
import {
  resolveSmartMatchProject,
  type SmartMatchProjectReference,
} from "./smart-match-projects";

export class SmartMatchProjectError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export async function fetchSmartMatchProjects(
  userId: string,
): Promise<SmartMatchProjectReference[]> {
  const { data, error } = await createServerSupabase()
    .from("dashboard_projects")
    .select("id,project_name,writer_project_id")
    .eq("user_id", userId);
  if (error)
    throw new SmartMatchProjectError(
      "Unable to check existing projects. Please try again.",
      502,
    );
  return (data ?? []).map((project) => ({
    dashboardProjectId: project.id,
    projectName: project.project_name,
    writerProjectId: project.writer_project_id,
  }));
}

export async function resolveSmartMatchWriterProjectId(input: {
  userId: string;
  writerProjectId: unknown;
  projectName: unknown;
}) {
  if (
    typeof input.writerProjectId === "string" &&
    input.writerProjectId.trim()
  ) {
    // The matching service validates ownership of explicit IDs in append mode.
    return input.writerProjectId.trim();
  }
  if (typeof input.projectName !== "string" || !input.projectName.trim())
    return null;

  const projects = await fetchSmartMatchProjects(input.userId);
  try {
    return resolveSmartMatchProject(input.projectName, null, projects)
      .writerProjectId;
  } catch (error) {
    throw new SmartMatchProjectError((error as Error).message, 409);
  }
}
