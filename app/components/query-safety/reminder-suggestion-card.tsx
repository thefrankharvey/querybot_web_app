"use client";

import { useState } from "react";
import { CalendarPlus, X } from "lucide-react";

import {
  useCreateQueryReminder,
  useDismissQueryReminderSuggestion,
  type QueryReminderOriginSurface,
} from "@/app/hooks/use-query-reminders";
import { Alert, AlertDescription, AlertTitle } from "@/app/ui-primitives/alert";
import { Badge } from "@/app/ui-primitives/badge";
import { Button } from "@/app/ui-primitives/button";
import { Input } from "@/app/ui-primitives/input";
import { Spinner } from "@/app/ui-primitives/spinner";
import { isValidLocalDate } from "@/app/utils/query-reminders/calendar";
import type { QueryReminder } from "@/app/utils/query-reminders/contracts";
import type { QueryReminderSuggestion } from "@/app/utils/query-reminders/suggestions";

import {
  formatReminderDate,
  QUERY_REMINDER_KIND_LABELS,
} from "./reminder-view-model";

export function ReminderSuggestionCard({
  suggestion,
  agentMatchId,
  timezone,
  originSurface,
  onAccepted,
  onDismissed,
}: {
  suggestion: QueryReminderSuggestion;
  agentMatchId: string;
  timezone: string;
  originSurface: QueryReminderOriginSurface;
  onAccepted?: (reminder: QueryReminder) => void;
  onDismissed?: () => void;
}) {
  const [dueOn, setDueOn] = useState(suggestion.suggestedDueOn);
  const [error, setError] = useState<string | null>(null);
  const create = useCreateQueryReminder({ originSurface });
  const dismiss = useDismissQueryReminderSuggestion({ originSurface });
  const isPending = create.isPending || dismiss.isPending;

  const handleAccept = async () => {
    if (!isValidLocalDate(dueOn)) {
      setError("Choose a valid reminder date.");
      return;
    }

    setError(null);
    try {
      const reminder = await create.mutateAsync({
        agentMatchId,
        kind: suggestion.kind,
        dueOn,
        timezone,
        source: "accepted_suggestion",
        suggestionRule: suggestion.ruleId,
      });
      onAccepted?.(reminder);
    } catch (mutationError) {
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : "The suggested reminder could not be scheduled.",
      );
    }
  };

  const handleDismiss = async () => {
    setError(null);
    try {
      await dismiss.mutateAsync({ agentMatchId, ruleId: suggestion.ruleId });
      onDismissed?.();
    } catch (mutationError) {
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : "The suggestion could not be dismissed.",
      );
    }
  };

  return (
    <article className="grid gap-3 rounded-[1rem] border border-accent/10 bg-accent/5 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="grid gap-1">
          <Badge variant="secondary">Optional suggestion</Badge>
          <h4 className="text-sm font-semibold text-accent">
            {QUERY_REMINDER_KIND_LABELS[suggestion.kind]}
          </h4>
        </div>
      </div>
      <p className="text-sm leading-6 text-accent/68">
        {suggestion.explanation}
      </p>
      <div className="grid gap-2 sm:max-w-xs">
        <label
          htmlFor={`suggestion-date-${suggestion.ruleId}`}
          className="text-xs font-semibold text-accent"
        >
          Suggested date
        </label>
        <Input
          id={`suggestion-date-${suggestion.ruleId}`}
          type="date"
          value={dueOn}
          onChange={(event) => {
            setDueOn(event.target.value);
            setError(null);
          }}
          aria-describedby={`suggestion-timezone-${suggestion.ruleId}`}
          disabled={isPending}
          required
        />
        {suggestion.presetDueOns.length > 1 ? (
          <div className="flex flex-wrap gap-2" aria-label="Suggested reminder dates">
            {suggestion.presetDueOns.map((presetDueOn) => (
              <Button
                key={presetDueOn}
                type="button"
                size="sm"
                variant={presetDueOn === dueOn ? "secondary" : "outline"}
                onClick={() => setDueOn(presetDueOn)}
                disabled={isPending}
              >
                {formatReminderDate(presetDueOn)}
              </Button>
            ))}
          </div>
        ) : null}
        <p
          id={`suggestion-timezone-${suggestion.ruleId}`}
          className="text-xs leading-5 text-accent/60"
        >
          Calendar dates use {timezone}.
        </p>
      </div>
      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Suggestion not updated</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          onClick={() => void handleAccept()}
          disabled={isPending}
        >
          {create.isPending ? <Spinner data-icon /> : <CalendarPlus data-icon />}
          Schedule review
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => void handleDismiss()}
          disabled={isPending}
        >
          {dismiss.isPending ? <Spinner data-icon /> : <X data-icon />}
          Not now
        </Button>
      </div>
    </article>
  );
}
