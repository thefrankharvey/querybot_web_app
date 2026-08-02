import {
  RADAR_EVENT_TYPES,
  RADAR_ORIGIN_SURFACES,
  RADAR_WATCH_STATUSES,
  getAgentIdentityKey,
  type AgentIdentityKey,
  type RadarEventType,
  type RadarOriginSurface,
  type RadarWatchCapabilities,
  type RadarWatchStatus,
  type WatchLookupRequestKey,
} from "@/app/utils/personalized-radar/contracts";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SAFE_ID_PATTERN = /^[A-Za-z0-9:_-]{1,200}$/;

export class RadarValidationError extends Error {
  readonly code = "RADAR_INVALID_REQUEST";
}

export class RadarEntitlementError extends Error {
  readonly code = "RADAR_ENTITLEMENT_REQUIRED";
}

export type CreateAgentWatchInput = AgentIdentityKey & {
  originAgentMatchId: string | null;
  originSurface: RadarOriginSurface;
  eventTypes: RadarEventType[];
  inAppEnabled: boolean;
  emailDigestEnabled: boolean;
};

export type UpdateAgentWatchInput =
  | { action: "mute" }
  | { action: "unmute" }
  | {
      action: "update";
      eventTypes: RadarEventType[];
      inAppEnabled: boolean;
      emailDigestEnabled: boolean;
    };

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function assertAllowedKeys(
  value: Record<string, unknown>,
  allowed: readonly string[],
) {
  const unknown = Object.keys(value).find((key) => !allowed.includes(key));
  if (unknown) {
    throw new RadarValidationError(`Unknown request field: ${unknown}`);
  }
}

function optionalSafeId(value: unknown, field: string): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string" || !SAFE_ID_PATTERN.test(value.trim())) {
    throw new RadarValidationError(`${field} is invalid`);
  }
  return value.trim();
}

function optionalUuid(value: unknown, field: string): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string" || !UUID_PATTERN.test(value.trim())) {
    throw new RadarValidationError(`${field} must be a UUID`);
  }
  return value.trim().toLowerCase();
}

export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

function requiredBoolean(
  value: unknown,
  field: string,
  defaultValue?: boolean,
): boolean {
  if (value === undefined && defaultValue !== undefined) return defaultValue;
  if (typeof value !== "boolean") {
    throw new RadarValidationError(`${field} must be a boolean`);
  }
  return value;
}

function eventTypes(value: unknown): RadarEventType[] {
  const source = value === undefined ? ["submission_reopened"] : value;
  if (!Array.isArray(source) || source.length === 0) {
    throw new RadarValidationError("eventTypes must be a non-empty array");
  }
  const result: RadarEventType[] = [];
  for (const item of source) {
    if (
      typeof item !== "string" ||
      !RADAR_EVENT_TYPES.includes(item as RadarEventType)
    ) {
      throw new RadarValidationError("eventTypes contains an unsupported category");
    }
    if (!result.includes(item as RadarEventType)) {
      result.push(item as RadarEventType);
    }
  }
  return result;
}

export function enforceWatchCapabilities(
  input: Pick<CreateAgentWatchInput, "eventTypes" | "emailDigestEnabled">,
  capabilities: RadarWatchCapabilities,
) {
  const unavailableType = input.eventTypes.find(
    (eventType) => !capabilities.allowedEventTypes.includes(eventType),
  );
  if (unavailableType || (input.emailDigestEnabled && !capabilities.emailDigest)) {
    throw new RadarEntitlementError(
      "This watch category or delivery channel requires a subscription",
    );
  }
}

