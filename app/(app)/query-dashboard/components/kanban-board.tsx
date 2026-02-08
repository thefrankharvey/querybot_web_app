"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { KanbanColumn, ColumnData } from "./kanban-column";
import { KanbanCard, KanbanCardData, FitRating, getFitRatingFromScore } from "./kanban-card";
import { KanbanDialog } from "./kanban-dialog";
import { useProfileContext } from "@/app/(app)/context/profile-context";
import { useClerkUser } from "@/app/hooks/use-clerk-user";
import { Spinner } from "@/app/ui-primitives/spinner";
import { AgentMatch } from "@/app/types";

const COLUMNS: ColumnData[] = [
  { id: "agents-to-research", title: "Agents to Research" },
  { id: "submitted-query", title: "Submitted Query" },
  { id: "pages-requested", title: "Pages Requested" },
  { id: "rejected", title: "Rejected" },
  { id: "offer-made", title: "Offer Made" },
];

// Map saved agent data to kanban card format
function mapAgentToCard(agent: AgentMatch): KanbanCardData {
  return {
    id: agent.id,
    name: agent.name,
    email: agent.email,
    agency: agent.agency,
    index_id: agent.index_id,
    query_tracker: agent.query_tracker,
    pub_marketplace: agent.pub_marketplace,
    match_score: agent.match_score,
    agency_url: agent.agency_url,
    columnId: "agents-to-research",
    prepQueryLetterDone: false,
    fitRating: getFitRatingFromScore(agent.match_score),
  };
}

export function KanbanBoard() {
  const { agentsList, isLoading } = useProfileContext();
  const { isSubscribed } = useClerkUser();

  const [cards, setCards] = useState<KanbanCardData[]>([]);
  const [activeCard, setActiveCard] = useState<KanbanCardData | null>(null);
  const [selectedCard, setSelectedCard] = useState<KanbanCardData | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Initialize cards from agentsList when data is available
  useEffect(() => {
    if (!isLoading && agentsList && !hasInitialized) {
      const mappedCards = agentsList.map(mapAgentToCard);
      setCards(mappedCards);
      setHasInitialized(true);
    }
  }, [agentsList, isLoading, hasInitialized]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner className="size-16" />
      </div>
    );
  }

  // Empty state - no agents saved
  if (!agentsList || agentsList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="bg-white rounded-lg p-8 shadow-lg text-center max-w-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No Agents Yet
          </h2>
          <p className="text-gray-600 mb-4">
            {isSubscribed
              ? "Save agents from your search results to start tracking your query progress here."
              : "Subscribe to save agents and track your querying journey."}
          </p>
        </div>
      </div>
    );
  }

  const handleCardClick = (card: KanbanCardData) => {
    setSelectedCard(card);
  };

  const handleTogglePrepQuery = (cardId: string) => {
    setCards((prevCards) =>
      prevCards.map((card) =>
        card.id === cardId
          ? { ...card, prepQueryLetterDone: !card.prepQueryLetterDone }
          : card
      )
    );
  };

  const handleFitRatingChange = (cardId: string, rating: FitRating) => {
    setCards((prevCards) =>
      prevCards.map((card) =>
        card.id === cardId ? { ...card, fitRating: rating } : card
      )
    );
    // Update selectedCard if it's the one being changed
    if (selectedCard?.id === cardId) {
      setSelectedCard((prev) => (prev ? { ...prev, fitRating: rating } : null));
    }
  };

  const getCardsForColumn = (columnId: string) => {
    return cards.filter((card) => card.columnId === columnId);
  };

  const findColumnByCardId = (cardId: string) => {
    const card = cards.find((c) => c.id === cardId);
    return card?.columnId;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const card = cards.find((c) => c.id === active.id);
    if (card) {
      setActiveCard(card);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find which columns the active and over items belong to
    const activeColumnId = findColumnByCardId(activeId);

    // Check if we're over a column or a card
    const isOverColumn = COLUMNS.some((col) => col.id === overId);
    const overColumnId = isOverColumn ? overId : findColumnByCardId(overId);

    if (!activeColumnId || !overColumnId || activeColumnId === overColumnId) {
      return;
    }

    // Move card to new column
    setCards((prevCards) => {
      return prevCards.map((card) => {
        if (card.id === activeId) {
          return { ...card, columnId: overColumnId };
        }
        return card;
      });
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveCard(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const activeColumnId = findColumnByCardId(activeId);
    const isOverColumn = COLUMNS.some((col) => col.id === overId);
    const overColumnId = isOverColumn ? overId : findColumnByCardId(overId);

    if (!activeColumnId || !overColumnId) return;

    // If in the same column, reorder
    if (activeColumnId === overColumnId && !isOverColumn) {
      setCards((prevCards) => {
        const columnCards = prevCards.filter((c) => c.columnId === activeColumnId);
        const otherCards = prevCards.filter((c) => c.columnId !== activeColumnId);

        const activeIndex = columnCards.findIndex((c) => c.id === activeId);
        const overIndex = columnCards.findIndex((c) => c.id === overId);

        const reorderedColumnCards = arrayMove(columnCards, activeIndex, overIndex);

        return [...otherCards, ...reorderedColumnCards];
      });
    }
  };

  return (
    <div className="overflow-x-auto pb-4 min-h-[calc(100vh-180px)] scrollbar-transparent">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 min-w-fit p-4">
          {COLUMNS.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              cards={getCardsForColumn(column.id)}
              onCardClick={handleCardClick}
              onTogglePrepQuery={handleTogglePrepQuery}
            />
          ))}
        </div>

        <DragOverlay>
          {activeCard ? (
            <KanbanCard card={activeCard} isDragOverlay dragOverlayWidth="256px" />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Agent Detail Dialog */}
      <KanbanDialog
        card={selectedCard}
        open={!!selectedCard}
        onOpenChange={(open) => !open && setSelectedCard(null)}
        onTogglePrepQuery={handleTogglePrepQuery}
        onFitRatingChange={handleFitRatingChange}
      />
    </div>
  );
}

export default KanbanBoard;
