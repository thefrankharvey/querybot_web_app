import "server-only";

import { createServerSupabase } from "@/app/api/supabase/server";
import {
  normalizeUserNotification,
  type UserNotification,
  type UserNotificationRow,
} from "@/app/utils/personalized-radar/notifications";
import {
  isNotificationUuid,
  NotificationValidationError,
} from "@/app/utils/personalized-radar/notification-validation";
import { RadarPersistenceError } from "@/app/utils/personalized-radar/repository.server";

type NotificationCursor = { createdAt: string; id: string };

function storageUnavailable() {
  return new RadarPersistenceError(
    500,
    "NOTIFICATION_STORAGE_UNAVAILABLE",
    "Notifications are temporarily unavailable",
  );
}

export function encodeNotificationCursor(cursor: NotificationCursor) {
  return Buffer.from(JSON.stringify({ v: 1, ...cursor }), "utf8").toString(
    "base64url",
  );
}

export function decodeNotificationCursor(value: string): NotificationCursor {
  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as {
      v?: unknown;
      createdAt?: unknown;
      id?: unknown;
    };
    if (
      parsed.v !== 1 ||
      typeof parsed.createdAt !== "string" ||
      Number.isNaN(Date.parse(parsed.createdAt)) ||
      typeof parsed.id !== "string" ||
      !isNotificationUuid(parsed.id)
    ) {
      throw new Error("invalid");
    }
    return {
      createdAt: new Date(parsed.createdAt).toISOString(),
      id: parsed.id.toLowerCase(),
    };
  } catch {
    throw new NotificationValidationError("cursor is invalid");
  }
}

export async function listOwnedNotifications(
  userId: string,
  filters: { status: "all" | "unread"; cursor: string | null; limit: number },
): Promise<{
  notifications: UserNotification[];
  nextCursor: string | null;
  hasMore: boolean;
  unreadCount: number;
  asOf: string;
}> {
  const supabase = createServerSupabase();
  const asOf = new Date().toISOString();
  let query = supabase
    .from("user_notifications")
    .select("*")
    .eq("user_id", userId)
    .is("archived_at", null);
  if (filters.status === "unread") query = query.is("read_at", null);
  if (filters.cursor) {
    const cursor = decodeNotificationCursor(filters.cursor);
    query = query.or(
      `created_at.lt.${cursor.createdAt},and(created_at.eq.${cursor.createdAt},id.lt.${cursor.id})`,
    );
  }

  const rowsPromise = query
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(filters.limit + 1);
  const countPromise = supabase
    .from("user_notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .is("read_at", null)
    .is("archived_at", null);
  const [rowsResult, countResult] = await Promise.all([rowsPromise, countPromise]);
  if (rowsResult.error || countResult.error) throw storageUnavailable();

  const rows = (rowsResult.data ?? []) as UserNotificationRow[];
  const hasMore = rows.length > filters.limit;
  const pageRows = rows.slice(0, filters.limit);
  const last = pageRows.at(-1);
  return {
    notifications: pageRows.map(normalizeUserNotification),
    nextCursor:
      hasMore && last
        ? encodeNotificationCursor({ createdAt: last.created_at, id: last.id })
        : null,
    hasMore,
    unreadCount: countResult.count ?? 0,
    asOf,
  };
}

export async function updateOwnedNotification(
  userId: string,
  notificationId: string,
  action: "read" | "unread" | "archive",
): Promise<UserNotification | null> {
  const now = new Date().toISOString();
  const patch =
    action === "read"
      ? { read_at: now }
      : action === "unread"
        ? { read_at: null }
        : { archived_at: now };
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("user_notifications")
    .update(patch)
    .eq("id", notificationId)
    .eq("user_id", userId)
    .is("archived_at", null)
    .select("*")
    .maybeSingle();
  if (error) throw storageUnavailable();
  return data ? normalizeUserNotification(data as UserNotificationRow) : null;
}

export async function markOwnedNotificationsRead(
  userId: string,
  before: string,
): Promise<number> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("user_notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", userId)
    .is("read_at", null)
    .is("archived_at", null)
    .lte("created_at", before)
    .select("id");
  if (error) throw storageUnavailable();
  return data?.length ?? 0;
}
