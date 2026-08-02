"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/app/ui-primitives/dialog";
import { Switch } from "@/app/ui-primitives/switch";
import type { ColumnData } from "./kanban-column";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/ui-primitives/select";
import CopyToClipboard from "@/app/components/copy-to-clipboard";
import { formatEmail } from "@/app/utils";
import type { KanbanCardData } from "./kanban-card";
import {
  FIT_RATING_CONFIG,
  type FitRating,
} from "@/app/components/fit-rating-badge";
import { KanbanNotes } from "./kanban-notes";
import { KanbanDialogTools } from "./kanban-dialog-tools";
import { KanbanLinkButtons } from "./kanban-link-buttons";
import { Circle, CircleCheckBigIcon, X } from "lucide-react";
import { DEFAULT_PROJECT_NAME } from "@/app/constants";
import { QueryProgressSummary } from "@/app/components/messages/query-lifecycle";
import { QueryRoundSelect } from "./query-round-control";
import type { QueryRoundSelection } from "@/app/utils/query-rounds";
import { QueryReminderPanel } from "@/app/components/query-safety/query-reminder-panel";
import { LiveNextAction } from "@/app/components/query-safety/live-next-action";
import { getBrowserTimeZone } from "@/app/components/query-safety/reminder-view-model";
import {
  getLocalDateForInstant,
  isValidLocalDate,
} from "@/app/utils/query-reminders/calendar";
import type { ReminderSuggestionLifecycle } from "@/app/utils/query-reminders/suggestions";
import { AgencyGuardDetails } from "@/app/components/query-safety/agency-guard";
import {
  AgencyGuardClientError,
  useAgencyGuard,
} from "@/app/hooks/use-agency-guard";
import { Alert, AlertDescription, AlertTitle } from "@/app/ui-primitives/alert";
import { Spinner } from "@/app/ui-primitives/spinner";
import { captureQuerySafetyEvent } from "@/app/utils/query-safety/product-analytics.client";
import { useQuerySafetyConfig } from "@/app/hooks/use-query-safety-config";
import { AgentWatchButton } from "@/app/components/personalized-radar/agent-watch-button";

const DAY_MS = 24 * 60 * 60 * 1000;

function parseDateOnly(value: string): Date | null {
  const datePart = value.split("T")[0];
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(year, month - 1, day);

  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  return parsed;
}

function getCalendarDayDiffFromToday(date: Date): number {
  const today = new Date();
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const targetStart = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const diffDays = Math.floor(
    (todayStart.getTime() - targetStart.getTime()) / DAY_MS,
  );
  return Math.max(0, diffDays);
}

function formatAsMMDDYYYY(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}

function getReminderLifecycle(card: KanbanCardData): ReminderSuggestionLifecycle {
  if (
    card.queryProgress?.isTerminal ||
    card.columnId === "rejected" ||
    card.columnId === "closed-no-response" ||
    card.columnId === "offer-made"
  ) {
    return "terminal";
  }

  if (card.columnId === "pages-requested") return "active_material";
  if (card.columnId === "submitted-query" || card.queryProgress) {
    return "active_query";
  }
  return "research";
}

function getReminderCalendarDate(
  value: string | null | undefined,
  timezone: string,
): string | null {
  if (!value) return null;
  if (isValidLocalDate(value)) return value;

  const instant = new Date(value);
  if (Number.isNaN(instant.getTime())) return null;

  try {
    return getLocalDateForInstant(timezone, instant);
  } catch {
    return null;
  }
}

