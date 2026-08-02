import {
  RADAR_EVENT_TYPES,
  type AgentChangeEvent,
  type AgentChangeEventPage,
  type AgentWatch,
  type RadarEventType,
} from "@/app/utils/personalized-radar/contracts";

const SAFE_ID_PATTERN = /^[A-Za-z0-9:_-]{1,200}$/;
const EVENT_FIELD_ALLOWLIST: Record<RadarEventType, ReadonlySet<string>> = {
  submission_reopened: new Set(["open_to_queries"]),
  submission_closed: new Set(["open_to_queries"]),
  official_profile_update: new Set([
    "bio",
    "genres",
    "status",
    "submission_requirements",
    "website",
  ]),
  mswl_or_interest_update: new Set(["genres", "interests", "mswl"]),
  agency_change: new Set(["agency_id", "agency_name"]),
};

export class AgentChangeSourceContractError extends Error {}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function optionalSafeId(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string" || !SAFE_ID_PATTERN.test(value.trim())) {
    throw new AgentChangeSourceContractError("Agent identity is invalid");
  }
  return value.trim();
}

function requiredText(value: unknown, field: string, maximum: number) {
  if (typeof value !== "string") {
    throw new AgentChangeSourceContractError(`${field} is invalid`);
  }
  const normalized = " ".concat(value).trim().replace(/\s+/g, " ");
  if (!normalized || normalized.length > maximum || /<[^>]*>/.test(normalized)) {
    throw new AgentChangeSourceContractError(`${field} is invalid`);
  }
  return normalized;
}

function requiredTimestamp(value: unknown, field: string) {
  if (typeof value !== "string" || Number.isNaN(Date.parse(value))) {
    throw new AgentChangeSourceContractError(`${field} is invalid`);
  }
  return new Date(value).toISOString();
}

function validateHttpsUrl(value: unknown) {
  if (typeof value !== "string" || value.length > 1_000) {
    throw new AgentChangeSourceContractError("source_url is invalid");
  }
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new AgentChangeSourceContractError("source_url is invalid");
  }
  if (url.protocol !== "https:" || url.username || url.password) {
    throw new AgentChangeSourceContractError("source_url is invalid");
  }
  return url.toString();
}

function parseChangedValue(value: unknown, field: string): unknown {
  if (value === null || typeof value === "boolean") return value;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") return requiredText(value, field, 500);
  if (
    Array.isArray(value) &&
    value.length <= 50 &&
    value.every((item) => typeof item === "string")
  ) {
    return value.map((item) => requiredText(item, `${field}[]`, 200));
  }
  throw new AgentChangeSourceContractError(`${field} is invalid`);
}

function parseTransition(
  value: Record<string, unknown>,
  declaredFields: readonly string[],
  side: "previous" | "current",
) {
  if (Object.keys(value).some((field) => !declaredFields.includes(field))) {
    throw new AgentChangeSourceContractError(`${side} contains an undeclared field`);
  }
  return Object.fromEntries(
    Object.entries(value).map(([field, changedValue]) => [
      field,
      parseChangedValue(changedValue, `${side}.${field}`),
    ]),
  );
}

