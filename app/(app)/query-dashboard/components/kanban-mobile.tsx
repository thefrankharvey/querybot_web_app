"use client";

import { useEffect, useRef, useState } from "react";
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
import { KanbanColumn } from "./kanban-column";
import { KanbanCard, KanbanCardData, FitRating } from "./kanban-card";
import { KanbanDialog } from "./kanban-dialog";
import { useClerkUser } from "@/app/hooks/use-clerk-user";
import { Spinner } from "@/app/ui-primitives/spinner";
import DotIndicators from "./dot-indicators";
import { QUERY_DASH_COLUMNS, QueryDashColumnId } from "./kanban-config";
import { useQueryDashContext } from "../context/query-dash-context";
import { Button } from "@/app/ui-primitives/button";
import Link from "next/link";

const SWIPE_THRESHOLD = 50;
const DRAG_EDGE_THRESHOLD = 60;
const DRAG_SLIDE_COOLDOWN = 2000;
const DRAG_EDGE_GRACE_PERIOD = 220;

export function KanbanMobile() {
  const { isSubscribed } = useClerkUser();
  const {
    cards,
    isLoading,
    isEmpty,
    moveCard,
    reorderInColumn,
    togglePrepQueryLetter,
    setFitRating,
    setProjectName,
    setNotes,
    getCardsForColumn,
    findCardById,
    findColumnByCardId,
  } = useQueryDashContext();

  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartXRef = useRef<number>(0);
  const touchStartYRef = useRef<number>(0);
  const lastColumnChangeRef = useRef<number>(0);
  const dragStartTimeRef = useRef<number>(0);
  const dragStartColumnRef = useRef<string | null>(null);

  const [activeCard, setActiveCard] = useState<KanbanCardData | null>(null);
  const [selectedCard, setSelectedCard] = useState<KanbanCardData | null>(null);
  const [currentColumnIndex, setCurrentColumnIndex] = useState(0);
  const [isDraggingCard, setIsDraggingCard] = useState(false);

  useEffect(() => {
    if (!selectedCard?.id) return;

    const latestSelectedCard = cards.find((card) => card.id === selectedCard.id);
    if (!latestSelectedCard) {
      setSelectedCard(null);
      return;
    }

    setSelectedCard((prev) => (prev === latestSelectedCard ? prev : latestSelectedCard));
  }, [cards, selectedCard?.id]);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 300,
        tolerance: 5,
      },
    })
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner className="size-16" />
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="bg-white rounded-lg p-8 shadow-lg text-center max-w-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Agents Saved Yet</h2>
          <p className="text-gray-600 mb-4">
            {isSubscribed
              ? "Save agents from your Smart Match search results to start tracking your query progress here."
              : "Subscribe to save agents and track your querying journey."}
          </p>
          <div className="pt-2 text-center">
            <Link href="/smart-match">
              <Button className="w-full sm:w-auto">Go to Smart Match</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleCardClick = (card: KanbanCardData) => {
    setSelectedCard(card);
  };

  const handleTogglePrepQuery = (cardId: string) => {
    togglePrepQueryLetter(cardId);

    if (selectedCard?.id === cardId) {
      setSelectedCard((prev) =>
        prev ? { ...prev, prepQueryLetterDone: !prev.prepQueryLetterDone } : null
      );
    }
  };

  const handleFitRatingChange = (cardId: string, rating: FitRating) => {
    setFitRating(cardId, rating);

    if (selectedCard?.id === cardId) {
      setSelectedCard((prev) => (prev ? { ...prev, fitRating: rating } : null));
    }
  };

  const handleMoveCard = (cardId: string, columnId: QueryDashColumnId) => {
    moveCard(cardId, columnId);

    if (selectedCard?.id === cardId) {
      setSelectedCard((prev) => (prev ? { ...prev, columnId } : null));
    }
  };

  const handleProjectNameChange = (cardId: string, projectName: string) => {
    setProjectName(cardId, projectName);

    if (selectedCard?.id === cardId) {
      setSelectedCard((prev) => (prev ? { ...prev, projectName } : null));
    }
  };

  const handleNotesSave = (cardId: string, notes: string) => {
    setNotes(cardId, notes);

    if (selectedCard?.id === cardId) {
      setSelectedCard((prev) => (prev ? { ...prev, notes } : null));
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const card = findCardById(event.active.id as string);
    if (!card) return;

    dragStartTimeRef.current = Date.now();
    dragStartColumnRef.current = card.columnId;
    setActiveCard(card);
    setIsDraggingCard(true);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeColumnId = findColumnByCardId(activeId);
    const isOverColumn = QUERY_DASH_COLUMNS.some((column) => column.id === overId);
    const overColumnId = isOverColumn
      ? (overId as QueryDashColumnId)
      : findColumnByCardId(overId);

    if (!activeColumnId || !overColumnId || activeColumnId === overColumnId) {
      return;
    }

    const currentColumnId = QUERY_DASH_COLUMNS[currentColumnIndex].id;
    if (overColumnId !== currentColumnId) return;

    moveCard(activeId, overColumnId, { persist: false });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const startColumnId = dragStartColumnRef.current;
    dragStartColumnRef.current = null;

    setActiveCard(null);
    setIsDraggingCard(false);
    lastColumnChangeRef.current = 0;

    const activeId = active.id as string;
    const finalColumnId = findColumnByCardId(activeId);

    if (startColumnId && finalColumnId && finalColumnId !== startColumnId) {
      moveCard(activeId, finalColumnId, { persist: true, forcePersist: true });
      return;
    }

    if (!over || !finalColumnId) return;

    const overId = over.id as string;
    if (activeId === overId) return;

    const isOverColumn = QUERY_DASH_COLUMNS.some((column) => column.id === overId);
    const overColumnId = isOverColumn
      ? (overId as QueryDashColumnId)
      : findColumnByCardId(overId);
    if (!overColumnId) return;

    const currentColumnId = QUERY_DASH_COLUMNS[currentColumnIndex].id;
    if (overColumnId !== currentColumnId && finalColumnId !== currentColumnId) return;

    if (finalColumnId === overColumnId && !isOverColumn) {
      reorderInColumn(finalColumnId, activeId, overId);
    }
  };

  const handleDragMove = (event: DragMoveEvent) => {
    const translatedRect = event.active.rect.current.translated;
    if (!translatedRect) return;

    const now = Date.now();
    if (now - dragStartTimeRef.current < DRAG_EDGE_GRACE_PERIOD) return;
    if (now - lastColumnChangeRef.current < DRAG_SLIDE_COOLDOWN) return;

    const viewportWidth = window.innerWidth;
    const activeId = event.active.id as string;

    if (
      translatedRect.right > viewportWidth - DRAG_EDGE_THRESHOLD &&
      currentColumnIndex < QUERY_DASH_COLUMNS.length - 1
    ) {
      lastColumnChangeRef.current = now;
      const targetColumnId = QUERY_DASH_COLUMNS[currentColumnIndex + 1].id;
      setCurrentColumnIndex((prev) => prev + 1);
      moveCard(activeId, targetColumnId, { persist: false });
    } else if (
      translatedRect.left < DRAG_EDGE_THRESHOLD &&
      currentColumnIndex > 0
    ) {
      lastColumnChangeRef.current = now;
      const targetColumnId = QUERY_DASH_COLUMNS[currentColumnIndex - 1].id;
      setCurrentColumnIndex((prev) => prev - 1);
      moveCard(activeId, targetColumnId, { persist: false });
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isDraggingCard) return;

    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;

    if (Math.abs(deltaX) < Math.abs(deltaY)) return;

    if (deltaX < -SWIPE_THRESHOLD && currentColumnIndex < QUERY_DASH_COLUMNS.length - 1) {
      setCurrentColumnIndex((prev) => prev + 1);
    } else if (deltaX > SWIPE_THRESHOLD && currentColumnIndex > 0) {
      setCurrentColumnIndex((prev) => prev - 1);
    }
  };

  const navigateToColumn = (index: number) => {
    setCurrentColumnIndex(index);
  };

  const COLUMN_GAP = 16;
  const PEEK_WIDTH = 24;
  const columnWidth = `calc(100vw - ${PEEK_WIDTH * 2}px - ${COLUMN_GAP}px)`;

  const lastColumnOffset =
    currentColumnIndex === QUERY_DASH_COLUMNS.length - 1 ? COLUMN_GAP : 0;

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
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
        <div
          ref={containerRef}
          className="overflow-hidden flex-1 min-h-0"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="flex h-full min-h-0"
            style={{
              gap: COLUMN_GAP,
              paddingLeft: 0,
              paddingRight: 0,
              transform: `translateX(calc(${-currentColumnIndex} * (100vw - ${PEEK_WIDTH * 2}px) + ${lastColumnOffset}px))`,
              transition: "transform 0.3s ease-out",
            }}
          >
            {QUERY_DASH_COLUMNS.map((column, index) => (
              <div
                key={column.id}
                className="flex-shrink-0 h-full"
                style={{ width: columnWidth, order: index }}
              >
                <KanbanColumn
                  column={column}
                  cards={getCardsForColumn(column.id)}
                  onCardClick={handleCardClick}
                  className="w-full min-w-0 h-full"
                  useDragHandle
                  droppableDisabled={Math.abs(index - currentColumnIndex) > 1}
                />
              </div>
            ))}
          </div>
        </div>

        <DragOverlay>
          {activeCard ? (
            <KanbanCard card={activeCard} isDragOverlay dragOverlayWidth={columnWidth} />
          ) : null}
        </DragOverlay>
      </DndContext>

      <DotIndicators
        total={QUERY_DASH_COLUMNS.length}
        current={currentColumnIndex}
        onDotClick={navigateToColumn}
      />

      <KanbanDialog
        card={selectedCard}
        columns={QUERY_DASH_COLUMNS}
        open={!!selectedCard}
        onOpenChange={(open) => !open && setSelectedCard(null)}
        onTogglePrepQuery={handleTogglePrepQuery}
        onFitRatingChange={handleFitRatingChange}
        onProjectNameChange={handleProjectNameChange}
        onNotesSave={handleNotesSave}
        onMoveCard={(cardId, columnId) => handleMoveCard(cardId, columnId as QueryDashColumnId)}
      />
    </div>
  );
}

export default KanbanMobile;
