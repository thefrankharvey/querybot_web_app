import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { AGENT_MATCHES_TABLE } from "@/app/constants";
import { createServerSupabase } from "@/app/api/supabase/server";
import {
  getStoredWriterProjectId,
  getStoredWriterProjectTimestamp,
  normalizeWriterProjectForSmartMatch,
  selectMostRecentWriterProject,
  type StoredWriterProject,
} from "@/app/utils/smart-match-restore";
import { getWqhApiUrl } from "@/lib/config";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type WriterProjectsResponse =
  | {
      status: "success";
      writer_projects: unknown[];
    }
  | {
      status: "error";
      message?: string;
    };

const REQUEST_TIMEOUT_MS = 30000;

type SavedAgentProjectReferenceRow = {
  project_name: string | null;
  writer_project_id: string | null;
};

function getPrimaryEmailAddress(
  user: NonNullable<Awaited<ReturnType<typeof currentUser>>>,
) {
  const primaryEmail = user.primaryEmailAddress?.emailAddress?.trim();
  if (primaryEmail) return primaryEmail;

  return user.emailAddresses[0]?.emailAddress?.trim() || null;
}

function isStoredWriterProject(value: unknown): value is StoredWriterProject {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

async function readWriterProjectsResponse(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.toLocaleLowerCase().includes("application/json")) {
    await response.text().catch(() => "");
    return null;
  }

  try {
    return (await response.json()) as WriterProjectsResponse;
  } catch {
    return null;
  }
}

async function getSavedAgentProjectReference(
  userId: string,
  preferredWriterProjectId: string | null,
) {
  const supabase = createServerSupabase();

  if (preferredWriterProjectId) {
    const { data: exactData, error: exactError } = await supabase
      .from(AGENT_MATCHES_TABLE)
      .select("project_name, writer_project_id")
      .eq("user_id", userId)
      .eq("writer_project_id", preferredWriterProjectId)
      .not("project_name", "is", null)
      .order("created_at", { ascending: false })
      .limit(1);

    if (exactError) {
      console.error(
        "[smart-match-restore] Exact saved-agent project lookup failed",
        { code: exactError.code },
      );
    } else {
      const exactRow = (
        (exactData ?? []) as SavedAgentProjectReferenceRow[]
      ).find((row) => Boolean(row.project_name?.trim()));
      const exactProjectName = exactRow?.project_name?.trim();

      if (exactProjectName) {
        return {
          projectName: exactProjectName,
          writerProjectId:
            exactRow?.writer_project_id?.trim() || preferredWriterProjectId,
        };
      }
    }
  }

  return null;
}

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await currentUser();

  if (!user || user.id !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = getPrimaryEmailAddress(user);

  if (!email) {
    return NextResponse.json(
      { error: "A verified email address is required" },
      { status: 422 },
    );
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const apiBaseUrl = getWqhApiUrl().replace(/\/$/, "");
    const externalUrl = new URL(`${apiBaseUrl}/get-writer-projects`);
    externalUrl.searchParams.set("email", email);

    const externalResponse = await fetch(externalUrl, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
    });
    const responseBody = await readWriterProjectsResponse(externalResponse);

    if (
      !externalResponse.ok ||
      !responseBody ||
      responseBody.status !== "success" ||
      !Array.isArray(responseBody.writer_projects)
    ) {
      console.error("[smart-match-restore] Writer projects request failed", {
        status: externalResponse.status,
      });

      return NextResponse.json(
        { error: "Unable to load the previous Smart Match search" },
        { status: 502 },
      );
    }

    const projects = responseBody.writer_projects.filter(isStoredWriterProject);
    const previousSearch = selectMostRecentWriterProject(projects);

    if (!previousSearch) {
      return NextResponse.json(
        { error: "No previous Smart Match search found" },
        { status: 404 },
      );
    }

    const writerProjectId = getStoredWriterProjectId(previousSearch);
    const normalizedForm = normalizeWriterProjectForSmartMatch(previousSearch);
    const savedAgentProjectReference = !normalizedForm.project_name
      ? await getSavedAgentProjectReference(userId, writerProjectId)
      : null;
    const restoredProjectName =
      normalizedForm.project_name ||
      savedAgentProjectReference?.projectName ||
      "";
    const restoredWriterProjectId = writerProjectId;

    return NextResponse.json(
      {
        form: {
          ...normalizedForm,
          project_name: restoredProjectName,
        },
        searched_at: getStoredWriterProjectTimestamp(previousSearch),
        writer_project_id: restoredWriterProjectId,
      },
      {
        headers: {
          "Cache-Control": "private, no-store",
        },
      },
    );
  } catch (error) {
    console.error("[smart-match-restore] Failed to restore search", {
      message: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      { error: "Unable to load the previous Smart Match search" },
      { status: 502 },
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
