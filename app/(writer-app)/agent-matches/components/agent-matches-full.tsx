"use client";

import { useAgentMatches, FormData, AgentMatch } from "../../context/agent-matches-context";
import { useMutation } from "@tanstack/react-query";
import { QUERY_LIMIT } from "@/app/constants";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/app/ui-primitives/pagination";
import { startSheetPolling } from "../../workers/sheet-worker-manager";
import AgentMatchesInner from "./agent-matches-inner";
// import TypeForm from "@/app/components/type-form";
import { useProfileContext } from "../../context/profile-context";
import type { SaveAgentPayload } from "@/app/types";
import {
  getProjectDashboardHref,
  normalizeProjectName,
} from "@/app/utils/project-dashboard-summary";
import { getProjectDashboardHrefById } from "@/app/utils/project-profile";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ensureAgentSavedForProject,
  getProjectAgentComposeMessageHref,
  getWriterAgentLegacyId,
  mapWriterAgentMatchToSaveAgentPayload,
  savedAgentMatchesProject,
} from "../project-scoped-agent-messaging";

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

export const AgentMatchesFull = ({
  onWalkthroughActiveChange,
}: {
  onWalkthroughActiveChange?: (isActive: boolean) => void;
}) => {
  const router = useRouter();
  const [messagingAgentId, setMessagingAgentId] = useState<string | null>(null);
  const {
    matches,
    totalAgents,
    formData,
    saveMatches,
    saveFormData,
    nextCursorCount,
    saveNextCursor,
    currentCursor,
    saveCurrentCursor,
    statusFilter,
    saveStatusFilter,
    countryFilter,
    saveCountryFilter,
    sheetTaskId,
    spreadsheetUrl,
    sheetStatus,
    startSpreadsheetPolling,
    saveSpreadsheetUrl,
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

  const nextCursor = nextCursorCount || QUERY_LIMIT;
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
      nextCursor: number;
      status: string;
      country_code: string;
    }) => {
      // Map status values for API: "all" -> "", "open" -> "open", "closed" -> "closed"
      const statusParam = params.status === "all" ? "" : params.status;
      const statusQuery = statusParam ? `&status=${statusParam}` : "";

      // Map country_code values for API: "all" -> "", otherwise use the country code
      const countryParam = params.country_code === "all" ? "" : params.country_code;
      const countryQuery = countryParam ? `&country_code=${countryParam}` : "";

      const res = await fetch(
        `/api/get-agents-paid?last_index=${params.nextCursor}${statusQuery}${countryQuery}`,
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
      const data = await res.json();
      return data;
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

      if (data.matches.length > 0) {
        saveMatches(data.matches);
        if (data.next_cursor !== null) {
          saveNextCursor(data.next_cursor);
        }
        if (data.task_id) {
          startSpreadsheetPolling(data.task_id);

          startSheetPolling(
            data.task_id,
            (url) => {
              saveSpreadsheetUrl(url);
            },
            () => {
            }
          );
        }
      }
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const handleNextPage = () => {
    if (formData) {
      saveCurrentCursor(nextCursor);
      queryMutation.mutate({
        formData,
        nextCursor: nextCursor,
        status: statusFilter,
        country_code: countryFilter,
      });
    }
    window.scrollTo({ top: 0 });
  };

  const handlePreviousPage = () => {
    if (formData) {
      const updatedCursor = currentCursor - QUERY_LIMIT;
      saveCurrentCursor(updatedCursor);
      queryMutation.mutate({
        formData,
        nextCursor: updatedCursor,
        status: statusFilter,
        country_code: countryFilter,
      });
    }
    window.scrollTo({ top: 0 });
  };

  const handleStatusChange = (newStatus: string) => {
    saveStatusFilter(newStatus);
    // Reset pagination to page 1 and trigger new query
    if (formData) {
      saveCurrentCursor(0);
      saveNextCursor(QUERY_LIMIT);
      queryMutation.mutate({
        formData,
        nextCursor: 0,
        status: newStatus,
        country_code: countryFilter,
      });
    }
    window.scrollTo({ top: 0 });
  };

  const handleCountryChange = (newCountry: string) => {
    saveCountryFilter(newCountry);
    // Reset pagination to page 1 and trigger new query
    if (formData) {
      saveCurrentCursor(0);
      saveNextCursor(QUERY_LIMIT);
      queryMutation.mutate({
        formData,
        nextCursor: 0,
        status: statusFilter,
        country_code: newCountry,
      });
    }
    window.scrollTo({ top: 0 });
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
        isSubscribed={true}
        isSuccess={queryMutation.isSuccess}
        isLoading={queryMutation.isPending}
        statusFilter={statusFilter}
        onStatusChange={handleStatusChange}
        countryFilter={countryFilter}
        onCountryChange={handleCountryChange}
        sheetTaskId={sheetTaskId}
        spreadsheetUrl={spreadsheetUrl}
        sheetStatus={sheetStatus}
        onSaveAllAgents={handleSaveAllAgents}
        isSavingAll={isSavingAll}
        onSaveAgent={handleSaveAgent}
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
      <Pagination className="mt-8">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={handlePreviousPage}
              aria-disabled={currentCursor === 0}
              tabIndex={currentCursor === 0 ? -1 : 0}
              style={{
                pointerEvents: currentCursor === 0 ? "none" : "auto",
                opacity: currentCursor === 0 ? 0.5 : 1,
              }}
            />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              onClick={handleNextPage}
              aria-disabled={matches.length < QUERY_LIMIT}
              tabIndex={matches.length < QUERY_LIMIT ? -1 : 0}
              style={{
                pointerEvents: matches.length < QUERY_LIMIT ? "none" : "auto",
                opacity: matches.length < QUERY_LIMIT ? 0.5 : 1,
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      {/* <TypeForm id="BgfNaWmd" /> */}
    </>
  );
};

export default AgentMatchesFull;
