"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { KanbanCard, KanbanCardData } from "./kanban-card";
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
}

export function KanbanColumn({
  column,
  cards,
  onCardClick,
  onTogglePrepQuery,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: "column",
      column,
    },
  });

  return (
    <div className="flex flex-col w-[272px] min-w-[272px]">
      {/* Column Header - Fixed, centered title */}
      <div className="py-3">
        <h2 className="text-base bg-accent/10 rounded-lg p-2 font-medium text-accent text-center">
          {column.title}
        </h2>
      </div>

      {/* Column Content - Scrollable area for cards */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex flex-col gap-2 p-2 bg-accent/10 rounded-lg min-h-[200px] flex-1",
          isOver && "bg-gray-200"
        )}
      >
        <SortableContext
          items={cards.map((card) => card.id)}
          strategy={verticalListSortingStrategy}
        >
          {cards.map((card) => (
            <KanbanCard
              key={card.id}
              card={card}
              onCardClick={onCardClick}
              onTogglePrepQuery={onTogglePrepQuery}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

export default KanbanColumn;
