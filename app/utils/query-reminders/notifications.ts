import type { QueryReminderKind } from "@/app/utils/query-reminders/contracts";
import { isValidLocalDate } from "@/app/utils/query-reminders/calendar";

export type DueReminderNotificationInput = {
  reminderId: string;
  userId: string;
  kind: QueryReminderKind;
  dueOn: string;
  occurredAt: string;
};

export type DueReminderNotificationInsert = {
  user_id: string;
  kind: "query_reminder_due";
  source_event_id: string;
  query_reminder_id: string;
  event_type: null;
  occurred_at: string;
  title: string;
  summary: string;
  target_href: string;
};

export function getDueReminderNotificationSourceEventId(
  reminderId: string,
  dueOn: string,
): string {
  const normalizedReminderId = reminderId.trim();
  if (!normalizedReminderId || !isValidLocalDate(dueOn)) {
    throw new RangeError("A reminder ID and valid due date are required");
  }

  return `reminder:${normalizedReminderId}:due:${dueOn}`;
}

export function getDueReminderNotificationCopy(kind: QueryReminderKind): {
  title: string;
  summary: string;
} {
  const summaries: Record<QueryReminderKind, string> = {
    manual: "A personal query reminder is ready for review.",
    research_revisit: "It is time to revisit your saved-agent research.",
    query_check_in:
      "Review the agency guidelines before deciding whether to check in.",
    no_response_review:
      "Review this outstanding query and decide how you want to track it.",
    requested_material_check_in:
      "Review the material request and agency guidelines before taking action.",
  };

  return {
    title: "Query reminder due",
    summary: summaries[kind],
  };
}

export function createDueReminderNotification(
  input: DueReminderNotificationInput,
): DueReminderNotificationInsert {
  const copy = getDueReminderNotificationCopy(input.kind);

  return {
    user_id: input.userId,
    kind: "query_reminder_due",
    source_event_id: getDueReminderNotificationSourceEventId(
      input.reminderId,
      input.dueOn,
    ),
    query_reminder_id: input.reminderId,
    event_type: null,
    occurred_at: input.occurredAt,
    title: copy.title,
    summary: copy.summary,
    target_href: "/query-dashboard",
  };
}
