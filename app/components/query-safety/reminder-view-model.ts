import type {
  QueryReminder,
  QueryReminderKind,
} from "@/app/utils/query-reminders/contracts";
import {
  compareLocalDates,
  getLocalDateForInstant,
  isValidLocalDate,
} from "@/app/utils/query-reminders/calendar";

export const QUERY_REMINDER_KIND_LABELS: Record<QueryReminderKind, string> = {
  manual: "Personal reminder",
  research_revisit: "Review research",
  query_check_in: "Check query status",
  no_response_review: "Review no response",
  requested_material_check_in: "Check requested material",
};

export type ReminderUrgency = "overdue" | "due" | "upcoming";

export type ReminderEditorValues = {
  kind: QueryReminderKind;
  dueOn: string;
  timezone: string;
  note: string;
};

export type ReminderEditorErrors = Partial<
  Record<keyof ReminderEditorValues, string>
>;

export function getBrowserTimeZone(fallback = "UTC"): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || fallback;
  } catch {
    return fallback;
  }
}

export function isValidTimeZone(timezone: string): boolean {
  if (!timezone.trim()) return false;

  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone }).format();
    return true;
  } catch {
    return false;
  }
}

export function validateReminderEditorValues(
  values: ReminderEditorValues,
): ReminderEditorErrors {
  const errors: ReminderEditorErrors = {};

  if (!QUERY_REMINDER_KIND_LABELS[values.kind]) {
    errors.kind = "Choose a reminder type.";
  }

  if (!isValidLocalDate(values.dueOn)) {
    errors.dueOn = "Choose a valid date.";
  }

  if (!isValidTimeZone(values.timezone)) {
    errors.timezone = "Enter a valid IANA timezone, such as America/New_York.";
  }

  if (values.note.length > 500) {
    errors.note = "Keep the note to 500 characters or fewer.";
  }

  return errors;
}

export function getReminderUrgency(
  reminder: Pick<QueryReminder, "dueOn" | "timezone">,
  now = new Date(),
): ReminderUrgency {
  const today = getLocalDateForInstant(reminder.timezone, now);
  const comparison = compareLocalDates(reminder.dueOn, today);

  if (comparison < 0) return "overdue";
  if (comparison === 0) return "due";
  return "upcoming";
}

export function getNextScheduledReminder(
  reminders: QueryReminder[],
): QueryReminder | null {
  return (
    reminders
      .filter((reminder) => reminder.status === "scheduled")
      .toSorted((left, right) => {
        const dateOrder = compareLocalDates(left.dueOn, right.dueOn);
        if (dateOrder !== 0) return dateOrder;
        return left.createdAt.localeCompare(right.createdAt);
      })[0] ?? null
  );
}

export function getNeedsAttentionReminders(
  reminders: QueryReminder[],
  options: { now?: Date; limit?: number } = {},
): QueryReminder[] {
  const now = options.now ?? new Date();
  const limit = Math.max(0, options.limit ?? 4);

  return reminders
    .filter(
      (reminder) =>
        reminder.status === "scheduled" &&
        getReminderUrgency(reminder, now) !== "upcoming",
    )
    .toSorted((left, right) => {
      const dateOrder = compareLocalDates(left.dueOn, right.dueOn);
      if (dateOrder !== 0) return dateOrder;
      return left.createdAt.localeCompare(right.createdAt);
    })
    .slice(0, limit);
}

export function formatReminderDate(
  dueOn: string,
  locale?: string,
): string {
  if (!isValidLocalDate(dueOn)) return dueOn;

  const [year, month, day] = dueOn.split("-").map(Number);
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}
