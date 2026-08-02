"use client";

import { Pencil } from "lucide-react";

import type { QueryReminderOriginSurface } from "@/app/hooks/use-query-reminders";
import { Button } from "@/app/ui-primitives/button";
import type { QueryReminder } from "@/app/utils/query-reminders/contracts";

import { NextReminderBadge } from "./reminder-badge";
import { ReminderActions } from "./reminder-actions";
import { QUERY_REMINDER_KIND_LABELS } from "./reminder-view-model";

export function ReminderList({
  reminders,
  originSurface,
  maxItems = 5,
  showActions = true,
  compactActions = false,
  onEdit,
}: {
  reminders: QueryReminder[];
  originSurface: QueryReminderOriginSurface;
  maxItems?: number;
  showActions?: boolean;
  compactActions?: boolean;
  onEdit?: (reminder: QueryReminder) => void;
}) {
  const visibleReminders = reminders.slice(0, Math.max(0, maxItems));

  if (visibleReminders.length === 0) return null;

  return (
    <ul className="grid gap-3" aria-label="Personal reminders">
      {visibleReminders.map((reminder) => (
        <li
          key={reminder.id}
          className="grid gap-3 rounded-[1rem] border border-accent/10 bg-white/74 p-4"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="grid min-w-0 gap-1">
              <p className="text-sm font-semibold text-accent">
                {QUERY_REMINDER_KIND_LABELS[reminder.kind]}
              </p>
              {reminder.note ? (
                <p className="line-clamp-2 text-sm leading-6 text-accent/68">
                  {reminder.note}
                </p>
              ) : null}
            </div>
            <NextReminderBadge reminder={reminder} />
          </div>
          {showActions ? (
            <div className="flex flex-wrap items-start gap-2">
              <ReminderActions
                reminder={reminder}
                originSurface={originSurface}
                compact={compactActions}
              />
              {onEdit ? (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => onEdit(reminder)}
                >
                  <Pencil data-icon />
                  Reschedule
                </Button>
              ) : null}
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
