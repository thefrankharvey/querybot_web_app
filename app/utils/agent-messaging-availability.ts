type AgentMessagingProfile = {
  profile_id?: unknown;
  user_id?: unknown;
  is_active?: unknown;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function normalizeAgentMessagingId(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return typeof value === "string" ? value.trim() : "";
}

export function normalizeAgentMessagingIds(values: readonly unknown[]) {
  return Array.from(
    new Set(values.map(normalizeAgentMessagingId).filter(Boolean)),
  ).sort();
}

function isUuid(value: unknown) {
  return UUID_PATTERN.test(normalizeAgentMessagingId(value));
}

export function isAgentMessagingProfileAvailable(
  profile: AgentMessagingProfile | null | undefined,
) {
  return Boolean(
    profile?.is_active === true &&
      isUuid(profile.profile_id) &&
      isUuid(profile.user_id),
  );
}
