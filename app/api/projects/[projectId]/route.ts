import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";

import { AGENT_MATCHES_TABLE } from "@/app/constants";
import { createServerSupabase } from "@/app/api/supabase/server";
import { getWqhApiUrl } from "@/lib/config";
import {
  hasWriterProjectMetadata,
  mapWriterProjectToProfile,
  type WriterProject,
} from "@/app/utils/project-profile-data";
import { normalizeRouteProjectId } from "@/app/utils/project-profile";

type SavedAgentProjectRow = {
  id: string;
  project_name: string | null;
  writer_project_id: string | null;
};

type SaveProjectProfilePayload = {
  writerProjectId?: unknown;
  savedAgentWriterProjectId?: unknown;
  previousProjectName?: unknown;
  matchCount?: unknown;
  projectName?: unknown;
  description?: unknown;
  genre?: unknown;
  subgenres?: unknown;
  format?: unknown;
  targetAudience?: unknown;
  comps?: unknown;
  themes?: unknown;
  enableAi?: unknown;
  nonFiction?: unknown;
};

type WriterProjectSuccessResponse = {
  status: "success";
  writer_project_id: string;
  project_id?: string | null;
  writer_project: WriterProject;
};

type WriterProjectErrorResponse = {
  status: "error";
  message: string;
};

type WriterProjectResponse =
  | WriterProjectSuccessResponse
  | WriterProjectErrorResponse;

function getString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getOptionalString(value: unknown) {
  const stringValue = getString(value);
  return stringValue || null;
}

