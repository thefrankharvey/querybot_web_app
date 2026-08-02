export const QUERY_SAFETY_CONTRACT_VERSION = "query-safety-v1" as const;

export type AgencyMatchMethod =
  | "canonical_id"
  | "domain"
  | "normalized_name"
  | "none";

export type AgencyMatchConfidence = "high" | "medium" | "none";

export type AgencyGuardStatus =
  | "clear"
  | "history"
  | "warning"
  | "possible_match";

export type AgencyQueryStage =
  | "research"
  | "active_query"
  | "active_material"
  | "terminal_rejected"
  | "terminal_no_response"
  | "terminal_offer"
  | "unknown_sent";

export type AgencyIdentityInput = {
  agencyId?: string | null;
  agencyName?: string | null;
  agencyUrl?: string | null;
};

export type AgencyGuardInput = {
  candidateRecordId?: string | null;
  candidateAgentProfileId?: string | null;
  candidateIndexId?: string | null;
  candidateAgencyId?: string | null;
  candidateAgencyName?: string | null;
  candidateAgencyUrl?: string | null;
  projectName?: string | null;
  writerProjectId?: string | null;
  includeAllProjects?: boolean;
};

export type AgencyResolution = {
  agencyId: string | null;
  name: string;
  matchMethod: AgencyMatchMethod;
  confidence: AgencyMatchConfidence;
};

export type AgencyHistoryCandidate = AgencyIdentityInput & {
  recordId: string;
  indexId?: string | null;
  agentName: string;
  projectName: string;
  projectScopeKey: string;
  columnName?: string | null;
  querySentDate?: string | null;
  pagesRequestedDate?: string | null;
  rejectedDate?: string | null;
  offerDate?: string | null;
  liveStatus?: string | null;
  liveChangedAt?: string | null;
  liveSentAt?: string | null;
  href: string;
};

export type AgencyQueryHistoryRecord = {
  recordId: string;
  indexId: string | null;
  agentName: string;
  projectName: string;
  stage: AgencyQueryStage;
  stageLabel: string;
  sentAt: string | null;
  terminalAt: string | null;
  sameProject: boolean;
  tracking: "live" | "manual";
  href: string;
};

export type AgencyGuardResult = {
  contractVersion: typeof QUERY_SAFETY_CONTRACT_VERSION;
  resultVersion: string;
  status: AgencyGuardStatus;
  scopeKey: string;
  agency: AgencyResolution;
  counts: {
    sameProjectActive: number;
    sameProjectTerminal: number;
    otherProjectActive: number;
    otherProjectTerminal: number;
  };
  records: AgencyQueryHistoryRecord[];
};

export type AgencyGuardServiceResult = AgencyGuardResult & {
  scope: {
    key: string;
    writerProjectId: string | null;
    projectName: string;
  };
  liveDataStatus: "available" | "partial" | "unavailable";
};

const TERMINAL_STAGES = new Set<AgencyQueryStage>([
  "terminal_rejected",
  "terminal_no_response",
  "terminal_offer",
]);

const GENERIC_SHARED_HOSTS = new Set([
  "docs.google.com",
  "facebook.com",
  "instagram.com",
  "linkedin.com",
  "querymanager.com",
  "querytracker.net",
  "submittable.com",
  "twitter.com",
  "x.com",
]);

const AGENCY_SUFFIX_PATTERN =
  /\b(?:literary\s+agency|literary\s+management|agency|associates|management|group|incorporated|inc|llc|limited|ltd|literary)\b/g;

function trimToNull(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed || null;
}

export function normalizeAgencyId(value?: string | null) {
  return trimToNull(value)?.toLowerCase() ?? null;
}

export function normalizeAgencyDomain(value?: string | null) {
  const normalizedValue = trimToNull(value);
  if (!normalizedValue) return null;

  try {
    const url = new URL(
      /^[a-z][a-z\d+.-]*:\/\//i.test(normalizedValue)
        ? normalizedValue
        : `https://${normalizedValue}`,
    );
    const host = url.hostname.toLowerCase().replace(/^www\./, "");

    if (!host || GENERIC_SHARED_HOSTS.has(host)) return null;
    return host;
  } catch {
    return null;
  }
}

export function normalizeAgencyName(value?: string | null) {
  const normalizedValue = trimToNull(value);
  if (!normalizedValue) return null;

  const normalized = normalizedValue
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(AGENCY_SUFFIX_PATTERN, " ")
    .replace(/\s+/g, " ")
    .trim();

  return normalized || null;
}

