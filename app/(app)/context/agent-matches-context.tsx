"use client";

import React, { createContext, useContext, useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

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

// -----------------------------
// Keys + localStorage helpers
// -----------------------------
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

// -----------------------------
// React Query-powered data hook
// -----------------------------
const useAgentData = () => {
  const queryClient = useQueryClient();

  // In-memory state for sheet task ID (not persisted)
  const [sheetTaskId, setSheetTaskId] = useState<string | null>(null);

  // ----- Queries (read from localStorage, cached in React Query) -----

  const { data: matches = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.agentMatches,
    queryFn: async (): Promise<AgentMatch[]> =>
      readJSON<AgentMatch[]>(STORAGE_KEYS.agentMatches) ?? [],
    initialData: () =>
      readJSON<AgentMatch[]>(STORAGE_KEYS.agentMatches) ?? [],
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

  // ----- Mutations (setQueryData immediately, then persist) -----

  const saveMatchesMutation = useMutation({
    mutationFn: async (newMatches: AgentMatch[]) => {
      writeJSON(STORAGE_KEYS.agentMatches, newMatches);
      return newMatches;
    },
    onMutate: async (newMatches) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.agentMatches });
      const prev = queryClient.getQueryData<AgentMatch[]>(QUERY_KEYS.agentMatches);
      queryClient.setQueryData<AgentMatch[]>(QUERY_KEYS.agentMatches, newMatches);
      return { prev };
    },
    onError: (_err, _newMatches, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(QUERY_KEYS.agentMatches, ctx.prev);
    },
    onSuccess: (newMatches) => {
      queryClient.setQueryData(QUERY_KEYS.agentMatches, newMatches);
    },
  });

  const saveFormDataMutation = useMutation({
    mutationFn: async (next: FormData) => {
      writeJSON(STORAGE_KEYS.formData, next);
      return next;
    },
    onMutate: async (next) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.formData });
      const prev = queryClient.getQueryData<FormData | null>(QUERY_KEYS.formData);
      queryClient.setQueryData<FormData | null>(QUERY_KEYS.formData, next);
      return { prev };
    },
    onError: (_err, _next, ctx) => {
      queryClient.setQueryData<FormData | null>(
        QUERY_KEYS.formData,
        ctx?.prev ?? null
      );
    },
    onSuccess: (next) => {
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
      const prev = queryClient.getQueryData<number | null>(QUERY_KEYS.nextCursorCount);
      queryClient.setQueryData<number | null>(QUERY_KEYS.nextCursorCount, count);
      return { prev };
    },
    onError: (_err, _count, ctx) => {
      queryClient.setQueryData<number | null>(
        QUERY_KEYS.nextCursorCount,
        ctx?.prev ?? null
      );
    },
    onSuccess: (count) => {
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
      const prev = queryClient.getQueryData<number>(QUERY_KEYS.currentCursor);
      queryClient.setQueryData<number>(QUERY_KEYS.currentCursor, cursor);
      return { prev };
    },
    onError: (_err, _cursor, ctx) => {
      queryClient.setQueryData<number>(
        QUERY_KEYS.currentCursor,
        ctx?.prev ?? 0
      );
    },
    onSuccess: (cursor) => {
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
      const prev = queryClient.getQueryData<string | null>(QUERY_KEYS.spreadsheetUrl);
      queryClient.setQueryData<string | null>(QUERY_KEYS.spreadsheetUrl, url);
      return { prev };
    },
    onError: (_err, _url, ctx) => {
      queryClient.setQueryData<string | null>(
        QUERY_KEYS.spreadsheetUrl,
        ctx?.prev ?? null
      );
    },
    onSuccess: (url) => {
      queryClient.setQueryData<string | null>(QUERY_KEYS.spreadsheetUrl, url);
    },
  });

  const saveStatusFilterMutation = useMutation({
    mutationFn: async (status: string) => {
      writeJSON(STORAGE_KEYS.statusFilter, status);
      return status;
    },
    onMutate: async (status) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.statusFilter });
      const prev = queryClient.getQueryData<string>(QUERY_KEYS.statusFilter);
      queryClient.setQueryData<string>(QUERY_KEYS.statusFilter, status);
      return { prev };
    },
    onError: (_err, _status, ctx) => {
      queryClient.setQueryData<string>(
        QUERY_KEYS.statusFilter,
        ctx?.prev ?? "all"
      );
    },
    onSuccess: (status) => {
      queryClient.setQueryData<string>(QUERY_KEYS.statusFilter, status);
    },
  });

  return {
    matches,
    nextCursorCount,
    currentCursor,
    formData,
    spreadsheetUrl,
    statusFilter,
    sheetTaskId,
    isLoading,

    saveMatches: (data: AgentMatch[]) => saveMatchesMutation.mutate(data),
    saveFormData: (data: FormData) => saveFormDataMutation.mutate(data),
    saveNextCursor: (count: number) => saveNextCursorMutation.mutate(count),
    saveCurrentCursor: (cursor: number) => saveCurrentCursorMutation.mutate(cursor),
    saveSpreadsheetUrl: (url: string | null) =>
      saveSpreadsheetUrlMutation.mutate(url),
    saveStatusFilter: (status: string) => saveStatusFilterMutation.mutate(status),
    saveSheetTaskId: (taskId: string | null) => setSheetTaskId(taskId),
  };
};

// -----------------------------
// Context
// -----------------------------
interface MatchesContextType {
  matches: AgentMatch[];
  formData: FormData | null;
  spreadsheetUrl: string | null;
  statusFilter: string;
  sheetTaskId: string | null;
  isLoading: boolean;

  saveMatches: (data: AgentMatch[]) => void;
  saveFormData: (data: FormData) => void;
  saveNextCursor: (count: number) => void;
  saveCurrentCursor: (cursor: number) => void;
  saveSpreadsheetUrl: (url: string | null) => void;
  saveStatusFilter: (status: string) => void;
  saveSheetTaskId: (taskId: string | null) => void;

  nextCursorCount: number | null;
  currentCursor: number;
}

export const MatchesContext = createContext<MatchesContextType | null>(null);

// Combined provider component that sets up both React Query and the context
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

// The internal context provider that uses React Query hooks
function AgentMatchesContextProvider({ children }: { children: React.ReactNode }) {
  const {
    matches,
    formData,
    spreadsheetUrl,
    statusFilter,
    sheetTaskId,
    isLoading,
    saveMatches,
    saveFormData,
    saveNextCursor,
    saveCurrentCursor,
    saveSpreadsheetUrl,
    saveStatusFilter,
    saveSheetTaskId,
    nextCursorCount,
    currentCursor,
  } = useAgentData();

  return (
    <MatchesContext.Provider
      value={{
        matches,
        nextCursorCount,
        currentCursor,
        formData,
        spreadsheetUrl,
        statusFilter,
        sheetTaskId,
        isLoading,
        saveMatches,
        saveFormData,
        saveNextCursor,
        saveCurrentCursor,
        saveSpreadsheetUrl,
        saveStatusFilter,
        saveSheetTaskId,
      }}
    >
      {children}
    </MatchesContext.Provider>
  );
}

// Hook to use the context
export function useAgentMatches(): MatchesContextType {
  const context = useContext(MatchesContext);
  if (!context) {
    throw new Error("useAgentMatches must be used within an AgentMatchesProvider");
  }
  return context;
}
