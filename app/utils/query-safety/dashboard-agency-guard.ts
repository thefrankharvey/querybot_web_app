import { getProjectDashboardHref } from "@/app/utils/project-dashboard-summary";
import { getProjectMessageThreadHref } from "@/app/utils/message-routes";
import { getProjectScope } from "@/app/utils/project-scope";

import {
  createAgencyGuardResult,
  type AgencyGuardServiceResult,
  type AgencyHistoryCandidate,
} from "./agency-guard";

export type DashboardAgencyGuardCard = {
  id: string;
  index_id?: string | null;
  name: string;
  agency_id?: string | null;
  agency?: string | null;
  agency_url?: string | null;
  projectName: string;
  writerProjectId?: string | null;
  columnId?: string | null;
  query_sent_date?: string | null;
  pages_requested_date?: string | null;
  rejected_date?: string | null;
  offer_date?: string | null;
  queryProgress?: {
    currentCode: string;
    changedAt: string;
    sentAt: string;
  } | null;
  messageThreadId?: string | null;
  lifecycleSyncUnavailable?: boolean;
};

function mapDashboardHistoryCard(
  card: DashboardAgencyGuardCard,
): AgencyHistoryCandidate {
  const scope = getProjectScope({
    projectName: card.projectName,
    writerProjectId: card.writerProjectId,
  });

  return {
    recordId: card.id,
    indexId: card.index_id,
    agentName: card.name,
    agencyId: card.agency_id,
    agencyName: card.agency,
    agencyUrl: card.agency_url,
    projectName: scope.projectName,
    projectScopeKey: scope.key,
    columnName: card.columnId,
    querySentDate: card.query_sent_date,
    pagesRequestedDate: card.pages_requested_date,
    rejectedDate: card.rejected_date,
    offerDate: card.offer_date,
    liveStatus: card.queryProgress?.currentCode ?? null,
    liveChangedAt: card.queryProgress?.changedAt ?? null,
    liveSentAt: card.queryProgress?.sentAt ?? null,
    href: card.messageThreadId
      ? getProjectMessageThreadHref(
          scope.writerProjectId ?? scope.projectName,
          card.messageThreadId,
        )
      : getProjectDashboardHref(scope.projectName, scope.writerProjectId),
  };
}

/**
 * Builds immediate dashboard indicators from the already-loaded saved-agent
 * index. Detail dialogs still fetch the authoritative server guard so card and
 * table rendering never creates an N+1 request pattern.
 */
export function getDashboardAgencyGuard(
  candidate: DashboardAgencyGuardCard,
  cards: readonly DashboardAgencyGuardCard[],
): AgencyGuardServiceResult {
  const scope = getProjectScope({
    projectName: candidate.projectName,
    writerProjectId: candidate.writerProjectId,
  });
  const result = createAgencyGuardResult({
    candidate: {
      agencyId: candidate.agency_id,
      agencyName: candidate.agency,
      agencyUrl: candidate.agency_url,
    },
    candidateRecordId: candidate.id,
    history: cards.map(mapDashboardHistoryCard),
    scopeKey: scope.key,
  });

  return {
    ...result,
    scope,
    liveDataStatus: cards.some(
      (card) =>
        card.lifecycleSyncUnavailable &&
        getProjectScope({
          projectName: card.projectName,
          writerProjectId: card.writerProjectId,
        }).key === scope.key,
    )
      ? "partial"
      : "available",
  };
}
