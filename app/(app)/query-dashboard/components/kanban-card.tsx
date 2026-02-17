"use client";

import type { CSSProperties } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/app/utils";
import { SquarePen, Grip, Circle, CircleCheckBigIcon } from "lucide-react";

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
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const targetStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor((todayStart.getTime() - targetStart.getTime()) / DAY_MS);
  return Math.max(0, diffDays);
}

// Fit Rating types and configuration
export type FitRating = "perfect" | "great" | "good" | "neutral";

export const FIT_RATING_CONFIG: Record<
  FitRating,
  { label: string; color: string }
> = {
  perfect: { label: "Perfect Fit", color: "var(--fit-perfect)" },
  great: { label: "Great Fit", color: "var(--fit-great)" },
  good: { label: "Good Fit", color: "var(--fit-good)" },
  neutral: { label: "Neutral Fit", color: "var(--fit-neutral)" },
};

export function getFitRatingFromScore(score: number | null | undefined): FitRating {
  if (score == null) return "neutral";
  if (score >= 4) return "perfect";
  if (score >= 3) return "great";
  if (score > 2.5) return "good";
  return "neutral";
}

export interface KanbanCardData {
  // From database
  id: string;
  created_at?: string;
  updated_date?: string | null;
  name: string;
  email?: string | null;
  agency?: string | null;
  index_id?: string | null;
  query_tracker?: string | null;
  pub_marketplace?: string | null;
  match_score?: number | null;
  agency_url?: string | null;
  // Kanban-specific (local state)
  columnId: string;
  prepQueryLetterDone: boolean;
  fitRating: FitRating;
  projectName: string;
  notes: string;
}

interface KanbanCardProps {
  card: KanbanCardData;
  isDragOverlay?: boolean;
  /** Width for the drag overlay (e.g. "256px" or "calc(100vw - 56px)"). Defaults to "248px". */
  dragOverlayWidth?: string;
  onCardClick?: (card: KanbanCardData) => void;
  /** When true, only the grip handle is draggable (enables scroll on card body). Used on mobile. */
  useDragHandle?: boolean;
}

export function KanbanCard({
  card,
  isDragOverlay = false,
  dragOverlayWidth,
  onCardClick,
  useDragHandle = false,
}: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
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
    card.columnId === "submitted-query" || card.columnId === "pages-requested";
  const parsedUpdatedDate =
    isTimingColumn && card.updated_date ? parseDateOnly(card.updated_date) : null;
  const daysAgo =
    parsedUpdatedDate ? getCalendarDayDiffFromToday(parsedUpdatedDate) : null;
  const timingText =
    daysAgo != null
      ? card.columnId === "submitted-query"
        ? daysAgo === 0
          ? "Submitted Query Today"
          : `Submitted Query ${daysAgo} Days ago`
        : card.columnId === "pages-requested"
          ? daysAgo === 0
            ? "Pages Requested Today"
            : `Pages Requested ${daysAgo} Days ago`
          : null
      : null;
  const isRejected = card.columnId === "rejected";

  // Card content shared between regular and overlay views
  const cardContent = (
    <>
      {/* Agent Name */}
      <div className="flex items-center justify-between">
        <p
          className={cn(
            "text-sm font-semibold text-gray-900 truncate capitalize",
            isRejected && "line-through"
          )}
        >
          {card.name}
        </p>
        {useDragHandle ? (
          <div
            {...attributes}
            {...listeners}
            className="touch-none select-none cursor-grab active:cursor-grabbing p-1 -m-1"
            style={{ touchAction: "none", ...dragSurfaceProtectionStyle }}
            onClick={(e) => e.stopPropagation()}
            onContextMenu={(e) => e.preventDefault()}
          >
            <Grip className="w-6 h-6 opacity-70" />
          </div>
        ) : (
          <SquarePen className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-accent" />
        )}
      </div>
      {card.agency && (
        <p
          className={cn(
            "text-xs text-gray-500 truncate mt-0.5",
            isRejected && "line-through"
          )}
        >
          {card.agency}
        </p>
      )}
      {timingText && (
        <div className="mt-4">
          <p className="text-xs font-semibold text-accent cursor-pointer">
            {timingText}
          </p>
        </div>
      )}
      <div className={cn("flex items-center gap-1 mb-4", timingText ? "mt-3" : "mt-4")}>
        <label
          htmlFor={`prep-query-${card.id}`}
          className="text-xs font-semibold text-accent cursor-pointer"
        >
          Query Letter Ready
        </label>
        {card.prepQueryLetterDone ? <CircleCheckBigIcon className="w-4 h-4 text-accent" /> : <Circle className="w-4 h-4 text-accent" />}
      </div>

      {/* Match Score */}
      {/* {card.match_score != null && (
        <div className="mt-2">
          <StarRating rateNum={card.match_score} />
        </div>
      )} */}

      {/* Fit Rating Pill */}
      <div className="mt-2 flex flex-wrap gap-2">
        <span
          className="inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white"
          style={{ backgroundColor: FIT_RATING_CONFIG[card.fitRating].color }}
        >
          {FIT_RATING_CONFIG[card.fitRating].label}
        </span>
        <span className="inline-block rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-white">
          {card.projectName?.trim() || "My Project"}
        </span>
      </div>
    </>
  );

  if (isDragOverlay) {
    return (
      <div
        className="bg-white rounded-lg p-3 shadow-lg cursor-grabbing select-none"
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
      onClick={handleCardClick}
      className={cn(
        "group bg-white rounded-lg p-3 shadow-sm border-2 border-transparent hover:shadow-md hover:border-accent/60 transition-all duration-300 md:max-w-[256px]",
        !useDragHandle && "cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50 shadow-lg"
      )}
    >
      {cardContent}
    </div>
  );
}

export default KanbanCard;