export function resolveAgencyMatch(
  candidate: AgencyIdentityInput,
  history: AgencyIdentityInput,
): AgencyResolution {
  const candidateId = normalizeAgencyId(candidate.agencyId);
  const historyId = normalizeAgencyId(history.agencyId);
  const displayName =
    trimToNull(candidate.agencyName) ??
    trimToNull(history.agencyName) ??
    "Unknown agency";

  if (candidateId && historyId && candidateId === historyId) {
    return {
      agencyId: trimToNull(candidate.agencyId),
      name: displayName,
      matchMethod: "canonical_id",
      confidence: "high",
    };
  }

  const candidateDomain = normalizeAgencyDomain(candidate.agencyUrl);
  const historyDomain = normalizeAgencyDomain(history.agencyUrl);

  if (candidateDomain && historyDomain && candidateDomain === historyDomain) {
    return {
      agencyId: candidateId && candidateId === historyId ? candidateId : null,
      name: displayName,
      matchMethod: "domain",
      confidence: "medium",
    };
  }

  const candidateName = normalizeAgencyName(candidate.agencyName);
  const historyName = normalizeAgencyName(history.agencyName);

  if (candidateName && historyName && candidateName === historyName) {
    return {
      agencyId: candidateId && candidateId === historyId ? candidateId : null,
      name: displayName,
      matchMethod: "normalized_name",
      confidence: "medium",
    };
  }

  return {
    agencyId: candidateId,
    name: displayName,
    matchMethod: "none",
    confidence: "none",
  };
}

function hasValidDate(value?: string | null) {
  if (!value) return false;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp);
}

function normalizeLiveStage(value?: string | null): AgencyQueryStage | null {
  switch (value?.trim().toLowerCase()) {
    case "query_sent":
    case "query_viewed":
      return "active_query";
    case "manuscript_requested":
    case "manuscript_under_review":
      return "active_material";
    case "rejected":
      return "terminal_rejected";
    case "closed_no_response":
      return "terminal_no_response";
    case "offer_of_representation":
      return "terminal_offer";
    default:
      return null;
  }
}

export function classifyAgencyQueryStage(
  record: Pick<
    AgencyHistoryCandidate,
    | "columnName"
    | "liveStatus"
    | "offerDate"
    | "pagesRequestedDate"
    | "querySentDate"
    | "rejectedDate"
  >,
): AgencyQueryStage {
  const liveStage = normalizeLiveStage(record.liveStatus);
  if (liveStage) return liveStage;

  if (hasValidDate(record.offerDate)) return "terminal_offer";
  if (hasValidDate(record.rejectedDate)) return "terminal_rejected";

  switch (record.columnName?.trim().toLowerCase()) {
    case "offer-made":
      return "terminal_offer";
    case "rejected":
      return "terminal_rejected";
    case "closed-no-response":
      return "terminal_no_response";
    case "pages-requested":
      return "active_material";
    case "submitted-query":
      return "active_query";
    case "agents-to-research":
    case undefined:
    case null:
    case "":
      return hasValidDate(record.querySentDate) ? "unknown_sent" : "research";
    default:
      return hasValidDate(record.querySentDate) ? "unknown_sent" : "research";
  }
}

export function isTerminalAgencyQueryStage(stage: AgencyQueryStage) {
  return TERMINAL_STAGES.has(stage);
}

export function isActiveAgencyQueryStage(stage: AgencyQueryStage) {
  return stage !== "research" && !isTerminalAgencyQueryStage(stage);
}

export function getAgencyQueryStageLabel(stage: AgencyQueryStage) {
  switch (stage) {
    case "active_query":
      return "Active query";
    case "active_material":
      return "Requested material active";
    case "terminal_rejected":
      return "Query closed — declined";
    case "terminal_no_response":
      return "Query closed — no response";
    case "terminal_offer":
      return "Offer received";
    case "unknown_sent":
      return "Sent — manually tracked status uncertain";
    default:
      return "Research";
  }
}

function getTerminalAt(record: AgencyHistoryCandidate, stage: AgencyQueryStage) {
  switch (stage) {
    case "terminal_offer":
      return trimToNull(record.liveChangedAt) ?? trimToNull(record.offerDate);
    case "terminal_rejected":
    case "terminal_no_response":
      return trimToNull(record.liveChangedAt) ?? trimToNull(record.rejectedDate);
    default:
      return null;
  }
}

