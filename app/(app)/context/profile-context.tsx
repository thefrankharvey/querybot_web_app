"use client";

import React, { createContext, useContext } from "react";
import { useFetchAgentsList } from "@/app/hooks/use-fetch-agents-list";
import { useQueryClient } from "@tanstack/react-query";
import { AgentMatch } from "@/app/types";

// Context type definition
interface ProfileContextType {
  agentsList: AgentMatch[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  removeAgent: (agentId: string) => void;
  addAgent: (agentId: string) => void;
}

const ProfileContext = createContext<ProfileContextType | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { data, isLoading, isError, error, refetch } = useFetchAgentsList();
  const queryClient = useQueryClient();

  const agentsList = data?.agent_matches;

  const removeAgent = (agentId: string) => {
    queryClient.setQueryData(
      ["agent-matches"],
      (oldData: { agent_matches: AgentMatch[] } | undefined) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          agent_matches: oldData.agent_matches.filter(
            (agent) => agent.index_id !== agentId
          ),
        };
      }
    );
  };

  const addAgent = (agentId: string) => {
    queryClient.setQueryData(
      ["agent-matches"],
      (oldData: { agent_matches: AgentMatch[] } | undefined) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          agent_matches: [...oldData.agent_matches, agentId],
        };
      }
    );
  };

  const value: ProfileContextType = {
    agentsList,
    isLoading,
    isError,
    error,
    refetch,
    addAgent,
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
