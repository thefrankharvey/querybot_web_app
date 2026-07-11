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
import { useRouter, useSearchParams } from "next/navigation";
import { useProfileContext } from "@/app/(writer-app)/context/profile-context";
import type {
  AgentMatch,
  SaveAgentPayload,
  SaveAgentResponse,
  UpdateAgentPayload,
} from "@/app/types";
import { toast } from "sonner";
import {
  getFitRatingFromScore,
  type FitRating,
} from "@/app/components/fit-rating-badge";
import { DEFAULT_PROJECT_NAME } from "@/app/constants";
import type { KanbanCardData } from "../components/kanban-card";
import {
  FIRST_COLUMN_ID,
  sortFirstColumnByNewest,
} from "../components/kanban-ordering";
import {
  isQueryDashColumnId,
  QueryDashColumnId,
} from "../components/kanban-config";
import { normalizeProjectName } from "@/app/utils/project-dashboard-summary";
import { useWriterMessageThreads } from "@/app/hooks/use-message-query-lifecycle";
import {
  getWriterThreadsByAgentIdentifier,
  type WriterMessageThread,
} from "@/app/utils/message-types";
import { applyLiveQueryThreadToCard } from "../live-query-dashboard";

interface MoveCardOptions {
  persist?: boolean;
  forcePersist?: boolean;
}

type QueryDashboardDateField =
  "query_sent_date" | "pages_requested_date" | "rejected_date" | "offer_date";

type EditableCardUpdate = Partial<
  Pick<
    KanbanCardData,
    | "name"
    | "email"
    | "agency_url"
    | "query_tracker"
    | "pub_marketplace"
    | "genres_themes"
    | "fitRating"
    | "query_sent_date"
    | "pages_requested_date"
    | "rejected_date"
    | "offer_date"
    | "notes"
  >
>;

export interface QueryDashState {
  cards: KanbanCardData[];
  visibleCards: KanbanCardData[];
  isLoading: boolean;
  isEmpty: boolean;
  offerMadeCelebrationNonce: number;
  activeProjectName: string | null;
  activeWriterProjectId: string | null;
  isDeletingProject: boolean;
}

export interface QueryDashActions {
  moveCard: (
    cardId: string,
    columnId: QueryDashColumnId,
    options?: MoveCardOptions,
  ) => void;
  reorderInColumn: (columnId: string, activeId: string, overId: string) => void;
  togglePrepQueryLetter: (cardId: string) => void;
  setFitRating: (cardId: string, rating: FitRating) => void;
  updateCardFields: (cardId: string, updates: EditableCardUpdate) => void;
  createManualRow: (
    initialUpdates?: EditableCardUpdate,
  ) => Promise<KanbanCardData | null>;
  removeRowsByIndexIds: (
    indexIds: string[],
  ) => Promise<{ deletedIndexIds: string[]; failedCount: number }>;
  deleteActiveProject: () => Promise<boolean>;
  setNotes: (cardId: string, notes: string) => void;
  getCardsForColumn: (columnId: string) => KanbanCardData[];
  findCardById: (cardId: string) => KanbanCardData | undefined;
  findColumnByCardId: (cardId: string) => QueryDashColumnId | undefined;
  removeCardByIndexId: (indexId: string) => void;
}

type QueryDashContextType = QueryDashState & QueryDashActions;

const QueryDashContext = createContext<QueryDashContextType | null>(null);
const EMPTY_MESSAGE_THREADS: readonly WriterMessageThread[] = [];

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
  const existingIds = new Set(
    existingCardsInCurrentOrder.map((card) => card.id),
  );
  const newlyAddedCards = mergedFromAgents.filter(
    (card) => !existingIds.has(card.id),
  );

  // Keep user-driven ordering stable on refresh/update; only sort when new cards appear.
  if (newlyAddedCards.length === 0) {
    return existingCardsInCurrentOrder;
  }

  return sortFirstColumnByNewest([
    ...newlyAddedCards,
    ...existingCardsInCurrentOrder,
  ]);
}

function getTodayLocalDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const MILESTONE_DATE_FIELD_BY_COLUMN: Partial<
  Record<QueryDashColumnId, QueryDashboardDateField>
> = {
  "submitted-query": "query_sent_date",
  "pages-requested": "pages_requested_date",
  rejected: "rejected_date",
  "offer-made": "offer_date",
};

function getFurthestMilestoneColumnId(card: KanbanCardData): QueryDashColumnId {
  if (card.offer_date) return "offer-made";
  if (card.rejected_date) return "rejected";
  if (card.pages_requested_date) return "pages-requested";
  if (card.query_sent_date) return "submitted-query";
  return FIRST_COLUMN_ID;
}

function includesMilestoneDateUpdate(updates: EditableCardUpdate) {
  return (
    "query_sent_date" in updates ||
    "pages_requested_date" in updates ||
    "rejected_date" in updates ||
    "offer_date" in updates
  );
}

function getActivityDateForUpdate(updates: EditableCardUpdate) {
  return (
    getPayloadValue(updates.offer_date) ??
    getPayloadValue(updates.rejected_date) ??
    getPayloadValue(updates.pages_requested_date) ??
    getPayloadValue(updates.query_sent_date) ??
    getTodayLocalDateString()
  );
}

function createManualIndexId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `manual:${crypto.randomUUID()}`;
  }

  return `manual:${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getPayloadValue(value: string | null | undefined) {
  return value?.trim() || null;
}

function getColumnIdFromDateUpdates(
  updates: EditableCardUpdate,
): QueryDashColumnId {
  if (updates.offer_date) return "offer-made";
  if (updates.rejected_date) return "rejected";
  if (updates.pages_requested_date) return "pages-requested";
  if (updates.query_sent_date) return "submitted-query";
  return FIRST_COLUMN_ID;
}

function applyEditableUpdatesToPayload(
  payload: SaveAgentPayload,
  updates: EditableCardUpdate,
) {
  if ("name" in updates) {
    payload.name = getPayloadValue(updates.name) ?? "Untitled Agent";
  }
  if ("email" in updates) payload.email = getPayloadValue(updates.email);
  if ("agency_url" in updates) {
    payload.agency_url = getPayloadValue(updates.agency_url);
  }
  if ("query_tracker" in updates) {
    payload.query_tracker = getPayloadValue(updates.query_tracker);
  }
  if ("pub_marketplace" in updates) {
    payload.pub_marketplace = getPayloadValue(updates.pub_marketplace);
  }
  if ("genres_themes" in updates) {
    payload.genres_themes = getPayloadValue(updates.genres_themes);
  }
  if ("fitRating" in updates)
    payload.fit_rating = updates.fitRating ?? "neutral";
  if ("notes" in updates) payload.notes = updates.notes ?? null;
  if ("query_sent_date" in updates) {
    payload.query_sent_date = getPayloadValue(updates.query_sent_date);
  }
  if ("pages_requested_date" in updates) {
    payload.pages_requested_date = getPayloadValue(
      updates.pages_requested_date,
    );
  }
  if ("rejected_date" in updates) {
    payload.rejected_date = getPayloadValue(updates.rejected_date);
  }
  if ("offer_date" in updates) {
    payload.offer_date = getPayloadValue(updates.offer_date);
  }

  if (includesMilestoneDateUpdate(updates)) {
    payload.column_name = getColumnIdFromDateUpdates(updates);
    payload.updated_date = getActivityDateForUpdate(updates);
  }
}

function isFitRating(value: string): value is FitRating {
  return (
    value === "perfect" ||
    value === "great" ||
    value === "good" ||
    value === "neutral"
  );
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
    genres_themes: agent.genres_themes,
    query_sent_date: agent.query_sent_date,
    pages_requested_date: agent.pages_requested_date,
    rejected_date: agent.rejected_date,
    offer_date: agent.offer_date,
    columnId,
    prepQueryLetterDone: agent.query_letter_ready ?? false,
    fitRating,
    projectName: normalizeProjectName(agent.project_name),
    writerProjectId: agent.writer_project_id?.trim() || null,
    notes: agent.notes ?? "",
  };
}

export function QueryDashProvider({
  children,
  projectNameOverride,
  writerProjectIdOverride,
}: {
  children: React.ReactNode;
  projectNameOverride?: string;
  writerProjectIdOverride?: string | null;
}) {
  const { addAgent, isLoading, refetch, removeAgent, removeProject } =
    useProfileContext();
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawActiveProjectName =
    projectNameOverride ?? searchParams.get("project");
  const activeProjectName = rawActiveProjectName
    ? normalizeProjectName(rawActiveProjectName)
    : null;
  const rawActiveWriterProjectId =
    writerProjectIdOverride ?? searchParams.get("writerProjectId");
  const activeWriterProjectId = rawActiveWriterProjectId?.trim() || null;
  const [cards, setCards] = useState<KanbanCardData[]>([]);
  const [isHydratingFromServer, setIsHydratingFromServer] = useState(true);
  const [offerMadeCelebrationNonce, setOfferMadeCelebrationNonce] = useState(0);
  const [isDeletingProject, setIsDeletingProject] = useState(false);
  const messageProjectId = activeWriterProjectId ?? activeProjectName ?? "";
  const messageThreadsQuery = useWriterMessageThreads({
    projectId: messageProjectId,
    enabled: Boolean(messageProjectId),
  });
  const messageThreads =
    messageThreadsQuery.data?.threads ?? EMPTY_MESSAGE_THREADS;
  const messageThreadsByAgentIdentifier = useMemo(
    () => getWriterThreadsByAgentIdentifier(messageThreads),
    [messageThreads],
  );
  const cardsWithLiveTracking = useMemo(
    () =>
      cards.map((card) => {
        const agentIdentifier = card.index_id?.trim() ?? "";
        const liveThread = agentIdentifier
          ? (messageThreadsByAgentIdentifier.get(agentIdentifier)?.[0] ?? null)
          : null;

        return {
          ...applyLiveQueryThreadToCard(card, liveThread),
          lifecycleSyncUnavailable: messageThreadsQuery.isError,
        };
      }),
    [cards, messageThreadsByAgentIdentifier, messageThreadsQuery.isError],
  );

  const visibleCards = useMemo(
    () =>
      activeWriterProjectId
        ? cardsWithLiveTracking.filter(
            (card) =>
              card.writerProjectId === activeWriterProjectId ||
              (!card.writerProjectId &&
                activeProjectName &&
                card.projectName === activeProjectName),
          )
        : activeProjectName
          ? cardsWithLiveTracking.filter(
              (card) => card.projectName === activeProjectName,
            )
          : cardsWithLiveTracking,
    [cardsWithLiveTracking, activeProjectName, activeWriterProjectId],
  );

  useEffect(() => {
    let isMounted = true;

    const hydrateFromFreshServerData = async () => {
      setIsHydratingFromServer(true);

      try {
        const result = await refetch();
        if (!isMounted) return;

        const freshAgents = result.data?.agent_matches ?? [];
        let mergedFromAgents = freshAgents.map(mapAgentToCard);

        if (activeWriterProjectId) {
          try {
            const enrichmentResponse = await fetch(
              `/api/projects/${encodeURIComponent(activeWriterProjectId)}/agent-genres`,
            );
            if (enrichmentResponse.ok) {
              const enrichmentData = (await enrichmentResponse.json()) as {
                genresThemesByIndexId?: Record<string, string>;
              };
              const genresThemesByIndexId =
                enrichmentData.genresThemesByIndexId ?? {};

              mergedFromAgents = mergedFromAgents.map((card) => {
                if (card.genres_themes?.trim() || !card.index_id) {
                  return card;
                }

                const genresThemes = genresThemesByIndexId[card.index_id];
                return genresThemes
                  ? { ...card, genres_themes: genresThemes }
                  : card;
              });
            }
          } catch {
            // Enrichment is best-effort; saved dashboard fields still render.
          }
        }

        setCards((prevCards) =>
          mergeCardsPreservingOrder({
            previousCards: prevCards,
            mergedFromAgents,
          }),
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
  }, [activeWriterProjectId, refetch]);

  const persistCardUpdate = useCallback(
    async (
      cardId: string,
      payload: UpdateAgentPayload,
      fallbackErrorMessage: string,
    ) => {
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
    [cards],
  );

  const moveCard = useCallback(
    (
      cardId: string,
      columnId: QueryDashColumnId,
      options: MoveCardOptions = {},
    ) => {
      const { persist = true, forcePersist = false } = options;
      const currentCard = cardsWithLiveTracking.find(
        (card) => card.id === cardId,
      );
      if (!currentCard) return;

      if (currentCard.lifecycleSyncUnavailable) {
        toast.error("Message status sync is temporarily unavailable", {
          description:
            "Lifecycle moves are paused to protect live query history. The dashboard retries automatically.",
        });
        return;
      }

      if (currentCard.trackingMode === "live") {
        toast.info("This query is synced from Messages", {
          description: "Open the live query to change its lifecycle status.",
        });
        return;
      }

      const columnChanged = currentCard.columnId !== columnId;
      const shouldPersist = persist && (columnChanged || forcePersist);
      const nextUpdatedDate = getTodayLocalDateString();
      const milestoneDateField = MILESTONE_DATE_FIELD_BY_COLUMN[columnId];
      const milestoneDateUpdate = milestoneDateField
        ? { [milestoneDateField]: nextUpdatedDate }
        : {};

      setCards((prevCards) =>
        prevCards.map((card) =>
          card.id === cardId
            ? {
                ...card,
                columnId,
                ...milestoneDateUpdate,
                ...(shouldPersist ? { updated_date: nextUpdatedDate } : {}),
              }
            : card,
        ),
      );

      if (shouldPersist) {
        void persistCardUpdate(
          cardId,
          {
            column_name: columnId,
            updated_date: nextUpdatedDate,
            ...milestoneDateUpdate,
          },
          "Failed to persist column move",
        );
      }

      if (shouldPersist && columnId === "offer-made") {
        setOfferMadeCelebrationNonce((currentNonce) => currentNonce + 1);
      }
    },
    [cardsWithLiveTracking, persistCardUpdate],
  );

  const reorderInColumn = useCallback(
    (columnId: string, activeId: string, overId: string) => {
      if (activeId === overId) return;

      setCards((prevCards) => {
        const columnCards = prevCards.filter(
          (card) => card.columnId === columnId,
        );
        const otherCards = prevCards.filter(
          (card) => card.columnId !== columnId,
        );

        const activeIndex = columnCards.findIndex(
          (card) => card.id === activeId,
        );
        const overIndex = columnCards.findIndex((card) => card.id === overId);

        if (activeIndex === -1 || overIndex === -1) return prevCards;

        const reorderedColumnCards = arrayMove(
          columnCards,
          activeIndex,
          overIndex,
        );
        return [...otherCards, ...reorderedColumnCards];
      });
    },
    [],
  );

  const togglePrepQueryLetter = useCallback(
    (cardId: string) => {
      const currentCard = cards.find((card) => card.id === cardId);
      if (!currentCard) return;
      const nextValue = !currentCard.prepQueryLetterDone;
      const nextUpdatedDate = getTodayLocalDateString();

      setCards((prevCards) =>
        prevCards.map((card) =>
          card.id === cardId
            ? {
                ...card,
                prepQueryLetterDone: nextValue,
                updated_date: nextUpdatedDate,
              }
            : card,
        ),
      );

      void persistCardUpdate(
        cardId,
        {
          query_letter_ready: nextValue,
          updated_date: nextUpdatedDate,
        },
        "Failed to update query letter status",
      );
    },
    [cards, persistCardUpdate],
  );

  const setFitRating = useCallback(
    (cardId: string, rating: FitRating) => {
      const currentCard = cards.find((card) => card.id === cardId);
      if (!currentCard || currentCard.fitRating === rating) return;
      const nextUpdatedDate = getTodayLocalDateString();

      setCards((prevCards) =>
        prevCards.map((card) =>
          card.id === cardId
            ? { ...card, fitRating: rating, updated_date: nextUpdatedDate }
            : card,
        ),
      );

      void persistCardUpdate(
        cardId,
        {
          fit_rating: rating,
          updated_date: nextUpdatedDate,
        },
        "Failed to update fit rating",
      );
    },
    [cards, persistCardUpdate],
  );

  const updateCardFields = useCallback(
    (cardId: string, updates: EditableCardUpdate) => {
      const currentCard = cardsWithLiveTracking.find(
        (card) => card.id === cardId,
      );
      if (!currentCard) return;

      const hasDateUpdate = includesMilestoneDateUpdate(updates);
      if (currentCard.lifecycleSyncUnavailable && hasDateUpdate) {
        toast.error("Message status sync is temporarily unavailable", {
          description:
            "Lifecycle dates are paused until the dashboard can verify live queries.",
        });
        return;
      }
      if (currentCard.trackingMode === "live" && hasDateUpdate) {
        toast.info("Lifecycle dates are managed in Messages", {
          description: "Open the live query to update its status.",
        });
        return;
      }
      const nextUpdatedDate = getActivityDateForUpdate(updates);
      const nextCard = {
        ...currentCard,
        ...updates,
      };
      const nextColumnId = hasDateUpdate
        ? getFurthestMilestoneColumnId(nextCard)
        : currentCard.columnId;
      const payload: UpdateAgentPayload = {
        updated_date: nextUpdatedDate,
      };

      if ("name" in updates) payload.name = updates.name ?? null;
      if ("email" in updates) payload.email = updates.email ?? null;
      if ("agency_url" in updates)
        payload.agency_url = updates.agency_url ?? null;
      if ("query_tracker" in updates) {
        payload.query_tracker = updates.query_tracker ?? null;
      }
      if ("pub_marketplace" in updates) {
        payload.pub_marketplace = updates.pub_marketplace ?? null;
      }
      if ("genres_themes" in updates) {
        payload.genres_themes = updates.genres_themes ?? null;
      }
      if ("fitRating" in updates)
        payload.fit_rating = updates.fitRating ?? null;
      if ("notes" in updates) payload.notes = updates.notes ?? null;
      if ("query_sent_date" in updates) {
        payload.query_sent_date = updates.query_sent_date ?? null;
      }
      if ("pages_requested_date" in updates) {
        payload.pages_requested_date = updates.pages_requested_date ?? null;
      }
      if ("rejected_date" in updates) {
        payload.rejected_date = updates.rejected_date ?? null;
      }
      if ("offer_date" in updates)
        payload.offer_date = updates.offer_date ?? null;
      if (hasDateUpdate && nextColumnId !== currentCard.columnId) {
        payload.column_name = nextColumnId;
      }

      setCards((prevCards) =>
        prevCards.map((card) =>
          card.id === cardId
            ? {
                ...card,
                ...updates,
                columnId: nextColumnId,
                updated_date: nextUpdatedDate,
              }
            : card,
        ),
      );

      void persistCardUpdate(cardId, payload, "Failed to update table cell");

      if (hasDateUpdate && nextColumnId === "offer-made") {
        setOfferMadeCelebrationNonce((currentNonce) => currentNonce + 1);
      }
    },
    [cardsWithLiveTracking, persistCardUpdate],
  );

  const createManualRow = useCallback(
    async (initialUpdates: EditableCardUpdate = {}) => {
      const manualPayload: SaveAgentPayload = {
        name: getPayloadValue(initialUpdates.name) ?? "Untitled Agent",
        index_id: createManualIndexId(),
        fit_rating: initialUpdates.fitRating ?? "neutral",
        column_name: includesMilestoneDateUpdate(initialUpdates)
          ? getColumnIdFromDateUpdates(initialUpdates)
          : FIRST_COLUMN_ID,
        updated_date: getActivityDateForUpdate(initialUpdates),
        query_letter_ready: false,
        project_name: activeProjectName ?? DEFAULT_PROJECT_NAME,
        writer_project_id: activeWriterProjectId,
      };

      applyEditableUpdatesToPayload(manualPayload, initialUpdates);

      try {
        const response = await fetch("/api/agent-matches", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(manualPayload),
        });

        if (!response.ok) {
          let errorMessage = "Failed to create row";
          try {
            const errorData = (await response.json()) as { error?: string };
            if (errorData?.error) {
              errorMessage = errorData.error;
            }
          } catch {
            // Use fallback.
          }
          throw new Error(errorMessage);
        }

        const result = (await response.json()) as SaveAgentResponse;
        const createdAgent = result.created[0] as AgentMatch | undefined;
        if (!createdAgent) {
          throw new Error("Created row was not returned by the server.");
        }

        const createdCard = mapAgentToCard(createdAgent);
        setCards((prevCards) => [...prevCards, createdCard]);
        addAgent(createdAgent);

        try {
          await refetch();
        } catch {
          // Local state already contains the row; the next refresh can reconcile.
        }

        return createdCard;
      } catch (error) {
        toast.error("Failed to add row", {
          description:
            error instanceof Error
              ? error.message
              : "Please try again in a moment.",
        });
        return null;
      }
    },
    [activeProjectName, activeWriterProjectId, addAgent, refetch],
  );

  const removeRowsByIndexIds = useCallback(
    async (indexIds: string[]) => {
      const uniqueIndexIds = Array.from(
        new Set(indexIds.map((indexId) => indexId.trim()).filter(Boolean)),
      );

      if (uniqueIndexIds.length === 0) {
        return { deletedIndexIds: [], failedCount: 0 };
      }

      const results = await Promise.allSettled(
        uniqueIndexIds.map(async (indexId) => {
          const response = await fetch(
            `/api/agent-matches/${encodeURIComponent(indexId)}`,
            {
              method: "DELETE",
            },
          );

          if (!response.ok) {
            throw new Error(`Failed to delete ${indexId}`);
          }

          return indexId;
        }),
      );
      const deletedIndexIds = results
        .filter(
          (result): result is PromiseFulfilledResult<string> =>
            result.status === "fulfilled",
        )
        .map((result) => result.value);
      const failedCount = results.length - deletedIndexIds.length;

      if (deletedIndexIds.length > 0) {
        const deletedSet = new Set(deletedIndexIds);
        setCards((prevCards) =>
          prevCards.filter(
            (card) => !card.index_id || !deletedSet.has(card.index_id),
          ),
        );
        for (const indexId of deletedIndexIds) {
          removeAgent(indexId);
        }
      }

      if (failedCount > 0) {
        toast.error("Some rows could not be removed", {
          description: `${failedCount} row${failedCount === 1 ? "" : "s"} stayed in the table.`,
        });
      } else {
        toast.success("Rows removed", {
          description: `${deletedIndexIds.length} row${deletedIndexIds.length === 1 ? "" : "s"} removed.`,
        });
      }

      try {
        await refetch();
      } catch {
        // Local state was updated for successful deletes.
      }

      return { deletedIndexIds, failedCount };
    },
    [refetch, removeAgent],
  );

  const deleteActiveProject = useCallback(async () => {
    const projectName = activeProjectName;

    if (!projectName) {
      return false;
    }

    setIsDeletingProject(true);
    try {
      const response = await fetch("/api/agent-matches/delete-project", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ projectName }),
      });

      if (!response.ok) {
        let errorMessage = "Failed to delete project";
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

      setCards((prevCards) =>
        prevCards.filter((card) => card.projectName !== projectName),
      );
      removeProject(projectName);

      toast.success("Project deleted", {
        description: "Saved agents for this project were removed.",
      });

      try {
        await refetch();
      } catch {
        // The local cache has already been updated; the next profile load can refresh.
      }

      router.replace("/home");
      return true;
    } catch (error) {
      toast.error("Failed to delete project", {
        description:
          error instanceof Error
            ? error.message
            : "Please try again in a moment.",
      });
      return false;
    } finally {
      setIsDeletingProject(false);
    }
  }, [activeProjectName, refetch, removeProject, router]);

  const setNotes = useCallback(
    (cardId: string, notes: string) => {
      const currentCard = cards.find((card) => card.id === cardId);
      if (!currentCard || currentCard.notes === notes) return;
      const nextUpdatedDate = getTodayLocalDateString();

      setCards((prevCards) =>
        prevCards.map((card) =>
          card.id === cardId
            ? { ...card, notes, updated_date: nextUpdatedDate }
            : card,
        ),
      );

      void persistCardUpdate(
        cardId,
        {
          notes,
          updated_date: nextUpdatedDate,
        },
        "Failed to update notes",
      );
    },
    [cards, persistCardUpdate],
  );

  const getCardsForColumn = useCallback(
    (columnId: string) =>
      visibleCards.filter((card) => card.columnId === columnId),
    [visibleCards],
  );

  const findCardById = useCallback(
    (cardId: string) =>
      cardsWithLiveTracking.find((card) => card.id === cardId),
    [cardsWithLiveTracking],
  );

  const findColumnByCardId = useCallback(
    (cardId: string) => {
      const card = cardsWithLiveTracking.find(
        (currentCard) => currentCard.id === cardId,
      );
      if (!card) return undefined;
      return isQueryDashColumnId(card.columnId) ? card.columnId : undefined;
    },
    [cardsWithLiveTracking],
  );

  const removeCardByIndexId = useCallback((indexId: string) => {
    setCards((prevCards) =>
      prevCards.filter((card) => card.index_id !== indexId),
    );
  }, []);

  const value = useMemo<QueryDashContextType>(
    () => ({
      cards: cardsWithLiveTracking,
      visibleCards,
      isLoading:
        isLoading || isHydratingFromServer || messageThreadsQuery.isLoading,
      isEmpty:
        !isLoading &&
        !isHydratingFromServer &&
        !messageThreadsQuery.isLoading &&
        visibleCards.length === 0,
      offerMadeCelebrationNonce,
      activeProjectName,
      activeWriterProjectId,
      isDeletingProject,
      moveCard,
      reorderInColumn,
      togglePrepQueryLetter,
      setFitRating,
      updateCardFields,
      createManualRow,
      removeRowsByIndexIds,
      deleteActiveProject,
      setNotes,
      getCardsForColumn,
      findCardById,
      findColumnByCardId,
      removeCardByIndexId,
    }),
    [
      cardsWithLiveTracking,
      visibleCards,
      isLoading,
      isHydratingFromServer,
      messageThreadsQuery.isLoading,
      offerMadeCelebrationNonce,
      activeProjectName,
      activeWriterProjectId,
      isDeletingProject,
      moveCard,
      reorderInColumn,
      togglePrepQueryLetter,
      setFitRating,
      updateCardFields,
      createManualRow,
      removeRowsByIndexIds,
      deleteActiveProject,
      setNotes,
      getCardsForColumn,
      findCardById,
      findColumnByCardId,
      removeCardByIndexId,
    ],
  );

  return (
    <QueryDashContext.Provider value={value}>
      {children}
    </QueryDashContext.Provider>
  );
}

export function useQueryDashContext(): QueryDashContextType {
  const context = useContext(QueryDashContext);

  if (!context) {
    throw new Error(
      "useQueryDashContext must be used within QueryDashProvider",
    );
  }

  return context;
}
