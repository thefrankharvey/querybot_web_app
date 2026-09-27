"use client";

import { useUser } from "@clerk/nextjs";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useMemo,
  useState,
} from "react";
import { useFetchAgentsList } from "@/app/hooks/use-fetch-agents-list";
import { useQueryClient } from "@tanstack/react-query";
import {
  AgentMatch,
  DashboardProject,
  SaveAgentPayload,
  SaveAgentResponse,
} from "@/app/types";
import { toast } from "sonner";
import { getProjectScope, isSameProjectScope } from "@/app/utils/project-scope";

import {
  buildProjectDashboardSummaries,
  type ProjectDashboardSummary,
} from "@/app/utils/project-dashboard-summary";

// Context type definition
interface ProfileContextType {
  agentsList: AgentMatch[] | undefined;
  projects: DashboardProject[];
  projectSummaries: ProjectDashboardSummary[];
  updateProject: (project: DashboardProject) => Promise<void>;
  forgetProject: (projectId: string) => Promise<void>;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<{ data?: { agent_matches: AgentMatch[] } }>;
  removeAgent: (agentId: string) => Promise<void>;
  removeAgents: (agentIds: string[]) => Promise<void>;
  addAgent: (agent: AgentMatch) => void;
  saveAgent: (payload: SaveAgentPayload) => Promise<SaveAgentResponse | null>;
  saveAllAgents: (
    payloads: SaveAgentPayload[],
  ) => Promise<SaveAgentResponse | null>;
  savingAgentId: string | null;
  isSavingAll: boolean;
}

const ProfileContext = createContext<ProfileContextType | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const { data, isLoading, isFetching, isError, error, refetch } =
    useFetchAgentsList();
  const queryClient = useQueryClient();
  const [savingAgentId, setSavingAgentId] = useState<string | null>(null);
  const [isSavingAll, setIsSavingAll] = useState(false);

  const agentsList = data?.agent_matches;
  const projects = useMemo(() => data?.projects ?? [], [data?.projects]);
  const projectSummaries = useMemo(
    () => buildProjectDashboardSummaries(agentsList, projects),
    [agentsList, projects],
  );
  type ProfileData = {
    agent_matches: AgentMatch[];
    projects: DashboardProject[];
  };
  const updateProject = async (project: DashboardProject) => {
    await queryClient.cancelQueries({ queryKey: ["agent-matches", user?.id] });
    queryClient.setQueryData(
      ["agent-matches", user?.id],
      (old: ProfileData | undefined) =>
        old
          ? {
              ...old,
              projects: old.projects.map((item) =>
                item.id === project.id ? project : item,
              ),
              agent_matches: old.agent_matches.map((agent) =>
                agent.dashboard_project_id === project.id
                  ? { ...agent, project_name: project.project_name }
                  : agent,
              ),
            }
          : old,
    );
  };
  const forgetProject = async (projectId: string) => {
    await queryClient.cancelQueries({ queryKey: ["agent-matches", user?.id] });
    queryClient.setQueryData(
      ["agent-matches", user?.id],
      (old: ProfileData | undefined) =>
        old
          ? {
              ...old,
              projects: old.projects.filter(
                (project) => project.id !== projectId,
              ),
              agent_matches: old.agent_matches.filter(
                (agent) => agent.dashboard_project_id !== projectId,
              ),
            }
          : old,
    );
  };

  // Attach the permanent dashboard ID for older callers and fresh search results.
  const withProject = (payload: SaveAgentPayload): SaveAgentPayload => {
    if (payload.dashboard_project_id) return payload;
    const matches = projects.filter((project) =>
      isSameProjectScope(
        {
          projectName: project.project_name,
          writerProjectId: project.writer_project_id,
        },
        {
          projectName: payload.project_name,
          writerProjectId: payload.writer_project_id,
        },
      ),
    );
    return matches.length === 1
      ? { ...payload, dashboard_project_id: matches[0].id }
      : payload;
  };

  const hasRunBackfillRef = useRef(false);
  useEffect(() => {
    if (hasRunBackfillRef.current || !agentsList?.length) return;
    const needsBackfill = agentsList.some(
      (a) => !a.project_name || a.project_name.trim() === "",
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

  const removeAgents = async (agentIds: string[]) => {
    const removed = new Set(agentIds);
    // A pending refresh must not restore the row after a successful deletion.
    await queryClient.cancelQueries({ queryKey: ["agent-matches", user?.id] });
    queryClient.setQueryData(
      ["agent-matches", user?.id],
      (oldData: { agent_matches: AgentMatch[] } | undefined) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          agent_matches: oldData.agent_matches.filter(
            (agent) => !removed.has(agent.id),
          ),
        };
      },
    );
  };

  const removeAgent = (agentId: string) => removeAgents([agentId]);

  const addAgent = (agent: AgentMatch) => {
    queryClient.setQueryData(
      ["agent-matches", user?.id],
      (oldData: { agent_matches: AgentMatch[] } | undefined) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          agent_matches: [agent, ...oldData.agent_matches],
        };
      },
    );
  };

  const rememberSavedAgents = async (created: AgentMatch[]) => {
    await queryClient.cancelQueries({ queryKey: ["agent-matches", user?.id] });
    queryClient.setQueryData(["agent-matches", user?.id], (old: ProfileData | undefined) => {
      if (!old) return old;
      const saved = new Map(old.agent_matches.map((agent) => [agent.id, agent]));
      created.forEach((agent) => saved.set(agent.id, agent));
      return { ...old, agent_matches: [...saved.values()] };
    });
  };

  const saveAgent = async (
    payload: SaveAgentPayload,
  ): Promise<SaveAgentResponse | null> => {
    setSavingAgentId(payload.index_id ?? null);
    try {
      const response = await fetch("/api/agent-matches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(withProject(payload)),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save agent");
      }

      const result = (await response.json()) as SaveAgentResponse;

      await rememberSavedAgents(result.created);
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
    payloads: SaveAgentPayload[],
  ): Promise<SaveAgentResponse | null> => {
    // Filter out agents that are already saved
    const key = (a: SaveAgentPayload) =>
      JSON.stringify([
        a.index_id,
        getProjectScope({
          projectName: a.project_name,
          writerProjectId: a.writer_project_id,
        }).key,
      ]);
    const existingIds = new Set(agentsList?.map(key) || []);
    const newAgents = payloads.filter((p) => {
      const identity = key(p);
      if (existingIds.has(identity)) return false;
      existingIds.add(identity);
      return true;
    });

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
        body: JSON.stringify(newAgents.map(withProject)),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save agents");
      }

      const result = (await response.json()) as SaveAgentResponse;

      await rememberSavedAgents(result.created);
      await refetch();

      const skippedCount = payloads.length - newAgents.length;
      const savedCount = newAgents.length;

      toast.success(
        `${savedCount} agent${savedCount !== 1 ? "s" : ""} saved!`,
        {
          description:
            skippedCount > 0
              ? `${skippedCount} agent${skippedCount !== 1 ? "s were" : " was"} already saved.`
              : "View your saved agents in your query dashboard!",
          duration: 3000,
        },
      );

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
    projects,
    projectSummaries,
    updateProject,
    forgetProject,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    addAgent,
    removeAgent,
    removeAgents,
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
