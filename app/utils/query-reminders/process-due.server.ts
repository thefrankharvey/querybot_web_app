import "server-only";

import { createServerSupabase } from "@/app/api/supabase/server";
import type {
  QueryReminderKind,
} from "@/app/utils/query-reminders/contracts";
import {
  compareLocalDates,
  getLocalDateForInstant,
} from "@/app/utils/query-reminders/calendar";
import {
  createDueReminderNotification,
  type DueReminderNotificationInsert,
} from "@/app/utils/query-reminders/notifications";

type DueProcessorReminderRow = {
  id: string;
  user_id: string;
  kind: QueryReminderKind;
  due_on: string;
  timezone: string;
};

export type DueReminderProcessorSummary = {
  scanned: number;
  eligible: number;
  inserted: number;
  duplicate: number;
  invalid: number;
};

export class DueReminderProcessorError extends Error {
  readonly status = 500;
  readonly code = "QUERY_REMINDER_PROCESSOR_FAILED";
}

export function prepareDueReminderNotifications(
  rows: readonly DueProcessorReminderRow[],
  now: Date,
): {
  notifications: DueReminderNotificationInsert[];
  invalid: number;
} {
  const occurredAt = now.toISOString();
  const notifications: DueReminderNotificationInsert[] = [];
  let invalid = 0;

  for (const row of rows) {
    try {
      const today = getLocalDateForInstant(row.timezone, now);
      if (compareLocalDates(row.due_on, today) > 0) continue;

      notifications.push(
        createDueReminderNotification({
          reminderId: row.id,
          userId: row.user_id,
          kind: row.kind,
          dueOn: row.due_on,
          occurredAt,
        }),
      );
    } catch {
      invalid += 1;
    }
  }

  return { notifications, invalid };
}

export function omitDisabledReminderNotifications(
  notifications: readonly DueReminderNotificationInsert[],
  disabledUserIds: ReadonlySet<string>,
): DueReminderNotificationInsert[] {
  return notifications.filter(
    (notification) => !disabledUserIds.has(notification.user_id),
  );
}

export async function runDueReminderProcessor(
  now: Date = new Date(),
): Promise<DueReminderProcessorSummary> {
  const supabase = createServerSupabase();
  const latestStartedLocalDate = getLocalDateForInstant(
    "Pacific/Kiritimati",
    now,
  );
  const { data, error } = await supabase
    .from("query_reminders")
    .select("id,user_id,kind,due_on,timezone")
    .eq("status", "scheduled")
    .lte("due_on", latestStartedLocalDate);

  if (error) throw new DueReminderProcessorError("Failed to read due reminders");

  const rows = (data ?? []) as DueProcessorReminderRow[];
  const prepared = prepareDueReminderNotifications(rows, now);
  if (prepared.notifications.length === 0) {
    return {
      scanned: rows.length,
      eligible: 0,
      inserted: 0,
      duplicate: 0,
      invalid: prepared.invalid,
    };
  }

  const userIds = Array.from(
    new Set(prepared.notifications.map((notification) => notification.user_id)),
  );
  const { data: disabledRows, error: preferenceError } = await supabase
    .from("user_notification_preferences")
    .select("user_id")
    .in("user_id", userIds)
    .eq("reminder_in_app_enabled", false);
  if (preferenceError) {
    throw new DueReminderProcessorError("Failed to read reminder preferences");
  }
  const notifications = omitDisabledReminderNotifications(
    prepared.notifications,
    new Set((disabledRows ?? []).map((row) => row.user_id as string)),
  );
  if (notifications.length === 0) {
    return {
      scanned: rows.length,
      eligible: 0,
      inserted: 0,
      duplicate: 0,
      invalid: prepared.invalid,
    };
  }

  const { data: insertedRows, error: insertError } = await supabase
    .from("user_notifications")
    .upsert(notifications, {
      onConflict: "user_id,kind,source_event_id",
      ignoreDuplicates: true,
    })
    .select("id");

  if (insertError) {
    throw new DueReminderProcessorError("Failed to create due notifications");
  }

  const inserted = insertedRows?.length ?? 0;
  return {
    scanned: rows.length,
    eligible: notifications.length,
    inserted,
    duplicate: Math.max(0, notifications.length - inserted),
    invalid: prepared.invalid,
  };
}
