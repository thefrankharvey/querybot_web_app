import { AlertCircle, CalendarClock } from "lucide-react";

import { Badge } from "@/app/ui-primitives/badge";
import type { QueryReminder } from "@/app/utils/query-reminders/contracts";

import {
  formatReminderDate,
  getReminderUrgency,
} from "./reminder-view-model";

export function NextReminderBadge({
  reminder,
  now,
}: {
  reminder: Pick<QueryReminder, "dueOn" | "timezone">;
  now?: Date;
}) {
  const urgency = getReminderUrgency(reminder, now);

  if (urgency === "overdue") {
    return (
      <Badge variant="destructive">
        <AlertCircle aria-hidden="true" />
        Overdue · {formatReminderDate(reminder.dueOn)}
      </Badge>
    );
  }

  if (urgency === "due") {
    return (
      <Badge>
        <CalendarClock aria-hidden="true" />
        Due today
      </Badge>
    );
  }

  return (
    <Badge variant="outline">
      <CalendarClock aria-hidden="true" />
      Next reminder · {formatReminderDate(reminder.dueOn)}
    </Badge>
  );
}
