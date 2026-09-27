import { getProjectDashboardHrefById } from "@/app/utils/project-dashboard-route";

export const CONTRACT_VERSION = "manual-agency-guard-v1" as const;
export type AgencyIdentity = {
  agencyId?: string | null;
  agencyName?: string | null;
  agencyUrl?: string | null;
};
export type AgencyGuardInput = {
  dashboardProjectId: string;
  candidateRecordId?: string;
  candidateIndexId?: string;
  candidateAgencyName?: string;
  candidateAgencyUrl?: string;
  includeAllProjects?: boolean;
};
export type ManualHistoryRow = {
  id: string;
  dashboard_project_id?: string | null;
  project_name?: string | null;
  name: string;
  index_id?: string | null;
  agency?: string | null;
  agency_url?: string | null;
  column_name?: string | null;
  query_sent_date?: string | null;
  // Only populated by the server's reviewed catalog lookup, never a browser payload.
  identity?: AgencyIdentity;
};
export type MatchMethod =
  "canonical_id" | "domain" | "normalized_name" | "none";
export type ManualStage =
  "active" | "requested" | "rejected" | "offer" | "unknown_sent";
export type ManualAgencyGuardResponse = {
  contractVersion: typeof CONTRACT_VERSION;
  dashboardProjectId: string;
  evidenceSource: "manual_saved_records";
  status: "clear" | "history" | "warning" | "possible_match" | "unknown";
  agency: {
    id: string | null;
    displayName: string | null;
    matchMethod: MatchMethod;
    confidence: "high" | "fallback" | "unknown";
  };
  coverage: {
    historyComplete: boolean;
    identitySource: "canonical" | "fallback" | "unavailable";
  };
  counts: {
    sameProjectActive: number;
    sameProjectTerminal: number;
    otherProjectActive: number | null;
    otherProjectTerminal: number | null;
  };
  records: Array<{
    recordId: string;
    dashboardProjectId: string;
    projectName: string;
    agentName: string;
    stage: ManualStage;
    querySentOn: string | null;
    sameProject: boolean;
    evidenceSource: "manual";
    href: string;
    matchMethod: Exclude<MatchMethod, "none">;
  }>;
};
const SHARED_HOSTS = [
  "querymanager.com",
  "querytracker.net",
  "submittable.com",
  "google.com",
  "googleusercontent.com",
  "facebook.com",
  "instagram.com",
  "linkedin.com",
  "twitter.com",
  "x.com",
  "bsky.app",
  "threads.net",
  "tiktok.com",
  "linktr.ee",
  "youtube.com",
];
export function normalizeAgencyDomain(value?: string | null) {
  if (!value?.trim()) return null;
  try {
    const url = new URL(value.trim());
    if (!["http:", "https:"].includes(url.protocol)) return null;
    const host = url.hostname
      .toLowerCase()
      .replace(/^www\./, "")
      .replace(/\.$/, "");
    if (
      !host ||
      SHARED_HOSTS.some(
        (shared) => host === shared || host.endsWith(`.${shared}`),
      )
    )
      return null;
    return host;
  } catch {
    return null;
  }
}
export function normalizeAgencyName(value?: string | null) {
  return (
    value
      ?.normalize("NFKD")
      .replace(/\p{M}/gu, "")
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^\p{L}\p{N}]+/gu, " ")
      .replace(
        /\b(?:literary agency|literary management|agency|associates|management|group|incorporated|inc|llc|limited|ltd|literary)\b/g,
        " ",
      )
      .replace(/\s+/g, " ")
      .trim() || null
  );
}
export function resolveAgencyMatch(
  a: AgencyIdentity,
  b: AgencyIdentity,
): MatchMethod {
  const aId = a.agencyId?.trim();
  const bId = b.agencyId?.trim();
  if (aId && bId) return aId === bId ? "canonical_id" : "none";
  const domain = normalizeAgencyDomain(a.agencyUrl);
  if (domain && domain === normalizeAgencyDomain(b.agencyUrl)) return "domain";
  const name = normalizeAgencyName(a.agencyName);
  return name && name === normalizeAgencyName(b.agencyName)
    ? "normalized_name"
    : "none";
}
export function querySentDay(value?: string | null): string | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}(?:$|T)/.test(value)) return null;
  if (value.length > 10 && !Number.isFinite(Date.parse(value))) return null;
  const day = value.slice(0, 10);
  const date = new Date(`${day}T00:00:00Z`);
  return Number.isFinite(date.getTime()) &&
    date.toISOString().slice(0, 10) === day
    ? day
    : null;
}
export function classifyManualStage(row: ManualHistoryRow): ManualStage | null {
  switch (row.column_name) {
    case "submitted-query":
      return "active";
    case "pages-requested":
      return "requested";
    case "rejected":
      return "rejected";
    case "offer-made":
      return "offer";
    default:
      return querySentDay(row.query_sent_date) ? "unknown_sent" : null;
  }
}
export function rowIdentity(row: ManualHistoryRow): AgencyIdentity {
  return row.identity ?? { agencyName: row.agency, agencyUrl: row.agency_url };
}
export function buildAgencyGuard(
  input: AgencyGuardInput,
  candidate: AgencyIdentity,
  history: readonly ManualHistoryRow[],
  historyComplete = true,
): ManualAgencyGuardResponse {
  const hasIdentity = !!(
    candidate.agencyId ||
    normalizeAgencyDomain(candidate.agencyUrl) ||
    normalizeAgencyName(candidate.agencyName)
  );
  const matches = history.flatMap((row) => {
    if (row.id === input.candidateRecordId || !row.dashboard_project_id)
      return [];
    const sameProject = row.dashboard_project_id === input.dashboardProjectId;
    if (!sameProject && !input.includeAllProjects) return [];
    const stage = classifyManualStage(row);
    const matchMethod = resolveAgencyMatch(candidate, rowIdentity(row));
    if (!stage || matchMethod === "none") return [];
    return [
      {
        recordId: row.id,
        dashboardProjectId: row.dashboard_project_id,
        projectName: row.project_name || "Untitled Project",
        agentName: row.name,
        stage,
        querySentOn: querySentDay(row.query_sent_date),
        sameProject,
        evidenceSource: "manual" as const,
        href: `${getProjectDashboardHrefById(row.dashboard_project_id)}?record=${encodeURIComponent(row.id)}`,
        matchMethod,
      },
    ];
  });
  const terminal = (stage: ManualStage) =>
    stage === "offer" || stage === "rejected";
  matches.sort(
    (a, b) =>
      Number(b.sameProject) - Number(a.sameProject) ||
      Number(terminal(a.stage)) - Number(terminal(b.stage)) ||
      (b.querySentOn ?? "").localeCompare(a.querySentOn ?? "") ||
      a.recordId.localeCompare(b.recordId),
  );
  const count = (same: boolean, closed: boolean) =>
    matches.filter(
      (row) => row.sameProject === same && terminal(row.stage) === closed,
    ).length;
  const warning = matches.some(
    (row) =>
      row.sameProject &&
      !terminal(row.stage) &&
      row.matchMethod === "canonical_id",
  );
  const possibleActive = matches.some(
    (row) => !terminal(row.stage) && row.matchMethod !== "canonical_id",
  );
  const matchMethod =
    (["canonical_id", "domain", "normalized_name"] as const).find((method) =>
      matches.some((row) => row.matchMethod === method),
    ) ?? "none";
  return {
    contractVersion: CONTRACT_VERSION,
    dashboardProjectId: input.dashboardProjectId,
    evidenceSource: "manual_saved_records",
    status: warning
      ? "warning"
      : possibleActive
        ? "possible_match"
        : matches.length
          ? "history"
          : !hasIdentity || !historyComplete
            ? "unknown"
            : "clear",
    agency: {
      id: candidate.agencyId ?? null,
      displayName: candidate.agencyName?.trim() || null,
      matchMethod,
      confidence:
        matchMethod === "canonical_id"
          ? "high"
          : matchMethod !== "none"
            ? "fallback"
            : "unknown",
    },
    coverage: {
      historyComplete,
      identitySource: candidate.agencyId
        ? "canonical"
        : hasIdentity
          ? "fallback"
          : "unavailable",
    },
    counts: {
      sameProjectActive: count(true, false),
      sameProjectTerminal: count(true, true),
      otherProjectActive: input.includeAllProjects ? count(false, false) : null,
      otherProjectTerminal: input.includeAllProjects
        ? count(false, true)
        : null,
    },
    records: matches,
  };
}
