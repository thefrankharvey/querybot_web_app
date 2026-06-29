import "server-only";

import { auth, currentUser } from "@clerk/nextjs/server";

import { AGENT_MATCHES_TABLE, DEFAULT_PROJECT_NAME } from "@/app/constants";
import { createServerSupabase } from "@/app/api/supabase/server";
import { getWqhApiUrl } from "@/lib/config";

import {
  normalizeRouteProjectId,
  type ProjectProfile,
} from "@/app/utils/project-profile";

export type WriterProject = {
  id: string;
  user_id: string;
  genre?: string | null;
  subgenres?: string[] | string | null;
  format?: string | null;
  target_audience?: string | null;
  comps?: string[] | string | null;
  themes?: string[] | string | null;
  enable_ai?: boolean | string | null;
  non_fiction?: boolean | string | null;
  project_id?: string | null;
  project_name?: string | null;
  project_description?: string | null;
  description?: string | null;
  match_count?: number | string | null;
  content_hash?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
  [column: string]: unknown;
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

type GetWriterProjectAgentsResponse =
  | {
      status: "success";
      writer_project_id: string;
      match_count: number;
      agents: unknown[];
    }
  | {
      status: "error";
      message: string;
    };

type ProjectRouteMatch = {
  matchedBy: "id" | "legacyProjectId" | "projectName";
  project: WriterProject;
};

type SavedAgentProjectRow = {
  id: string;
  user_id: string;
  project_name: string | null;
  writer_project_id: string | null;
  created_at: string | null;
  updated_date: string | null;
};

export type ProjectProfileRouteData = {
  source: "writer-project-api" | "saved-agents-fallback";
  hasProfileMetadata: boolean;
  isCanonicalRoute: boolean;
  matchedBy:
    | ProjectRouteMatch["matchedBy"]
    | "savedAgentWriterProjectId"
    | "savedAgentProjectName";
  profile: ProjectProfile;
};

class WriterProjectApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "WriterProjectApiError";
    this.status = status;
  }
}

function getString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getLookupKey(value: unknown) {
  return getString(value).toLocaleLowerCase();
}

function getProjectNameKey(projectName?: string | null) {
  const trimmed = projectName?.trim();
  return (trimmed || DEFAULT_PROJECT_NAME).toLocaleLowerCase();
}

function getOptionalString(value: unknown) {
  const stringValue = getString(value);
  return stringValue || null;
}

function normalizeStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);
  }

  if (typeof value !== "string") {
    return [];
  }

  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(trimmedValue) as unknown;
    if (Array.isArray(parsed)) {
      return normalizeStringList(parsed);
    }
  } catch {
    // Fall back to comma-separated API values.
  }

  return trimmedValue
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeBoolean(value: unknown) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return value.trim().toLocaleLowerCase() === "true";
  }

  return false;
}

function normalizeNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function buildWqhUrl(
  path: "/get-writer-projects" | "/get-writer-project-agents",
  params: Record<string, string>,
) {
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

function getApiErrorMessage(
  body: GetWriterProjectsResponse | GetWriterProjectAgentsResponse | null,
  fallback: string,
) {
  return body?.status === "error" ? body.message : fallback;
}

async function fetchWriterProjects(email: string) {
  const response = await fetch(
    buildWqhUrl("/get-writer-projects", { email: email.trim() }),
    { cache: "no-store" },
  );
  const body = await parseApiJson<GetWriterProjectsResponse>(response);

  if (!response.ok || body?.status !== "success") {
    throw new WriterProjectApiError(
      getApiErrorMessage(body, "Failed to fetch writer projects"),
      response.status,
    );
  }

  return body.writer_projects;
}

async function fetchSavedAgentProjectRows(userId: string) {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from(AGENT_MATCHES_TABLE)
    .select("id,user_id,project_name,writer_project_id,created_at,updated_date")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as SavedAgentProjectRow[];
}

async function fetchWriterProjectAgents(email: string, writerProjectId: string) {
  const response = await fetch(
    buildWqhUrl("/get-writer-project-agents", {
      email: email.trim(),
      writer_project_id: writerProjectId.trim(),
    }),
    { cache: "no-store" },
  );
  const body = await parseApiJson<GetWriterProjectAgentsResponse>(response);

  if (!response.ok || body?.status !== "success") {
    throw new WriterProjectApiError(
      getApiErrorMessage(body, "Failed to fetch writer project agents"),
      response.status,
    );
  }

  return body;
}

async function getCurrentUserEmail() {
  const user = await currentUser();
  const primaryEmail = user?.primaryEmailAddress?.emailAddress?.trim();

  if (primaryEmail) {
    return primaryEmail;
  }

  return user?.emailAddresses?.[0]?.emailAddress?.trim() || null;
}

function resolveWriterProject(
  projects: WriterProject[],
  routeProjectId: string,
): ProjectRouteMatch | null {
  const normalizedRouteProjectId = normalizeRouteProjectId(routeProjectId);
  const routeProjectKey = getLookupKey(normalizedRouteProjectId);

  if (!normalizedRouteProjectId) {
    return null;
  }

  const canonicalMatch = projects.find(
    (project) => project.id.trim() === normalizedRouteProjectId,
  );
  if (canonicalMatch) {
    return { matchedBy: "id", project: canonicalMatch };
  }

  const legacyIdMatch = projects.find(
    (project) => getString(project.project_id) === normalizedRouteProjectId,
  );
  if (legacyIdMatch) {
    return { matchedBy: "legacyProjectId", project: legacyIdMatch };
  }

  const nameMatch = projects.find(
    (project) => getLookupKey(project.project_name) === routeProjectKey,
  );
  if (nameMatch) {
    return { matchedBy: "projectName", project: nameMatch };
  }

  return null;
}

function getSavedAgentRowsForRoute({
  project,
  routeProjectId,
  rows,
}: {
  project?: WriterProject | null;
  routeProjectId: string;
  rows: SavedAgentProjectRow[];
}) {
  const normalizedRouteProjectId = normalizeRouteProjectId(routeProjectId);
  const routeProjectKey = getProjectNameKey(normalizedRouteProjectId);
  const writerProjectIds = new Set(
    [project?.id, normalizedRouteProjectId].map(getString).filter(Boolean),
  );
  const projectNameKeys = new Set(
    [project?.project_name, normalizedRouteProjectId]
      .map(getString)
      .filter(Boolean)
      .map(getProjectNameKey)
      .filter(Boolean),
  );

  return rows.filter((row) => {
    const writerProjectId = getString(row.writer_project_id);
    if (writerProjectId && writerProjectIds.has(writerProjectId)) {
      return true;
    }

    const rowProjectKey = getProjectNameKey(row.project_name);
    return rowProjectKey === routeProjectKey || projectNameKeys.has(rowProjectKey);
  });
}

function getSavedAgentWriterProjectId(rows: SavedAgentProjectRow[]) {
  const ids = new Set<string>();

  for (const row of rows) {
    const writerProjectId = getString(row.writer_project_id);
    if (writerProjectId) {
      ids.add(writerProjectId);
    }
  }

  return ids.size === 1 ? Array.from(ids)[0] : null;
}

function getFallbackProjectName(
  rows: SavedAgentProjectRow[],
  routeProjectId: string,
) {
  const nameCounts = new Map<string, { count: number; name: string }>();

  for (const row of rows) {
    const projectName = getString(row.project_name) || DEFAULT_PROJECT_NAME;
    const projectKey = getProjectNameKey(projectName);
    const current = nameCounts.get(projectKey) ?? { count: 0, name: projectName };
    current.count += 1;
    nameCounts.set(projectKey, current);
  }

  const mostCommonName = Array.from(nameCounts.values()).sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name),
  )[0]?.name;

  return mostCommonName || normalizeRouteProjectId(routeProjectId) || DEFAULT_PROJECT_NAME;
}

function getLatestActivity(rows: SavedAgentProjectRow[]) {
  let latestValue = "";
  let latestTimestamp = Number.NEGATIVE_INFINITY;

  for (const row of rows) {
    for (const value of [row.updated_date, row.created_at]) {
      const timestamp = value ? Date.parse(value) : Number.NaN;
      if (!Number.isNaN(timestamp) && timestamp > latestTimestamp) {
        latestTimestamp = timestamp;
        latestValue = value ?? "";
      }
    }
  }

  return latestValue;
}

export function hasWriterProjectMetadata(profile: ProjectProfile) {
  return Boolean(
    profile.description ||
      profile.genre ||
      profile.subgenres.length > 0 ||
      profile.format ||
      profile.targetAudience ||
      profile.comps.length > 0 ||
      profile.themes.length > 0,
  );
}

