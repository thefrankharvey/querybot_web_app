// Sophie Lambert is the current agent used to seed the signup profile flow.
export const SIGNUP_AGENT_LEGACY_ID =
  "ce32ead6-f9fd-4629-8fa4-c0e5c6173641";

export type LegacyAgent = {
  agent_id: string;
  name?: string | null;
  email?: string | null;
  [key: string]: unknown;
};

export type AgentProfile = {
  profile_id?: string | null;
  legacy_agent_id?: string | null;
  is_active?: boolean | null;
  aala_member?: boolean | null;
  name?: string | null;
  title?: string | null;
  agency?: string | null;
  bio?: string | null;
  genres?: string | null;
  subgenres?: string | string[] | null;
  formats?: string | string[] | null;
  audiences?: string | string[] | null;
  extra_interest?: string | null;
  favorites?: string | null;
  clients?: string | null;
  sales?: string | null;
  negatives?: string | null;
  status?: string | null;
  submission_req?: string | null;
  email?: string | null;
  website?: string | null;
  twitter_handle?: string | null;
  instagram_handle?: string | null;
  bluesky_handle?: string | null;
  linkedin_url?: string | null;
  pubmarketplace?: string | null;
  querymanager?: string | null;
  querytracker?: string | null;
  extra_links?: string | null;
  city?: string | null;
  state_province?: string | null;
  country?: string | null;
  country_code?: string | null;
  location?: string | null;
  open_to_queries?: string | null;
  accepts_middle_grade?: boolean | null;
  accepts_young_adult?: boolean | null;
  accepts_screenplay?: boolean | null;
  accepts_comics?: boolean | null;
  accepts_children?: boolean | null;
  accepts_poetry?: boolean | null;
  accepts_nonfiction?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
  [key: string]: unknown;
};

export type AgentProfileMutableFields = {
  name?: string | null;
  title?: string | null;
  bio?: string | null;
  website?: string | null;
  email?: string | null;
  agency?: string | null;
  genres?: string | null;
  subgenres?: string | null;
  formats?: string | null;
  audiences?: string | null;
  extra_interest?: string | null;
  favorites?: string | null;
  clients?: string | null;
  sales?: string | null;
  negatives?: string | null;
  status?: string | null;
  submission_req?: string | null;
  country_code?: string | null;
  state_province?: string | null;
  twitter_handle?: string | null;
  instagram_handle?: string | null;
  bluesky_handle?: string | null;
  linkedin_url?: string | null;
  pubmarketplace?: string | null;
  querymanager?: string | null;
  querytracker?: string | null;
  extra_links?: string | null;
  is_active?: boolean | null;
  aala_member?: boolean | null;
  accepts_middle_grade?: boolean | null;
  accepts_young_adult?: boolean | null;
  accepts_screenplay?: boolean | null;
  accepts_comics?: boolean | null;
  accepts_children?: boolean | null;
  accepts_poetry?: boolean | null;
  accepts_nonfiction?: boolean | null;
  city?: string | null;
  country?: string | null;
  location?: string | null;
  open_to_queries?: string | null;
};

export type UpdateAgentProfileRequest = {
  profile_id: string;
} & Partial<AgentProfileMutableFields>;

export type CreateAgentProfilePayload = {
  legacy_agent_id: string;
  name?: string | null;
  email?: string | null;
  [key: string]: unknown;
};

export type AgentProfileResponse = {
  status: "success";
  agent: AgentProfile;
};

export type UpdateAgentProfileResponse = AgentProfileResponse;

export type LegacyAgentResponse = {
  status: "success";
  agent: LegacyAgent;
};

const SERVER_MANAGED_OR_UNLINKABLE_LEGACY_KEYS = new Set([
  "agent_id",
  "legacy_agent_id",
  "profile_id",
  "created_at",
  "updated_at",
  "search_vector",
]);

function isPayloadValue(value: unknown) {
  return (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    Array.isArray(value)
  );
}

function stringOrNull(value: unknown) {
  return typeof value === "string" ? value : null;
}

export function buildFullCreateProfilePayload(
  legacyAgent: LegacyAgent
): CreateAgentProfilePayload {
  const payload: CreateAgentProfilePayload = {
    legacy_agent_id: legacyAgent.agent_id,
  };

  for (const [key, value] of Object.entries(legacyAgent)) {
    if (SERVER_MANAGED_OR_UNLINKABLE_LEGACY_KEYS.has(key)) {
      continue;
    }

    if (typeof value === "undefined" || !isPayloadValue(value)) {
      continue;
    }

    payload[key] = value;
  }

  return payload;
}

export function buildMinimalCreateProfilePayload(
  legacyAgent: LegacyAgent
): CreateAgentProfilePayload {
  return {
    legacy_agent_id: legacyAgent.agent_id,
    name: stringOrNull(legacyAgent.name),
    email: stringOrNull(legacyAgent.email),
  };
}

export function splitAgentList(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean)
      .filter((item, index, items) => items.indexOf(item) === index);
  }

  if (typeof value !== "string") return [];

  return value
    .split(/[|,]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item, index, items) => items.indexOf(item) === index);
}

export function formatLocation(profile: AgentProfile) {
  const structuredLocation = [
    profile.city,
    profile.state_province,
    profile.country,
  ]
    .filter((value): value is string => Boolean(value))
    .join(", ");

  if (structuredLocation) {
    return structuredLocation;
  }

  return typeof profile.location === "string" && profile.location
    ? profile.location
    : null;
}
