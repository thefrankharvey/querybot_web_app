import "server-only";

import { createServerSupabase } from "@/app/api/supabase/server";
import { getWqhApiEndpoint } from "@/lib/config";
import { getWqhHistoryHeaders } from "@/lib/wqh-history-auth";
import { isLocalBackendTestingEndpoint } from "@/lib/wqh-local-backend-auth";
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

async function resolveLocalWriterProjectId(input: {
  email?: string;
  writerProjectId: unknown;
  projectName: unknown;
}, endpoint: string): Promise<string | null> {
  const headers = getWqhHistoryHeaders();
  if (!headers || !input.email?.trim()) {
    throw new SmartMatchProjectError("Local search history is not configured", 503);
  }
  const url = new URL(endpoint);
  url.searchParams.set("email", input.email.trim());
  let projects: SmartMatchProjectReference[];
  try {
    const response = await fetch(url, {
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error("History request failed");
    const data = await response.json();
    if (data?.status !== "success" || !Array.isArray(data.writer_projects)) {
      throw new Error("Invalid history response");
    }
    projects = data.writer_projects.map((project: {
      id?: unknown; project_name?: unknown;
    }) => {
      if (
        typeof project?.id !== "string" || !project.id.trim() ||
        (project.project_name !== null && typeof project.project_name !== "string")
      ) {
        throw new Error("Invalid history project");
      }
      return { writerProjectId: project.id, projectName: project.project_name ?? "" };
    });
  } catch {
    throw new SmartMatchProjectError(
      "Unable to check local search history. Please try again.", 502,
    );
  }

  const selectedId = typeof input.writerProjectId === "string"
    ? input.writerProjectId.trim() : "";
  if (selectedId) {
    if (projects.some((project) => project.writerProjectId === selectedId)) {
      return selectedId;
    }
    // Hosted dashboard IDs are absent from the local test database. Start a
    // local search copy; the caller retains the hosted dashboard/save scope.
    if (typeof input.projectName !== "string" || !input.projectName.trim()) {
      throw new SmartMatchProjectError("Provide a name for the local test search", 400);
    }
    return null;
  }
  if (typeof input.projectName !== "string" || !input.projectName.trim()) return null;
  try {
    return resolveSmartMatchProject(input.projectName, null, projects).writerProjectId;
  } catch (error) {
    throw new SmartMatchProjectError((error as Error).message, 409);
  }
}

export async function resolveSmartMatchWriterProjectId(input: {
  userId: string;
  email?: string;
  writerProjectId: unknown;
  projectName: unknown;
}) {
  const historyEndpoint = getWqhApiEndpoint("get-writer-projects");
  if (isLocalBackendTestingEndpoint(historyEndpoint)) {
    return resolveLocalWriterProjectId(input, historyEndpoint);
  }
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
