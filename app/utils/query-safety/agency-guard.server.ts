import "server-only";

import { createServerSupabase } from "@/app/api/supabase/server";
import { AGENT_MATCHES_TABLE, DEFAULT_PROJECT_NAME } from "@/app/constants";
import { getProjectDashboardHref } from "@/app/utils/project-dashboard-summary";
import { getProjectScope } from "@/app/utils/project-scope";
import { getWriterMessageThreadsData } from "@/app/utils/message-thread-data";
import type { WriterMessageThread } from "@/app/utils/message-types";
import {
  fetchCanonicalAgencyIdentities,
  type CanonicalAgencyIdentity,
} from "@/app/utils/agency-identity.server";

import {
  createAgencyGuardResult,
  type AgencyHistoryCandidate,
  type AgencyIdentityInput,
  type AgencyGuardServiceResult,
  type AgencyGuardInput,
} from "./agency-guard";

export class AgencyGuardServiceError extends Error {
  code: string;
  status: number;

  constructor(message: string, status: number, code: string) {
    super(message);
    this.name = "AgencyGuardServiceError";
    this.status = status;
    this.code = code;
  }
}

type SavedAgentGuardRow = {
  id: string;
  index_id: string | null;
  name: string | null;
  agency_id: string | null;
  agency: string | null;
  agency_url: string | null;
  project_name: string | null;
  writer_project_id: string | null;
  column_name: string | null;
  query_sent_date: string | null;
  pages_requested_date: string | null;
  rejected_date: string | null;
  offer_date: string | null;
};

function getString(value?: string | null) {
  return value?.trim() ?? "";
}

function getNullableString(value?: string | null) {
  return getString(value) || null;
}

function getThreadForSavedRow(
  row: SavedAgentGuardRow,
  threadsByIdentifier: ReadonlyMap<string, WriterMessageThread>,
) {
  return (
    threadsByIdentifier.get(row.id) ??
    (row.index_id ? threadsByIdentifier.get(row.index_id) : undefined) ??
    null
  );
}

function withCanonicalAgencyIdentity(
  row: SavedAgentGuardRow,
  identityByAgentId: ReadonlyMap<string, CanonicalAgencyIdentity>,
) {
  const identity = row.index_id
    ? identityByAgentId.get(getString(row.index_id).toLowerCase()) ?? null
    : null;
  if (!identity) return row;

  return {
    ...row,
    agency_id: identity.agency_id,
    agency: identity.agency_name,
    agency_url: identity.agency_url,
  };
}

function indexThreads(threads: readonly WriterMessageThread[]) {
  const index = new Map<string, WriterMessageThread>();

  for (const thread of threads) {
    for (const identifier of [
      thread.savedAgentId,
      thread.legacyAgentId,
      thread.indexId,
    ]) {
      const normalizedIdentifier = getString(identifier);
      if (!normalizedIdentifier || index.has(normalizedIdentifier)) continue;
      index.set(normalizedIdentifier, thread);
    }
  }

  return index;
}

async function fetchLiveThreadsForScope({
  includeAllProjects,
  rows,
  writerProjectId,
  projectName,
}: {
  includeAllProjects: boolean;
  rows: readonly SavedAgentGuardRow[];
  writerProjectId: string | null;
  projectName: string;
}) {
  const routeProjectIds = new Set<string>();
  routeProjectIds.add(writerProjectId ?? projectName);

  if (includeAllProjects) {
    for (const row of rows) {
      const rowScope = getProjectScope({
        writerProjectId: row.writer_project_id,
        projectName: row.project_name,
      });
      routeProjectIds.add(rowScope.writerProjectId ?? rowScope.projectName);
    }
  }

  const results = await Promise.allSettled(
    Array.from(routeProjectIds, async (routeProjectId) => {
      const data = await getWriterMessageThreadsData(routeProjectId);
      return data?.threads ?? [];
    }),
  );
  const threads = results.flatMap((result) =>
    result.status === "fulfilled" ? result.value : [],
  );
  const rejectedCount = results.filter(
    (result) => result.status === "rejected",
  ).length;

  return {
    threads,
    status:
      rejectedCount === 0
        ? ("available" as const)
        : rejectedCount === results.length
          ? ("unavailable" as const)
          : ("partial" as const),
  };
}

function getAuthoritativeCandidate(
  input: AgencyGuardInput,
  candidateRow: SavedAgentGuardRow | null,
): AgencyIdentityInput {
  if (candidateRow) {
    return {
      agencyId: candidateRow.agency_id,
      agencyName: candidateRow.agency,
      agencyUrl: candidateRow.agency_url,
    };
  }

  // Unsaved discovery candidates currently have no trusted agency ID source.
  // The caller's display fields can support a disclosed fallback match only.
  return {
    agencyId: null,
    agencyName: input.candidateAgencyName,
    agencyUrl: input.candidateAgencyUrl,
  };
}

