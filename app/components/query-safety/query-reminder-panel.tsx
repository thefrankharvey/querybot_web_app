"use client";

import { useMemo, useState } from "react";
import { BellPlus } from "lucide-react";

import {
  useQueryReminders,
  useQueryReminderSuggestionDismissals,
  type QueryReminderOriginSurface,
} from "@/app/hooks/use-query-reminders";
import { useQuerySafetyConfig } from "@/app/hooks/use-query-safety-config";
import { Alert, AlertDescription, AlertTitle } from "@/app/ui-primitives/alert";
import { Button } from "@/app/ui-primitives/button";
import { getLocalDateForInstant } from "@/app/utils/query-reminders/calendar";
import {
  QUERY_REMINDER_RULE_IDS,
  type QueryReminder,
} from "@/app/utils/query-reminders/contracts";
import {
  getQueryReminderSuggestions,
  type ReminderSuggestionLifecycle,
} from "@/app/utils/query-reminders/suggestions";

import { ReminderEditor } from "./reminder-editor";
import { ReminderList } from "./reminder-list";
import { ReminderSuggestionCard } from "./reminder-suggestion-card";
import { getBrowserTimeZone } from "./reminder-view-model";

export function QueryReminderPanel({
  agentMatchId,
  lifecycle,
  querySentOn,
  materialRequestedOn,
  liveNextActionDueOn,
  initialTimezone,
  originSurface,
}: {
  agentMatchId: string;
  lifecycle: ReminderSuggestionLifecycle;
  querySentOn?: string | null;
  materialRequestedOn?: string | null;
  liveNextActionDueOn?: string | null;
  initialTimezone?: string;
  originSurface: QueryReminderOriginSurface;
}) {
  const safetyConfig = useQuerySafetyConfig();
  const manualRemindersEnabled =
    safetyConfig.data?.features.manualReminders === true;
  const enabledRuleIds = useMemo(
    () =>
      QUERY_REMINDER_RULE_IDS.filter(
        (ruleId) =>
          safetyConfig.data?.features.suggestionRules[ruleId] === true,
      ),
    [safetyConfig.data],
  );
  const [timezone] = useState(() => initialTimezone ?? getBrowserTimeZone());
  const [evaluationInstant] = useState(() => new Date());
  const [editingReminder, setEditingReminder] = useState<QueryReminder | null>(
    null,
  );
  const [isCreating, setIsCreating] = useState(false);
  const remindersQuery = useQueryReminders({
    status: "scheduled",
    enabled: manualRemindersEnabled,
  });
  const dismissalsQuery = useQueryReminderSuggestionDismissals(agentMatchId, {
    enabled: manualRemindersEnabled && enabledRuleIds.length > 0,
  });

  const reminders = useMemo(
    () =>
      (remindersQuery.data ?? []).filter(
        (reminder) => reminder.agentMatchId === agentMatchId,
      ),
    [agentMatchId, remindersQuery.data],
  );

  const suggestions = useMemo(() => {
    if (!remindersQuery.isSuccess || !dismissalsQuery.isSuccess) return [];

    let today: string;
    try {
      today = getLocalDateForInstant(timezone, evaluationInstant);
    } catch {
      return [];
    }

    return getQueryReminderSuggestions({
      today,
      evaluatedAt: evaluationInstant.toISOString(),
      lifecycle,
      querySentOn,
      materialRequestedOn,
      liveNextActionDueOn,
      enabledRuleIds,
      scheduledKinds: reminders.map((reminder) => reminder.kind),
      dismissals: (dismissalsQuery.data ?? []).map((dismissal) => ({
        ruleId: dismissal.ruleId,
        dismissedAt: dismissal.dismissedAt,
        cooldownUntil: dismissal.cooldownUntil,
      })),
    });
  }, [
    dismissalsQuery.data,
    dismissalsQuery.isSuccess,
    enabledRuleIds,
    evaluationInstant,
    lifecycle,
    liveNextActionDueOn,
    materialRequestedOn,
    querySentOn,
    reminders,
    remindersQuery.isSuccess,
    timezone,
  ]);

  const closeEditor = () => {
    setEditingReminder(null);
    setIsCreating(false);
  };

  if (!manualRemindersEnabled) return null;

  return (
    <section
      aria-labelledby={`personal-reminders-${agentMatchId}`}
      className="grid gap-4 rounded-[1rem] border border-accent/10 bg-accent/5 p-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="grid gap-1">
          <h3
            id={`personal-reminders-${agentMatchId}`}
            className="text-sm font-semibold text-accent"
          >
            Personal reminders
          </h3>
          <p className="text-xs leading-5 text-accent/65">
            Private planning notes. These never change the live query workflow.
          </p>
        </div>
        {!isCreating && !editingReminder ? (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => setIsCreating(true)}
          >
            <BellPlus data-icon />
            Set reminder
          </Button>
        ) : null}
      </div>

      {remindersQuery.isError ? (
        <Alert variant="muted">
          <AlertTitle>Personal reminders unavailable</AlertTitle>
          <AlertDescription>
            Reminder status could not be loaded. The live query status above is
            unaffected.
          </AlertDescription>
        </Alert>
      ) : null}

      {!remindersQuery.isPending && !remindersQuery.isError ? (
        reminders.length > 0 ? (
          <ReminderList
            reminders={reminders}
            originSurface={originSurface}
            onEdit={(reminder) => {
              setIsCreating(false);
              setEditingReminder(reminder);
            }}
          />
        ) : (
          <p className="text-sm text-accent/62">No personal reminders scheduled.</p>
        )
      ) : null}

      {isCreating || editingReminder ? (
        <div className="grid gap-3 rounded-[1rem] border border-accent/12 bg-white/82 p-4">
          <h4 className="text-sm font-semibold text-accent">
            {editingReminder ? "Reschedule reminder" : "New reminder"}
          </h4>
          <ReminderEditor
            key={editingReminder?.id ?? "new-reminder"}
            agentMatchId={agentMatchId}
            reminder={editingReminder ?? undefined}
            initialTimezone={timezone}
            originSurface={originSurface}
            onCancel={closeEditor}
            onSaved={closeEditor}
          />
        </div>
      ) : null}

      {!isCreating && !editingReminder && suggestions.length > 0 ? (
        <div className="grid gap-3" aria-label="Optional reminder suggestions">
          {suggestions.map((suggestion) => (
            <ReminderSuggestionCard
              key={suggestion.ruleId}
              suggestion={suggestion}
              agentMatchId={agentMatchId}
              timezone={timezone}
              originSurface={originSurface}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
