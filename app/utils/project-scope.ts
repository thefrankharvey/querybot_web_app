import { DEFAULT_PROJECT_NAME } from "@/app/constants";

export type ProjectScopeInput = {
  writerProjectId?: string | null;
  projectName?: string | null;
};

export type ProjectScope = {
  key: string;
  writerProjectId: string | null;
  projectName: string;
};

function getTrimmedValue(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed || null;
}

/**
 * Mirrors the project-scope expression in
 * `20260709000000_project_scoped_agent_matches_unique.sql`.
 *
 * Writer-project IDs are opaque and case-sensitive. Legacy project names are
 * trimmed at the edges, defaulted when blank, and lowercased only for the key.
 */
export function getProjectScope(input: ProjectScopeInput = {}): ProjectScope {
  const writerProjectId = getTrimmedValue(input.writerProjectId);
  const projectName = getTrimmedValue(input.projectName) ?? DEFAULT_PROJECT_NAME;

  return {
    key: writerProjectId
      ? `writer:${writerProjectId}`
      : `name:${projectName.toLowerCase()}`,
    writerProjectId,
    projectName,
  };
}

export function isSameProjectScope(
  left: ProjectScopeInput,
  right: ProjectScopeInput,
) {
  return getProjectScope(left).key === getProjectScope(right).key;
}

/**
 * Transitional compatibility for rows created before writer_project_id was
 * backfilled. Keep this distinct from exact scope equality so new persistence
 * and safety decisions never mistake a legacy name match for canonical ID
 * identity.
 */
export function savedRecordMatchesProjectScope(
  record: ProjectScopeInput,
  target: ProjectScopeInput,
) {
  const recordScope = getProjectScope(record);
  const targetScope = getProjectScope(target);

  if (recordScope.key === targetScope.key) {
    return true;
  }

  return Boolean(
    targetScope.writerProjectId &&
      !recordScope.writerProjectId &&
      recordScope.projectName.toLowerCase() ===
        targetScope.projectName.toLowerCase(),
  );
}
