"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
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
import { KanbanCard, type KanbanCardData } from "./kanban-card";
import type { FitRating } from "@/app/components/fit-rating-badge";
import { KanbanDialog } from "./kanban-dialog";
import { Spinner } from "@/app/ui-primitives/spinner";
import {
  QUERY_DASH_COLUMNS,
  type QueryDashColumnId,
} from "./kanban-config";
import { FIRST_COLUMN_ID } from "./kanban-ordering";
import { useQueryDashContext } from "../context/query-dash-context";
import { Button } from "@/app/ui-primitives/button";
import Link from "next/link";
import type { QueryDashboardWalkthroughStepId } from "./query-dashboard-walkthrough-config";

const QueryDashboardWalkthrough = dynamic(
  () =>
    import("./query-dashboard-walkthrough").then(
      (module) => module.QueryDashboardWalkthrough,
    ),
  { ssr: false },
);

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
  const [tourStepId, setTourStepId] =
    useState<QueryDashboardWalkthroughStepId | null>(null);
  const [isDesktopViewport, setIsDesktopViewport] = useState(false);
  const dragStartColumnRef = useRef<string | null>(null);
  const tourOpenedModalRef = useRef(false);
  const firstColumnFirstCard = getCardsForColumn(FIRST_COLUMN_ID)[0] ?? null;
  const isFilterTourStep =
    tourStepId === "fit-rating-filter" || tourStepId === "query-letter-filter";
  const isModalTourStep = tourStepId?.startsWith("modal-") ?? false;
  const isWalkthroughEnabled =
    isDesktopViewport && !isLoading && !isEmpty && !!firstColumnFirstCard;

  const handleTourStepChange = useCallback(
    (stepId: QueryDashboardWalkthroughStepId | null) => {
      setTourStepId(stepId);

      if (stepId === null && tourOpenedModalRef.current) {
        setSelectedCard(null);
        tourOpenedModalRef.current = false;
      }
    },
    [],
  );

  const handleDialogOpenChange = useCallback(
    (open: boolean) => {
      if (open || isModalTourStep) return;

      setSelectedCard(null);
    },
    [isModalTourStep],
  );

  useEffect(() => {
    if (!selectedCard?.id) return;

    const latestSelectedCard = cards.find((card) => card.id === selectedCard.id);
    if (!latestSelectedCard) {
      setSelectedCard(null);
      return;
    }

    setSelectedCard((prev) => (prev === latestSelectedCard ? prev : latestSelectedCard));
  }, [cards, selectedCard?.id]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const updateDesktopViewport = () => {
      setIsDesktopViewport(mediaQuery.matches);
    };

    updateDesktopViewport();
    mediaQuery.addEventListener("change", updateDesktopViewport);

    return () => {
      mediaQuery.removeEventListener("change", updateDesktopViewport);
    };
  }, []);

  useEffect(() => {
    if (!isModalTourStep || !firstColumnFirstCard) return;

    tourOpenedModalRef.current = true;
    setSelectedCard((prev) =>
      prev?.id === firstColumnFirstCard.id ? prev : firstColumnFirstCard,
    );
  }, [firstColumnFirstCard, isModalTourStep]);

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
      <div className="glass-panel-strong mx-auto mt-13 flex min-h-[400px] flex-col items-center justify-center gap-4 md:w-[1000px]">
        <div className="max-auto flex h-[300px] flex-col items-center justify-center space-y-6 text-center">
          <h1 className="text-lg font-bold text-accent md:text-3xl">
            No Agents Saved Yet
          </h1>
          <p className="w-full text-center text-sm text-accent/72 md:w-3/4 md:text-base">
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
    <div className="min-h-[calc(100vh-80px)] overflow-x-auto scrollbar-transparent md:min-h-[calc(100vh-120px)]">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex min-w-fit gap-4 p-4">
          {QUERY_DASH_COLUMNS.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              cards={getCardsForColumn(column.id)}
              onCardClick={handleCardClick}
              tourFilterForceOpen={
                column.id === FIRST_COLUMN_ID && tourStepId !== null
                  ? isFilterTourStep
                  : undefined
              }
              tourFirstCardId={
                column.id === FIRST_COLUMN_ID ? firstColumnFirstCard?.id : null
              }
              tourTargetsEnabled={column.id === FIRST_COLUMN_ID}
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
        onOpenChange={handleDialogOpenChange}
        onTogglePrepQuery={handleTogglePrepQuery}
        onFitRatingChange={handleFitRatingChange}
        onProjectNameChange={handleProjectNameChange}
        onNotesSave={handleNotesSave}
        onMoveCard={(cardId, columnId) => handleMoveCard(cardId, columnId as QueryDashColumnId)}
        tourModalActive={isModalTourStep}
      />

      <QueryDashboardWalkthrough
        enabled={isWalkthroughEnabled}
        onActiveStepChange={handleTourStepChange}
      />
    </div>
  );
}

export default KanbanBoard;
