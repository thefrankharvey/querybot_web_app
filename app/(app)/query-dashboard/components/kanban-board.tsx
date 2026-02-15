"use client";

import { useEffect, useRef, useState } from "react";
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
import { KanbanColumn } from "./kanban-column";
import { KanbanCard, KanbanCardData, FitRating } from "./kanban-card";
import { KanbanDialog } from "./kanban-dialog";
import { Spinner } from "@/app/ui-primitives/spinner";
import {
  QUERY_DASH_COLUMNS,
  QueryDashColumnId,
} from "./kanban-config";
import { useQueryDashContext } from "../context/query-dash-context";
import { Button } from "@/app/ui-primitives/button";
import Link from "next/link";

export function KanbanBoard() {
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

  const [activeCard, setActiveCard] = useState<KanbanCardData | null>(null);
  const [selectedCard, setSelectedCard] = useState<KanbanCardData | null>(null);
  const dragStartColumnRef = useRef<string | null>(null);

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
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
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
      <div className="flex flex-col gap-4 bg-white min-h-[400px] rounded-lg md:w-[1000px] md:mx-auto mt-13 shadow-lg justify-center items-center border border-accent/20 mx-auto">
        <div className="text-center space-y-6 max-auto h-[300px] flex flex-col justify-center items-center">
          <h1 className="text-lg md:text-3xl font-bold text-gray-900">
            No Agents Saved Yet
          </h1>
          <p className="text-sm md:text-base text-gray-600 w-full md:w-3/4 text-center">
            Save agents from your Smart Match search results to start tracking your query progress here!
          </p>
          <div className="pt-2 text-center">
            <Link href="/smart-match">
              <Button className="w-full sm:w-auto" size="lg">Go to Smart Match</Button>
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

    setActiveCard(card);
    dragStartColumnRef.current = card.columnId;
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

    if (!activeColumnId || !overColumnId || activeColumnId === overColumnId) return;

    moveCard(activeId, overColumnId, { persist: false });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const startColumnId = dragStartColumnRef.current;
    dragStartColumnRef.current = null;

    setActiveCard(null);

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

    if (finalColumnId === overColumnId && !isOverColumn) {
      reorderInColumn(finalColumnId, activeId, overId);
    }
  };

  return (
    <div className="overflow-x-auto md:min-h-[calc(100vh-120px)] min-h-[calc(100vh-80px)] scrollbar-transparent">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 min-w-fit p-4">
          {QUERY_DASH_COLUMNS.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              cards={getCardsForColumn(column.id)}
              onCardClick={handleCardClick}
            />
          ))}
        </div>

        <DragOverlay>
          {activeCard ? (
            <KanbanCard card={activeCard} isDragOverlay dragOverlayWidth="256px" />
          ) : null}
        </DragOverlay>
      </DndContext>

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

export default KanbanBoard;
