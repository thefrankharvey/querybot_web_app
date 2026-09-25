import "server-only";

import { getWqhHistoryHeaders } from "@/lib/wqh-history-auth";
import { getWqhApiUrl } from "@/lib/config";
import {
  getStoredWriterProjectId,
  getStoredWriterProjectName,
} from "./smart-match-restore";
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
  email: string,
): Promise<SmartMatchProjectReference[]> {
  const headers = getWqhHistoryHeaders();
  if (!headers)
    throw new SmartMatchProjectError(
      "Smart Match service is not configured",
      503,
    );
  try {
    const query = new URLSearchParams({ email: email.trim() });
    const response = await fetch(
      `${getWqhApiUrl().replace(/\/$/, "")}/get-writer-projects?${query}`,
      { headers, cache: "no-store", signal: AbortSignal.timeout(30000) },
    );
    const body = await response.json();
    if (
      !response.ok ||
      body?.status !== "success" ||
      !Array.isArray(body.writer_projects)
    ) {
      throw new Error("Invalid writer projects response");
    }
    return body.writer_projects.flatMap((project: unknown) => {
      if (!project || typeof project !== "object" || Array.isArray(project))
        return [];
      const row = project as Record<string, unknown>;
      const writerProjectId = getStoredWriterProjectId(row);
      const projectName = getStoredWriterProjectName(row);
      return writerProjectId && projectName && !row.deleted_at
        ? [{ writerProjectId, projectName }]
        : [];
    });
  } catch {
    throw new SmartMatchProjectError(
      "Unable to check existing projects. Please try again.",
      502,
    );
  }
}

export async function resolveSmartMatchWriterProjectId(input: {
  email: string;
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

  const projects = await fetchSmartMatchProjects(input.email);
  try {
    return resolveSmartMatchProject(input.projectName, null, projects)
      .writerProjectId;
  } catch (error) {
    throw new SmartMatchProjectError((error as Error).message, 409);
  }
}
