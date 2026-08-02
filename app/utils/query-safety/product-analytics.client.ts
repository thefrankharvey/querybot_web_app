"use client";

import posthog from "posthog-js";

export type QuerySafetyClientEvent =
  | "agency_guard_rendered"
  | "agency_guard_history_opened"
  | "agency_guard_continue_selected"
  | "agency_guard_cancel_selected"
  | "query_round_changed"
  | "reminder_created"
  | "reminder_completed"
  | "reminder_dismissed"
  | "reminder_snoozed"
  | "smart_reminder_suggestion_accepted"
  | "smart_reminder_suggestion_dismissed";

const ALLOWED_KEYS = new Set([
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

function sanitizeProperties(properties: Record<string, unknown>) {
  const sanitized: Record<string, string | number | boolean> = {};

  for (const [key, value] of Object.entries(properties)) {
    if (!ALLOWED_KEYS.has(key)) continue;
    if (
      typeof value === "boolean" ||
      (typeof value === "number" && Number.isFinite(value)) ||
      (typeof value === "string" &&
        value.length <= 48 &&
        /^[a-z0-9_+\-]+$/i.test(value))
    ) {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

export function captureQuerySafetyEvent(
  event: QuerySafetyClientEvent,
  properties: Record<string, unknown> = {},
) {
  if (typeof window === "undefined") return;
  posthog.capture(event, sanitizeProperties(properties));
}