function compareHistoryRecords(
  left: AgencyQueryHistoryRecord,
  right: AgencyQueryHistoryRecord,
) {
  if (left.sameProject !== right.sameProject) return left.sameProject ? -1 : 1;

  const leftActive = isActiveAgencyQueryStage(left.stage);
  const rightActive = isActiveAgencyQueryStage(right.stage);
  if (leftActive !== rightActive) return leftActive ? -1 : 1;

  const leftDate = Date.parse(left.terminalAt ?? left.sentAt ?? "") || 0;
  const rightDate = Date.parse(right.terminalAt ?? right.sentAt ?? "") || 0;
  return rightDate - leftDate;
}

function stableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

export function createAgencyGuardResult({
  candidate,
  candidateRecordId,
  history,
  scopeKey,
}: {
  candidate: AgencyIdentityInput;
  candidateRecordId?: string | null;
  history: readonly AgencyHistoryCandidate[];
  scopeKey: string;
}): AgencyGuardResult {
  const fallbackResolution: AgencyResolution = {
    agencyId: normalizeAgencyId(candidate.agencyId),
    name: trimToNull(candidate.agencyName) ?? "Unknown agency",
    matchMethod: "none",
    confidence: "none",
  };
  const matches: Array<{
    history: AgencyHistoryCandidate;
    resolution: AgencyResolution;
    stage: AgencyQueryStage;
  }> = [];

  for (const candidateHistory of history) {
    if (candidateHistory.recordId === candidateRecordId) continue;

    const stage = classifyAgencyQueryStage(candidateHistory);
    if (stage === "research") continue;

    const resolution = resolveAgencyMatch(candidate, candidateHistory);
    if (resolution.confidence === "none") continue;

    matches.push({ history: candidateHistory, resolution, stage });
  }

  const hasHighConfidenceMatch = matches.some(
    ({ resolution }) => resolution.confidence === "high",
  );
  const selectedMatches = hasHighConfidenceMatch
    ? matches.filter(({ resolution }) => resolution.confidence === "high")
    : matches;
  const strongestResolution =
    selectedMatches[0]?.resolution ?? fallbackResolution;
  const records: AgencyQueryHistoryRecord[] = selectedMatches.map(
    ({ history: candidateHistory, stage }) => ({
      recordId: candidateHistory.recordId,
      indexId: trimToNull(candidateHistory.indexId),
      agentName: candidateHistory.agentName,
      projectName: candidateHistory.projectName,
      stage,
      stageLabel: getAgencyQueryStageLabel(stage),
      sentAt:
        trimToNull(candidateHistory.liveSentAt) ??
        trimToNull(candidateHistory.querySentDate),
      terminalAt: getTerminalAt(candidateHistory, stage),
      sameProject: candidateHistory.projectScopeKey === scopeKey,
      tracking: candidateHistory.liveStatus ? "live" : "manual",
      href: candidateHistory.href,
    }),
  );

  records.sort(compareHistoryRecords);

  const counts = records.reduce(
    (result, record) => {
      const isActive = isActiveAgencyQueryStage(record.stage);
      if (record.sameProject) {
        if (isActive) result.sameProjectActive += 1;
        else result.sameProjectTerminal += 1;
      } else if (isActive) {
        result.otherProjectActive += 1;
      } else {
        result.otherProjectTerminal += 1;
      }
      return result;
    },
    {
      sameProjectActive: 0,
      sameProjectTerminal: 0,
      otherProjectActive: 0,
      otherProjectTerminal: 0,
    },
  );

  let status: AgencyGuardStatus = "clear";
  if (records.length > 0 && strongestResolution.confidence === "medium") {
    status = "possible_match";
  } else if (counts.sameProjectActive > 0) {
    status = "warning";
  } else if (records.length > 0) {
    status = "history";
  }

  const versionSource = records
    .map((record) =>
      [
        record.recordId,
        record.stage,
        record.sentAt ?? "",
        record.terminalAt ?? "",
        record.sameProject ? "same" : "other",
      ].join(":"),
    )
    .join("|");

  return {
    contractVersion: QUERY_SAFETY_CONTRACT_VERSION,
    resultVersion: `${QUERY_SAFETY_CONTRACT_VERSION}:${stableHash(versionSource)}`,
    status,
    scopeKey,
    agency: strongestResolution,
    counts,
    records,
  };
}
