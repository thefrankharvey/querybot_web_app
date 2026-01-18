"use client";

import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { startSheetPolling, stopSheetPolling } from "../workers/sheet-worker-manager";

export interface MatchHits {
  cluster: {
    comps: string[];
    genres: string[];
    subgenres: string[];
    target_audience: string[];
    themes: string[];
  };
  direct: {
    comps: string[];
    genres: string[];
    subgenres: string[];
    target_audience: string[];
    themes: string[];
  };
}

export interface AgentMatch {
  aala_member?: string;
  agency: string;
  bio: string;
  clients?: string;
  dont_send?: string;
  email?: string;
  extra_interest?: string;
  extra_links?: string;
  agent_id?: string;
  favorites: string;
  negatives?: string;
  genres: string;
  id: string;
  location?: string;
  name: string;
  pubmarketplace?: string;
  querymanager?: string;
  querytracker?: string;
  sales?: string;
  submission_req: string;
  score: number;
  normalized_score: number;
  twitter_handle?: string;
  twitter_url?: string;
  website?: string;
  status?: string;
  match_hits?: MatchHits;
}

export interface FormData {
  email: string;
  genre: string;
  subgenres: string[];
  format: string;
  target_audience: string;
  comps: string[];
  themes: string[];
  enable_ai: boolean;
  non_fiction: boolean;
}

const QUERY_KEYS = {
  agentMatches: ["agentMatches"] as const,
  formData: ["formData"] as const,
  nextCursorCount: ["nextCursorCount"] as const,
  currentCursor: ["currentCursor"] as const,
  spreadsheetUrl: ["spreadsheetUrl"] as const,
  statusFilter: ["statusFilter"] as const,
};

