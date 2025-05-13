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
  favorites: string;
  genres: string;
  id: string;
  location?: string;
  name: string;
  open_to_queries?: string;
  pubmarketplace?: string;
  querymanager?: string;
  querytracker?: string;
  sales?: string;
  submission_req: string;
  total_score: number;
  twitter_handle?: string;
  twitter_url?: string;
  website?: string;
}

export interface FormData {
  email: string;
  genre: string;
  subgenres: string[];
  special_audience: string;
  target_audience: string;
  comps: { title: string; author: string }[];
  themes: string;
  synopsis: string;
  manuscript: string;
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

  const { data: matches = [], isLoading } = useQuery({
    queryKey: ["agentMatches"],
    queryFn: fetchMatches,
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

  return {
    matches,
    isLoading,
    saveMatches: (data: AgentMatch[]) => saveMatchesMutation.mutate(data),
    saveFormData: (data: FormData) => saveFormDataMutation.mutate(data),
  };
};

// Context type definition
interface MatchesContextType {
  matches: AgentMatch[];
  isLoading: boolean;
  saveMatches: (data: AgentMatch[]) => void;
  saveFormData: (data: FormData) => void;
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
  const { matches, isLoading, saveMatches, saveFormData } = useAgentData();

  return (
    <MatchesContext.Provider
      value={{
        matches,
        isLoading,
        saveMatches,
        saveFormData,
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