interface KanbanDialogProps {
  card: KanbanCardData | null;
  columns: readonly ColumnData[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTogglePrepQuery: (cardId: string) => void;
  onFitRatingChange: (cardId: string, rating: FitRating) => void;
  onQueryRoundChange: (
    cardId: string,
    selection: QueryRoundSelection,
  ) => void;
  onNotesSave: (cardId: string, notes: string) => void;
  onMoveCard: (cardId: string, columnId: string) => void;
  tourModalActive?: boolean;
}

export function KanbanDialog({
  card,
  columns,
  open,
  onOpenChange,
  onTogglePrepQuery,
  onFitRatingChange,
  onQueryRoundChange,
  onNotesSave,
  onMoveCard,
  tourModalActive = false,
}: KanbanDialogProps) {
  const [notes, setNotes] = useState("");
  const safetyConfig = useQuerySafetyConfig();
  const agencyHistoryEnabled =
    safetyConfig.data?.features.agencyHistory === true;
  const queryRoundsEnabled =
    safetyConfig.data?.features.queryRounds === true;
  const agencyGuardQuery = useAgencyGuard(
    { candidateRecordId: card?.id, includeAllProjects: true },
    { enabled: agencyHistoryEnabled && open && Boolean(card?.id) },
  );

  useEffect(() => {
    if (!open || !card) return;
    setNotes(card.notes ?? "");
  }, [card, open]);

  useEffect(() => {
    const guard = agencyGuardQuery.data;
    if (!open || !guard) return;
    const count = guard.records.length;

    captureQuerySafetyEvent("agency_guard_rendered", {
      countBucket: count === 0 ? "0" : count === 1 ? "1" : count < 5 ? "2_4" : "5_plus",
      matchMethod: guard.agency.matchMethod,
      originSurface: "kanban_dialog",
      scope: "all_projects",
      warningStatus: guard.status,
    });
  }, [agencyGuardQuery.data, open]);

  if (!card) return null;

  const emails = formatEmail(card.email);
  const isTimingColumn =
    card.trackingMode !== "live" &&
    !card.lifecycleSyncUnavailable &&
    (card.columnId === "submitted-query" ||
      card.columnId === "pages-requested");
  const parsedUpdatedDate =
    isTimingColumn && card.updated_date
      ? parseDateOnly(card.updated_date)
      : null;
  const timingPrefix =
    card.columnId === "submitted-query"
      ? "Submitted Query"
      : card.columnId === "pages-requested"
        ? "Pages Requested"
        : null;
  const timingLabel =
    parsedUpdatedDate && timingPrefix
      ? (() => {
          const daysAgo = getCalendarDayDiffFromToday(parsedUpdatedDate);
          return daysAgo === 0
            ? `${timingPrefix} Today`
            : `${timingPrefix} ${daysAgo} ${daysAgo === 1 ? "Day" : "Days"} ago`;
        })()
      : null;
  const timingDate = parsedUpdatedDate
    ? formatAsMMDDYYYY(parsedUpdatedDate)
    : null;
  const reminderTimezone = getBrowserTimeZone();
  const reminderLifecycle = getReminderLifecycle(card);
  const querySentOn = getReminderCalendarDate(
    card.queryProgress?.sentAt ?? card.query_sent_date ?? card.updated_date,
    reminderTimezone,
  );
  const materialRequestedOn = getReminderCalendarDate(
    card.pages_requested_date ??
      (card.columnId === "pages-requested"
        ? card.queryProgress?.changedAt ?? card.updated_date
        : null),
    reminderTimezone,
  );
  const liveNextActionDueOn = getReminderCalendarDate(
    card.queryProgress?.nextAction?.dueAt,
    reminderTimezone,
  );

  const handleSaveNotes = () => {
    onNotesSave(card.id, notes);
  };

  const handleCancelNotes = () => {
    setNotes(card.notes ?? "");
  };

  const handleCloseDialog = () => {
    onOpenChange(false);
  };

  return (
    <Dialog modal={!tourModalActive} open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[85vh] overflow-y-auto sm:max-w-xl overflow-x-hidden bg-white max-sm:w-[calc(100vw-16px)] max-sm:max-w-none max-sm:rounded-lg gap-6"
      >
        <div className="flex justify-between items-center mb-2">
          <KanbanDialogTools
            card={card}
            currentColumnId={card.columnId}
            columns={columns}
            onMoveCard={onMoveCard}
            onOpenChange={onOpenChange}
          />
          <button
            type="button"
            onClick={handleCloseDialog}
            aria-label="Close dialog"
            className="hover:bg-accent/20 rounded-sm p-1"
          >
            <X className="size-6" />
            <span className="sr-only">Close</span>
          </button>
        </div>
        <div className="mt-[-16px]">
          <div className="flex md:flex-row flex-col gap-6 justify-between mt-0">
            <div className="flex flex-col gap-1">
              <DialogTitle className="text-xl capitalize">
                {card.name}
              </DialogTitle>
              <DialogDescription className="text-sm">
                {card.agency}
              </DialogDescription>
            </div>
            <AgentWatchButton
              agentName={card.name}
              identity={{ agentProfileId: null, indexId: card.index_id ?? null }}
              originAgentMatchId={card.id}
              originSurface="kanban_dialog"
            />
            {/* Match Score Section */}
            {/* {card.match_score != null && (
              <div className="flex flex-col md:items-end items-start gap-1">
                <label className="text-sm font-semibold text-gray-700">
                  Match Score
                </label>
                <div className="flex items-center gap-2">
                  <StarRating rateNum={card.match_score} />
                  <span className="text-sm font-medium text-gray-600">
                    {card.match_score}
                  </span>
                </div>
              </div>
            )} */}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:gap-8 gap-4">
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700">
                Preferred Contact Method
              </label>
              <span className="text-sm text-gray-600">Query via email</span>
            </div>
            {timingLabel && timingDate && (
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700">
                  {timingLabel}
                </label>
                <span className="text-sm text-gray-600">{timingDate}</span>
              </div>
            )}
          </div>
          {/* Email */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-700">Email</label>
            {emails && emails.length > 0 && (
              <div className="flex flex-col gap-1">
                <div className="flex flex-wrap gap-2">
                  {emails.map((email, index) => (
                    <CopyToClipboard
                      key={index}
                      text={email}
                      className="text-sm underline"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <KanbanLinkButtons card={card} />

        {agencyHistoryEnabled ? (
          <section
            aria-labelledby={`agency-history-${card.id}`}
            className="flex flex-col gap-3"
          >
          <div>
            <h3
              className="text-sm font-semibold text-accent"
              id={`agency-history-${card.id}`}
            >
              Agency query history
            </h3>
            <p className="text-sm text-accent/68">
              Review same-agency query activity before deciding what to do next.
            </p>
          </div>
          {agencyGuardQuery.isLoading ? (
            <div className="flex items-center gap-2 text-sm text-accent/68" role="status">
              <Spinner className="size-4" />
              Checking agency history…
            </div>
          ) : agencyGuardQuery.data ? (
            <AgencyGuardDetails guard={agencyGuardQuery.data} showClear />
          ) : agencyGuardQuery.error instanceof AgencyGuardClientError &&
            agencyGuardQuery.error.code === "FEATURE_DISABLED" ? null : (
            <Alert role="status" variant="muted">
              <AlertTitle>Agency history unavailable</AlertTitle>
              <AlertDescription>
                WQH could not refresh agency history. Your saved query details remain unchanged.
              </AlertDescription>
            </Alert>
          )}
          </section>
        ) : null}

        {card.trackingMode === "live" ? (
          <section
            aria-labelledby={`live-query-${card.id}`}
            className="rounded-[1rem] border border-accent/10 bg-accent/5 p-4"
          >
            <h3
              className="mb-3 text-sm font-semibold text-accent"
              id={`live-query-${card.id}`}
            >
              Live query progress
            </h3>
            <QueryProgressSummary
              progress={card.queryProgress}
              viewerRole="writer"
            />
            <div className="mt-3">
              <LiveNextAction nextAction={card.queryProgress?.nextAction} />
            </div>
          </section>
        ) : null}

        <QueryReminderPanel
          agentMatchId={card.id}
          lifecycle={reminderLifecycle}
          querySentOn={querySentOn}
          materialRequestedOn={materialRequestedOn}
          liveNextActionDueOn={liveNextActionDueOn}
          initialTimezone={reminderTimezone}
          originSurface="kanban_dialog"
        />

        <div className="flex flex-col gap-6">
          <div className="flex md:flex-row flex-col gap-4">
            <div
              className="flex flex-col gap-1"
              data-tour-target="query-dashboard-modal-fit-rating"
            >
              <label className="text-sm font-semibold text-gray-700">
                Fit Rating
              </label>
              <Select
                value={card.fitRating}
                onValueChange={(value: FitRating) =>
                  onFitRatingChange(card.id, value)
                }
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(FIT_RATING_CONFIG) as FitRating[]).map(
                    (key) => (
                      <SelectItem key={key} value={key}>
                        <span className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: FIT_RATING_CONFIG[key].color,
                            }}
                          />
                          {FIT_RATING_CONFIG[key].label}
                        </span>
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
            <div
              className="flex flex-col gap-1"
              data-tour-target="query-dashboard-modal-project-name"
            >
              <label className="text-sm font-semibold text-gray-700">
                Project Name
              </label>
              <span className="text-sm text-gray-600">
                {card.projectName?.trim() || DEFAULT_PROJECT_NAME}
              </span>
            </div>
            {queryRoundsEnabled ? (
              <div className="flex min-w-0 flex-col gap-1">
              <label
                className="text-sm font-semibold text-gray-700"
                htmlFor={`query-round-${card.id}`}
              >
                Query Round
              </label>
              <QueryRoundSelect
                className="md:w-[180px]"
                id={`query-round-${card.id}`}
                onValueChange={(selection) =>
                  onQueryRoundChange(card.id, selection)
                }
                queryOnHold={card.queryOnHold}
                queryRound={card.queryRound}
              />
              <p className="text-xs text-gray-500">
                Separate from the agent&apos;s fit rating.
              </p>
              </div>
            ) : null}
          </div>

          {/* Query Letter Ready Checkbox */}
          <div
            className="flex flex-col gap-2"
            data-tour-target="query-dashboard-modal-query-letter-toggle"
          >
            <div className="flex gap-2">
              <label className="text-sm font-medium cursor-pointer">
                Query Letter Ready
              </label>
              {card.prepQueryLetterDone ? (
                <CircleCheckBigIcon className="w-5 h-5 text-accent" />
              ) : (
                <Circle className="w-5 h-5 text-accent" />
              )}
            </div>
            <Switch
              checked={card.prepQueryLetterDone}
              onCheckedChange={() => onTogglePrepQuery(card.id)}
            />
          </div>
        </div>
        {/* Notes Section */}
        <KanbanNotes
          notes={notes}
          setNotes={setNotes}
          saveNotes={handleSaveNotes}
          cancelNotes={handleCancelNotes}
        />
      </DialogContent>
    </Dialog>
  );
}

export default KanbanDialog;
