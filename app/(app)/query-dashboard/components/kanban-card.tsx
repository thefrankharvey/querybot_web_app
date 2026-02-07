"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/app/utils";
import { Checkbox } from "@/app/ui-primitives/checkbox";
import { SquarePen } from "lucide-react";

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
}

interface KanbanCardProps {
  card: KanbanCardData;
  isDragOverlay?: boolean;
  onCardClick?: (card: KanbanCardData) => void;
  onTogglePrepQuery?: (cardId: string) => void;
}

export function KanbanCard({
  card,
  isDragOverlay = false,
  onCardClick,
  onTogglePrepQuery,
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
    touchAction: "none" as const, // Required for dnd-kit touch support on mobile
  };

  const handleCheckboxChange = (e: React.MouseEvent) => {
    e.stopPropagation();
    onTogglePrepQuery?.(card.id);
  };

  const handleCardClick = () => {
    onCardClick?.(card);
  };

  // Card content shared between regular and overlay views
  const cardContent = (
    <>
      {/* Agent Name */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-900 truncate capitalize">{card.name}</p>
        <SquarePen className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Agency Name */}
      {card.agency && (
        <p className="text-xs text-gray-500 truncate mt-0.5">{card.agency}</p>
      )}

      {/* Query Letter Ready Checkbox */}
      <div className="flex items-center gap-2 mt-2">
        <Checkbox
          id={`prep-query-${card.id}`}
          checked={card.prepQueryLetterDone}
          onCheckedChange={() => onTogglePrepQuery?.(card.id)}
          onClick={(e) => e.stopPropagation()}
          className="data-[state=checked]:bg-blue-accent data-[state=checked]:border-blue-accent data-[state=checked]:text-white cursor-pointer"
        />
        <label
          htmlFor={`prep-query-${card.id}`}
          className="text-xs text-gray-600 cursor-pointer"
          onClick={handleCheckboxChange}
        >
          Query Letter Ready
        </label>
      </div>

      {/* Match Score */}
      {/* {card.match_score != null && (
        <div className="mt-2">
          <StarRating rateNum={card.match_score} />
        </div>
      )} */}

      {/* Fit Rating Pill */}
      <div className="mt-2">
        <span
          className="inline-block rounded-full px-2 py-0.5 text-xs font-medium text-gray-800"
          style={{ backgroundColor: FIT_RATING_CONFIG[card.fitRating].color }}
        >
          {FIT_RATING_CONFIG[card.fitRating].label}
        </span>
      </div>
    </>
  );

  if (isDragOverlay) {
    return (
      <div className="bg-white rounded-lg p-3 shadow-lg cursor-grabbing w-[248px]">
        {cardContent}
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleCardClick}
      className={cn(
        "group bg-white rounded-lg p-3 shadow-sm border-2 border-transparent hover:shadow-md hover:border-accent/60 cursor-grab active:cursor-grabbing transition-all duration-300",
        isDragging && "opacity-50 shadow-lg"
      )}
    >
      {cardContent}
    </div>
  );
}

export default KanbanCard;
