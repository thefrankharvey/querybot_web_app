"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

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
  country_code?: string;
  aala_member?: string;
  agency: string;
  bio: string;
  clients?: string;
  dont_send?: string;
  email?: string;
  extra_interest?: string;
  extra_links?: string;
  agent_id?: string;
  agency_identity?: {
    agency_id: string;
    agency_name: string;
    agency_url: string | null;
  } | null;
  favorites: string;
  negatives?: string;
  genres: string;
  id: string;
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
  location?: {
    country_code: string;
    state_province: string;
  }
}

export interface FormData {
  email: string;
  writer_project_id?: string | null;
  project_name: string;
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
  totalAgents: ["totalAgents"] as const,
  spreadsheetUrl: ["spreadsheetUrl"] as const,
  statusFilter: ["statusFilter"] as const,
  countryFilter: ["countryFilter"] as const,
  projectName: ["projectName"] as const,
  writerProjectId: ["writerProjectId"] as const,
};

const STORAGE_KEYS = {
  agentMatches: "agent_matches",
  formData: "query_form_data",
  nextCursorCount: "future_request_count",
  currentCursor: "current_cursor",
  totalAgents: "total_agents",
  spreadsheetUrl: "spreadsheet_url",
  statusFilter: "status_filter",
  countryFilter: "country_filter",
  projectName: "project_name",
  writerProjectId: "writer_project_id",
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

export type PreviousSearchStatus = "idle" | "pending" | "success";

interface AgentSearchApiResponse {
  matches?: AgentMatch[];
  next_cursor?: number | null;
  spreadsheet_url?: string | null;
  task_id?: string | null;
  total_agents?: number;
  total_available?: number;
}

const useAgentData = () => {
  const queryClient = useQueryClient();

  const [sheetTaskId, setSheetTaskId] = useState<string | null>(null);
  const [sheetStatus, setSheetStatus] = useState<SheetStatus>("idle");
  const [previousSearchStatus, setPreviousSearchStatus] =
    useState<PreviousSearchStatus>("idle");

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

  const { data: totalAgents = null } = useQuery({
    queryKey: QUERY_KEYS.totalAgents,
    queryFn: async (): Promise<number | null> =>
      readJSON<number>(STORAGE_KEYS.totalAgents),
    initialData: () => readJSON<number>(STORAGE_KEYS.totalAgents),
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

  const { data: countryFilter = "all" } = useQuery({
    queryKey: QUERY_KEYS.countryFilter,
    queryFn: async (): Promise<string> =>
      readJSON<string>(STORAGE_KEYS.countryFilter) ?? "all",
    initialData: () => readJSON<string>(STORAGE_KEYS.countryFilter) ?? "all",
  });

  const { data: projectName = "" } = useQuery({
    queryKey: QUERY_KEYS.projectName,
    queryFn: async (): Promise<string> =>
      readJSON<string>(STORAGE_KEYS.projectName) ?? "",
    initialData: () => readJSON<string>(STORAGE_KEYS.projectName) ?? "",
  });

  const { data: writerProjectId = null } = useQuery({
    queryKey: QUERY_KEYS.writerProjectId,
    queryFn: async (): Promise<string | null> =>
      readJSON<string>(STORAGE_KEYS.writerProjectId),
    initialData: () => readJSON<string>(STORAGE_KEYS.writerProjectId),
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

  const saveTotalAgentsMutation = useMutation({
    mutationFn: async (count: number | null) => {
      if (count === null) removeKey(STORAGE_KEYS.totalAgents);
      else writeJSON(STORAGE_KEYS.totalAgents, count);
      return count;
    },
    onMutate: async (count) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.totalAgents });
      queryClient.setQueryData<number | null>(QUERY_KEYS.totalAgents, count);
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

  const saveCountryFilterMutation = useMutation({
    mutationFn: async (country: string) => {
      writeJSON(STORAGE_KEYS.countryFilter, country);
      return country;
    },
    onMutate: async (country) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.countryFilter });
      queryClient.setQueryData<string>(QUERY_KEYS.countryFilter, country);
    },
  });

  const saveProjectName = useCallback(
    (name: string) => {
      writeJSON(STORAGE_KEYS.projectName, name);
      queryClient.setQueryData<string>(QUERY_KEYS.projectName, name);
    },
    [queryClient]
  );

  const saveWriterProjectId = useCallback(
    (id: string | null) => {
      const normalizedId = id?.trim() || null;
      if (normalizedId) {
        writeJSON(STORAGE_KEYS.writerProjectId, normalizedId);
      } else {
        removeKey(STORAGE_KEYS.writerProjectId);
      }
      queryClient.setQueryData<string | null>(
        QUERY_KEYS.writerProjectId,
        normalizedId
      );
    },
    [queryClient]
  );

  const renameSavedProjectName = useCallback(
    (oldName: string, newName: string) => {
      const storedProjectName =
        readJSON<string>(STORAGE_KEYS.projectName) ?? projectName;
      const normalizedStoredProjectName = storedProjectName.trim();

      if (!normalizedStoredProjectName || normalizedStoredProjectName !== oldName) {
        return false;
      }

      saveProjectName(newName);
      return true;
    },
    [projectName, saveProjectName]
  );

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
    removeKey(STORAGE_KEYS.totalAgents);
    removeKey(STORAGE_KEYS.spreadsheetUrl);
    removeKey(STORAGE_KEYS.projectName);
    removeKey(STORAGE_KEYS.writerProjectId);
    // keep or clear formData depending on your UX:
    // removeKey(STORAGE_KEYS.formData);

    // You likely want to reset status filter on a brand new search
    // removeKey(STORAGE_KEYS.statusFilter);

    // 3) reset React Query cache immediately (forces re-render everywhere)
    queryClient.setQueryData<AgentMatch[]>(QUERY_KEYS.agentMatches, []);
    queryClient.setQueryData<number | null>(QUERY_KEYS.nextCursorCount, null);
    queryClient.setQueryData<number>(QUERY_KEYS.currentCursor, 0);
    queryClient.setQueryData<number | null>(QUERY_KEYS.totalAgents, null);
    queryClient.setQueryData<string | null>(QUERY_KEYS.spreadsheetUrl, null);
    queryClient.setQueryData<string>(QUERY_KEYS.projectName, "");
    queryClient.setQueryData<string | null>(QUERY_KEYS.writerProjectId, null);

    // If you clear statusFilter in storage, also reset it here:
    // queryClient.setQueryData<string>(QUERY_KEYS.statusFilter, "all");

    // 4) reset any in-memory state
    setSheetTaskId(null);

    // If you added sheetStatus earlier, reset it too:
    setSheetStatus("idle");
  };

  const completePreviousSearchRefresh = useCallback(() => {
    setPreviousSearchStatus("idle");
  }, []);

  const refreshPreviousAgentMatches = async (isSubscribed: boolean) => {
    if (previousSearchStatus !== "idle") return false;

    if (!formData) {
      toast.error("Previous search details are unavailable", {
        description: "Run a new Smart Match search to create fresh results.",
      });
      return false;
    }

    setPreviousSearchStatus("pending");

    try {
      const endpoint = isSubscribed
        ? "/api/get-agents-paid"
        : "/api/get-agents-free";
      const response = await fetch(`${endpoint}?last_index=0`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Query request failed: ${response.status}`);
      }

      const data = (await response.json()) as AgentSearchApiResponse;
      if (!Array.isArray(data.matches)) {
        throw new Error("Query response did not include agent matches");
      }

      const savedProjectName = projectName;
      const savedWriterProjectId = writerProjectId;
      const totalAgents =
        typeof data.total_agents === "number"
          ? data.total_agents
          : typeof data.total_available === "number"
            ? data.total_available
            : null;

      await resetForNewSearch();

      saveFormDataMutation.mutate(formData);
      saveMatchesMutation.mutate(data.matches);
      saveTotalAgentsMutation.mutate(totalAgents);
      saveStatusFilterMutation.mutate("all");
      saveCountryFilterMutation.mutate("all");

      if (typeof data.next_cursor === "number") {
        saveNextCursorMutation.mutate(data.next_cursor);
      }

      if (savedProjectName) {
        saveProjectName(savedProjectName);
      }

      if (savedWriterProjectId) {
        saveWriterProjectId(savedWriterProjectId);
      }

      if (isSubscribed) {
        if (data.spreadsheet_url) {
          saveSpreadsheetUrl(data.spreadsheet_url);
        } else if (data.task_id) {
          startSpreadsheetPolling(data.task_id);
        }
      }

      setPreviousSearchStatus("success");
      return true;
    } catch (error) {
      console.error(error);
      setPreviousSearchStatus("idle");
      toast.error("Could not refresh agent matches", {
        description: "Your previous results are still available. Please try again.",
      });
      return false;
    }
  };


  return {
    matches,
    nextCursorCount,
    currentCursor,
    totalAgents,
    formData,
    spreadsheetUrl,
    statusFilter,
    countryFilter,
    projectName,
    writerProjectId,
    sheetTaskId,
    isLoading,

    sheetStatus,
    isSpreadsheetPending: sheetStatus === "pending",
    previousSearchStatus,

    saveMatches: (data: AgentMatch[]) => saveMatchesMutation.mutate(data),
    saveFormData: (data: FormData) => saveFormDataMutation.mutate(data),
    saveNextCursor: (count: number) => saveNextCursorMutation.mutate(count),
    saveCurrentCursor: (cursor: number) => saveCurrentCursorMutation.mutate(cursor),
    saveTotalAgents: (count: number | null) => saveTotalAgentsMutation.mutate(count),
    saveSpreadsheetUrl,
    saveStatusFilter: (status: string) => saveStatusFilterMutation.mutate(status),
    saveCountryFilter: (country: string) => saveCountryFilterMutation.mutate(country),
    saveProjectName,
    saveWriterProjectId,
    renameSavedProjectName,
    saveSheetTaskId: (taskId: string | null) => setSheetTaskId(taskId),

    startSpreadsheetPolling,
    stopSpreadsheetPolling,
    resetSpreadsheet,
    resetForNewSearch,
    refreshPreviousAgentMatches,
    completePreviousSearchRefresh,
  };
};

interface MatchesContextType {
  matches: AgentMatch[];
  formData: FormData | null;
  spreadsheetUrl: string | null;
  totalAgents: number | null;
  statusFilter: string;
  countryFilter: string;
  projectName: string;
  writerProjectId: string | null;
  sheetTaskId: string | null;
  isLoading: boolean;

  sheetStatus: SheetStatus;
  isSpreadsheetPending: boolean;
  previousSearchStatus: PreviousSearchStatus;

  saveMatches: (data: AgentMatch[]) => void;
  saveFormData: (data: FormData) => void;
  saveNextCursor: (count: number) => void;
  saveCurrentCursor: (cursor: number) => void;
  saveTotalAgents: (count: number | null) => void;
  saveSpreadsheetUrl: (url: string | null) => void;
  saveStatusFilter: (status: string) => void;
  saveCountryFilter: (country: string) => void;
  saveProjectName: (name: string) => void;
  saveWriterProjectId: (id: string | null) => void;
  renameSavedProjectName: (oldName: string, newName: string) => boolean;
  saveSheetTaskId: (taskId: string | null) => void;

  startSpreadsheetPolling: (taskId: string) => void;
  stopSpreadsheetPolling: () => void;
  resetSpreadsheet: () => void;
  resetForNewSearch: () => Promise<void> | void;
  refreshPreviousAgentMatches: (isSubscribed: boolean) => Promise<boolean>;
  completePreviousSearchRefresh: () => void;

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
      totalAgents: data.totalAgents,
      formData: data.formData,
      spreadsheetUrl: data.spreadsheetUrl,
      statusFilter: data.statusFilter,
      countryFilter: data.countryFilter,
      projectName: data.projectName,
      writerProjectId: data.writerProjectId,
      sheetTaskId: data.sheetTaskId,
      isLoading: data.isLoading,

      sheetStatus: data.sheetStatus,
      isSpreadsheetPending: data.isSpreadsheetPending,
      previousSearchStatus: data.previousSearchStatus,

      saveMatches: data.saveMatches,
      saveFormData: data.saveFormData,
      saveNextCursor: data.saveNextCursor,
      saveCurrentCursor: data.saveCurrentCursor,
      saveTotalAgents: data.saveTotalAgents,
      saveSpreadsheetUrl: data.saveSpreadsheetUrl,
      saveStatusFilter: data.saveStatusFilter,
      saveCountryFilter: data.saveCountryFilter,
      saveProjectName: data.saveProjectName,
      saveWriterProjectId: data.saveWriterProjectId,
      renameSavedProjectName: data.renameSavedProjectName,
      saveSheetTaskId: data.saveSheetTaskId,

      startSpreadsheetPolling: data.startSpreadsheetPolling,
      stopSpreadsheetPolling: data.stopSpreadsheetPolling,
      resetSpreadsheet: data.resetSpreadsheet,
      resetForNewSearch: data.resetForNewSearch,
      refreshPreviousAgentMatches: data.refreshPreviousAgentMatches,
      completePreviousSearchRefresh: data.completePreviousSearchRefresh,
    }),
    [
      data.matches,
      data.nextCursorCount,
      data.currentCursor,
      data.totalAgents,
      data.formData,
      data.spreadsheetUrl,
      data.statusFilter,
      data.countryFilter,
      data.projectName,
      data.writerProjectId,
      data.sheetTaskId,
      data.isLoading,
      data.sheetStatus,
      data.isSpreadsheetPending,
      data.previousSearchStatus,
      data.saveMatches,
      data.saveFormData,
      data.saveNextCursor,
      data.saveCurrentCursor,
      data.saveTotalAgents,
      data.saveSpreadsheetUrl,
      data.saveStatusFilter,
      data.saveCountryFilter,
      data.saveProjectName,
      data.saveWriterProjectId,
      data.renameSavedProjectName,
      data.saveSheetTaskId,
      data.startSpreadsheetPolling,
      data.stopSpreadsheetPolling,
      data.resetSpreadsheet,
      data.resetForNewSearch,
      data.refreshPreviousAgentMatches,
      data.completePreviousSearchRefresh,
    ]
  );

  return <MatchesContext.Provider value={value}>{children}</MatchesContext.Provider>;
}

export function useAgentMatches(): MatchesContextType {
  const context = useContext(MatchesContext);
  if (!context) throw new Error("useAgentMatches must be used within an AgentMatchesProvider");
  return context;
}