export function parseAgentChangeEvent(value: unknown): AgentChangeEvent {
  if (!isRecord(value) || value.schema_version !== "agent-change-v1") {
    throw new AgentChangeSourceContractError("schema_version is not supported");
  }
  if (
    typeof value.event_type !== "string" ||
    !RADAR_EVENT_TYPES.includes(value.event_type as RadarEventType)
  ) {
    throw new AgentChangeSourceContractError("event_type is not supported");
  }
  if (!isRecord(value.agent)) {
    throw new AgentChangeSourceContractError("agent is invalid");
  }
  const agentProfileId = optionalSafeId(value.agent.profile_id);
  const indexId = optionalSafeId(value.agent.index_id);
  if (!agentProfileId && !indexId) {
    throw new AgentChangeSourceContractError("Stable agent identity is required");
  }
  if (!Array.isArray(value.changed_fields) || !value.changed_fields.length) {
    throw new AgentChangeSourceContractError("changed_fields is invalid");
  }
  if (!isRecord(value.previous) || !isRecord(value.current)) {
    throw new AgentChangeSourceContractError("Event transition is invalid");
  }

  const eventType = value.event_type as RadarEventType;
  const changedFields = value.changed_fields.map((field) =>
    requiredText(field, "changed_fields", 100),
  );
  if (
    new Set(changedFields).size !== changedFields.length ||
    changedFields.some((field) => !EVENT_FIELD_ALLOWLIST[eventType].has(field))
  ) {
    throw new AgentChangeSourceContractError("changed_fields is invalid");
  }
  const previous = parseTransition(value.previous, changedFields, "previous");
  const current = parseTransition(value.current, changedFields, "current");
  if (eventType === "submission_reopened" || eventType === "submission_closed") {
    const previousState = String(previous.open_to_queries ?? "").toLowerCase();
    const currentState = String(current.open_to_queries ?? "").toLowerCase();
    const transitionIsValid =
      eventType === "submission_reopened"
        ? ["closed", "not_open"].includes(previousState) && currentState === "open"
        : previousState === "open" && ["closed", "not_open"].includes(currentState);
    if (
      changedFields.length !== 1 ||
      changedFields[0] !== "open_to_queries" ||
      !transitionIsValid
    ) {
      throw new AgentChangeSourceContractError(
        "Submission event does not contain a verified transition",
      );
    }
  }

  const eventId = requiredText(value.event_id, "event_id", 200);
  if (!SAFE_ID_PATTERN.test(eventId)) {
    throw new AgentChangeSourceContractError("event_id is invalid");
  }

  return {
    event_id: eventId,
    schema_version: "agent-change-v1",
    event_type: eventType,
    occurred_at: requiredTimestamp(value.occurred_at, "occurred_at"),
    recorded_at: requiredTimestamp(value.recorded_at, "recorded_at"),
    agent: {
      profile_id: agentProfileId,
      index_id: indexId,
      name:
        value.agent.name == null
          ? null
          : requiredText(value.agent.name, "agent.name", 200),
      agency_id: optionalSafeId(value.agent.agency_id),
      agency_name:
        value.agent.agency_name == null
          ? null
          : requiredText(value.agent.agency_name, "agent.agency_name", 200),
    },
    headline: requiredText(value.headline, "headline", 200),
    summary: requiredText(value.summary, "summary", 500),
    source_url: validateHttpsUrl(value.source_url),
    changed_fields: changedFields,
    previous,
    current,
    supersedes_event_id: optionalSafeId(value.supersedes_event_id),
  };
}

export function parseAgentChangeEventPage(value: unknown): AgentChangeEventPage {
  if (
    !isRecord(value) ||
    value.schema_version !== "agent-change-v1" ||
    !Array.isArray(value.events) ||
    typeof value.has_more !== "boolean" ||
    (value.next_cursor !== null && typeof value.next_cursor !== "string")
  ) {
    throw new AgentChangeSourceContractError("Event page is invalid");
  }
  return {
    schema_version: "agent-change-v1",
    events: value.events.map(parseAgentChangeEvent),
    next_cursor: value.next_cursor,
    has_more: value.has_more,
  };
}

export function watchMatchesAgentChangeEvent(
  watch: AgentWatch,
  event: AgentChangeEvent,
): boolean {
  const identityMatches =
    Boolean(
      watch.agentProfileId &&
        event.agent.profile_id &&
        watch.agentProfileId === event.agent.profile_id,
    ) ||
    Boolean(
      watch.indexId && event.agent.index_id && watch.indexId === event.agent.index_id,
    );
  return identityMatches && watch.eventTypes.includes(event.event_type);
}

export function getAgentChangeEventTargetHref(eventId: string) {
  return `/dispatch?scope=watched&eventId=${encodeURIComponent(eventId)}`;
}
