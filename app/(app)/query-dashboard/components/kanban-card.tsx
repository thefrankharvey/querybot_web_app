"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/app/utils";
import { AgentMatch } from "@/app/(app)/context/agent-matches-context";
import { StarRating } from "@/app/components/star-rating";

export interface KanbanCardData extends AgentMatch {
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
      <p className="text-sm font-semibold text-gray-900 truncate">{card.name}</p>

      {/* Agency Name */}
      <p className="text-xs text-gray-500 truncate mt-0.5">{card.agency}</p>

      {/* Prep Query Letter Checkbox */}
      <div className="flex items-center gap-2 mt-2">
        <input
          type="checkbox"
          id={`prep-query-${card.id}`}
          checked={card.prepQueryLetterDone}
          onChange={() => { }}
          onClick={handleCheckboxChange}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
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
      <div className="mt-2">
        <StarRating rateNum={card.normalized_score} />
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
        "bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50 shadow-lg"
      )}
    >
      {cardContent}
    </div>
  );
}

export default KanbanCard;
