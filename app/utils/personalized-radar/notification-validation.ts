export class NotificationValidationError extends Error {
  readonly code = "NOTIFICATION_INVALID_REQUEST";
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function isNotificationUuid(value: string) {
  return UUID_PATTERN.test(value);
}

export function parseNotificationListFilters(searchParams: URLSearchParams): {
  status: "all" | "unread";
  cursor: string | null;
  limit: number;
} {
  const status = searchParams.get("status")?.trim() || "all";
  if (status !== "all" && status !== "unread") {
    throw new NotificationValidationError("status is not supported");
  }
  const rawLimit = searchParams.get("limit") ?? "20";
  const limit = Number(rawLimit);
  if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
    throw new NotificationValidationError("limit must be between 1 and 50");
  }
  const cursor = searchParams.get("cursor")?.trim() || null;
  if (cursor && cursor.length > 1_000) {
    throw new NotificationValidationError("cursor is invalid");
  }
  return { status, cursor, limit };
}

export function parseNotificationAction(value: unknown): {
  action: "read" | "unread" | "archive";
} {
  if (!isRecord(value) || Object.keys(value).some((key) => key !== "action")) {
    throw new NotificationValidationError("Request body must contain only action");
  }
  if (value.action !== "read" && value.action !== "unread" && value.action !== "archive") {
    throw new NotificationValidationError("action is not supported");
  }
  return { action: value.action };
}

export function parseMarkAllReadInput(value: unknown): { before: string } {
  if (!isRecord(value) || Object.keys(value).some((key) => key !== "before")) {
    throw new NotificationValidationError("Request body must contain only before");
  }
  if (typeof value.before !== "string" || Number.isNaN(Date.parse(value.before))) {
    throw new NotificationValidationError("before must be an ISO-8601 timestamp");
  }
  return { before: new Date(value.before).toISOString() };
}

