"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useFetchAgentsList } from "@/app/hooks/use-fetch-agents-list";
import { AgentMatch } from "@/app/types";

// Context type definition
interface ProfileContextType {
  agentsList: AgentMatch[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  removeAgent: (agentId: string) => void;
}

// Create context
const ProfileContext = createContext<ProfileContextType | null>(null);

// Provider component
export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { data, isLoading, isError, error, refetch } = useFetchAgentsList();
  const [agentsList, setAgentsList] = useState<AgentMatch[] | undefined>(
    data?.agent_matches
  );

  // Sync local state with fetched data
  useEffect(() => {
    if (data?.agent_matches) {
      setAgentsList(data.agent_matches);
    }
  }, [data]);

  const removeAgent = (agentId: string) => {
    setAgentsList((prev) =>
      prev?.filter((agent) => agent.index_id !== agentId)
    );
  };

  const value: ProfileContextType = {
    agentsList,
    isLoading,
    isError,
    error,
    refetch,
    removeAgent,
  };

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}

// Hook to use the context
export function useProfileContext(): ProfileContextType {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfileContext must be used within a ProfileProvider");
  }
  return context;
}
