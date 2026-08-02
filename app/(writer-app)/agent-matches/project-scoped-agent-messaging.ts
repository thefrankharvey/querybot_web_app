import type { AgentMatch as WriterAgentMatch } from "@/app/(writer-app)/context/agent-matches-context";
import type {
  AgentMatch as SavedAgentMatch,
  SaveAgentPayload,
  SaveAgentResponse,
} from "@/app/types";
import { getGenresThemesSummary } from "@/app/utils/agent-match-genres";
import { getProjectMessagesHref } from "@/app/utils/message-routes";
import { normalizeProjectName } from "@/app/utils/project-dashboard-summary";
import { savedRecordMatchesProjectScope } from "@/app/utils/project-scope";

type ProjectScope = {
  projectName?: string | null;
  writerProjectId?: string | null;
};

type SavedAgentProjectFields = Pick<
  SavedAgentMatch,
  | "id"
  | "index_id"
  | "project_name"
  | "query_on_hold"
  | "query_round"
  | "writer_project_id"
>;

export type SaveAgentForProject = (
  payload: SaveAgentPayload,
) => Promise<SaveAgentResponse | null>;

export type EnsureAgentSavedForProjectResult =
  | {
      ok: true;
      status: "already-saved";
      payload: SaveAgentPayload;
      savedAgent: SavedAgentProjectFields;
      response: null;
    }
  | {
      ok: true;
      status: "saved";
      payload: SaveAgentPayload;
      savedAgent: null;
      response: SaveAgentResponse;
    }
  | {
      ok: false;
      status: "failed";
      payload: SaveAgentPayload;
      savedAgent: null;
      response: null;
      error?: unknown;
    };

function getTrimmedValue(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed || null;
}

export function getWriterAgentLegacyId(agent: WriterAgentMatch) {
  return getTrimmedValue(agent.agent_id);
}

export function mapWriterAgentMatchToSaveAgentPayload(
  agent: WriterAgentMatch,
  scope: ProjectScope = {},
): SaveAgentPayload {
  return {
    name: agent.name,
    agencyId: getTrimmedValue(agent.agency_identity?.agency_id),
    email: getTrimmedValue(agent.email),
    agency: getTrimmedValue(agent.agency),
    agency_url: getTrimmedValue(agent.website),
    index_id: getWriterAgentLegacyId(agent),
    query_tracker: getTrimmedValue(agent.querytracker),
    pub_marketplace: getTrimmedValue(agent.pubmarketplace),
    match_score: Number.isFinite(agent.normalized_score)
      ? agent.normalized_score
      : null,
    genres_themes: getTrimmedValue(getGenresThemesSummary(agent)),
    project_name: getTrimmedValue(scope.projectName),
    writer_project_id: getTrimmedValue(scope.writerProjectId),
  };
}

export function savedAgentMatchesProject(
  savedAgent: SavedAgentProjectFields,
  scope: ProjectScope,
) {
  return savedRecordMatchesProjectScope(
    {
      projectName: savedAgent.project_name,
      writerProjectId: savedAgent.writer_project_id,
    },
    scope,
  );
}

export function getSavedAgentForProject(
  savedAgents: readonly SavedAgentProjectFields[] | null | undefined,
  {
    legacyAgentId,
    projectName,
    writerProjectId,
  }: ProjectScope & { legacyAgentId?: string | null },
) {
  const normalizedLegacyAgentId = getTrimmedValue(legacyAgentId);

  if (!normalizedLegacyAgentId) {
    return null;
  }

  return (
    savedAgents?.find(
      (savedAgent) =>
        getTrimmedValue(savedAgent.index_id) === normalizedLegacyAgentId &&
        savedAgentMatchesProject(savedAgent, { projectName, writerProjectId }),
    ) ?? null
  );
}

export function isAgentSavedForProject(
  savedAgents: readonly SavedAgentProjectFields[] | null | undefined,
  target: ProjectScope & { legacyAgentId?: string | null },
) {
  return Boolean(getSavedAgentForProject(savedAgents, target));
}

export function getProjectAgentComposeMessageHref({
  legacyAgentId,
  projectName,
  writerProjectId,
}: ProjectScope & { legacyAgentId: string }) {
  const params = new URLSearchParams({
    compose: "1",
    agentId: legacyAgentId.trim(),
  });

  return `${getProjectMessagesHref(
    normalizeProjectName(projectName),
    getTrimmedValue(writerProjectId),
  )}?${params.toString()}`;
}

export function getSavedAgentLegacyMessageId(indexId?: string | null) {
  const legacyAgentId = getTrimmedValue(indexId);

  if (!legacyAgentId || legacyAgentId.startsWith("manual:")) {
    return null;
  }

  return legacyAgentId;
}

export function getSavedAgentComposeMessageHref({
  indexId,
  projectName,
  writerProjectId,
}: ProjectScope & { indexId?: string | null }) {
  const legacyAgentId = getSavedAgentLegacyMessageId(indexId);

  return legacyAgentId
    ? getProjectAgentComposeMessageHref({
        legacyAgentId,
        projectName,
        writerProjectId,
      })
    : null;
}

export function getWriterAgentComposeMessageHref(
  agent: WriterAgentMatch,
  scope: ProjectScope,
) {
  return getProjectAgentComposeMessageHref({
    ...scope,
    legacyAgentId: getWriterAgentLegacyId(agent) ?? "",
  });
}

export async function ensureAgentSavedForProject({
  agent,
  savedAgents,
  saveAgent,
  projectName,
  writerProjectId,
  payload,
}: ProjectScope & {
  agent: WriterAgentMatch;
  savedAgents?: readonly SavedAgentProjectFields[] | null;
  saveAgent: SaveAgentForProject;
  payload?: SaveAgentPayload;
}): Promise<EnsureAgentSavedForProjectResult> {
  const basePayload =
    payload ??
    mapWriterAgentMatchToSaveAgentPayload(agent, {
      projectName,
      writerProjectId,
    });
  const savePayload: SaveAgentPayload = {
    ...basePayload,
    project_name:
      getTrimmedValue(basePayload.project_name) ?? getTrimmedValue(projectName),
    writer_project_id:
      getTrimmedValue(basePayload.writer_project_id) ??
      getTrimmedValue(writerProjectId),
  };
  const legacyAgentId = getTrimmedValue(
    savePayload.index_id ?? getWriterAgentLegacyId(agent),
  );
  const savedAgent = getSavedAgentForProject(savedAgents, {
    legacyAgentId,
    projectName,
    writerProjectId,
  });

  if (savedAgent) {
    return {
      ok: true,
      status: "already-saved",
      payload: savePayload,
      savedAgent,
      response: null,
    };
  }

  let response: SaveAgentResponse | null;

  try {
    response = await saveAgent(savePayload);
  } catch (error) {
    return {
      ok: false,
      status: "failed",
      payload: savePayload,
      savedAgent: null,
      response: null,
      error,
    };
  }

  if (!response) {
    return {
      ok: false,
      status: "failed",
      payload: savePayload,
      savedAgent: null,
      response: null,
    };
  }

  return {
    ok: true,
    status: "saved",
    payload: savePayload,
    savedAgent: null,
    response,
  };
}