function mapHistoryRow(
  row: SavedAgentGuardRow,
  thread: WriterMessageThread | null,
): AgencyHistoryCandidate {
  const scope = getProjectScope({
    writerProjectId: row.writer_project_id,
    projectName: row.project_name,
  });
  const progress = thread?.queryProgress;

  return {
    recordId: row.id,
    indexId: row.index_id,
    agentName: getString(row.name) || "Unknown agent",
    agencyId: row.agency_id,
    agencyName: row.agency,
    agencyUrl: row.agency_url,
    projectName: scope.projectName,
    projectScopeKey: scope.key,
    columnName: row.column_name,
    querySentDate: row.query_sent_date,
    pagesRequestedDate: row.pages_requested_date,
    rejectedDate: row.rejected_date,
    offerDate: row.offer_date,
    liveStatus: progress?.currentCode ?? null,
    liveChangedAt: progress?.changedAt ?? null,
    liveSentAt: progress?.sentAt ?? null,
    href: thread
      ? `/messages/${encodeURIComponent(
          scope.writerProjectId ?? scope.projectName,
        )}/threads/${encodeURIComponent(thread.threadId)}`
      : getProjectDashboardHref(
          scope.projectName,
          scope.writerProjectId,
        ),
  };
}

export async function getAgencyGuardForUser({
  input,
  userId,
}: {
  input: AgencyGuardInput;
  userId: string;
}): Promise<AgencyGuardServiceResult> {
  const requestedScope = getProjectScope({
    writerProjectId: input.writerProjectId,
    projectName: input.projectName,
  });
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from(AGENT_MATCHES_TABLE)
    .select(
      "id,index_id,name,agency_id,agency,agency_url,project_name,writer_project_id,column_name,query_sent_date,pages_requested_date,rejected_date,offer_date",
    )
    .eq("user_id", userId);

  if (error) {
    throw new AgencyGuardServiceError(
      "Agency history is temporarily unavailable.",
      503,
      "AGENCY_GUARD_UNAVAILABLE",
    );
  }

  const rawRows = (data ?? []) as SavedAgentGuardRow[];
  const identityByAgentId = await fetchCanonicalAgencyIdentities([
    ...rawRows.map((row) => row.index_id ?? ""),
    input.candidateIndexId ?? "",
  ]);
  const rows = rawRows.map((row) =>
    withCanonicalAgencyIdentity(row, identityByAgentId),
  );
  const candidateRecordId = getNullableString(input.candidateRecordId);
  const candidateRow = candidateRecordId
    ? (rows.find((row) => row.id === candidateRecordId) ?? null)
    : null;

  if (candidateRecordId && !candidateRow) {
    throw new AgencyGuardServiceError(
      "Saved agent not found.",
      404,
      "NOT_FOUND",
    );
  }

  const scope = candidateRow
    ? getProjectScope({
        writerProjectId: candidateRow.writer_project_id,
        projectName: candidateRow.project_name,
      })
    : requestedScope;

  const upstreamCandidateIdentity = input.candidateIndexId
    ? identityByAgentId.get(getString(input.candidateIndexId).toLowerCase()) ?? null
    : null;
  const candidate = upstreamCandidateIdentity
    ? {
        agencyId: upstreamCandidateIdentity.agency_id,
        agencyName: upstreamCandidateIdentity.agency_name,
        agencyUrl: upstreamCandidateIdentity.agency_url,
      }
    : getAuthoritativeCandidate(input, candidateRow);
  if (
    !candidateRow &&
    !candidate.agencyId &&
    !candidate.agencyName &&
    !candidate.agencyUrl
  ) {
    throw new AgencyGuardServiceError(
      "Agency identity is required.",
      400,
      "INVALID_AGENCY_CANDIDATE",
    );
  }

  const live = await fetchLiveThreadsForScope({
    includeAllProjects: input.includeAllProjects === true,
    rows,
    writerProjectId: scope.writerProjectId,
    projectName: scope.projectName || DEFAULT_PROJECT_NAME,
  });
  const threadsByIdentifier = indexThreads(live.threads);
  const result = createAgencyGuardResult({
    candidate,
    candidateRecordId,
    history: rows.map((row) =>
      mapHistoryRow(row, getThreadForSavedRow(row, threadsByIdentifier)),
    ),
    scopeKey: scope.key,
  });

  return {
    ...result,
    scope,
    liveDataStatus: live.status,
  };
}