const STORAGE_KEYS = {
  agentMatches: "agent_matches",
  formData: "query_form_data",
  nextCursorCount: "future_request_count",
  currentCursor: "current_cursor",
  spreadsheetUrl: "spreadsheet_url",
  statusFilter: "status_filter",
};

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readJSON<T>(key: string): T | null {
  if (!canUseStorage()) return null;
  const raw = window.localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJSON<T>(key: string, value: T) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function removeKey(key: string) {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(key);
}

export type SheetStatus = "idle" | "pending" | "ready" | "timeout" | "error";

const useAgentData = () => {
  const queryClient = useQueryClient();

  const [sheetTaskId, setSheetTaskId] = useState<string | null>(null);
  const [sheetStatus, setSheetStatus] = useState<SheetStatus>("idle");

  const { data: matches = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.agentMatches,
    queryFn: async (): Promise<AgentMatch[]> =>
      readJSON<AgentMatch[]>(STORAGE_KEYS.agentMatches) ?? [],
    initialData: () => readJSON<AgentMatch[]>(STORAGE_KEYS.agentMatches) ?? [],
  });

  const { data: formData = null } = useQuery({
    queryKey: QUERY_KEYS.formData,
    queryFn: async (): Promise<FormData | null> =>
      readJSON<FormData>(STORAGE_KEYS.formData),
    initialData: () => readJSON<FormData>(STORAGE_KEYS.formData),
  });

  const { data: nextCursorCount = null } = useQuery({
    queryKey: QUERY_KEYS.nextCursorCount,
    queryFn: async (): Promise<number | null> =>
      readJSON<number>(STORAGE_KEYS.nextCursorCount),
    initialData: () => readJSON<number>(STORAGE_KEYS.nextCursorCount),
  });

  const { data: currentCursor = 0 } = useQuery({
    queryKey: QUERY_KEYS.currentCursor,
    queryFn: async (): Promise<number> =>
      readJSON<number>(STORAGE_KEYS.currentCursor) ?? 0,
    initialData: () => readJSON<number>(STORAGE_KEYS.currentCursor) ?? 0,
  });

  const { data: spreadsheetUrl = null } = useQuery({
    queryKey: QUERY_KEYS.spreadsheetUrl,
    queryFn: async (): Promise<string | null> =>
      readJSON<string>(STORAGE_KEYS.spreadsheetUrl),
    initialData: () => readJSON<string>(STORAGE_KEYS.spreadsheetUrl),
  });

  const { data: statusFilter = "all" } = useQuery({
    queryKey: QUERY_KEYS.statusFilter,
    queryFn: async (): Promise<string> =>
      readJSON<string>(STORAGE_KEYS.statusFilter) ?? "all",
    initialData: () => readJSON<string>(STORAGE_KEYS.statusFilter) ?? "all",
  });

  // ✅ Key fix: if we're pending and the URL arrives (from any source), mark ready
  useEffect(() => {
    if (sheetStatus === "pending" && spreadsheetUrl) {
      setSheetStatus("ready");
    }
  }, [sheetStatus, spreadsheetUrl]);

  const saveMatchesMutation = useMutation({
    mutationFn: async (newMatches: AgentMatch[]) => {
      writeJSON(STORAGE_KEYS.agentMatches, newMatches);
      return newMatches;
    },
    onMutate: async (newMatches) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.agentMatches });
      queryClient.setQueryData<AgentMatch[]>(QUERY_KEYS.agentMatches, newMatches);
    },
  });

  const saveFormDataMutation = useMutation({
    mutationFn: async (next: FormData) => {
      writeJSON(STORAGE_KEYS.formData, next);
      return next;
    },
    onMutate: async (next) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.formData });
      queryClient.setQueryData<FormData | null>(QUERY_KEYS.formData, next);
    },
  });

  const saveNextCursorMutation = useMutation({
    mutationFn: async (count: number) => {
      writeJSON(STORAGE_KEYS.nextCursorCount, count);
      return count;
    },
    onMutate: async (count) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.nextCursorCount });
      queryClient.setQueryData<number | null>(QUERY_KEYS.nextCursorCount, count);
    },
  });

  const saveCurrentCursorMutation = useMutation({
    mutationFn: async (cursor: number) => {
      writeJSON(STORAGE_KEYS.currentCursor, cursor);
      return cursor;
    },
    onMutate: async (cursor) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.currentCursor });
      queryClient.setQueryData<number>(QUERY_KEYS.currentCursor, cursor);
    },
  });

  const saveSpreadsheetUrlMutation = useMutation({
    mutationFn: async (url: string | null) => {
      if (url) writeJSON(STORAGE_KEYS.spreadsheetUrl, url);
      else removeKey(STORAGE_KEYS.spreadsheetUrl);
      return url;
    },
    onMutate: async (url) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.spreadsheetUrl });
      queryClient.setQueryData<string | null>(QUERY_KEYS.spreadsheetUrl, url);
    },
    onError: () => {
      setSheetStatus("error");
    },
  });

  const saveStatusFilterMutation = useMutation({
    mutationFn: async (status: string) => {
      writeJSON(STORAGE_KEYS.statusFilter, status);
      return status;
    },
    onMutate: async (status) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.statusFilter });
      queryClient.setQueryData<string>(QUERY_KEYS.statusFilter, status);
    },
  });

  // ✅ Worker-tied API: status changes are guaranteed here
  const startSpreadsheetPolling = (taskId: string) => {
    setSheetTaskId(taskId);
    setSheetStatus("pending");

    // optional: clear previous url
    saveSpreadsheetUrlMutation.mutate(null);

    startSheetPolling(
      taskId,
      (url) => {
        // if this callback is the one delivering the url, this flips immediately
        setSheetStatus("ready");
        saveSpreadsheetUrlMutation.mutate(url);
      },
      () => {
        setSheetStatus("timeout");
      }
    );
  };

  const stopSpreadsheetPolling = () => {
    stopSheetPolling();
    setSheetStatus("idle");
    setSheetTaskId(null);
  };

  const resetSpreadsheet = () => {
    stopSheetPolling();
    setSheetStatus("idle");
    setSheetTaskId(null);
    saveSpreadsheetUrlMutation.mutate(null);
  };

  // ✅ If some other code calls saveSpreadsheetUrl directly, still flip ready
  const saveSpreadsheetUrl = (url: string | null) => {
    if (url) setSheetStatus("ready");
    saveSpreadsheetUrlMutation.mutate(url);
  };

  const resetForNewSearch = async () => {
    // stop sheet-related stuff (optional, but usually correct)
    stopSheetPolling();

    // 1) cancel anything in flight
    await queryClient.cancelQueries();

    // 2) clear localStorage keys that cause old UI to hydrate
    removeKey(STORAGE_KEYS.agentMatches);
    removeKey(STORAGE_KEYS.nextCursorCount);
    removeKey(STORAGE_KEYS.currentCursor);
    removeKey(STORAGE_KEYS.spreadsheetUrl);
    // keep or clear formData depending on your UX:
    // removeKey(STORAGE_KEYS.formData);

    // You likely want to reset status filter on a brand new search
    // removeKey(STORAGE_KEYS.statusFilter);

    // 3) reset React Query cache immediately (forces re-render everywhere)
    queryClient.setQueryData<AgentMatch[]>(QUERY_KEYS.agentMatches, []);
    queryClient.setQueryData<number | null>(QUERY_KEYS.nextCursorCount, null);
    queryClient.setQueryData<number>(QUERY_KEYS.currentCursor, 0);
    queryClient.setQueryData<string | null>(QUERY_KEYS.spreadsheetUrl, null);

    // If you clear statusFilter in storage, also reset it here:
    // queryClient.setQueryData<string>(QUERY_KEYS.statusFilter, "all");

    // 4) reset any in-memory state
    setSheetTaskId(null);

    // If you added sheetStatus earlier, reset it too:
    setSheetStatus("idle");
  };


  return {
    matches,
    nextCursorCount,
    currentCursor,
    formData,
    spreadsheetUrl,
    statusFilter,
    sheetTaskId,
    isLoading,

    sheetStatus,
    isSpreadsheetPending: sheetStatus === "pending",

    saveMatches: (data: AgentMatch[]) => saveMatchesMutation.mutate(data),
    saveFormData: (data: FormData) => saveFormDataMutation.mutate(data),
    saveNextCursor: (count: number) => saveNextCursorMutation.mutate(count),
    saveCurrentCursor: (cursor: number) => saveCurrentCursorMutation.mutate(cursor),
    saveSpreadsheetUrl,
    saveStatusFilter: (status: string) => saveStatusFilterMutation.mutate(status),
    saveSheetTaskId: (taskId: string | null) => setSheetTaskId(taskId),

    startSpreadsheetPolling,
    stopSpreadsheetPolling,
    resetSpreadsheet,
    resetForNewSearch,
  };
};

