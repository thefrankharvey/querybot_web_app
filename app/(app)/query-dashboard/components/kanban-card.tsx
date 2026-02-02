"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/app/utils";
import { StarRating } from "@/app/components/star-rating";
import { Checkbox } from "@/app/ui-primitives/checkbox";

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
      <p className="text-sm font-semibold text-gray-900 truncate capitalize">{card.name}</p>

      {/* Agency Name */}
      {card.agency && (
        <p className="text-xs text-gray-500 truncate mt-0.5">{card.agency}</p>
      )}

      {/* Prep Query Letter Checkbox */}
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
          Prep Query Letter
        </label>
      </div>

      {/* Match Score */}
      {card.match_score != null && (
        <div className="mt-2">
          <StarRating rateNum={card.match_score} />
        </div>
      )}
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
        "bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50 shadow-lg"
      )}
    >
      {cardContent}
    </div>
  );
}

export default KanbanCard;
