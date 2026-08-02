"use client";

import { useId, useState, type FormEvent, type ReactNode } from "react";

import {
  useCreateQueryReminder,
  useRescheduleQueryReminder,
  type QueryReminderOriginSurface,
} from "@/app/hooks/use-query-reminders";
import { Alert, AlertDescription, AlertTitle } from "@/app/ui-primitives/alert";
import { Button } from "@/app/ui-primitives/button";
import { Input } from "@/app/ui-primitives/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/ui-primitives/select";
import { Spinner } from "@/app/ui-primitives/spinner";
import { Textarea } from "@/app/ui-primitives/textarea";
import { cn } from "@/app/utils";
import { getLocalDateForInstant } from "@/app/utils/query-reminders/calendar";
import {
  QUERY_REMINDER_KINDS,
  type QueryReminder,
  type QueryReminderKind,
  type QueryReminderRuleId,
  type QueryReminderSource,
} from "@/app/utils/query-reminders/contracts";

import {
  getBrowserTimeZone,
  QUERY_REMINDER_KIND_LABELS,
  validateReminderEditorValues,
  type ReminderEditorErrors,
  type ReminderEditorValues,
} from "./reminder-view-model";

function ReminderFieldGroup({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("grid gap-5 sm:grid-cols-2", className)}
      {...props}
    />
  );
}

function ReminderField({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={cn("grid content-start gap-2", className)} {...props} />;
}

function ReminderFieldLabel({
  className,
  ...props
}: React.ComponentProps<"label">) {
  return (
    <label
      className={cn("text-sm font-semibold text-accent", className)}
      {...props}
    />
  );
}

function ReminderFieldDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p className={cn("text-xs leading-5 text-accent/65", className)} {...props} />
  );
}

function getInitialValues(input: {
  reminder?: QueryReminder;
  initialKind?: QueryReminderKind;
  initialDueOn?: string;
  initialTimezone?: string;
  initialNote?: string;
}): ReminderEditorValues {
  const timezone =
    input.reminder?.timezone ?? input.initialTimezone ?? getBrowserTimeZone();

  let today: string;
  try {
    today = getLocalDateForInstant(timezone);
  } catch {
    today = getLocalDateForInstant("UTC");
  }

  return {
    kind: input.reminder?.kind ?? input.initialKind ?? "manual",
    dueOn: input.reminder?.dueOn ?? input.initialDueOn ?? today,
    timezone,
    note: input.reminder?.note ?? input.initialNote ?? "",
  };
}

export type ReminderEditorProps = {
  agentMatchId: string;
  reminder?: QueryReminder;
  initialKind?: QueryReminderKind;
  initialDueOn?: string;
  initialTimezone?: string;
  initialNote?: string;
  source?: QueryReminderSource;
  suggestionRule?: QueryReminderRuleId | null;
  originSurface: QueryReminderOriginSurface;
  submitLabel?: string;
  onSaved?: (reminder: QueryReminder) => void;
  onCancel?: () => void;
  footer?: ReactNode;
};

