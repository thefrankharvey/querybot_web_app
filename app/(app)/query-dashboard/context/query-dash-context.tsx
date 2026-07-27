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
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useProfileContext } from "@/app/(app)/context/profile-context";
import { useAgentMatches } from "@/app/(app)/context/agent-matches-context";
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
import { FIRST_COLUMN_ID, sortFirstColumnByNewest } from "../components/kanban-ordering";
import {
  isQueryDashColumnId,
  QueryDashColumnId,
} from "../components/kanban-config";
import { normalizeProjectName } from "@/app/utils/project-dashboard-summary";

interface MoveCardOptions {
  persist?: boolean;
  forcePersist?: boolean;
}

type QueryDashboardDateField =
  | "query_sent_date"
  | "pages_requested_date"
  | "rejected_date"
  | "offer_date";

type EditableCardUpdate = Partial<
  Pick<
    KanbanCardData,
    | "name"
    | "email"
    | "agency_url"
    | "query_tracker"
    | "pub_marketplace"
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
  isRenamingProject: boolean;
  isDeletingProject: boolean;
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
  updateCardFields: (cardId: string, updates: EditableCardUpdate) => void;
  createManualRow: (
    initialUpdates?: EditableCardUpdate,
  ) => Promise<KanbanCardData | null>;
  removeRowsByIds: (
    rowIds: string[],
  ) => Promise<{ deletedRowIds: string[]; failedCount: number }>;
  renameActiveProject: (newName: string) => Promise<void>;
  deleteActiveProject: () => Promise<boolean>;
  setNotes: (cardId: string, notes: string) => void;
  getCardsForColumn: (columnId: string) => KanbanCardData[];
  findCardById: (cardId: string) => KanbanCardData | undefined;
  findColumnByCardId: (cardId: string) => QueryDashColumnId | undefined;
  removeCardByIndexId: (indexId: string) => void;
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

const MILESTONE_DATE_FIELD_BY_COLUMN: Partial<
  Record<QueryDashColumnId, QueryDashboardDateField>
> = {
  "submitted-query": "query_sent_date",
  "pages-requested": "pages_requested_date",
  rejected: "rejected_date",
  "offer-made": "offer_date",
};

function getFurthestMilestoneColumnId(
  card: KanbanCardData,
): QueryDashColumnId {
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

function getPayloadValue(value: string | null | undefined) {
  return value?.trim() || null;
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
  if ("fitRating" in updates) {
    payload.fit_rating = updates.fitRating ?? "neutral";
  }
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
    query_sent_date: agent.query_sent_date,
    pages_requested_date: agent.pages_requested_date,
    rejected_date: agent.rejected_date,
    offer_date: agent.offer_date,
    columnId,
    prepQueryLetterDone: agent.query_letter_ready ?? false,
    fitRating,
    projectName: normalizeProjectName(agent.project_name),
    notes: agent.notes ?? "",
  };
}

