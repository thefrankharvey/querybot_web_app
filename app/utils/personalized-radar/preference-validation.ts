import type { NotificationPreferences } from "@/app/utils/personalized-radar/preferences";

export class PreferenceValidationError extends Error {
  readonly code = "NOTIFICATION_PREFERENCE_INVALID_REQUEST";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function validTimezone(value: string) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value }).format();
    return true;
  } catch {
    return false;
  }
}

export function parseNotificationPreferencePatch(value: unknown): NotificationPreferences {
  if (!isRecord(value)) {
    throw new PreferenceValidationError("Request body must be a JSON object");
  }
  const allowed = [
    "timezone",
    "digestFrequency",
    "digestHourLocal",
    "emailEnabled",
    "watchInAppEnabled",
    "reminderInAppEnabled",
  ];
  const unknown = Object.keys(value).find((key) => !allowed.includes(key));
  if (unknown) throw new PreferenceValidationError(`Unknown request field: ${unknown}`);
  if (typeof value.timezone !== "string" || !validTimezone(value.timezone.trim())) {
    throw new PreferenceValidationError("timezone must be a valid IANA timezone");
  }
  if (value.digestFrequency !== "off" && value.digestFrequency !== "daily") {
    throw new PreferenceValidationError("digestFrequency is not supported");
  }
  if (![7, 8, 9, 10].includes(Number(value.digestHourLocal))) {
    throw new PreferenceValidationError("digestHourLocal is not supported");
  }
  const emailEnabled = value.emailEnabled;
  const watchInAppEnabled = value.watchInAppEnabled;
  const reminderInAppEnabled = value.reminderInAppEnabled;
  if (typeof emailEnabled !== "boolean") {
    throw new PreferenceValidationError("emailEnabled must be a boolean");
  }
  if (typeof watchInAppEnabled !== "boolean") {
    throw new PreferenceValidationError("watchInAppEnabled must be a boolean");
  }
  if (typeof reminderInAppEnabled !== "boolean") {
    throw new PreferenceValidationError("reminderInAppEnabled must be a boolean");
  }
  return {
    timezone: value.timezone.trim(),
    digestFrequency: value.digestFrequency,
    digestHourLocal: Number(value.digestHourLocal),
    emailEnabled,
    watchInAppEnabled,
    reminderInAppEnabled,
    emailUnsubscribedAt: null,
    updatedAt: null,
  };
}
