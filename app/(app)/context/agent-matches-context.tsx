import React, { createContext, useContext } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
} from "@tanstack/react-query";

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
  // synopsis: string;
  // manuscript?: File; TODO: add this file back in when it's time
  // manuscript?: string;
}

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
    },
  },
});

// Custom hook for fetching agent data
const useAgentData = () => {
  const fetchMatches = async (): Promise<AgentMatch[]> => {
    const stored = localStorage.getItem("agent_matches");
    if (stored) return JSON.parse(stored);
    return [];
  };

  const fetchNextCursorCount = async (): Promise<number | null> => {
    const stored = localStorage.getItem("future_request_count");
    if (stored) return JSON.parse(stored);
    return null;
  };

  const fetchCurrentCursor = async (): Promise<number> => {
    const stored = localStorage.getItem("current_cursor");
    if (stored) return JSON.parse(stored);
    return 0;
  };

  const fetchFormData = async (): Promise<FormData | null> => {
    const stored = localStorage.getItem("query_form_data");
    if (stored) return JSON.parse(stored);
    return null;
  };

  const fetchSpreadsheetUrl = async (): Promise<string | null> => {
    const stored = localStorage.getItem("spreadsheet_url");
    if (stored) return JSON.parse(stored);
    return null;
  };

  const fetchStatusFilter = async (): Promise<string> => {
    const stored = localStorage.getItem("status_filter");
    if (stored) return JSON.parse(stored);
    return "all";
  };

  const { data: matches = [], isLoading } = useQuery({
    queryKey: ["agentMatches"],
    queryFn: fetchMatches,
  });

  const { data: formData = null } = useQuery({
    queryKey: ["formData"],
    queryFn: fetchFormData,
  });

  const { data: nextCursorCount = null } = useQuery({
    queryKey: ["nextCursorCount"],
    queryFn: fetchNextCursorCount,
  });

  const { data: currentCursor = 0 } = useQuery({
    queryKey: ["currentCursor"],
    queryFn: fetchCurrentCursor,
  });

  const { data: spreadsheetUrl = null } = useQuery({
    queryKey: ["spreadsheetUrl"],
    queryFn: fetchSpreadsheetUrl,
  });

  const { data: statusFilter = "all" } = useQuery({
    queryKey: ["statusFilter"],
    queryFn: fetchStatusFilter,
  });

  const saveNextCursor = useMutation({
    mutationFn: (count: number) => {
      localStorage.setItem("future_request_count", JSON.stringify(count));
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nextCursorCount"] });
    },
  });

  const saveCurrentCursor = useMutation({
    mutationFn: (cursor: number) => {
      localStorage.setItem("current_cursor", JSON.stringify(cursor));
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentCursor"] });
    },
  });

  const saveMatchesMutation = useMutation({
    mutationFn: (newMatches: AgentMatch[]) => {
      localStorage.setItem("agent_matches", JSON.stringify(newMatches));
      return Promise.resolve(newMatches);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agentMatches"] });
    },
  });

  const saveFormDataMutation = useMutation({
    mutationFn: (formData: FormData) => {
      localStorage.setItem("query_form_data", JSON.stringify(formData));
      return Promise.resolve();
    },
  });

  const saveSpreadsheetUrlMutation = useMutation({
    mutationFn: (url: string | null) => {
      if (url) {
        localStorage.setItem("spreadsheet_url", JSON.stringify(url));
      } else {
        localStorage.removeItem("spreadsheet_url");
      }
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spreadsheetUrl"] });
    },
  });

  const saveStatusFilterMutation = useMutation({
    mutationFn: (status: string) => {
      localStorage.setItem("status_filter", JSON.stringify(status));
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["statusFilter"] });
    },
  });

  return {
    matches,
    nextCursorCount,
    currentCursor,
    formData,
    spreadsheetUrl,
    statusFilter,
    isLoading,
    saveMatches: (data: AgentMatch[]) => saveMatchesMutation.mutate(data),
    saveFormData: (data: FormData) => saveFormDataMutation.mutate(data),
    saveNextCursor: (count: number) => saveNextCursor.mutate(count),
    saveCurrentCursor: (cursor: number) => saveCurrentCursor.mutate(cursor),
    saveSpreadsheetUrl: (url: string | null) =>
      saveSpreadsheetUrlMutation.mutate(url),
    saveStatusFilter: (status: string) =>
      saveStatusFilterMutation.mutate(status),
  };
};

// Context type definition
interface MatchesContextType {
  matches: AgentMatch[];
  formData: FormData | null;
  spreadsheetUrl: string | null;
  statusFilter: string;
  isLoading: boolean;
  saveMatches: (data: AgentMatch[]) => void;
  saveFormData: (data: FormData) => void;
  saveNextCursor: (count: number) => void;
  saveCurrentCursor: (cursor: number) => void;
  saveSpreadsheetUrl: (url: string | null) => void;
  saveStatusFilter: (status: string) => void;
  nextCursorCount: number | null;
  currentCursor: number;
}

// Create context
export const MatchesContext = createContext<MatchesContextType | null>(null);

// Combined provider component that sets up both React Query and the context
export function AgentMatchesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <AgentMatchesContextProvider>{children}</AgentMatchesContextProvider>
    </QueryClientProvider>
  );
}

// The internal context provider that uses React Query hooks
function AgentMatchesContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    matches,
    formData,
    spreadsheetUrl,
    statusFilter,
    isLoading,
    saveMatches,
    saveFormData,
    saveNextCursor,
    saveCurrentCursor,
    saveSpreadsheetUrl,
    saveStatusFilter,
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
        isLoading,
        saveMatches,
        saveFormData,
        saveNextCursor,
        saveCurrentCursor,
        saveSpreadsheetUrl,
        saveStatusFilter,
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
    throw new Error(
      "useAgentMatches must be used within an AgentMatchesProvider"
    );
  }
  return context;
}
