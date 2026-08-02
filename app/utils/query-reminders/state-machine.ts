import type {
  QueryReminder,
  QueryReminderStatus,
} from "@/app/utils/query-reminders/contracts";

export const QUERY_REMINDER_TRANSITION_CONFLICT =
  "QUERY_REMINDER_TRANSITION_CONFLICT";

export type QueryReminderTransitionInput =
  | { action: "complete" }
  | { action: "dismiss" }
  | { action: "cancel" }
  | { action: "snooze"; dueOn: string; timezone: string }
  | {
      action: "reschedule";
      dueOn: string;
      timezone: string;
      note?: string | null;
    };

export type QueryReminderTransitionPatch = {
  status?: QueryReminderStatus;
  dueOn?: string;
  timezone?: string;
  note?: string | null;
  completedAt?: string | null;
  dismissedAt?: string | null;
  canceledAt?: string | null;
};

export class QueryReminderTransitionError extends Error {
  readonly code = QUERY_REMINDER_TRANSITION_CONFLICT;
}

function terminalPatch(
  status: Exclude<QueryReminderStatus, "scheduled">,
  occurredAt: string,
): QueryReminderTransitionPatch {
  return {
    status,
    completedAt: status === "completed" ? occurredAt : null,
    dismissedAt: status === "dismissed" ? occurredAt : null,
    canceledAt: status === "canceled" ? occurredAt : null,
  };
}

export function transitionQueryReminder(
  reminder: QueryReminder,
  input: QueryReminderTransitionInput,
  occurredAt: string = new Date().toISOString(),
): { patch: QueryReminderTransitionPatch; idempotent: boolean } {
  const targetStatusByAction = {
    complete: "completed",
    dismiss: "dismissed",
    cancel: "canceled",
  } as const;

  if (
    input.action === "complete" ||
    input.action === "dismiss" ||
    input.action === "cancel"
  ) {
    const targetStatus = targetStatusByAction[input.action];
    if (reminder.status === targetStatus) {
      return { patch: {}, idempotent: true };
    }
    if (reminder.status !== "scheduled") {
      const actionLabel = input.action === "cancel" ? "canceled" : `${input.action}d`;
      throw new QueryReminderTransitionError(
        `A ${reminder.status} reminder cannot be ${actionLabel}`,
      );
    }

    return {
      patch: terminalPatch(targetStatus, occurredAt),
      idempotent: false,
    };
  }

  if (reminder.status !== "scheduled") {
    throw new QueryReminderTransitionError(
      `A ${reminder.status} reminder cannot be ${input.action}d`,
    );
  }

  const patch: QueryReminderTransitionPatch = {
    dueOn: input.dueOn,
    timezone: input.timezone,
  };
  if (input.action === "reschedule" && "note" in input) {
    patch.note = input.note;
  }

  const idempotent =
    reminder.dueOn === patch.dueOn &&
    reminder.timezone === patch.timezone &&
    (!("note" in patch) || reminder.note === patch.note);

  return { patch: idempotent ? {} : patch, idempotent };
}
