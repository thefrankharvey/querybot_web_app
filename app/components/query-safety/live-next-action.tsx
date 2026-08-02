import { Radio } from "lucide-react";

import { LocalDateTime } from "@/app/components/messages/local-date-time";
import { Badge } from "@/app/ui-primitives/badge";
import type { QueryNextAction } from "@/app/utils/message-types";

export function LiveNextAction({
  nextAction,
}: {
  nextAction: QueryNextAction | null | undefined;
}) {
  if (!nextAction) return null;

  const ownerLabel =
    nextAction.owner === "writer"
      ? "Your action"
      : nextAction.owner === "agent"
        ? "Waiting on the agent"
        : "Next action";

  return (
    <section
      aria-label="Live next action"
      className="grid gap-2 rounded-[1rem] border border-accent/14 bg-white/78 p-4"
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">
          <Radio aria-hidden="true" />
          Live next action
        </Badge>
        <span className="text-xs font-semibold text-accent/58">
          Synced from Messages · canonical workflow state
        </span>
      </div>
      <p className="text-sm font-semibold text-accent">{ownerLabel}</p>
      {nextAction.dueAt ? (
        <p className="text-sm text-accent/68">
          {nextAction.overdueAtFetch ? "Overdue" : "Due"}{" "}
          <LocalDateTime value={nextAction.dueAt} />
        </p>
      ) : (
        <p className="text-sm text-accent/68">No date is set.</p>
      )}
    </section>
  );
}
