"use client";

import { useState, useEffect, useRef } from "react";
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  DragMoveEvent,
  pointerWithin,
  MeasuringStrategy,
  MouseSensor,
  TouchSensor,
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
import DotIndicators from "./dot-indicators";

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

// Swipe threshold for changing columns
const SWIPE_THRESHOLD = 50;
// How close to viewport edge a dragged card must be to trigger auto-slide
const DRAG_EDGE_THRESHOLD = 60;
// Minimum ms between auto-slide column changes during drag
const DRAG_SLIDE_COOLDOWN = 3500;

export function KanbanMobile() {
  const { agentsList, isLoading } = useProfileContext();
  const { isSubscribed } = useClerkUser();
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartXRef = useRef<number>(0);
  const touchStartYRef = useRef<number>(0);
  const lastColumnChangeRef = useRef<number>(0);

  const [cards, setCards] = useState<KanbanCardData[]>([]);
  const [activeCard, setActiveCard] = useState<KanbanCardData | null>(null);
  const [selectedCard, setSelectedCard] = useState<KanbanCardData | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [currentColumnIndex, setCurrentColumnIndex] = useState(0);
  const [isDraggingCard, setIsDraggingCard] = useState(false);

  // Initialize cards from agentsList when data is available
  useEffect(() => {
    if (!isLoading && agentsList && !hasInitialized) {
      const mappedCards = agentsList.map(mapAgentToCard);
      setCards(mappedCards);
      setHasInitialized(true);
    }
  }, [agentsList, isLoading, hasInitialized]);

  // Configure sensors for drag-and-drop with touch support
  // MouseSensor (not PointerSensor) so it only fires for actual mouse events on desktop.
  // On mobile, only TouchSensor activates — no race condition with pointer events.
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 300, // Long-press duration before drag starts
        tolerance: 5, // Allowed finger movement during hold
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

  // Drag and drop handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const card = cards.find((c) => c.id === active.id);
    if (card) {
      setActiveCard(card);
      setIsDraggingCard(true);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeColumnId = findColumnByCardId(activeId);
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
    setIsDraggingCard(false);
    lastColumnChangeRef.current = 0; // Reset cooldown for next drag session

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

  // Auto-slide carousel when a dragged card reaches the edge of the viewport
  const handleDragMove = (event: DragMoveEvent) => {
    const translatedRect = event.active.rect.current.translated;
    if (!translatedRect) return;

    const now = Date.now();
    if (now - lastColumnChangeRef.current < DRAG_SLIDE_COOLDOWN) return;

    const viewportWidth = window.innerWidth;
    const activeId = event.active.id as string;

    if (
      translatedRect.right > viewportWidth - DRAG_EDGE_THRESHOLD &&
      currentColumnIndex < COLUMNS.length - 1
    ) {
      lastColumnChangeRef.current = now;
      const targetColumnId = COLUMNS[currentColumnIndex + 1].id;
      setCurrentColumnIndex((prev) => prev + 1);
      setCards((prevCards) =>
        prevCards.map((card) =>
          card.id === activeId ? { ...card, columnId: targetColumnId } : card
        )
      );
    } else if (
      translatedRect.left < DRAG_EDGE_THRESHOLD &&
      currentColumnIndex > 0
    ) {
      lastColumnChangeRef.current = now;
      const targetColumnId = COLUMNS[currentColumnIndex - 1].id;
      setCurrentColumnIndex((prev) => prev - 1);
      setCards((prevCards) =>
        prevCards.map((card) =>
          card.id === activeId ? { ...card, columnId: targetColumnId } : card
        )
      );
    }
  };

  // Swipe navigation via native touch events (avoids conflict with dnd-kit)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    // Don't handle swipe if we're dragging a card via dnd-kit
    if (isDraggingCard) return;

    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;

    // Only handle horizontal swipes (ignore vertical scrolling)
    if (Math.abs(deltaX) < Math.abs(deltaY)) return;

    if (deltaX < -SWIPE_THRESHOLD && currentColumnIndex < COLUMNS.length - 1) {
      setCurrentColumnIndex((prev) => prev + 1);
    } else if (deltaX > SWIPE_THRESHOLD && currentColumnIndex > 0) {
      setCurrentColumnIndex((prev) => prev - 1);
    }
  };

  const navigateToColumn = (index: number) => {
    setCurrentColumnIndex(index);
  };

  // Calculate column width and position
  const COLUMN_GAP = 16;
  const PEEK_WIDTH = 24;
  // Column takes full width minus padding on both sides (for peek effect)
  const columnWidth = `calc(100vw - ${PEEK_WIDTH * 2}px - ${COLUMN_GAP}px)`;

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] overflow-hidden">
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        measuring={{
          droppable: {
            strategy: MeasuringStrategy.Always,
          },
        }}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {/* Swipeable columns container */}
        <div
          ref={containerRef}
          className="overflow-hidden flex-1"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="flex h-full"
            style={{
              gap: COLUMN_GAP,
              paddingLeft: PEEK_WIDTH,
              transform: `translateX(calc(${-currentColumnIndex} * (100vw - ${PEEK_WIDTH * 2}px)))`,
              transition: isDraggingCard ? "none" : "transform 0.3s ease-out",
            }}
          >
            {COLUMNS.map((column) => (
              <div
                key={column.id}
                className="flex-shrink-0 h-full"
                style={{ width: columnWidth }}
              >
                <KanbanColumn
                  column={column}
                  cards={getCardsForColumn(column.id)}
                  onCardClick={handleCardClick}
                  onTogglePrepQuery={handleTogglePrepQuery}
                  className="w-full min-w-0 h-full"
                />
              </div>
            ))}
          </div>
        </div>

        <DragOverlay>
          {activeCard ? (
            <KanbanCard card={activeCard} isDragOverlay />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Dot indicators */}
      <DotIndicators
        total={COLUMNS.length}
        current={currentColumnIndex}
        onDotClick={navigateToColumn}
      />

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

export default KanbanMobile;
