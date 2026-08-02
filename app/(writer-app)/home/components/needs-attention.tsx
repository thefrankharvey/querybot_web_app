"use client";

import Link from "next/link";
import { useMemo } from "react";
import { BellRing, ShieldAlert } from "lucide-react";

import { useProfileContext } from "@/app/(writer-app)/context/profile-context";
import { AgencyGuardBadge } from "@/app/components/query-safety/agency-guard";
import { ReminderList } from "@/app/components/query-safety/reminder-list";
import { getNeedsAttentionReminders } from "@/app/components/query-safety/reminder-view-model";
import { useQueryReminders } from "@/app/hooks/use-query-reminders";
import { useQuerySafetyConfig } from "@/app/hooks/use-query-safety-config";
import { Alert, AlertDescription, AlertTitle } from "@/app/ui-primitives/alert";
import { Badge } from "@/app/ui-primitives/badge";
import { Button } from "@/app/ui-primitives/button";
import { getProjectDashboardHref } from "@/app/utils/project-dashboard-summary";
import { getProjectScope } from "@/app/utils/project-scope";
import { classifyAgencyQueryStage } from "@/app/utils/query-safety/agency-guard";
import {
  getDashboardAgencyGuard,
  type DashboardAgencyGuardCard,
} from "@/app/utils/query-safety/dashboard-agency-guard";

const HOME_ATTENTION_LIMIT = 4;
const HOME_SAFETY_LIMIT = 2;

export function NeedsAttention() {
  const { agentsList } = useProfileContext();
  const safetyConfig = useQuerySafetyConfig();
  const agencyHistoryEnabled =
    safetyConfig.data?.features.agencyHistory === true;
  const manualRemindersEnabled =
    safetyConfig.data?.features.manualReminders === true;
  const remindersQuery = useQueryReminders({
    status: "scheduled",
    due: "due_or_overdue",
    enabled: manualRemindersEnabled,
  });
  const draftSafetyIssues = useMemo(() => {
    if (!agencyHistoryEnabled) return [];

    const cards: DashboardAgencyGuardCard[] = (agentsList ?? []).map((agent) => {
      const scope = getProjectScope({
        projectName: agent.project_name,
        writerProjectId: agent.writer_project_id,
      });

      return {
        id: agent.id,
        index_id: agent.index_id,
        name: agent.name,
        agency_id: agent.agency_id,
        agency: agent.agency,
        agency_url: agent.agency_url,
        projectName: scope.projectName,
        writerProjectId: scope.writerProjectId,
        columnId: agent.column_name,
        query_sent_date: agent.query_sent_date,
        pages_requested_date: agent.pages_requested_date,
        rejected_date: agent.rejected_date,
        offer_date: agent.offer_date,
      };
    });

    return cards
      .filter(
        (card) =>
          Boolean(card.agency_id) &&
          classifyAgencyQueryStage({
            columnName: card.columnId,
            liveStatus: null,
            offerDate: card.offer_date,
            pagesRequestedDate: card.pages_requested_date,
            querySentDate: card.query_sent_date,
            rejectedDate: card.rejected_date,
          }) === "research",
      )
      .map((card) => ({
        card,
        guard: getDashboardAgencyGuard(card, cards),
      }))
      .filter(
        ({ guard }) =>
          guard.status === "warning" && guard.agency.confidence === "high",
      )
      .slice(0, HOME_SAFETY_LIMIT);
  }, [agencyHistoryEnabled, agentsList]);

  if (!manualRemindersEnabled && draftSafetyIssues.length === 0) return null;
  if (
    manualRemindersEnabled &&
    remindersQuery.isPending &&
    draftSafetyIssues.length === 0
  ) {
    return null;
  }

  if (
    manualRemindersEnabled &&
    remindersQuery.isError &&
    draftSafetyIssues.length === 0
  ) {
    return (
      <section className="mb-5 w-full" aria-labelledby="needs-attention-title">
        <Alert variant="muted">
          <BellRing aria-hidden="true" />
          <AlertTitle id="needs-attention-title">
            Needs attention unavailable
          </AlertTitle>
          <AlertDescription>
            Personal reminders could not be loaded. Try refreshing in a moment.
          </AlertDescription>
        </Alert>
      </section>
    );
  }

  const reminders = getNeedsAttentionReminders(remindersQuery.data ?? [], {
    limit: Math.max(0, HOME_ATTENTION_LIMIT - draftSafetyIssues.length),
  });

  if (reminders.length === 0 && draftSafetyIssues.length === 0) return null;
  const attentionCount = reminders.length + draftSafetyIssues.length;

  return (
    <section
      className="mb-5 grid w-full gap-3 rounded-[1.25rem] border border-accent/10 bg-accent/5 p-4 sm:p-5"
      aria-labelledby="needs-attention-title"
    >
      <div className="flex flex-wrap items-center gap-2">
        <BellRing aria-hidden="true" className="size-5 text-accent" />
        <h2 id="needs-attention-title" className="font-serif text-xl text-accent">
          Needs attention
        </h2>
        <Badge variant="secondary">
          {attentionCount} {attentionCount === 1 ? "item" : "items"}
        </Badge>
      </div>
      <p className="text-sm leading-6 text-accent/68">
        Due reminders and high-confidence agency conflicts on saved draft queries.
      </p>
      {draftSafetyIssues.length > 0 ? (
        <ul className="grid gap-2" aria-label="Draft query safety issues">
          {draftSafetyIssues.map(({ card, guard }) => (
            <li
              className="flex flex-col gap-3 rounded-[1rem] border border-destructive/18 bg-white/82 p-4 sm:flex-row sm:items-center sm:justify-between"
              key={card.id}
            >
              <div className="min-w-0">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <ShieldAlert aria-hidden="true" className="size-4 text-destructive" />
                  <AgencyGuardBadge compact guard={guard} />
                </div>
                <p className="truncate text-sm font-semibold text-accent">
                  {card.name}
                </p>
                <p className="text-xs leading-5 text-accent/65">
                  WQH found another active query at this agency for {card.projectName}.
                </p>
              </div>
              <Button asChild size="sm" variant="outline">
                <Link
                  href={getProjectDashboardHref(
                    card.projectName,
                    card.writerProjectId,
                  )}
                >
                  Review
                </Link>
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
      {manualRemindersEnabled && remindersQuery.isError ? (
        <Alert variant="muted">
          <BellRing aria-hidden="true" />
          <AlertTitle>Personal reminders unavailable</AlertTitle>
          <AlertDescription>
            Draft safety issues are shown, but reminders could not be refreshed.
          </AlertDescription>
        </Alert>
      ) : manualRemindersEnabled && reminders.length > 0 ? (
        <ReminderList
          reminders={reminders}
          originSurface="home"
          maxItems={HOME_ATTENTION_LIMIT}
          compactActions
        />
      ) : null}
    </section>
  );
}
