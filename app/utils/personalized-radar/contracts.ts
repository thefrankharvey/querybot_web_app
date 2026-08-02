export const RADAR_SCHEMA_VERSION = "personalized-radar-v1" as const;

export const RADAR_EVENT_TYPES = [
  "submission_reopened",
  "submission_closed",
  "official_profile_update",
  "mswl_or_interest_update",
  "agency_change",
] as const;

export type RadarEventType = (typeof RADAR_EVENT_TYPES)[number];

export const RADAR_WATCH_STATUSES = ["active", "muted", "deleted"] as const;
export type RadarWatchStatus = (typeof RADAR_WATCH_STATUSES)[number];

export const RADAR_ORIGIN_SURFACES = [
  "agent_card",
  "agent_profile",
  "query_dashboard",
  "kanban_dialog",
  "dispatch",
  "message_thread",
  "unknown",
] as const;
export type RadarOriginSurface = (typeof RADAR_ORIGIN_SURFACES)[number];

export type AgentIdentityKey = {
  agentProfileId: string | null;
  indexId: string | null;
};

export type AgentWatchRow = {
  id: string;
  user_id: string;
  agent_profile_id: string | null;
  index_id: string | null;
  origin_agent_match_id: string | null;
  origin_surface: string;
  event_types: string[];
  status: string;
  in_app_enabled: boolean;
  email_digest_enabled: boolean;
  muted_at: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type AgentWatch = {
  id: string;
  agentProfileId: string | null;
  indexId: string | null;
  originAgentMatchId: string | null;
  originSurface: RadarOriginSurface;
  eventTypes: RadarEventType[];
  status: Exclude<RadarWatchStatus, "deleted">;
  inAppEnabled: boolean;
  emailDigestEnabled: boolean;
  mutedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type RadarWatchCapabilities = {
  maxActiveWatches: number;
  allowedEventTypes: RadarEventType[];
  emailDigest: boolean;
  targetedHistoryDays: number;
  isSubscribed: boolean;
};

export type WatchLookupRequestKey = AgentIdentityKey & { key: string };

export type WatchLookupResult = WatchLookupRequestKey & {
  watch: AgentWatch | null;
};

export type AgentChangeEvent = {
  event_id: string;
  schema_version: "agent-change-v1";
  event_type: RadarEventType;
  occurred_at: string;
  recorded_at: string;
  agent: {
    profile_id: string | null;
    index_id: string | null;
    name: string | null;
    agency_id: string | null;
    agency_name: string | null;
  };
  headline: string;
  summary: string;
  source_url: string;
  changed_fields: string[];
  previous: Record<string, unknown>;
  current: Record<string, unknown>;
  supersedes_event_id: string | null;
};

export type AgentChangeEventPage = {
  schema_version: "agent-change-v1";
  events: AgentChangeEvent[];
  next_cursor: string | null;
  has_more: boolean;
};

export function getAgentIdentityKey(identity: AgentIdentityKey): string | null {
  const profileId = identity.agentProfileId?.trim();
  if (profileId) return `profile:${profileId}`;
  const indexId = identity.indexId?.trim();
  return indexId ? `index:${indexId}` : null;
}

export function normalizeAgentWatch(row: AgentWatchRow): AgentWatch {
  if (row.status === "deleted") {
    throw new Error("Deleted watches are not part of the public watch contract");
  }

  return {
    id: row.id,
    agentProfileId: row.agent_profile_id,
    indexId: row.index_id,
    originAgentMatchId: row.origin_agent_match_id,
    originSurface: row.origin_surface as RadarOriginSurface,
    eventTypes: row.event_types as RadarEventType[],
    status: row.status as Exclude<RadarWatchStatus, "deleted">,
    inAppEnabled: row.in_app_enabled,
    emailDigestEnabled: row.email_digest_enabled,
    mutedAt: row.muted_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
