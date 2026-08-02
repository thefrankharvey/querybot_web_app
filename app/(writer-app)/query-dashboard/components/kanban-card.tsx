"use client";

import { useMemo, type CSSProperties } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import { cn } from "@/app/utils";
import {
  AlertTriangle,
  SquarePen,
  Grip,
  Circle,
  CircleCheckBigIcon,
  FileUp,
} from "lucide-react";
import {
  FitRatingBadge,
  type FitRating,
} from "@/app/components/fit-rating-badge";
import { DEFAULT_PROJECT_NAME } from "@/app/constants";
import type { QueryProgress } from "@/app/utils/message-types";
import { QueryStatusBadge } from "@/app/components/messages/query-lifecycle";
import { getProjectMessageThreadHref } from "@/app/utils/message-routes";
import { isManuscriptUploadVisible } from "@/app/utils/manuscript-attachments";
import { Button } from "@/app/ui-primitives/button";
import { QueryRoundBadge } from "./query-round-control";
import { AgencyGuardBadge } from "@/app/components/query-safety/agency-guard";
import { useQueryDashContext } from "../context/query-dash-context";
import { getDashboardAgencyGuard } from "@/app/utils/query-safety/dashboard-agency-guard";
import { NextReminderBadge } from "@/app/components/query-safety/reminder-badge";
import {
  getNextScheduledReminder,
  getReminderUrgency,
} from "@/app/components/query-safety/reminder-view-model";
import { useQueryReminders } from "@/app/hooks/use-query-reminders";
import { useQuerySafetyConfig } from "@/app/hooks/use-query-safety-config";

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

export interface KanbanCardData {
  // From database
  id: string;
  created_at?: string;
  updated_date?: string | null;
  name: string;
  email?: string | null;
  agency?: string | null;
  agency_id?: string | null;
  index_id?: string | null;
  query_tracker?: string | null;
  pub_marketplace?: string | null;
  match_score?: number | null;
  agency_url?: string | null;
  genres_themes?: string | null;
  query_sent_date?: string | null;
  pages_requested_date?: string | null;
  rejected_date?: string | null;
  offer_date?: string | null;
  // Kanban-specific (local state)
  columnId: string;
  prepQueryLetterDone: boolean;
  fitRating: FitRating;
  queryRound: number | null;
  queryOnHold: boolean;
  projectName: string;
  writerProjectId?: string | null;
  notes: string;
  trackingMode?: "manual" | "live";
  messageThreadId?: string | null;
  queryProgress?: QueryProgress | null;
  lifecycleSyncUnavailable?: boolean;
}

interface KanbanCardProps {
  card: KanbanCardData;
  isDragOverlay?: boolean;
  /** Width for the drag overlay (e.g. "256px" or "calc(100vw - 56px)"). Defaults to "248px". */
  dragOverlayWidth?: string;
  onCardClick?: (card: KanbanCardData) => void;
  /** When true, only the grip handle is draggable (enables scroll on card body). Used on mobile. */
  useDragHandle?: boolean;
  tourTarget?: string;
}

