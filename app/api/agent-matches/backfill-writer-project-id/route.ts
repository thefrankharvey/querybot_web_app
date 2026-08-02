import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";

import { AGENT_MATCHES_TABLE } from "@/app/constants";
import { createServerSupabase } from "../../supabase/server";
import { getWqhApiUrl } from "@/lib/config";
import { getProjectScope } from "@/app/utils/project-scope";

type WriterProject = {
  id?: unknown;
  project_name?: unknown;
};

type GetWriterProjectsResponse =
  | {
      status: "success";
      writer_projects: WriterProject[];
    }
  | {
      status: "error";
      message: string;
    };

type LegacyAgentMatch = {
  id: string;
  project_name: string | null;
};

function getString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getProjectNameKey(projectName?: string | null) {
  return getProjectScope({ projectName }).key;
}

function buildWqhUrl(path: "/get-writer-projects", params: Record<string, string>) {
  const baseUrl = getWqhApiUrl().replace(/\/$/, "");
  const query = new URLSearchParams(params);

  return `${baseUrl}${path}?${query.toString()}`;
}

async function parseApiJson<TResponse>(
  response: Response,
): Promise<TResponse | null> {
  try {
    return (await response.json()) as TResponse;
  } catch {
    return null;
  }
}

async function getCurrentUserEmail() {
  const user = await currentUser();
  const primaryEmail = user?.primaryEmailAddress?.emailAddress?.trim();

  if (primaryEmail) {
    return primaryEmail;
  }

  return user?.emailAddresses?.[0]?.emailAddress?.trim() || null;
}

async function fetchWriterProjects(email: string) {
  const response = await fetch(
    buildWqhUrl("/get-writer-projects", { email: email.trim() }),
    { cache: "no-store" },
  );
  const body = await parseApiJson<GetWriterProjectsResponse>(response);

  if (!response.ok || body?.status !== "success") {
    const errorMessage =
      body?.status === "error" ? body.message : "Failed to fetch writer projects";
    throw new Error(errorMessage);
  }

  return body.writer_projects;
}

function getUnambiguousProjectIdsByName(projects: WriterProject[]) {
  const idsByName = new Map<string, Set<string>>();

  for (const project of projects) {
    const id = getString(project.id);
    if (!id) continue;

    const projectKey = getProjectNameKey(getString(project.project_name));
    const ids = idsByName.get(projectKey) ?? new Set<string>();
    ids.add(id);
    idsByName.set(projectKey, ids);
  }

  const unambiguousIdsByName = new Map<string, string>();

  for (const [projectKey, ids] of idsByName.entries()) {
    if (ids.size === 1) {
      unambiguousIdsByName.set(projectKey, Array.from(ids)[0]);
    }
  }

  return unambiguousIdsByName;
}

export async function POST() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = await getCurrentUserEmail();

  if (!email) {
    return NextResponse.json(
      { error: "Unable to resolve current user email" },
      { status: 400 },
    );
  }

  const supabase = createServerSupabase();

  try {
    const [writerProjects, legacyRowsResult] = await Promise.all([
      fetchWriterProjects(email),
      supabase
        .from(AGENT_MATCHES_TABLE)
        .select("id,project_name")
        .eq("user_id", userId)
        .is("writer_project_id", null),
    ]);

    if (legacyRowsResult.error) {
      return NextResponse.json(
        { error: legacyRowsResult.error.message },
        { status: 400 },
      );
    }

    const legacyRows = (legacyRowsResult.data ?? []) as LegacyAgentMatch[];
    const writerProjectIdsByName =
      getUnambiguousProjectIdsByName(writerProjects);
    const legacyRowIdsByWriterProjectId = new Map<string, string[]>();

    for (const row of legacyRows) {
      const projectKey = getProjectNameKey(row.project_name);
      const writerProjectId = writerProjectIdsByName.get(projectKey);

      if (!writerProjectId) continue;

      const rowIds = legacyRowIdsByWriterProjectId.get(writerProjectId) ?? [];
      rowIds.push(row.id);
      legacyRowIdsByWriterProjectId.set(writerProjectId, rowIds);
    }

    let updated = 0;

    for (const [writerProjectId, rowIds] of legacyRowIdsByWriterProjectId) {
      const { data, error } = await supabase
        .from(AGENT_MATCHES_TABLE)
        .update({ writer_project_id: writerProjectId })
        .eq("user_id", userId)
        .is("writer_project_id", null)
        .in("id", rowIds)
        .select("id");

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      updated += data?.length ?? 0;
    }

    return NextResponse.json({
      updated,
      scanned: legacyRows.length,
      skipped: Math.max(0, legacyRows.length - updated),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to backfill writer project ids",
      },
      { status: 502 },
    );
  }
}