interface MatchesContextType {
  matches: AgentMatch[];
  formData: FormData | null;
  spreadsheetUrl: string | null;
  statusFilter: string;
  sheetTaskId: string | null;
  isLoading: boolean;

  sheetStatus: SheetStatus;
  isSpreadsheetPending: boolean;

  saveMatches: (data: AgentMatch[]) => void;
  saveFormData: (data: FormData) => void;
  saveNextCursor: (count: number) => void;
  saveCurrentCursor: (cursor: number) => void;
  saveSpreadsheetUrl: (url: string | null) => void;
  saveStatusFilter: (status: string) => void;
  saveSheetTaskId: (taskId: string | null) => void;

  startSpreadsheetPolling: (taskId: string) => void;
  stopSpreadsheetPolling: () => void;
  resetSpreadsheet: () => void;
  resetForNewSearch: () => Promise<void> | void;

  nextCursorCount: number | null;
  currentCursor: number;
}

export const MatchesContext = createContext<MatchesContextType | null>(null);

export function AgentMatchesProvider({ children }: { children: React.ReactNode }) {
  const [client] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 30, // 30 minutes
          },
        },
      })
  );

  return (
    <QueryClientProvider client={client}>
      <AgentMatchesContextProvider>{children}</AgentMatchesContextProvider>
    </QueryClientProvider>
  );
}

function AgentMatchesContextProvider({ children }: { children: React.ReactNode }) {
  const data = useAgentData();

  const value = useMemo<MatchesContextType>(
    () => ({
      matches: data.matches,
      nextCursorCount: data.nextCursorCount,
      currentCursor: data.currentCursor,
      formData: data.formData,
      spreadsheetUrl: data.spreadsheetUrl,
      statusFilter: data.statusFilter,
      sheetTaskId: data.sheetTaskId,
      isLoading: data.isLoading,

      sheetStatus: data.sheetStatus,
      isSpreadsheetPending: data.isSpreadsheetPending,

      saveMatches: data.saveMatches,
      saveFormData: data.saveFormData,
      saveNextCursor: data.saveNextCursor,
      saveCurrentCursor: data.saveCurrentCursor,
      saveSpreadsheetUrl: data.saveSpreadsheetUrl,
      saveStatusFilter: data.saveStatusFilter,
      saveSheetTaskId: data.saveSheetTaskId,

      startSpreadsheetPolling: data.startSpreadsheetPolling,
      stopSpreadsheetPolling: data.stopSpreadsheetPolling,
      resetSpreadsheet: data.resetSpreadsheet,
      resetForNewSearch: data.resetForNewSearch,
    }),
    [
      data.matches,
      data.nextCursorCount,
      data.currentCursor,
      data.formData,
      data.spreadsheetUrl,
      data.statusFilter,
      data.sheetTaskId,
      data.isLoading,
      data.sheetStatus,
      data.isSpreadsheetPending,
      data.saveMatches,
      data.saveFormData,
      data.saveNextCursor,
      data.saveCurrentCursor,
      data.saveSpreadsheetUrl,
      data.saveStatusFilter,
      data.saveSheetTaskId,
      data.startSpreadsheetPolling,
      data.stopSpreadsheetPolling,
      data.resetSpreadsheet,
      data.resetForNewSearch,
    ]
  );

  return <MatchesContext.Provider value={value}>{children}</MatchesContext.Provider>;
}

export function useAgentMatches(): MatchesContextType {
  const context = useContext(MatchesContext);
  if (!context) throw new Error("useAgentMatches must be used within an AgentMatchesProvider");
  return context;
}
