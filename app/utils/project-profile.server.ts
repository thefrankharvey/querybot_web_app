import "server-only";

import { getWqhApiUrl } from "@/lib/config";
import { getWqhHistoryHeaders } from "@/lib/wqh-history-auth";
import type { StoredWriterProject } from "./smart-match-restore";
import { toProjectProfile } from "./project-profile";

export class ProjectProfileError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export type ProfileDashboard = {
  id: string;
  project_name: string;
  writer_project_id: string | null;
};

export async function requestWriterProfile(
  project: ProfileDashboard,
  email: string,
  patch?: { expected_revision?: unknown; traits?: unknown },
) {
  const headers = getWqhHistoryHeaders();
  if (!headers)
    throw new ProjectProfileError(
      "Project profile service is not configured.",
      503,
    );
  // Legacy dashboards use their own stable UUID until the link is attached.
  const id = project.writer_project_id ?? project.id;
  const url = new URL(
    `${getWqhApiUrl().replace(/\/$/, "")}/writer-projects/${encodeURIComponent(id)}`,
  );
  if (!patch) url.searchParams.set("email", email);
  let response: Response;
  try {
    response = await fetch(url, {
      method: patch ? "PATCH" : "GET",
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
      headers: { ...headers, "Content-Type": "application/json" },
      ...(patch
        ? {
            body: JSON.stringify({
              email,
              expected_revision: patch.expected_revision,
              traits: patch.traits,
              create_if_missing: !project.writer_project_id,
              project_name: project.project_name,
            }),
          }
        : {}),
    });
  } catch {
    throw new ProjectProfileError(
      "Unable to reach project profiles. Please try again.",
      503,
    );
  }
  if (!patch && response.status === 404 && !project.writer_project_id) {
    return toProjectProfile(null, project.project_name);
  }
  const body = (await response.json().catch(() => null)) as {
    status?: string;
    message?: string;
    writer_project?: StoredWriterProject;
  } | null;
  if (
    !response.ok ||
    body?.status !== "success" ||
    !body.writer_project ||
    body.writer_project.id !== id ||
    typeof body.writer_project.revision !== "string"
  ) {
    throw new ProjectProfileError(
      response.status === 409
        ? body?.message || "This project changed. Reload before saving again."
        : response.status === 400
          ? body?.message || "Check the project traits and try again."
          : response.status === 404
            ? "Project traits are unavailable. Please contact support."
            : "Unable to load or save project traits. Please try again.",
      response.ok ? 502 : response.status,
    );
  }
  return toProjectProfile(body.writer_project, project.project_name);
}
