import { DEFAULT_PROJECT_NAME } from "@/app/constants";

export type ProjectProfile = {
  id: string;
  userId: string;
  projectId: string;
  writerProjectId: string | null;
  savedAgentWriterProjectId?: string | null;
  legacyProjectId?: string | null;
  projectName: string;
  description: string;
  genre: string;
  subgenres: string[];
  format: string;
  targetAudience: string;
  comps: string[];
  themes: string[];
  enableAi: boolean;
  nonFiction: boolean;
  matchCount: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  contentHash: string;
};

export function normalizeRouteProjectId(projectId: string) {
  try {
    return decodeURIComponent(projectId).trim();
  } catch {
    return projectId.trim();
  }
}

export function getProjectRouteId(projectName: string) {
  const normalizedProjectName = projectName.trim();
  return normalizedProjectName || DEFAULT_PROJECT_NAME;
}

export function getProjectProfileHref(projectName: string) {
  return `/projects/${encodeURIComponent(getProjectRouteId(projectName))}`;
}

export function getProjectDashboardHrefFromName(projectName: string) {
  return `${getProjectProfileHref(projectName)}/dashboard`;
}

export function getProjectProfileHrefById(projectId: string) {
  return `/projects/${encodeURIComponent(projectId)}`;
}

export function getProjectDashboardHrefById(projectId: string) {
  return `${getProjectProfileHrefById(projectId)}/dashboard`;
}
