"use client";

import React, { createContext, useContext, useState } from "react";
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
  saveAllAgents: (payloads: SaveAgentPayload[]) => Promise<SaveAgentResponse | null>;
  savingAgentId: string | null;
  isSavingAll: boolean;
}

const ProfileContext = createContext<ProfileContextType | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { data, isLoading, isError, error, refetch } = useFetchAgentsList();
  const queryClient = useQueryClient();
  const [savingAgentId, setSavingAgentId] = useState<string | null>(null);
  const [isSavingAll, setIsSavingAll] = useState(false);

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
    setSavingAgentId(payload.index_id ?? null);
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
      setSavingAgentId(null);
    }
  };

  const saveAllAgents = async (
    payloads: SaveAgentPayload[]
  ): Promise<SaveAgentResponse | null> => {
    // Filter out agents that are already saved
    const existingIds = new Set(agentsList?.map((a) => a.index_id) || []);
    const newAgents = payloads.filter((p) => !existingIds.has(p.index_id));

    if (newAgents.length === 0) {
      toast.info("All agents already saved", {
        description: "All agents on this page are already in your saved list.",
        duration: 3000,
      });
      return null;
    }

    setIsSavingAll(true);
    try {
      const response = await fetch("/api/agent-matches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newAgents),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save agents");
      }

      const result = (await response.json()) as SaveAgentResponse;

      await refetch();

      const skippedCount = payloads.length - newAgents.length;
      const savedCount = newAgents.length;

      toast.success(`${savedCount} agent${savedCount !== 1 ? "s" : ""} saved!`, {
        description: skippedCount > 0
          ? `${skippedCount} agent${skippedCount !== 1 ? "s were" : " was"} already saved.`
          : "You can view your saved agents anytime in your profile.",
        duration: 3000,
      });

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error &&
        error.message.includes("duplicate key value violates")
          ? "Some agents already exist in your saved agents"
          : "An error occurred while attempting to save the agents";

      toast.error("An error occurred", {
        description: errorMessage,
        duration: 4000,
      });

      return null;
    } finally {
      setIsSavingAll(false);
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
    saveAllAgents,
    savingAgentId,
    isSavingAll,
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
