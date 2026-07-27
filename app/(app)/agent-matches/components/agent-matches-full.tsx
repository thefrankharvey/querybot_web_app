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
import AgentMatchesInner from "./agent-matches-inner";
// import TypeForm from "@/app/components/type-form";
import { useProfileContext } from "../../context/profile-context";
import { SaveAgentPayload } from "@/app/types";
import {
  getProjectDashboardHref,
  normalizeProjectName,
} from "@/app/utils/project-dashboard-summary";

// Helper function to map AgentMatch to SaveAgentPayload
const mapAgentToPayload = (agent: AgentMatch): SaveAgentPayload => ({
  name: agent.name,
  email: agent.email || null,
  agency: agent.agency || null,
  agency_url: agent.website || null,
  index_id: agent.agent_id || null,
  query_tracker: agent.querytracker || null,
  pub_marketplace: agent.pubmarketplace || null,
  match_score: agent.normalized_score || null,
});

export const AgentMatchesFull = ({
  onWalkthroughActiveChange,
}: {
  onWalkthroughActiveChange?: (isActive: boolean) => void;
}) => {
  const {
    matches,
    totalAgents,
    formData,
    saveMatches,
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
    beginSpreadsheetExport,
    failSpreadsheetExport,
    handleAgentExportResponse,
    saveTotalAgents,
    projectName,
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
  const hasSavedAgentsForActiveProject =
    activeProjectName.length > 0 &&
    Boolean(
      agentsList?.some(
        (agent) =>
          normalizeProjectName(agent.project_name) === activeProjectName
      )
    );

  const queryMutation = useMutation({
    mutationFn: async (params: {
      formData: FormData;
      nextCursor: number;
      status: string;
      country_code: string;
      refreshExport: boolean;
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
          body: JSON.stringify(params.formData),
        }
      );

      if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`);
      }
      const data = await res.json();
      return data;
    },

    onMutate: (params) => {
      if (params.refreshExport) {
        beginSpreadsheetExport();
      }
    },

    onSuccess: (data, params) => {
      const nextTotal =
        typeof data.total_agents === "number"
          ? data.total_agents
          : typeof data.total_available === "number"
            ? data.total_available
            : null;
      saveTotalAgents(nextTotal);

      if (Array.isArray(data.matches)) {
        saveMatches(data.matches);
      }

      if (data.next_cursor !== null) {
        saveNextCursor(data.next_cursor);
      }

      if (params.refreshExport) {
        handleAgentExportResponse(data);
      }
    },
    onError: (error, params) => {
      console.error(error);
      if (params.refreshExport) {
        failSpreadsheetExport(
          "The filtered results could not be prepared for Excel.",
        );
      }
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
        refreshExport: false,
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
        refreshExport: false,
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
        refreshExport: true,
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
        refreshExport: true,
      });
    }
    window.scrollTo({ top: 0 });
  };

  const handleSaveAgent = (payload: SaveAgentPayload) => {
    saveAgent({ ...payload, project_name: projectName || null });
  };

  const handleSaveAllAgents = () => {
    const payloads = matches.map((agent) => ({
      ...mapAgentToPayload(agent),
      project_name: projectName || null,
    }));
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
        projectName={activeProjectName}
        projectDashboardHref={
          hasSavedAgentsForActiveProject
            ? getProjectDashboardHref(activeProjectName)
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
