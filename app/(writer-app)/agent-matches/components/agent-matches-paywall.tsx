"use client";

import { QUERY_LIMIT } from "@/app/constants";
import { useMutation } from "@tanstack/react-query";
import { useAgentMatches, FormData, AgentMatch } from "../../context/agent-matches-context";
import { useRef, useState } from "react";
import AgentMatchesInner from "./agent-matches-inner";
import PayWall from "@/app/components/pay-wall";
import type { SaveAgentPayload } from "@/app/types";
import { useProfileContext } from "../../context/profile-context";
import {
  getProjectDashboardHref,
  normalizeProjectName,
} from "@/app/utils/project-dashboard-summary";
import { getProjectDashboardHrefById } from "@/app/utils/project-profile";
import { useRouter } from "next/navigation";
import {
  ensureAgentSavedForProject,
  getProjectAgentComposeMessageHref,
  getWriterAgentLegacyId,
  mapWriterAgentMatchToSaveAgentPayload,
  savedAgentMatchesProject,
} from "../project-scoped-agent-messaging";

declare global {
  interface Window {
    isScrollLocked?: boolean;
    lastTouchY?: number;
  }
}

const getWriterProjectIdFromResponse = (data: unknown) => {
  if (!data || typeof data !== "object") return null;
  const value = (data as { writer_project_id?: unknown }).writer_project_id;
  return typeof value === "string" && value.trim() ? value.trim() : null;
};

const getFormDataWithWriterProjectId = (
  formData: FormData,
  writerProjectId: string | null,
): FormData => ({
  ...formData,
  writer_project_id:
    writerProjectId ?? formData.writer_project_id?.trim() ?? null,
});

