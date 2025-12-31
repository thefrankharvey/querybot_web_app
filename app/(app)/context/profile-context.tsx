"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useFetchAgentsList } from "@/app/hooks/use-fetch-agents-list";
import { useQueryClient } from "@tanstack/react-query";
import { AgentMatch, SaveAgentPayload, SaveAgentResponse } from "@/app/types";
import { toast } from "sonner";

// Context type definition
interface ProfileContextType {
  agentsList: AgentMatch[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  removeAgent: (agentId: string) => void;
  addAgent: (agent: AgentMatch) => void;
  saveAgent: (payload: SaveAgentPayload) => Promise<SaveAgentResponse | null>;
  isSaving: boolean;
}

const ProfileContext = createContext<ProfileContextType | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { data, isLoading, isError, error, refetch } = useFetchAgentsList();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);

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

  const addAgent = (agent: AgentMatch) => {
    queryClient.setQueryData(
      ["agent-matches"],
      (oldData: { agent_matches: AgentMatch[] } | undefined) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          agent_matches: [...oldData.agent_matches, agent],
        };
      }
    );
  };

  const saveAgent = async (
    payload: SaveAgentPayload
  ): Promise<SaveAgentResponse | null> => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/agent-matches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save agent");
      }

      const result = (await response.json()) as SaveAgentResponse;

      await refetch();

      toast.success("Agent saved successfully!", {
        description: "You can view your saved agents anytime in your profile.",
        duration: 3000,
      });

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error &&
        error.message.includes("duplicate key value violates")
          ? "Agent already exists in your saved agents"
          : "An error occurred while attempting to save the agent";

      toast.error("An error occurred", {
        description: errorMessage,
        duration: 4000,
      });

      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const value: ProfileContextType = {
    agentsList,
    isLoading,
    isError,
    error,
    refetch,
    addAgent,
    removeAgent,
    saveAgent,
    isSaving,
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
