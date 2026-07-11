"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useFetchAgentsList } from "@/app/hooks/use-fetch-agents-list";
import { useQueryClient } from "@tanstack/react-query";
import { AgentMatch, SaveAgentPayload, SaveAgentResponse } from "@/app/types";
import { toast } from "sonner";
import { normalizeProjectName } from "@/app/utils/project-dashboard-summary";

// Context type definition
interface ProfileContextType {
  agentsList: AgentMatch[] | undefined;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<{ data?: { agent_matches: AgentMatch[] } }>;
  removeAgent: (agentId: string) => void;
  removeProject: (projectName: string) => void;
  addAgent: (agent: AgentMatch) => void;
  saveAgent: (payload: SaveAgentPayload) => Promise<SaveAgentResponse | null>;
  saveAllAgents: (payloads: SaveAgentPayload[]) => Promise<SaveAgentResponse | null>;
  savingAgentId: string | null;
  isSavingAll: boolean;
}

const ProfileContext = createContext<ProfileContextType | null>(null);

function getTrimmedValue(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed || null;
}

function savedAgentMatchesSavePayload(
  savedAgent: AgentMatch,
  payload: SaveAgentPayload,
) {
  if (getTrimmedValue(savedAgent.index_id) !== getTrimmedValue(payload.index_id)) {
    return false;
  }

  const savedWriterProjectId = getTrimmedValue(savedAgent.writer_project_id);
  const payloadWriterProjectId = getTrimmedValue(payload.writer_project_id);

  if (payloadWriterProjectId) {
    return savedWriterProjectId
      ? savedWriterProjectId === payloadWriterProjectId
      : normalizeProjectName(savedAgent.project_name).toLocaleLowerCase() ===
          normalizeProjectName(payload.project_name).toLocaleLowerCase();
  }

  return (
    !savedWriterProjectId &&
    normalizeProjectName(savedAgent.project_name).toLocaleLowerCase() ===
      normalizeProjectName(payload.project_name).toLocaleLowerCase()
  );
}

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { data, isLoading, isFetching, isError, error, refetch } = useFetchAgentsList();
  const queryClient = useQueryClient();
  const [savingAgentId, setSavingAgentId] = useState<string | null>(null);
  const [isSavingAll, setIsSavingAll] = useState(false);

  const agentsList = data?.agent_matches;

  const hasRunBackfillRef = useRef(false);
  const hasRunWriterProjectIdBackfillRef = useRef(false);
  useEffect(() => {
    if (hasRunBackfillRef.current || !agentsList?.length) return;
    const needsBackfill = agentsList.some(
      (a) => !a.project_name || a.project_name.trim() === ""
    );
    if (!needsBackfill) return;
    hasRunBackfillRef.current = true;
    (async () => {
      try {
        const res = await fetch("/api/agent-matches/backfill-project-name", {
          method: "POST",
        });
        if (res.ok) await refetch();
      } catch {
        hasRunBackfillRef.current = false; // allow retry on next load
      }
    })();
  }, [agentsList, refetch]);

  useEffect(() => {
    if (hasRunWriterProjectIdBackfillRef.current || !agentsList?.length) return;
    const needsWriterProjectIdBackfill = agentsList.some(
      (agent) => !agent.writer_project_id
    );
    if (!needsWriterProjectIdBackfill) return;

    hasRunWriterProjectIdBackfillRef.current = true;
    (async () => {
      try {
        const res = await fetch("/api/agent-matches/backfill-writer-project-id", {
          method: "POST",
        });
        if (!res.ok) {
          hasRunWriterProjectIdBackfillRef.current = false;
          return;
        }

        const data = (await res.json()) as { updated?: number };
        if ((data.updated ?? 0) > 0) {
          await refetch();
        }
      } catch {
        hasRunWriterProjectIdBackfillRef.current = false;
      }
    })();
  }, [agentsList, refetch]);

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

  const removeProject = (projectName: string) => {
    const normalizedProjectName = normalizeProjectName(projectName);

    queryClient.setQueryData(
      ["agent-matches"],
      (oldData: { agent_matches: AgentMatch[] } | undefined) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          agent_matches: oldData.agent_matches.filter(
            (agent) =>
              normalizeProjectName(agent.project_name) !== normalizedProjectName
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
          agent_matches: [agent, ...oldData.agent_matches],
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
        description: "View your saved agents in your query dashboard!",
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
    const newAgents = payloads.filter(
      (payload) =>
        !agentsList?.some((agent) => savedAgentMatchesSavePayload(agent, payload))
    );

    if (newAgents.length === 0) {
      toast.info("All agents already saved", {
        description:
          "All agents on this page are already saved for this project.",
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
          ? `${skippedCount} agent${skippedCount !== 1 ? "s were" : " was"} already saved for this project.`
          : "View your saved agents in your query dashboard!",
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
    isFetching,
    isError,
    error,
    refetch,
    addAgent,
    removeAgent,
    removeProject,
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