export const AgentMatchesPaywall = ({
  onWalkthroughActiveChange,
}: {
  onWalkthroughActiveChange?: (isActive: boolean) => void;
}) => {
  const router = useRouter();
  const [messagingAgentId, setMessagingAgentId] = useState<string | null>(null);
  const {
    matches,
    totalAgents,
    isLoading,
    formData,
    statusFilter,
    saveStatusFilter,
    countryFilter,
    saveCountryFilter,
    saveMatches,
    saveFormData,
    saveCurrentCursor,
    saveNextCursor,
    sheetTaskId,
    spreadsheetUrl,
    sheetStatus,
    saveTotalAgents,
    projectName,
    writerProjectId,
    saveWriterProjectId,
  } = useAgentMatches();
  const {
    agentsList,
    saveAgent,
    saveAllAgents,
    savingAgentId,
    isSavingAll,
  } = useProfileContext();
  const gridRef = useRef<HTMLDivElement>(null);
  const nextCursor = QUERY_LIMIT;
  const activeProjectName = projectName ? normalizeProjectName(projectName) : "";
  const activeWriterProjectId = writerProjectId?.trim() || null;
  const hasSavedAgentsForActiveProject =
    activeProjectName.length > 0 &&
    Boolean(
      agentsList?.some(
        (agent) =>
          savedAgentMatchesProject(agent, {
            projectName: activeProjectName,
            writerProjectId: activeWriterProjectId,
          })
      )
    );

  const queryMutation = useMutation({
    mutationFn: async (params: {
      formData: FormData;
      status: string;
      country_code: string;
    }) => {
      const statusParam = params.status === "all" ? "" : params.status;
      const statusQuery = statusParam ? `&status=${statusParam}` : "";

      const countryParam =
        params.country_code === "all" ? "" : params.country_code;
      const countryQuery = countryParam ? `&country_code=${countryParam}` : "";

      const res = await fetch(
        `/api/get-agents-free?last_index=0${statusQuery}${countryQuery}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            getFormDataWithWriterProjectId(params.formData, writerProjectId)
          ),
        }
      );

      if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`);
      }

      return res.json();
    },
    onSuccess: (data, params) => {
      const nextTotal =
        typeof data.total_agents === "number"
          ? data.total_agents
          : typeof data.total_available === "number"
            ? data.total_available
            : null;
      saveTotalAgents(nextTotal);
      const returnedWriterProjectId = getWriterProjectIdFromResponse(data);

      if (returnedWriterProjectId) {
        saveWriterProjectId(returnedWriterProjectId);
        saveFormData({
          ...params.formData,
          writer_project_id: returnedWriterProjectId,
        });
      }

      if (Array.isArray(data.matches)) {
        saveMatches(data.matches);
      }

      if (data.next_cursor !== null) {
        saveNextCursor(data.next_cursor);
      }
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const runFilterQuery = (status: string, country: string) => {
    if (!formData) return;

    saveCurrentCursor(0);
    saveNextCursor(nextCursor);
    queryMutation.mutate({
      formData,
      status,
      country_code: country,
    });
    window.scrollTo({ top: 0 });
  };

  const handleStatusChange = (newStatus: string) => {
    saveStatusFilter(newStatus);
    runFilterQuery(newStatus, countryFilter);
  };

  const handleCountryChange = (newCountry: string) => {
    saveCountryFilter(newCountry);
    runFilterQuery(statusFilter, newCountry);
  };

  const handleSaveAgent = (payload: SaveAgentPayload) => {
    return saveAgent({
      ...payload,
      project_name: projectName || null,
      writer_project_id: activeWriterProjectId,
    });
  };

  const handleMessageAgent = async (agent: AgentMatch) => {
    const legacyAgentId = getWriterAgentLegacyId(agent);
    if (!legacyAgentId || messagingAgentId === legacyAgentId) return;

    setMessagingAgentId(legacyAgentId);
    try {
      const result = await ensureAgentSavedForProject({
        agent,
        savedAgents: agentsList,
        saveAgent,
        projectName: activeProjectName,
        writerProjectId: activeWriterProjectId,
        payload: mapWriterAgentMatchToSaveAgentPayload(agent, {
          projectName: projectName || null,
          writerProjectId: activeWriterProjectId,
        }),
      });

      if (!result.ok) return;

      router.push(
        getProjectAgentComposeMessageHref({
          legacyAgentId,
          projectName: activeProjectName,
          writerProjectId: activeWriterProjectId,
        })
      );
    } finally {
      setMessagingAgentId(null);
    }
  };

  const handleSaveAllAgents = () => {
    const payloads = matches.map((agent) =>
      mapWriterAgentMatchToSaveAgentPayload(agent, {
        projectName: projectName || null,
        writerProjectId: activeWriterProjectId,
      })
    );
    saveAllAgents(payloads);
  };

  return (
    <>
      <AgentMatchesInner
        matches={matches}
        totalAgents={totalAgents}
        isSuccess={queryMutation.isSuccess}
        gridRef={gridRef}
        isSubscribed={false}
        isLoading={isLoading || queryMutation.isPending}
        statusFilter={statusFilter}
        onStatusChange={handleStatusChange}
        countryFilter={countryFilter}
        onCountryChange={handleCountryChange}
        onSaveAllAgents={handleSaveAllAgents}
        sheetTaskId={sheetTaskId || ""}
        spreadsheetUrl={spreadsheetUrl}
        sheetStatus={sheetStatus}
        onSaveAgent={handleSaveAgent}
        isSavingAll={isSavingAll}
        savingAgentId={savingAgentId}
        onMessageAgent={handleMessageAgent}
        messagingAgentId={messagingAgentId}
        projectName={activeProjectName}
        writerProjectId={activeWriterProjectId}
        projectDashboardHref={
          hasSavedAgentsForActiveProject
            ? activeWriterProjectId
              ? getProjectDashboardHrefById(activeWriterProjectId)
              : getProjectDashboardHref(activeProjectName)
            : undefined
        }
        onWalkthroughActiveChange={onWalkthroughActiveChange}
      />
      <PayWall
        gridRef={gridRef}
        resultLength={matches.length}
        lockAfterCards={6}
        lockTriggerViewportRatio={0.35}
        title="Your first six agent matches are free"
      />
    </>
  );
};

export default AgentMatchesPaywall;
