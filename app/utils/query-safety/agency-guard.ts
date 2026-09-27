export const CONTRACT_VERSION = "saved-agency-matches-v2" as const;
export type AgencyIdentity = {
  agencyId?: string | null;
  agencyName?: string | null;
  agencyUrl?: string | null;
};
export type SavedAgencyRecord = {
  id: string;
  dashboard_project_id: string;
  project_name: string;
  name: string;
  index_id?: string | null;
  identity: AgencyIdentity;
};
export type SavedAgencyResponse = {
  contractVersion: typeof CONTRACT_VERSION;
  enabled: boolean;
  records: SavedAgencyRecord[];
  identities: Record<string, AgencyIdentity>;
};
export type AgencyCandidate = {
  recordId?: string;
  indexId?: string;
  agencyName?: string | null;
  agencyUrl?: string | null;
};
export type MatchMethod =
  "canonical_id" | "domain" | "normalized_name" | "none";
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

function identityKeys(identity: AgencyIdentity) {
  return [
    identity.agencyId ? `id:${identity.agencyId}` : null,
    normalizeAgencyDomain(identity.agencyUrl)
      ? `domain:${normalizeAgencyDomain(identity.agencyUrl)}`
      : null,
    normalizeAgencyName(identity.agencyName)
      ? `name:${normalizeAgencyName(identity.agencyName)}`
      : null,
  ].filter((key): key is string => key !== null);
}
// Build once per successful batch, not once per rendered card.
export function indexSavedAgencies(data: SavedAgencyResponse) {
  const records = new Map(data.records.map((row) => [row.id, row]));
  const agencies = new Map<string, SavedAgencyRecord[]>();
  for (const row of data.records) {
    for (const key of identityKeys(row.identity)) {
      const group = agencies.get(key) ?? [];
      group.push(row);
      agencies.set(key, group);
    }
  }
  return { records, agencies, identities: data.identities };
}
export type SavedAgencyIndex = ReturnType<typeof indexSavedAgencies>;
export function findSavedAgencyMatches(
  index: SavedAgencyIndex,
  candidate: AgencyCandidate,
) {
  const saved = candidate.recordId
    ? index.records.get(candidate.recordId)
    : undefined;
  // A deleted row must not fall back to stale discovery props.
  if (candidate.recordId && !saved) return { projects: [], hasFallback: false };
  const agentId = saved?.index_id ?? candidate.indexId;
  const identity = saved?.identity ??
    index.identities[agentId?.toLowerCase() ?? ""] ?? {
      agencyName: candidate.agencyName,
      agencyUrl: candidate.agencyUrl,
    };
  const possible = new Map<string, SavedAgencyRecord>();
  for (const key of identityKeys(identity)) {
    for (const row of index.agencies.get(key) ?? []) possible.set(row.id, row);
  }
  const projects = new Map<
    string,
    { id: string; name: string; agents: Map<string, string> }
  >();
  let hasFallback = false;
  for (const row of possible.values()) {
    if (
      row.id === candidate.recordId ||
      (agentId && row.index_id?.toLowerCase() === agentId.toLowerCase())
    )
      continue;
    const method = resolveAgencyMatch(identity, row.identity);
    if (method === "none") continue;
    hasFallback ||= method !== "canonical_id";
    const project = projects.get(row.dashboard_project_id) ?? {
      id: row.dashboard_project_id,
      name: row.project_name || "Untitled Project",
      agents: new Map<string, string>(),
    };
    project.agents.set(row.index_id?.toLowerCase() || row.id, row.name);
    projects.set(project.id, project);
  }
  return {
    hasFallback,
    projects: [...projects.values()]
      .sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id))
      .map((project) => ({
        ...project,
        agents: [...project.agents.values()].sort((a, b) => a.localeCompare(b)),
      })),
  };
}
