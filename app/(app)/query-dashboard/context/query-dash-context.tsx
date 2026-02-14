"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { arrayMove } from "@dnd-kit/sortable";
import { useProfileContext } from "@/app/(app)/context/profile-context";
import type { AgentMatch, UpdateAgentPayload } from "@/app/types";
import { toast } from "sonner";
import {
  FitRating,
  getFitRatingFromScore,
  KanbanCardData,
} from "../components/kanban-card";
import { FIRST_COLUMN_ID, sortFirstColumnByNewest } from "../components/kanban-ordering";
import {
  isQueryDashColumnId,
  QueryDashColumnId,
} from "../components/kanban-config";

interface MoveCardOptions {
  persist?: boolean;
  forcePersist?: boolean;
}

export interface QueryDashState {
  cards: KanbanCardData[];
  isLoading: boolean;
  isEmpty: boolean;
  offerMadeCelebrationNonce: number;
}

export interface QueryDashActions {
  moveCard: (
    cardId: string,
    columnId: QueryDashColumnId,
    options?: MoveCardOptions
  ) => void;
  reorderInColumn: (columnId: string, activeId: string, overId: string) => void;
  togglePrepQueryLetter: (cardId: string) => void;
  setFitRating: (cardId: string, rating: FitRating) => void;
  setProjectName: (cardId: string, projectName: string) => void;
  setNotes: (cardId: string, notes: string) => void;
  getCardsForColumn: (columnId: string) => KanbanCardData[];
  findCardById: (cardId: string) => KanbanCardData | undefined;
  findColumnByCardId: (cardId: string) => QueryDashColumnId | undefined;
}

type QueryDashContextType = QueryDashState & QueryDashActions;

const QueryDashContext = createContext<QueryDashContextType | null>(null);

function mergeCardsPreservingOrder({
  previousCards,
  mergedFromAgents,
}: {
  previousCards: KanbanCardData[];
  mergedFromAgents: KanbanCardData[];
}): KanbanCardData[] {
  const mergedById = new Map(mergedFromAgents.map((card) => [card.id, card]));
  const existingCardsInCurrentOrder = previousCards
    .map((card) => mergedById.get(card.id))
    .filter((card): card is KanbanCardData => Boolean(card));
  const existingIds = new Set(existingCardsInCurrentOrder.map((card) => card.id));
  const newlyAddedCards = mergedFromAgents.filter((card) => !existingIds.has(card.id));

  // Keep user-driven ordering stable on refresh/update; only sort when new cards appear.
  if (newlyAddedCards.length === 0) {
    return existingCardsInCurrentOrder;
  }

  return sortFirstColumnByNewest([...newlyAddedCards, ...existingCardsInCurrentOrder]);
}

function getTodayLocalDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isFitRating(value: string): value is FitRating {
  return value === "perfect" || value === "great" || value === "good" || value === "neutral";
}

function mapAgentToCard(agent: AgentMatch): KanbanCardData {
  const columnId =
    agent.column_name && isQueryDashColumnId(agent.column_name)
      ? agent.column_name
      : FIRST_COLUMN_ID;

  const fitRating =
    agent.fit_rating && isFitRating(agent.fit_rating)
      ? agent.fit_rating
      : getFitRatingFromScore(agent.match_score);

  return {
    id: agent.id,
    created_at: agent.created_at,
    updated_date: agent.updated_date,
    name: agent.name,
    email: agent.email,
    agency: agent.agency,
    index_id: agent.index_id,
    query_tracker: agent.query_tracker,
    pub_marketplace: agent.pub_marketplace,
    match_score: agent.match_score,
    agency_url: agent.agency_url,
    columnId,
    prepQueryLetterDone: agent.query_letter_ready ?? false,
    fitRating,
    projectName: agent.project_name ?? "",
    notes: agent.notes ?? "",
  };
}

