import "server-only";

export const QUERY_SAFETY_ANALYTICS_EVENTS = [
  "agency_guard_rendered",
  "agency_guard_history_opened",
  "agency_guard_continue_selected",
  "agency_guard_cancel_selected",
  "query_round_changed",
  "reminder_created",
  "reminder_completed",
  "reminder_dismissed",
  "reminder_snoozed",
  "smart_reminder_suggestion_accepted",
  "smart_reminder_suggestion_dismissed",
] as const;

export type QuerySafetyAnalyticsEvent =
  (typeof QUERY_SAFETY_ANALYTICS_EVENTS)[number];

const ALLOWED_PROPERTY_KEYS = new Set([
  "warningStatus",
  "matchMethod",
  "countBucket",
  "scope",
  "roundNumber",
  "reminderKind",
  "reminderSource",
  "daysBucket",
  "entitlementState",
  "originSurface",
  "ruleId",
]);

const ALLOWED_STRING_VALUES: Record<string, ReadonlySet<string>> = {
  warningStatus: new Set(["clear", "history", "warning", "possible_match", "unavailable"]),
  matchMethod: new Set(["canonical_id", "domain", "normalized_name", "none"]),
  scope: new Set(["same_project", "all_projects"]),
  reminderKind: new Set([
    "manual",
    "research_revisit",
    "query_check_in",
    "no_response_review",
    "requested_material_check_in",
  ]),
  reminderSource: new Set(["manual", "accepted_suggestion"]),
  entitlementState: new Set(["free", "subscribed", "unknown"]),
  originSurface: new Set([
    "agent_card",
    "agent_profile",
    "query_dashboard",
    "kanban_dialog",
    "composer",
    "home",
  ]),
  ruleId: new Set([
    "research-revisit-v1",
    "query-check-in-30-v1",
    "no-response-review-90-v1",
    "material-check-in-30-v1",
  ]),
};

function isAllowedAnalyticsProperty(
  key: string,
  value: unknown,
): value is string | number | boolean {
  if (!ALLOWED_PROPERTY_KEYS.has(key)) return false;
  if (typeof value === "boolean") return true;
  if (typeof value === "number") {
    return Number.isFinite(value) && (key !== "roundNumber" || (Number.isInteger(value) && value >= 1 && value <= 9));
  }
  if (typeof value !== "string") return false;

  const allowedValues = ALLOWED_STRING_VALUES[key];
  if (allowedValues) return allowedValues.has(value);
  return value.length <= 32 && /^[a-z0-9_+\-]+$/i.test(value);
}

export type QuerySafetyAnalyticsProperties = Record<
  string,
  string | number | boolean
>;

export function sanitizeQuerySafetyAnalyticsProperties(
  properties: Record<string, unknown>,
): QuerySafetyAnalyticsProperties {
  const sanitized: QuerySafetyAnalyticsProperties = {};

  for (const [key, value] of Object.entries(properties)) {
    if (isAllowedAnalyticsProperty(key, value)) {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

type AnalyticsSink = (
  event: QuerySafetyAnalyticsEvent,
  properties: QuerySafetyAnalyticsProperties,
) => void | Promise<void>;

export function createQuerySafetyAnalyticsAdapter(sink?: AnalyticsSink) {
  return {
    async capture(
      event: QuerySafetyAnalyticsEvent,
      properties: Record<string, unknown> = {},
    ): Promise<void> {
      if (!sink) return;
      await sink(event, sanitizeQuerySafetyAnalyticsProperties(properties));
    },
  };
}

// Product analytics is intentionally disabled until a consent and identity
// policy is connected. Callers can use this adapter safely without logging
// private reminder text or identities.
export const querySafetyAnalytics = createQuerySafetyAnalyticsAdapter();