export function mapWriterProjectToProfile({
  agentsMatchCount,
  fallbackProjectName = null,
  savedAgentWriterProjectId = null,
  project,
}: {
  agentsMatchCount: number;
  fallbackProjectName?: string | null;
  savedAgentWriterProjectId?: string | null;
  project: WriterProject;
}): ProjectProfile {
  return {
    id: project.id,
    userId: project.user_id,
    projectId: project.id,
    writerProjectId: project.id,
    savedAgentWriterProjectId,
    legacyProjectId: getOptionalString(project.project_id),
    projectName:
      getString(project.project_name) ||
      getString(fallbackProjectName) ||
      DEFAULT_PROJECT_NAME,
    description:
      getString(project.project_description) || getString(project.description),
    genre: getString(project.genre),
    subgenres: normalizeStringList(project.subgenres),
    format: getString(project.format),
    targetAudience: getString(project.target_audience),
    comps: normalizeStringList(project.comps),
    themes: normalizeStringList(project.themes),
    enableAi: normalizeBoolean(project.enable_ai),
    nonFiction: normalizeBoolean(project.non_fiction),
    matchCount: agentsMatchCount,
    createdAt: getString(project.created_at),
    updatedAt: getString(project.updated_at),
    deletedAt: getOptionalString(project.deleted_at),
    contentHash: getString(project.content_hash),
  };
}

function mapSavedAgentsToFallbackProfile({
  routeProjectId,
  rows,
  userId,
}: {
  routeProjectId: string;
  rows: SavedAgentProjectRow[];
  userId: string;
}): ProjectProfile {
  const savedAgentWriterProjectId = getSavedAgentWriterProjectId(rows);
  const projectName = getFallbackProjectName(rows, routeProjectId);
  const routeId = normalizeRouteProjectId(routeProjectId);
  const projectId = savedAgentWriterProjectId ?? projectName;
  const latestActivity = getLatestActivity(rows);

  return {
    id: projectId || routeId || projectName,
    userId,
    projectId: projectId || routeId || projectName,
    writerProjectId: null,
    savedAgentWriterProjectId,
    legacyProjectId: null,
    projectName,
    description: "",
    genre: "",
    subgenres: [],
    format: "",
    targetAudience: "",
    comps: [],
    themes: [],
    enableAi: false,
    nonFiction: false,
    matchCount: rows.length,
    createdAt: getString(rows[rows.length - 1]?.created_at),
    updatedAt: latestActivity,
    deletedAt: null,
    contentHash: "",
  };
}

export async function getProjectProfileRouteData(
  routeProjectId: string,
): Promise<ProjectProfileRouteData | null> {
  const { userId } = await auth();
  const email = await getCurrentUserEmail();

  if (!userId || !email) {
    return null;
  }

  const savedAgentRows = await fetchSavedAgentProjectRows(userId);
  let projects: WriterProject[] = [];

  try {
    projects = await fetchWriterProjects(email);
  } catch {
    projects = [];
  }

  const match = resolveWriterProject(projects, routeProjectId);
  const savedRowsForRoute = getSavedAgentRowsForRoute({
    project: match?.project,
    routeProjectId,
    rows: savedAgentRows,
  });

  if (match) {
    let projectAgentsMatchCount = normalizeNumber(match.project.match_count);

    try {
      const projectAgents = await fetchWriterProjectAgents(email, match.project.id);
      projectAgentsMatchCount = normalizeNumber(projectAgents.match_count);
    } catch (error) {
      if (!(error instanceof WriterProjectApiError && error.status === 404)) {
        throw error;
      }

      projectAgentsMatchCount = savedRowsForRoute.length || projectAgentsMatchCount;
    }

    const profile = mapWriterProjectToProfile({
      agentsMatchCount: savedRowsForRoute.length || projectAgentsMatchCount,
      fallbackProjectName:
        savedRowsForRoute.length > 0
          ? getFallbackProjectName(savedRowsForRoute, routeProjectId)
          : null,
      savedAgentWriterProjectId: getSavedAgentWriterProjectId(savedRowsForRoute),
      project: match.project,
    });

    return {
      source: "writer-project-api",
      hasProfileMetadata: hasWriterProjectMetadata(profile),
      isCanonicalRoute:
        normalizeRouteProjectId(routeProjectId) === profile.projectId,
      matchedBy: match.matchedBy,
      profile,
    };
  }

  if (savedRowsForRoute.length === 0) {
    return null;
  }

  const profile = mapSavedAgentsToFallbackProfile({
    routeProjectId,
    rows: savedRowsForRoute,
    userId,
  });

  return {
    source: "saved-agents-fallback",
    hasProfileMetadata: false,
    isCanonicalRoute: true,
    matchedBy: profile.savedAgentWriterProjectId
      ? "savedAgentWriterProjectId"
      : "savedAgentProjectName",
    profile,
  };
}