function getStringList(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

function getBoolean(value: unknown) {
  return typeof value === "boolean" ? value : false;
}

function getNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function getProjectNameKey(projectName?: string | null) {
  return projectName?.trim().toLocaleLowerCase() ?? "";
}

async function getCurrentUserEmail() {
  const user = await currentUser();
  const primaryEmail = user?.primaryEmailAddress?.emailAddress?.trim();

  if (primaryEmail) {
    return primaryEmail;
  }

  return user?.emailAddresses?.[0]?.emailAddress?.trim() || null;
}

async function readJsonResponse<TResponse>(
  response: Response,
): Promise<TResponse | null> {
  try {
    return (await response.json()) as TResponse;
  } catch {
    return null;
  }
}

function getApiErrorMessage(
  body: WriterProjectResponse | null,
  fallback: string,
) {
  return body?.status === "error" ? body.message : fallback;
}

async function saveWriterProject({
  email,
  payload,
  writerProjectId,
}: {
  email: string;
  payload: SaveProjectProfilePayload;
  writerProjectId: string | null;
}) {
  const projectName = getString(payload.projectName);

  if (!projectName) {
    return {
      error: NextResponse.json(
        { error: "Project name is required" },
        { status: 400 },
      ),
    };
  }

  const body = {
    email,
    project_name: projectName,
    project_description: getString(payload.description),
    genre: getOptionalString(payload.genre),
    subgenres: getStringList(payload.subgenres),
    format: getOptionalString(payload.format),
    target_audience: getOptionalString(payload.targetAudience),
    comps: getStringList(payload.comps),
    themes: getStringList(payload.themes),
    enable_ai: getBoolean(payload.enableAi),
    non_fiction: getBoolean(payload.nonFiction),
  };
  const baseUrl = getWqhApiUrl().replace(/\/$/, "");
  const url = writerProjectId
    ? `${baseUrl}/writer-projects/${encodeURIComponent(writerProjectId)}`
    : `${baseUrl}/writer-projects`;
  const response = await fetch(url, {
    method: writerProjectId ? "PUT" : "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const responseBody = await readJsonResponse<WriterProjectResponse>(response);

  if (!response.ok || responseBody?.status !== "success") {
    return {
      error: NextResponse.json(
        {
          error: getApiErrorMessage(
            responseBody,
            "Failed to save project profile",
          ),
        },
        { status: response.status || 502 },
      ),
    };
  }

  return { data: responseBody };
}

async function updateSavedAgentProjectRows({
  newProjectName,
  newWriterProjectId,
  payload,
  routeProjectId,
  savedProjectLegacyId,
  savedProject,
  userId,
}: {
  newProjectName: string;
  newWriterProjectId: string;
  payload: SaveProjectProfilePayload;
  routeProjectId: string;
  savedProjectLegacyId?: string | null;
  savedProject: WriterProject;
  userId: string;
}) {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from(AGENT_MATCHES_TABLE)
    .select("id,project_name,writer_project_id")
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }

  const normalizedRouteProjectId = normalizeRouteProjectId(routeProjectId);
  const writerProjectIds = new Set(
    [
      newWriterProjectId,
      getString(savedProject.id),
      getString(payload.writerProjectId),
      getString(payload.savedAgentWriterProjectId),
      getString(savedProjectLegacyId),
      getString(savedProject.project_id),
      normalizedRouteProjectId,
    ].filter(Boolean),
  );
  const projectNameKeys = new Set(
    [
      newProjectName,
      getString(savedProject.project_name),
      getString(payload.previousProjectName),
      getString(payload.projectName),
      normalizedRouteProjectId,
    ]
      .map(getProjectNameKey)
      .filter(Boolean),
  );
  const matchingRows = ((data ?? []) as SavedAgentProjectRow[]).filter((row) => {
    const writerProjectId = getString(row.writer_project_id);
    if (writerProjectId && writerProjectIds.has(writerProjectId)) {
      return true;
    }

    return projectNameKeys.has(getProjectNameKey(row.project_name));
  });
  const rowIds = matchingRows.map((row) => row.id);

  if (rowIds.length === 0) {
    return 0;
  }

  const { data: updatedRows, error: updateError } = await supabase
    .from(AGENT_MATCHES_TABLE)
    .update({
      project_name: newProjectName,
      writer_project_id: newWriterProjectId,
    })
    .eq("user_id", userId)
    .in("id", rowIds)
    .select("id");

  if (updateError) {
    throw new Error(updateError.message);
  }

  return updatedRows?.length ?? 0;
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
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

  let payload: SaveProjectProfilePayload;

  try {
    payload = (await req.json()) as SaveProjectProfilePayload;
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON" },
      { status: 400 },
    );
  }

  const writerProjectId = getOptionalString(payload.writerProjectId);
  const savedProjectResult = await saveWriterProject({
    email,
    payload,
    writerProjectId,
  });

  if (savedProjectResult.error) {
    return savedProjectResult.error;
  }

  const { projectId } = await params;
  const savedProject = savedProjectResult.data;
  const nextWriterProjectId = savedProject.writer_project_id;
  const nextProjectName =
    getString(savedProject.writer_project.project_name) ||
    getString(payload.projectName);
  let updatedSavedAgentRows: number;

  try {
    updatedSavedAgentRows = await updateSavedAgentProjectRows({
      newProjectName: nextProjectName,
      newWriterProjectId: nextWriterProjectId,
      payload,
      routeProjectId: projectId,
      savedProjectLegacyId: savedProject.project_id ?? null,
      savedProject: savedProject.writer_project,
      userId,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? `Failed to sync project name to saved-agent dashboard rows: ${error.message}`
            : "Failed to sync project name to saved-agent dashboard rows",
      },
      { status: 500 },
    );
  }

  const fallbackMatchCount = getNumber(payload.matchCount);
  const profile = mapWriterProjectToProfile({
    agentsMatchCount:
      updatedSavedAgentRows ||
      fallbackMatchCount ||
      getNumber(savedProject.writer_project.match_count),
    fallbackProjectName: nextProjectName,
    savedAgentWriterProjectId: nextWriterProjectId,
    project: savedProject.writer_project,
  });

  return NextResponse.json({
    source: "writer-project-api",
    hasProfileMetadata: hasWriterProjectMetadata(profile),
    updatedSavedAgentRows,
    profile,
  });
}
