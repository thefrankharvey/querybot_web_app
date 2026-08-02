"use client";

import React from "react";
import { useFetchAgent } from "@/app/hooks/use-fetch-agent";
import TooltipComponent from "@/app/components/tooltip";
import StarRating from "@/app/components/star-rating";
import AgentContactDetails from "@/app/components/agent-contact-details";
import {
  formatDisplayString,
  formatGenres,
  capitalizeFirstCharacter,
} from "@/app/utils";
import { Button } from "@/app/ui-primitives/button";
import { useDeleteAgentMatch } from "@/app/hooks/use-delete-agent";
import { Spinner } from "@/app/ui-primitives/spinner";
import { useProfileContext } from "@/app/(writer-app)/context/profile-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useAgencyGuard, AgencyGuardClientError } from "@/app/hooks/use-agency-guard";
import { useQuerySafetyConfig } from "@/app/hooks/use-query-safety-config";
import {
  AgencyGuardBadge,
  AgencyGuardDetailsDialog,
} from "@/app/components/query-safety/agency-guard";
import { Alert, AlertDescription, AlertTitle } from "@/app/ui-primitives/alert";

interface QueryDashAgentProfileProps {
  params: Promise<{
    "agent-id": string;
  }>;
}

const QueryDashAgentProfile = ({ params }: QueryDashAgentProfileProps) => {
  const unwrappedParams = React.use(params);
  const routeAgentId = unwrappedParams["agent-id"];
  const {
    agentsList,
    isLoading: isSavedAgentsLoading,
    removeAgent,
  } = useProfileContext();
  const exactRecord = agentsList?.find((match) => match.id === routeAgentId);
  const legacyMatches = agentsList?.filter(
    (match) => match.index_id === routeAgentId,
  );
  const agentMatch =
    exactRecord ?? (legacyMatches?.length === 1 ? legacyMatches[0] : undefined);
  const upstreamAgentId = agentMatch?.index_id?.trim() || null;
  const { data, isLoading, error } = useFetchAgent(upstreamAgentId);
  const safetyConfig = useQuerySafetyConfig();
  const agencyHistoryEnabled =
    safetyConfig.data?.features.agencyHistory === true;
  const agencyGuardQuery = useAgencyGuard(
    { candidateRecordId: agentMatch?.id, includeAllProjects: true },
    { enabled: agencyHistoryEnabled && Boolean(agentMatch?.id) },
  );
  const router = useRouter();

  const { mutate: deleteAgentMatch, isPending: isDeleting } =
    useDeleteAgentMatch({
      onSuccess: (deletedRecordId) => {
        // Remove agent from context immediately
        removeAgent(deletedRecordId);

        // Get remaining agents after deletion
        const remainingAgents = agentsList?.filter(
          (agent) => agent.id !== deletedRecordId,
        );

        // Route based on remaining agents
        if (remainingAgents && remainingAgents.length > 0) {
          router.replace(
            `/query-dashboard/${encodeURIComponent(remainingAgents[0].id)}`,
          );
        } else {
          router.replace("/query-dashboard");
        }
      },
    });

  const agent = data?.agent;
  const handleDeleteAgentMatch = () => {
    if (agentMatch) {
      deleteAgentMatch(agentMatch.id);
    }
  };

  if (isLoading || isSavedAgentsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner className="size-16" />
      </div>
    );
  }

  if (error || !agent || !agentMatch) {
    return (
      <div>
        <h1 className="text-2xl md:text-[40px] font-extrabold leading-tight mb-4 flex items-center gap-4">
          Error
        </h1>
        <p className="text-red-500">
          {error instanceof Error ? error.message : "Failed to load agent"}
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div>
        <h1 className="text-2xl md:text-[40px] font-extrabold leading-tight mb-4 flex items-center gap-4">
          Not Found
        </h1>
        <p>Agent not found</p>
      </div>
    );
  }

  return (
    <div className="px-4 md:p-0">
      <div className="mx-auto flex max-w-[1000px] items-center justify-between pb-4 pt-3 md:mt-16 mt-6">
        <Link
          href="/query-dashboard"
          className="flex items-center gap-2 text-accent/72 transition-colors duration-300 hover:text-accent"
        >
          <ArrowLeft className="w-6 h-6" />
          <h2 className="text-md font-medium">Back</h2>
        </Link>
        <Button
          className="text-sm"
          onClick={handleDeleteAgentMatch}
          disabled={isDeleting || !agentMatch}
        >
          <div className="flex items-center gap-2">
            {isDeleting && <Spinner className="text-white" />}
            <span>Delete Agent</span>
          </div>
        </Button>
      </div>
      <div className="glass-panel-strong mx-auto max-w-[1000px] p-4 py-8 md:p-16">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-bold capitalize">{agent.name}</h2>
              {agent.status && agent.status !== "closed" ? (
                <span className="w-fit rounded-full border border-accent bg-accent px-3 py-1 text-xs font-semibold text-white">
                  Open to Submissions
                </span>
              ) : null}
            </div>
            <div className="text-xl font-semibold flex flex-col mt-8 md:mt-0">
              <label className="text-lg font-semibold">Match Score:</label>
              <TooltipComponent
                className="w-fit"
                content="Our 5-star score measures agent fit using your search query data points. Giving you an accurate idea of agent match potential."
              >
                <div className="text-xl font-semibold flex items-center gap-1">
                  <StarRating rateNum={agentMatch?.match_score || 0} />
                  {agentMatch?.match_score}
                </div>
              </TooltipComponent>
            </div>
          </div>
          {agencyHistoryEnabled && agencyGuardQuery.data ? (
            agencyGuardQuery.data.status === "clear" &&
            agencyGuardQuery.data.liveDataStatus === "available" ? (
              <p className="text-sm text-accent/72" role="status">
                No same-agency sent query history found for this project.
              </p>
            ) : (
              <AgencyGuardDetailsDialog
                guard={agencyGuardQuery.data}
                originSurface="agent_profile"
              >
                <Button className="w-fit" size="sm" type="button" variant="ghost">
                  <AgencyGuardBadge guard={agencyGuardQuery.data} />
                </Button>
              </AgencyGuardDetailsDialog>
            )
          ) : agencyHistoryEnabled && agencyGuardQuery.isLoading ? (
            <p className="text-sm text-accent/72" role="status">
              Checking agency query history…
            </p>
          ) : agencyHistoryEnabled &&
            agencyGuardQuery.error instanceof AgencyGuardClientError &&
            agencyGuardQuery.error.code === "FEATURE_DISABLED" ? null : agencyHistoryEnabled ? (
            <Alert role="status" variant="muted">
              <AlertTitle>Agency history unavailable</AlertTitle>
              <AlertDescription>
                Saved agent details are still available. Try the agency history
                check again later.
              </AlertDescription>
            </Alert>
          ) : null}
          <AgentContactDetails agent={agent} isSubscribed={true} />
          <div className="flex flex-col gap-1">
            <label className="text-lg font-semibold">Genres:</label>
            <div className="flex flex-wrap gap-1">
              {formatGenres(agent.genres || "").map((genre: string) => (
                <div
                  key={genre}
                  className="surface-tag px-2 py-1 text-sm"
                >
                  {genre}
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-lg font-semibold">Favorites:</label>
            <p className="text-base leading-relaxed text-accent/78">
              {agent.favorites
                ? capitalizeFirstCharacter(formatDisplayString(agent.favorites))
                : "Info Unavailable"}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-lg font-semibold">Interests:</label>
            <p className="text-base leading-relaxed text-accent/78">
              {agent.extra_interest
                ? capitalizeFirstCharacter(
                  formatDisplayString(agent.extra_interest)
                )
                : "Info Unavailable"}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-lg font-semibold">Negatives:</label>
            <p className="text-base leading-relaxed text-accent/78">
              {agent.negatives
                ? capitalizeFirstCharacter(formatDisplayString(agent.negatives))
                : "Info Unavailable"}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-lg font-semibold">Bio:</label>
            <p className="text-base leading-relaxed text-accent/78">
              {agent.bio
                ? capitalizeFirstCharacter(agent.bio)
                : "Info Unavailable"}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-lg font-semibold">Clients:</label>
            <p className="text-base leading-relaxed text-accent/78">
              {agent.clients
                ? capitalizeFirstCharacter(agent.clients)
                : "Info Unavailable"}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-lg font-semibold">Sales:</label>
            <p className="text-base leading-relaxed text-accent/78">
              {agent.sales
                ? capitalizeFirstCharacter(agent.sales)
                : "Info Unavailable"}
            </p>
          </div>
        </div>
      </div >
    </div >
  );
};

export default QueryDashAgentProfile;
