import { QUERY_LIMIT } from "@/app/constants";
import { useMutation } from "@tanstack/react-query";
import { useAgentMatches, FormData, AgentMatch } from "../../context/agent-matches-context";
import { useRef } from "react";
import AgentMatchesInner from "./agent-matches-inner";
import PayWall from "@/app/components/pay-wall";
import { SaveAgentPayload } from "@/app/types";
import { useProfileContext } from "../../context/profile-context";

declare global {
  interface Window {
    isScrollLocked?: boolean;
    lastTouchY?: number;
  }
}

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

export const AgentMatchesPaywall = () => {
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
    saveCurrentCursor,
    saveNextCursor,
    sheetTaskId,
    spreadsheetUrl,
    sheetStatus,
    saveTotalAgents,
  } = useAgentMatches();
  const { saveAgent, saveAllAgents, savingAgentId, isSavingAll } = useProfileContext();
  const gridRef = useRef<HTMLDivElement>(null);
  const nextCursor = QUERY_LIMIT;

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
          body: JSON.stringify(params.formData),
        }
      );

      if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`);
      }

      return res.json();
    },
    onSuccess: (data) => {
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
    saveAgent(payload);
  };

  const handleSaveAllAgents = () => {
    const payloads = matches.map(mapAgentToPayload);
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