export function KanbanCard({
  card,
  isDragOverlay = false,
  dragOverlayWidth,
  onCardClick,
  useDragHandle = false,
  tourTarget,
}: KanbanCardProps) {
  const { cards } = useQueryDashContext();
  const safetyConfig = useQuerySafetyConfig();
  const agencyHistoryEnabled =
    safetyConfig.data?.features.agencyHistory === true;
  const manualRemindersEnabled =
    safetyConfig.data?.features.manualReminders === true;
  const remindersQuery = useQueryReminders({
    status: "scheduled",
    enabled: manualRemindersEnabled,
  });
  const agencyGuard = useMemo(
    () => getDashboardAgencyGuard(card, cards),
    [card, cards],
  );
  const nextReminder = useMemo(
    () =>
      getNextScheduledReminder(
        (remindersQuery.data ?? []).filter(
          (reminder) => reminder.agentMatchId === card.id,
        ),
      ),
    [card.id, remindersQuery.data],
  );
  const nextReminderUrgency = nextReminder
    ? getReminderUrgency(nextReminder)
    : null;
  const isLifecycleLocked =
    card.trackingMode === "live" || card.lifecycleSyncUnavailable === true;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    disabled: isLifecycleLocked,
    data: {
      type: "card",
      card,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    // Only block touch on card root when not using drag handle (desktop)
    ...(useDragHandle ? {} : { touchAction: "none" as const }),
  };

  const dragSurfaceProtectionStyle: CSSProperties = {
    userSelect: "none",
    WebkitUserSelect: "none",
    WebkitTouchCallout: "none",
  };

  const handleCardClick = () => {
    onCardClick?.(card);
  };

  const isTimingColumn =
    !isLifecycleLocked &&
    (card.columnId === "submitted-query" ||
      card.columnId === "pages-requested");
  const parsedUpdatedDate =
    isTimingColumn && card.updated_date
      ? parseDateOnly(card.updated_date)
      : null;
  const daysAgo = parsedUpdatedDate
    ? getCalendarDayDiffFromToday(parsedUpdatedDate)
    : null;
  const timingText =
    daysAgo != null
      ? card.columnId === "submitted-query"
        ? daysAgo === 0
          ? "Submitted Query Today"
          : `Submitted Query ${daysAgo} ${daysAgo === 1 ? "Day" : "Days"} ago`
        : card.columnId === "pages-requested"
          ? daysAgo === 0
            ? "Pages Requested Today"
            : `Pages Requested ${daysAgo} ${daysAgo === 1 ? "Day" : "Days"} ago`
          : null
      : null;
  const isRejected = card.columnId === "rejected";
  const shareManuscriptHref =
    card.messageThreadId &&
    isManuscriptUploadVisible(card.queryProgress?.currentCode)
      ? `${getProjectMessageThreadHref(
          card.writerProjectId ?? card.projectName,
          card.messageThreadId,
        )}?shareManuscript=1`
      : null;

  // Card content shared between regular and overlay views
  const cardContent = (
    <>
      {/* Agent Name */}
      <div className="flex items-center justify-between">
        <p
          className={cn(
            "truncate text-sm font-semibold capitalize text-accent",
            isRejected && "line-through",
          )}
        >
          {card.name}
        </p>
        <div className="flex items-center gap-1">
          {useDragHandle && !isLifecycleLocked ? (
            <div
              {...attributes}
              {...listeners}
              aria-label={`Drag ${card.name}`}
              className="-m-1 cursor-grab touch-none select-none p-1 active:cursor-grabbing"
              onClick={(event) => event.stopPropagation()}
              onContextMenu={(event) => event.preventDefault()}
              style={{ touchAction: "none", ...dragSurfaceProtectionStyle }}
            >
              <Grip className="size-6 opacity-70" />
            </div>
          ) : null}
          <button
            aria-label={`Open ${card.name}`}
            className="rounded p-1 text-accent/68 outline-none transition hover:bg-accent/8 hover:text-accent focus-visible:ring-[3px] focus-visible:ring-ring/30"
            onClick={(event) => {
              event.stopPropagation();
              handleCardClick();
            }}
            type="button"
          >
            <SquarePen aria-hidden className="size-4" />
          </button>
        </div>
      </div>
      {card.agency && (
        <p
          className={cn(
            "mt-0.5 truncate text-xs text-accent/58",
            isRejected && "line-through",
          )}
        >
          {card.agency}
        </p>
      )}
      {agencyHistoryEnabled &&
      (agencyGuard.status !== "clear" ||
        agencyGuard.liveDataStatus !== "available") ? (
        <div className="mt-2">
          <AgencyGuardBadge compact guard={agencyGuard} />
        </div>
      ) : null}
      {manualRemindersEnabled &&
      nextReminder &&
      nextReminderUrgency !== "upcoming" ? (
        <div className="mt-2">
          <NextReminderBadge reminder={nextReminder} />
        </div>
      ) : null}
      {timingText && (
        <div className="mt-4">
          <p className="text-xs font-semibold text-accent cursor-pointer">
            {timingText}
          </p>
        </div>
      )}
      {card.trackingMode === "live" && card.queryProgress ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <QueryStatusBadge compact status={card.queryProgress.currentCode} />
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-accent/48">
            Live
          </span>
        </div>
      ) : null}
      {shareManuscriptHref && !isDragOverlay ? (
        <Button
          asChild
          className="mt-3 w-full"
          size="sm"
        >
          <Link
            href={shareManuscriptHref}
            onClick={(event) => event.stopPropagation()}
          >
            <FileUp data-icon="inline-start" />
            Share manuscript
          </Link>
        </Button>
      ) : null}
      {card.lifecycleSyncUnavailable ? (
        <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-destructive">
          <AlertTriangle aria-hidden className="size-3.5" />
          Status sync paused
        </div>
      ) : null}
      <div
        className={cn(
          "flex items-center gap-1 mb-4",
          timingText ? "mt-3" : "mt-4",
        )}
      >
        <label
          htmlFor={`prep-query-${card.id}`}
          className="text-xs font-semibold text-accent cursor-pointer"
        >
          Query Letter Ready
        </label>
        {card.prepQueryLetterDone ? (
          <CircleCheckBigIcon className="w-4 h-4 text-accent" />
        ) : (
          <Circle className="w-4 h-4 text-accent" />
        )}
      </div>

      {/* Match Score */}
      {/* {card.match_score != null && (
        <div className="mt-2">
          <StarRating rateNum={card.match_score} />
        </div>
      )} */}

      {/* Fit Rating Pill */}
      <div className="mt-2 flex flex-wrap gap-2">
        <FitRatingBadge rating={card.fitRating} />
        <QueryRoundBadge
          queryOnHold={card.queryOnHold}
          queryRound={card.queryRound}
        />
        <span className="inline-block rounded-full border border-accent/12 bg-white/85 px-2 py-0.5 text-xs font-medium text-accent">
          {card.projectName?.trim() || DEFAULT_PROJECT_NAME}
        </span>
      </div>
    </>
  );

  if (isDragOverlay) {
    return (
      <div
        className="glass-panel rounded-[20px] p-3 cursor-grabbing select-none"
        style={{
          width: dragOverlayWidth ?? "248px",
          ...dragSurfaceProtectionStyle,
        }}
      >
        {cardContent}
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(useDragHandle ? {} : { ...attributes, ...listeners })}
      data-tour-target={tourTarget}
      onClick={handleCardClick}
      className={cn(
        "glass-panel group rounded-[20px] border border-white/70 p-3 transition-all duration-300 md:max-w-[256px] hover:-translate-y-1 hover:border-accent/20 hover:shadow-[0_22px_52px_rgba(24,44,69,0.12)]",
        !useDragHandle &&
          !isLifecycleLocked &&
          "cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50 shadow-[0_24px_60px_rgba(24,44,69,0.14)]",
      )}
    >
      {cardContent}
    </div>
  );
}

export default KanbanCard;
