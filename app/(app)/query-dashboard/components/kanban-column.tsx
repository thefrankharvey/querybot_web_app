"use client";

import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { KanbanCard, KanbanCardData, FitRating } from "./kanban-card";
import { KanbanColumnFilters, PrepQueryLetterFilter } from "./kanban-column-filters";
import { cn } from "@/app/utils";

export interface ColumnData {
  id: string;
  title: string;
}

interface KanbanColumnProps {
  column: ColumnData;
  cards: KanbanCardData[];
  onCardClick?: (card: KanbanCardData) => void;
  onTogglePrepQuery?: (cardId: string) => void;
  className?: string;
  /** When true, cards use a grip handle for dragging (enables scroll on mobile) */
  useDragHandle?: boolean;
}

export function KanbanColumn({
  column,
  cards,
  onCardClick,
  onTogglePrepQuery,
  className,
  useDragHandle = false,
}: KanbanColumnProps) {
  const [fitRatingFilter, setFitRatingFilter] = useState<"all" | FitRating>("all");
  const [prepQueryLetterFilter, setPrepQueryLetterFilter] = useState<PrepQueryLetterFilter>("all");

  const { setNodeRef } = useDroppable({
    id: column.id,
    data: {
      type: "column",
      column,
    },
  });

  const filteredCards = cards.filter((card) => {
    const matchesFitRating =
      fitRatingFilter === "all" || card.fitRating === fitRatingFilter;
    const matchesPrepQuery =
      prepQueryLetterFilter === "all" ||
      (prepQueryLetterFilter === "done" && card.prepQueryLetterDone) ||
      (prepQueryLetterFilter === "not_done" && !card.prepQueryLetterDone);
    return matchesFitRating && matchesPrepQuery;
  });

  return (
    <div className={cn("flex flex-col w-[272px] min-w-[272px]", className)}>
      {/* Column Header - Fixed, centered title */}
      <div className="text-base bg-accent/10 rounded-lg px-4 font-medium text-accent py-3 flex items-center justify-between gap-2 mb-4">
        <h2 className="text-left">
          {column.title}
        </h2>
        <KanbanColumnFilters
          fitRatingFilter={fitRatingFilter}
          onFitRatingChange={setFitRatingFilter}
          prepQueryLetterFilter={prepQueryLetterFilter}
          onPrepQueryLetterChange={setPrepQueryLetterFilter}
        />
      </div>

      {/* Column Content - Scrollable area for cards */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex flex-col gap-2 p-2 bg-accent/10 rounded-lg h-[calc(100vh-300px)] overflow-y-auto md:scrollbar-transparent",
        )}
      >
        <SortableContext
          items={filteredCards.map((card) => card.id)}
          strategy={verticalListSortingStrategy}
        >
          {filteredCards.map((card) => (
            <KanbanCard
              key={card.id}
              card={card}
              onCardClick={onCardClick}
              onTogglePrepQuery={onTogglePrepQuery}
              useDragHandle={useDragHandle}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

export default KanbanColumn;