export function QueryDashProvider({ children }: { children: React.ReactNode }) {
  const { isLoading, refetch } = useProfileContext();
  const [cards, setCards] = useState<KanbanCardData[]>([]);
  const [isHydratingFromServer, setIsHydratingFromServer] = useState(true);
  const [offerMadeCelebrationNonce, setOfferMadeCelebrationNonce] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const hydrateFromFreshServerData = async () => {
      setIsHydratingFromServer(true);

      try {
        const result = await refetch();
        if (!isMounted) return;

        const freshAgents = result.data?.agent_matches ?? [];
        const mergedFromAgents = freshAgents.map(mapAgentToCard);

        setCards((prevCards) =>
          mergeCardsPreservingOrder({
            previousCards: prevCards,
            mergedFromAgents,
          })
        );
      } catch (error) {
        if (!isMounted) return;

        toast.warning("Unable to refresh query dashboard", {
          description:
            error instanceof Error
              ? error.message
              : "Showing your current board state until data is available.",
        });
      } finally {
        if (isMounted) {
          setIsHydratingFromServer(false);
        }
      }
    };

    void hydrateFromFreshServerData();

    return () => {
      isMounted = false;
    };
  }, [refetch]);

  const persistCardUpdate = useCallback(
    async (cardId: string, payload: UpdateAgentPayload, fallbackErrorMessage: string) => {
      const card = cards.find((currentCard) => currentCard.id === cardId);
      if (!card?.index_id) {
        console.warn("Skipping card update persistence: missing index_id", {
          cardId,
          payload,
        });
        return;
      }

      try {
        const response = await fetch(`/api/agent-matches/${card.index_id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          let errorMessage = fallbackErrorMessage;
          try {
            const errorData = (await response.json()) as { error?: string };
            if (errorData?.error) {
              errorMessage = errorData.error;
            }
          } catch {
            // Ignore parse errors and use fallback message.
          }
          throw new Error(errorMessage);
        }
      } catch (error) {
        toast.error("Failed to sync agent update", {
          description:
            error instanceof Error
              ? error.message
              : "Card was updated locally, but server sync failed.",
        });
      }
    },
    [cards]
  );

  const moveCard = useCallback(
    (
      cardId: string,
      columnId: QueryDashColumnId,
      options: MoveCardOptions = {}
    ) => {
      const { persist = true, forcePersist = false } = options;
      const currentCard = cards.find((card) => card.id === cardId);
      if (!currentCard) return;

      const columnChanged = currentCard.columnId !== columnId;

      setCards((prevCards) =>
        prevCards.map((card) =>
          card.id === cardId ? { ...card, columnId } : card
        )
      );

      if (persist && (columnChanged || forcePersist)) {
        void persistCardUpdate(
          cardId,
          {
            column_name: columnId,
            updated_date: getTodayLocalDateString(),
          },
          "Failed to persist column move"
        );
      }

      if (persist && (columnChanged || forcePersist) && columnId === "offer-made") {
        setOfferMadeCelebrationNonce((currentNonce) => currentNonce + 1);
      }
    },
    [cards, persistCardUpdate]
  );

  const reorderInColumn = useCallback(
    (columnId: string, activeId: string, overId: string) => {
      if (activeId === overId) return;

      setCards((prevCards) => {
        const columnCards = prevCards.filter((card) => card.columnId === columnId);
        const otherCards = prevCards.filter((card) => card.columnId !== columnId);

        const activeIndex = columnCards.findIndex((card) => card.id === activeId);
        const overIndex = columnCards.findIndex((card) => card.id === overId);

        if (activeIndex === -1 || overIndex === -1) return prevCards;

        const reorderedColumnCards = arrayMove(columnCards, activeIndex, overIndex);
        return [...otherCards, ...reorderedColumnCards];
      });
    },
    []
  );

  const togglePrepQueryLetter = useCallback(
    (cardId: string) => {
      const currentCard = cards.find((card) => card.id === cardId);
      if (!currentCard) return;
      const nextValue = !currentCard.prepQueryLetterDone;

      setCards((prevCards) =>
        prevCards.map((card) =>
          card.id === cardId ? { ...card, prepQueryLetterDone: nextValue } : card
        )
      );

      void persistCardUpdate(
        cardId,
        {
          query_letter_ready: nextValue,
          updated_date: getTodayLocalDateString(),
        },
        "Failed to update query letter status"
      );
    },
    [cards, persistCardUpdate]
  );

  const setFitRating = useCallback(
    (cardId: string, rating: FitRating) => {
      const currentCard = cards.find((card) => card.id === cardId);
      if (!currentCard || currentCard.fitRating === rating) return;

      setCards((prevCards) =>
        prevCards.map((card) =>
          card.id === cardId ? { ...card, fitRating: rating } : card
        )
      );

      void persistCardUpdate(
        cardId,
        {
          fit_rating: rating,
          updated_date: getTodayLocalDateString(),
        },
        "Failed to update fit rating"
      );
    },
    [cards, persistCardUpdate]
  );

  const setProjectName = useCallback(
    (cardId: string, projectName: string) => {
      const currentCard = cards.find((card) => card.id === cardId);
      if (!currentCard || currentCard.projectName === projectName) return;

      setCards((prevCards) =>
        prevCards.map((card) =>
          card.id === cardId ? { ...card, projectName } : card
        )
      );

      void persistCardUpdate(
        cardId,
        {
          project_name: projectName,
          updated_date: getTodayLocalDateString(),
        },
        "Failed to update project name"
      );
    },
    [cards, persistCardUpdate]
  );

  const setNotes = useCallback(
    (cardId: string, notes: string) => {
      const currentCard = cards.find((card) => card.id === cardId);
      if (!currentCard || currentCard.notes === notes) return;

      setCards((prevCards) =>
        prevCards.map((card) =>
          card.id === cardId ? { ...card, notes } : card
        )
      );

      void persistCardUpdate(
        cardId,
        {
          notes,
          updated_date: getTodayLocalDateString(),
        },
        "Failed to update notes"
      );
    },
    [cards, persistCardUpdate]
  );

  const getCardsForColumn = useCallback(
    (columnId: string) => cards.filter((card) => card.columnId === columnId),
    [cards]
  );

  const findCardById = useCallback(
    (cardId: string) => cards.find((card) => card.id === cardId),
    [cards]
  );

  const findColumnByCardId = useCallback(
    (cardId: string) => {
      const card = cards.find((currentCard) => currentCard.id === cardId);
      if (!card) return undefined;
      return isQueryDashColumnId(card.columnId) ? card.columnId : undefined;
    },
    [cards]
  );

  const value = useMemo<QueryDashContextType>(
    () => ({
      cards,
      isLoading: isLoading || isHydratingFromServer,
      isEmpty: !isLoading && !isHydratingFromServer && cards.length === 0,
      offerMadeCelebrationNonce,
      moveCard,
      reorderInColumn,
      togglePrepQueryLetter,
      setFitRating,
      setProjectName,
      setNotes,
      getCardsForColumn,
      findCardById,
      findColumnByCardId,
    }),
    [
      cards,
      isLoading,
      isHydratingFromServer,
      offerMadeCelebrationNonce,
      moveCard,
      reorderInColumn,
      togglePrepQueryLetter,
      setFitRating,
      setProjectName,
      setNotes,
      getCardsForColumn,
      findCardById,
      findColumnByCardId,
    ]
  );

  return (
    <QueryDashContext.Provider value={value}>{children}</QueryDashContext.Provider>
  );
}

export function useQueryDashContext(): QueryDashContextType {
  const context = useContext(QueryDashContext);

  if (!context) {
    throw new Error("useQueryDashContext must be used within QueryDashProvider");
  }

  return context;
}