export function QueryDashProvider({ children }: { children: React.ReactNode }) {
  const { addAgent, isLoading, refetch, removeProject } = useProfileContext();
  const { renameSavedProjectName } = useAgentMatches();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const rawActiveProjectName = searchParams.get("project");
  const activeProjectName = rawActiveProjectName
    ? normalizeProjectName(rawActiveProjectName)
    : null;
  const [cards, setCards] = useState<KanbanCardData[]>([]);
  const [isHydratingFromServer, setIsHydratingFromServer] = useState(true);
  const [offerMadeCelebrationNonce, setOfferMadeCelebrationNonce] = useState(0);
  const [isRenamingProject, setIsRenamingProject] = useState(false);
  const [isDeletingProject, setIsDeletingProject] = useState(false);

  const visibleCards = useMemo(
    () =>
      activeProjectName
        ? cards.filter((card) => card.projectName === activeProjectName)
        : cards,
    [cards, activeProjectName]
  );

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
            : card
        )
      );

      if (shouldPersist) {
        void persistCardUpdate(
          cardId,
          {
            column_name: columnId,
            updated_date: nextUpdatedDate,
            ...milestoneDateUpdate,
          },
          "Failed to persist column move"
        );
      }

      if (shouldPersist && columnId === "offer-made") {
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
      const nextUpdatedDate = getTodayLocalDateString();

      setCards((prevCards) =>
        prevCards.map((card) =>
          card.id === cardId
            ? { ...card, prepQueryLetterDone: nextValue, updated_date: nextUpdatedDate }
            : card
        )
      );

      void persistCardUpdate(
        cardId,
        {
          query_letter_ready: nextValue,
          updated_date: nextUpdatedDate,
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
      const nextUpdatedDate = getTodayLocalDateString();

      setCards((prevCards) =>
        prevCards.map((card) =>
          card.id === cardId
            ? { ...card, fitRating: rating, updated_date: nextUpdatedDate }
            : card
        )
      );

      void persistCardUpdate(
        cardId,
        {
          fit_rating: rating,
          updated_date: nextUpdatedDate,
        },
        "Failed to update fit rating"
      );
    },
    [cards, persistCardUpdate]
  );

  const setProjectName = useCallback(
    (cardId: string, projectName: string) => {
      const normalizedProjectName = normalizeProjectName(projectName);
      const currentCard = cards.find((card) => card.id === cardId);
      if (!currentCard || currentCard.projectName === normalizedProjectName) return;
      const nextUpdatedDate = getTodayLocalDateString();

      setCards((prevCards) =>
        prevCards.map((card) =>
          card.id === cardId
            ? { ...card, projectName: normalizedProjectName, updated_date: nextUpdatedDate }
            : card
        )
      );

      void persistCardUpdate(
        cardId,
        {
          project_name: normalizedProjectName,
          updated_date: nextUpdatedDate,
        },
        "Failed to update project name"
      );
    },
    [cards, persistCardUpdate]
  );

  const updateCardFields = useCallback(
    (cardId: string, updates: EditableCardUpdate) => {
      const currentCard = cards.find((card) => card.id === cardId);
      if (!currentCard) return;

      const hasDateUpdate = includesMilestoneDateUpdate(updates);
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
      if ("agency_url" in updates) {
        payload.agency_url = updates.agency_url ?? null;
      }
      if ("query_tracker" in updates) {
        payload.query_tracker = updates.query_tracker ?? null;
      }
      if ("pub_marketplace" in updates) {
        payload.pub_marketplace = updates.pub_marketplace ?? null;
      }
      if ("fitRating" in updates) {
        payload.fit_rating = updates.fitRating ?? null;
      }
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
      if ("offer_date" in updates) {
        payload.offer_date = updates.offer_date ?? null;
      }
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

      void persistCardUpdate(
        cardId,
        payload,
        "Failed to update table cell",
      );

      if (
        hasDateUpdate &&
        currentCard.columnId !== "offer-made" &&
        nextColumnId === "offer-made"
      ) {
        setOfferMadeCelebrationNonce((currentNonce) => currentNonce + 1);
      }
    },
    [cards, persistCardUpdate],
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
            if (errorData.error) {
              errorMessage = errorData.error;
            }
          } catch {
            // Use the fallback error message.
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
          // Local state already contains the row; a later refresh can reconcile.
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
    [activeProjectName, addAgent, refetch],
  );

  const removeRowsByIds = useCallback(
    async (rowIds: string[]) => {
      const uniqueRowIds = Array.from(
        new Set(rowIds.map((rowId) => rowId.trim()).filter(Boolean)),
      );

      if (uniqueRowIds.length === 0) {
        return { deletedRowIds: [], failedCount: 0 };
      }

      try {
        const response = await fetch("/api/project-dashboard/rows", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projectName: activeProjectName,
            rowIds: uniqueRowIds,
          }),
        });

        if (!response.ok) {
          let errorMessage = "Failed to remove rows";
          try {
            const errorData = (await response.json()) as { error?: string };
            if (errorData.error) {
              errorMessage = errorData.error;
            }
          } catch {
            // Use the fallback error message.
          }
          throw new Error(errorMessage);
        }

        const result = (await response.json()) as {
          deletedRows?: Array<{ id: string }>;
        };
        const deletedRowIds =
          result.deletedRows?.map((row) => row.id).filter(Boolean) ?? [];
        const deletedRowIdSet = new Set(deletedRowIds);
        const failedCount = uniqueRowIds.length - deletedRowIds.length;

        setCards((prevCards) =>
          prevCards.filter((card) => !deletedRowIdSet.has(card.id)),
        );

        try {
          await refetch();
        } catch {
          // Local state already reflects confirmed deletes.
        }

        if (failedCount > 0) {
          toast.error("Some rows could not be removed", {
            description: `${failedCount} row${
              failedCount === 1 ? "" : "s"
            } stayed in the table.`,
          });
        } else {
          toast.success("Rows removed", {
            description: `${deletedRowIds.length} row${
              deletedRowIds.length === 1 ? "" : "s"
            } removed.`,
          });
        }

        return { deletedRowIds, failedCount };
      } catch (error) {
        toast.error("Rows could not be removed", {
          description:
            error instanceof Error
              ? error.message
              : "Please try again in a moment.",
        });
        return {
          deletedRowIds: [],
          failedCount: uniqueRowIds.length,
        };
      }
    },
    [activeProjectName, refetch],
  );

  const renameActiveProject = useCallback(
    async (newName: string) => {
      const oldName = activeProjectName;
      const trimmedNewName = newName.trim();

      if (!oldName || !trimmedNewName || trimmedNewName === oldName) {
        return;
      }

      setIsRenamingProject(true);
      try {
        setCards((prevCards) =>
          prevCards.map((card) =>
            card.projectName === oldName
              ? { ...card, projectName: trimmedNewName }
              : card
          )
        );

        try {
          const response = await fetch("/api/agent-matches/rename-project", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ oldName, newName: trimmedNewName }),
          });

          if (!response.ok) {
            let errorMessage = "Failed to rename project";
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

          renameSavedProjectName(oldName, trimmedNewName);

          router.replace(`${pathname}?project=${encodeURIComponent(trimmedNewName)}`);
          await refetch();
        } catch (error) {
          toast.error("Failed to rename project", {
            description:
              error instanceof Error
                ? error.message
                : "Project name was updated locally, but server sync failed.",
          });
          await refetch();
        }
      } finally {
        setIsRenamingProject(false);
      }
    },
    [activeProjectName, pathname, refetch, renameSavedProjectName, router]
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
        prevCards.filter((card) => card.projectName !== projectName)
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
            : card
        )
      );

      void persistCardUpdate(
        cardId,
        {
          notes,
          updated_date: nextUpdatedDate,
        },
        "Failed to update notes"
      );
    },
    [cards, persistCardUpdate]
  );

  const getCardsForColumn = useCallback(
    (columnId: string) => visibleCards.filter((card) => card.columnId === columnId),
    [visibleCards]
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

  const removeCardByIndexId = useCallback((indexId: string) => {
    setCards((prevCards) => prevCards.filter((card) => card.index_id !== indexId));
  }, []);

  const value = useMemo<QueryDashContextType>(
    () => ({
      cards,
      visibleCards,
      isLoading: isLoading || isHydratingFromServer,
      isEmpty: !isLoading && !isHydratingFromServer && visibleCards.length === 0,
      offerMadeCelebrationNonce,
      activeProjectName,
      isRenamingProject,
      isDeletingProject,
      moveCard,
      reorderInColumn,
      togglePrepQueryLetter,
      setFitRating,
      setProjectName,
      updateCardFields,
      createManualRow,
      removeRowsByIds,
      renameActiveProject,
      deleteActiveProject,
      setNotes,
      getCardsForColumn,
      findCardById,
      findColumnByCardId,
      removeCardByIndexId,
    }),
    [
      cards,
      visibleCards,
      isLoading,
      isHydratingFromServer,
      offerMadeCelebrationNonce,
      activeProjectName,
      isRenamingProject,
      isDeletingProject,
      moveCard,
      reorderInColumn,
      togglePrepQueryLetter,
      setFitRating,
      setProjectName,
      updateCardFields,
      createManualRow,
      removeRowsByIds,
      renameActiveProject,
      deleteActiveProject,
      setNotes,
      getCardsForColumn,
      findCardById,
      findColumnByCardId,
      removeCardByIndexId,
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