export function ReminderEditor({
  agentMatchId,
  reminder,
  initialKind,
  initialDueOn,
  initialTimezone,
  initialNote,
  source = "manual",
  suggestionRule = null,
  originSurface,
  submitLabel,
  onSaved,
  onCancel,
  footer,
}: ReminderEditorProps) {
  const id = useId();
  const [values, setValues] = useState<ReminderEditorValues>(() =>
    getInitialValues({
      reminder,
      initialKind,
      initialDueOn,
      initialTimezone,
      initialNote,
    }),
  );
  const [errors, setErrors] = useState<ReminderEditorErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const createReminder = useCreateQueryReminder({ originSurface });
  const rescheduleReminder = useRescheduleQueryReminder();
  const isPending = createReminder.isPending || rescheduleReminder.isPending;

  const setValue = <TKey extends keyof ReminderEditorValues>(
    key: TKey,
    value: ReminderEditorValues[TKey],
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setSubmitError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateReminderEditorValues(values);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSubmitError(null);

    try {
      const savedReminder = reminder
        ? await rescheduleReminder.mutateAsync({
            reminderId: reminder.id,
            reminderKind: reminder.kind,
            dueOn: values.dueOn,
            timezone: values.timezone.trim(),
            note: values.note,
          })
        : await createReminder.mutateAsync({
            agentMatchId,
            kind: values.kind,
            dueOn: values.dueOn,
            timezone: values.timezone.trim(),
            note: values.note,
            source,
            suggestionRule,
          });

      onSaved?.(savedReminder);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "The reminder could not be saved. Your changes are still here.",
      );
    }
  };

  const kindDescriptionId = `${id}-kind-description`;
  const dueOnDescriptionId = `${id}-due-on-description`;
  const timezoneDescriptionId = `${id}-timezone-description`;
  const noteDescriptionId = `${id}-note-description`;

  return (
    <form className="grid gap-5" onSubmit={handleSubmit} noValidate>
      {submitError ? (
        <Alert variant="destructive">
          <AlertTitle>Reminder not saved</AlertTitle>
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      ) : null}

      <ReminderFieldGroup>
        <ReminderField>
          <ReminderFieldLabel id={`${id}-kind-label`}>
            Reminder type
          </ReminderFieldLabel>
          <Select
            value={values.kind}
            onValueChange={(value) =>
              setValue("kind", value as QueryReminderKind)
            }
            disabled={Boolean(reminder) || isPending}
          >
            <SelectTrigger
              className="w-full"
              aria-labelledby={`${id}-kind-label`}
              aria-describedby={kindDescriptionId}
              aria-invalid={Boolean(errors.kind)}
            >
              <SelectValue placeholder="Choose a reminder type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {QUERY_REMINDER_KINDS.map((kind) => (
                  <SelectItem key={kind} value={kind}>
                    {QUERY_REMINDER_KIND_LABELS[kind]}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <ReminderFieldDescription id={kindDescriptionId}>
            {errors.kind ??
              (reminder
                ? "The reminder type stays the same when rescheduling."
                : "Choose the reason you want to revisit this saved agent.")}
          </ReminderFieldDescription>
        </ReminderField>

        <ReminderField>
          <ReminderFieldLabel htmlFor={`${id}-due-on`}>
            Reminder date
          </ReminderFieldLabel>
          <Input
            id={`${id}-due-on`}
            type="date"
            value={values.dueOn}
            onChange={(event) => setValue("dueOn", event.target.value)}
            aria-describedby={dueOnDescriptionId}
            aria-invalid={Boolean(errors.dueOn)}
            disabled={isPending}
            required
          />
          <ReminderFieldDescription id={dueOnDescriptionId}>
            {errors.dueOn ?? "We use the calendar date in your chosen timezone."}
          </ReminderFieldDescription>
        </ReminderField>
      </ReminderFieldGroup>

      <ReminderField>
        <ReminderFieldLabel htmlFor={`${id}-timezone`}>
          Timezone
        </ReminderFieldLabel>
        <Input
          id={`${id}-timezone`}
          value={values.timezone}
          onChange={(event) => setValue("timezone", event.target.value)}
          aria-describedby={timezoneDescriptionId}
          aria-invalid={Boolean(errors.timezone)}
          autoComplete="off"
          spellCheck={false}
          disabled={isPending}
          required
        />
        <ReminderFieldDescription id={timezoneDescriptionId}>
          {errors.timezone ?? (
            <>
              Dates are interpreted in <strong>{values.timezone || "your timezone"}</strong>.
              Use an IANA timezone such as America/New_York.
            </>
          )}
        </ReminderFieldDescription>
      </ReminderField>

      <ReminderField>
        <ReminderFieldLabel htmlFor={`${id}-note`}>
          Private note <span className="font-normal">(optional)</span>
        </ReminderFieldLabel>
        <Textarea
          id={`${id}-note`}
          value={values.note}
          onChange={(event) => setValue("note", event.target.value)}
          aria-describedby={noteDescriptionId}
          aria-invalid={Boolean(errors.note)}
          maxLength={500}
          rows={4}
          disabled={isPending}
          placeholder="Add context for your future self"
        />
        <ReminderFieldDescription id={noteDescriptionId}>
          {errors.note ?? `${values.note.length} of 500 characters. Only you can see this note.`}
        </ReminderFieldDescription>
      </ReminderField>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
        {footer}
        {onCancel ? (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
        ) : null}
        <Button type="submit" disabled={isPending}>
          {isPending ? <Spinner data-icon /> : null}
          {submitLabel ?? (reminder ? "Save changes" : "Set reminder")}
        </Button>
      </div>
    </form>
  );
}
