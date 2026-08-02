"use client";

import { useState } from "react";
import { CalendarClock, Check, Clock3, X } from "lucide-react";

import {
  useCancelQueryReminder,
  useCompleteQueryReminder,
  useDismissQueryReminder,
  useSnoozeQueryReminder,
  type QueryReminderOriginSurface,
} from "@/app/hooks/use-query-reminders";
import { Alert, AlertDescription, AlertTitle } from "@/app/ui-primitives/alert";
import { Button } from "@/app/ui-primitives/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/ui-primitives/dialog";
import { Input } from "@/app/ui-primitives/input";
import { Spinner } from "@/app/ui-primitives/spinner";
import {
  addCalendarDays,
  getLocalDateForInstant,
  isValidLocalDate,
} from "@/app/utils/query-reminders/calendar";
import type { QueryReminder } from "@/app/utils/query-reminders/contracts";

export function ReminderActions({
  reminder,
  originSurface,
  compact = false,
}: {
  reminder: QueryReminder;
  originSurface: QueryReminderOriginSurface;
  compact?: boolean;
}) {
  const [actionError, setActionError] = useState<string | null>(null);
  const complete = useCompleteQueryReminder({ originSurface });
  const dismiss = useDismissQueryReminder({ originSurface });
  const cancel = useCancelQueryReminder();
  const isPending = complete.isPending || dismiss.isPending || cancel.isPending;

  const runAction = async (
    action: typeof complete | typeof dismiss | typeof cancel,
  ) => {
    setActionError(null);
    try {
      await action.mutateAsync({
        reminderId: reminder.id,
        reminderKind: reminder.kind,
      });
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "The reminder could not be updated.",
      );
    }
  };

  if (reminder.status !== "scheduled") return null;

  return (
    <div className="grid gap-2">
      {actionError ? (
        <Alert variant="destructive">
          <AlertTitle>Reminder not updated</AlertTitle>
          <AlertDescription>{actionError}</AlertDescription>
        </Alert>
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          onClick={() => void runAction(complete)}
          disabled={isPending}
        >
          {complete.isPending ? <Spinner data-icon /> : <Check data-icon />}
          Complete
        </Button>
        <SnoozeReminderDialog
          reminder={reminder}
          originSurface={originSurface}
          disabled={isPending}
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => void runAction(dismiss)}
          disabled={isPending}
        >
          {dismiss.isPending ? <Spinner data-icon /> : <X data-icon />}
          Dismiss
        </Button>
        {!compact ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => void runAction(cancel)}
            disabled={isPending}
          >
            {cancel.isPending ? <Spinner data-icon /> : null}
            Cancel reminder
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function SnoozeReminderDialog({
  reminder,
  originSurface,
  disabled,
}: {
  reminder: QueryReminder;
  originSurface: QueryReminderOriginSurface;
  disabled: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [dueOn, setDueOn] = useState(() => {
    const today = getLocalDateForInstant(reminder.timezone);
    const baseDate = reminder.dueOn > today ? reminder.dueOn : today;
    return addCalendarDays(baseDate, 7);
  });
  const [error, setError] = useState<string | null>(null);
  const snooze = useSnoozeQueryReminder({ originSurface });

  const handleSnooze = async () => {
    if (!isValidLocalDate(dueOn)) {
      setError("Choose a valid date.");
      return;
    }

    setError(null);
    try {
      await snooze.mutateAsync({
        reminderId: reminder.id,
        reminderKind: reminder.kind,
        dueOn,
        timezone: reminder.timezone,
      });
      setOpen(false);
    } catch (mutationError) {
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : "The reminder could not be snoozed. Your date is still here.",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="secondary" disabled={disabled}>
          <Clock3 data-icon />
          Snooze
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Snooze reminder</DialogTitle>
          <DialogDescription>
            Pick a new date. It will still be interpreted in {reminder.timezone}.
          </DialogDescription>
        </DialogHeader>
        {error ? (
          <Alert variant="destructive">
            <AlertTitle>Reminder not snoozed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        <div className="grid gap-2">
          <label htmlFor={`snooze-${reminder.id}`} className="text-sm font-semibold text-accent">
            New reminder date
          </label>
          <Input
            id={`snooze-${reminder.id}`}
            type="date"
            value={dueOn}
            onChange={(event) => {
              setDueOn(event.target.value);
              setError(null);
            }}
            disabled={snooze.isPending}
            required
          />
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={snooze.isPending}
          >
            Keep current date
          </Button>
          <Button
            type="button"
            onClick={() => void handleSnooze()}
            disabled={snooze.isPending}
          >
            {snooze.isPending ? (
              <Spinner data-icon />
            ) : (
              <CalendarClock data-icon />
            )}
            Snooze reminder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