export function parseCreateAgentWatchInput(value: unknown): CreateAgentWatchInput {
  if (!isRecord(value)) {
    throw new RadarValidationError("Request body must be a JSON object");
  }
  assertAllowedKeys(value, [
    "agentProfileId",
    "indexId",
    "originAgentMatchId",
    "originSurface",
    "eventTypes",
    "inAppEnabled",
    "emailDigestEnabled",
  ]);

  const identity = {
    agentProfileId: optionalSafeId(value.agentProfileId, "agentProfileId"),
    indexId: optionalSafeId(value.indexId, "indexId"),
  };
  if (!getAgentIdentityKey(identity)) {
    throw new RadarValidationError("agentProfileId or indexId is required");
  }
  const originSurface = value.originSurface ?? "unknown";
  if (
    typeof originSurface !== "string" ||
    !RADAR_ORIGIN_SURFACES.includes(originSurface as RadarOriginSurface)
  ) {
    throw new RadarValidationError("originSurface is not supported");
  }

  return {
    ...identity,
    originAgentMatchId: optionalUuid(
      value.originAgentMatchId,
      "originAgentMatchId",
    ),
    originSurface: originSurface as RadarOriginSurface,
    eventTypes: eventTypes(value.eventTypes),
    inAppEnabled: requiredBoolean(value.inAppEnabled, "inAppEnabled", true),
    emailDigestEnabled: requiredBoolean(
      value.emailDigestEnabled,
      "emailDigestEnabled",
      false,
    ),
  };
}

export function parseUpdateAgentWatchInput(value: unknown): UpdateAgentWatchInput {
  if (!isRecord(value) || typeof value.action !== "string") {
    throw new RadarValidationError("action is required");
  }
  if (value.action === "mute" || value.action === "unmute") {
    assertAllowedKeys(value, ["action"]);
    return { action: value.action };
  }
  if (value.action !== "update") {
    throw new RadarValidationError("action is not supported");
  }
  assertAllowedKeys(value, [
    "action",
    "eventTypes",
    "inAppEnabled",
    "emailDigestEnabled",
  ]);
  return {
    action: "update",
    eventTypes: eventTypes(value.eventTypes),
    inAppEnabled: requiredBoolean(value.inAppEnabled, "inAppEnabled"),
    emailDigestEnabled: requiredBoolean(
      value.emailDigestEnabled,
      "emailDigestEnabled",
    ),
  };
}

export function parseWatchStatusFilter(
  searchParams: URLSearchParams,
): Exclude<RadarWatchStatus, "deleted"> | "all" {
  const value = searchParams.get("status")?.trim() || "active";
  if (value === "all") return value;
  if (
    value === "deleted" ||
    !RADAR_WATCH_STATUSES.includes(value as RadarWatchStatus)
  ) {
    throw new RadarValidationError("status is not supported");
  }
  return value as Exclude<RadarWatchStatus, "deleted">;
}

export function parseWatchLookupInput(value: unknown): WatchLookupRequestKey[] {
  if (!isRecord(value)) {
    throw new RadarValidationError("Request body must be a JSON object");
  }
  assertAllowedKeys(value, ["agentKeys"]);
  if (!Array.isArray(value.agentKeys) || value.agentKeys.length === 0) {
    throw new RadarValidationError("agentKeys must be a non-empty array");
  }
  if (value.agentKeys.length > 100) {
    throw new RadarValidationError("agentKeys may contain at most 100 entries");
  }

  const seen = new Set<string>();
  const result: WatchLookupRequestKey[] = [];
  for (const rawIdentity of value.agentKeys) {
    if (!isRecord(rawIdentity)) {
      throw new RadarValidationError("Each agent key must be an object");
    }
    assertAllowedKeys(rawIdentity, ["agentProfileId", "indexId"]);
    const identity = {
      agentProfileId: optionalSafeId(
        rawIdentity.agentProfileId,
        "agentProfileId",
      ),
      indexId: optionalSafeId(rawIdentity.indexId, "indexId"),
    };
    const key = getAgentIdentityKey(identity);
    if (!key) {
      throw new RadarValidationError(
        "Each agent key needs agentProfileId or indexId",
      );
    }
    if (!seen.has(key)) {
      seen.add(key);
      result.push({ ...identity, key });
    }
  }
  return result;
}
