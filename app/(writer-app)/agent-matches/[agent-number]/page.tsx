"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Heart, MessageSquare } from "lucide-react";
import Link from "next/link";
import {
  formatGenres,
  formatDisplayString,
  capitalizeFirstCharacter,
} from "@/app/utils";
import React, { useState, useEffect, useMemo } from "react";
import {
  AgentMatchesProvider,
  AgentMatch,
} from "@/app/(writer-app)/context/agent-matches-context";
import { useAgentMatches } from "@/app/(writer-app)/context/agent-matches-context";
import TooltipComponent from "@/app/components/tooltip";
import { Spinner } from "@/app/ui-primitives/spinner";
import { useClerkUser } from "@/app/hooks/use-clerk-user";
import AgentContactDetails from "@/app/components/agent-contact-details";
import { Button } from "@/app/ui-primitives/button";
import { useProfileContext } from "../../context/profile-context";
import { normalizeAndDedup } from "@/app/utils/string-utils";
import { DEFAULT_PROJECT_NAME } from "@/app/constants";
// import TypeForm from "@/app/components/type-form";
import { RemoveAgent } from "@/app/(writer-app)/query-dashboard/components/remove-agent";
import {
  FitRatingBadge,
  getFitRatingFromScore,
} from "@/app/components/fit-rating-badge";
import {
  ensureAgentSavedForProject,
  getProjectAgentComposeMessageHref,
  getSavedAgentForProject,
  getWriterAgentLegacyId,
  mapWriterAgentMatchToSaveAgentPayload,
} from "../project-scoped-agent-messaging";
import { normalizeProjectName } from "@/app/utils/project-dashboard-summary";
import { useAgentMessagingAvailability } from "@/app/hooks/use-agent-messaging-availability";
import { normalizeAgentMessagingId } from "@/app/utils/agent-messaging-availability";
import { useAgencyGuard, AgencyGuardClientError } from "@/app/hooks/use-agency-guard";
import { useQuerySafetyConfig } from "@/app/hooks/use-query-safety-config";
import {
  AgencyGuardBadge,
  AgencyGuardDetailsDialog,
} from "@/app/components/query-safety/agency-guard";
import { Alert, AlertDescription, AlertTitle } from "@/app/ui-primitives/alert";

const AgentProfile = () => {
  const params = useParams();
  const router = useRouter();
  const { isSubscribed, isLoading } = useClerkUser();
  const matchesContext = useAgentMatches();
  const matches = useMemo(
    () => matchesContext?.matches || [],
    [matchesContext?.matches]
  );
  const [agent, setAgent] = useState<AgentMatch | null>(null);
  const [agentIndex, setAgentIndex] = useState<number>(0);
  const [messagingAgentId, setMessagingAgentId] = useState<string | null>(null);

  const { agentsList, saveAgent, savingAgentId } = useProfileContext();
  const legacyAgentId = agent ? getWriterAgentLegacyId(agent) : null;
  const agentMessagingIds = useMemo(
    () => (legacyAgentId ? [legacyAgentId] : []),
    [legacyAgentId],
  );
  const { availableAgentIds } =
    useAgentMessagingAvailability(agentMessagingIds);
  const isMessagingAvailable = availableAgentIds.has(
    normalizeAgentMessagingId(legacyAgentId),
  );
  const activeProjectName = normalizeProjectName(matchesContext.projectName);
  const activeWriterProjectId = matchesContext.writerProjectId?.trim() || null;
  const savedAgent = getSavedAgentForProject(agentsList, {
    legacyAgentId,
    projectName: activeProjectName,
    writerProjectId: activeWriterProjectId,
  });
  const safetyConfig = useQuerySafetyConfig();
  const agencyHistoryEnabled =
    safetyConfig.data?.features.agencyHistory === true;
  const agencyGuardQuery = useAgencyGuard(
    {
      candidateRecordId: savedAgent?.id,
      candidateIndexId: legacyAgentId,
      candidateAgencyId: agent?.agency_identity?.agency_id,
      candidateAgencyName:
        agent?.agency_identity?.agency_name ?? agent?.agency ?? null,
      candidateAgencyUrl:
        agent?.agency_identity?.agency_url ?? agent?.website ?? null,
      includeAllProjects: true,
      projectName: activeProjectName,
      writerProjectId: activeWriterProjectId,
    },
    { enabled: agencyHistoryEnabled && Boolean(agent) },
  );

  useEffect(() => {
    if (matches.length > 0) {
      const agentNumber = Number(params["agent-number"]);
      const foundAgent = matches.find(
        (_, index) => index === agentNumber
      );
      setAgent(foundAgent as AgentMatch | null);
      setAgentIndex(agentNumber);
    }
  }, [matches, params]);

  if (!agent || isLoading) {
    return (
      <div className="flex flex-col gap-4 w-full lg:w-3/4 mx-auto pt-30 justify-center items-center">
        <Spinner className="size-16" />
      </div>
    );
  }

  const genreMatches = [...(agent.match_hits?.direct.genres || []), ...(agent.match_hits?.cluster.genres || [])];
  const dedupedGenreMatches = normalizeAndDedup(genreMatches);
  const themeMatches = [
    ...(agent.match_hits?.direct.themes || []),
    ...(agent.match_hits?.cluster.themes || []),
  ];
  const dedupedThemeMatches = normalizeAndDedup(themeMatches);
  const isAlreadySaved = Boolean(savedAgent);
  const savedProjectName =
    savedAgent?.project_name?.trim() || DEFAULT_PROJECT_NAME;
  const fitRating = getFitRatingFromScore(agent.normalized_score);
  const isSaving = Boolean(legacyAgentId && savingAgentId === legacyAgentId);
  const isMessagePending = Boolean(
    legacyAgentId && messagingAgentId === legacyAgentId
  );
  const isMessageDisabled =
    isMessagePending || isSaving || !legacyAgentId || !isMessagingAvailable;

  const handleSaveAgent = async () => {
    await saveAgent(
      mapWriterAgentMatchToSaveAgentPayload(agent, {
        projectName: matchesContext.projectName || null,
        writerProjectId: activeWriterProjectId,
      })
    );
  };

  const handleMessageAgent = async () => {
    if (
      !legacyAgentId ||
      !isMessagingAvailable ||
      messagingAgentId === legacyAgentId
    ) {
      return;
    }

    setMessagingAgentId(legacyAgentId);
    try {
      const result = await ensureAgentSavedForProject({
        agent,
        savedAgents: agentsList,
        saveAgent,
        projectName: activeProjectName,
        writerProjectId: activeWriterProjectId,
        payload: mapWriterAgentMatchToSaveAgentPayload(agent, {
          projectName: matchesContext.projectName || null,
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

  return (
    <div className="mx-auto flex w-full flex-col gap-4 p-4 md:w-[90%] pb-10 md:pb-82">
      <div className="flex items-end justify-between">
        <Link
          href="/agent-matches"
          className="flex items-center gap-2 text-accent/72 transition-colors duration-300 hover:text-accent"
        >
          <ArrowLeft className="w-6 h-6" />
          <h2 className="text-md font-medium">Back</h2>
        </Link>
        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
          {isMessagingAvailable ? (
            <Button
              className="text-sm"
              variant="secondary"
              onClick={handleMessageAgent}
              disabled={isMessageDisabled}
            >
              {isMessagePending ? (
                <Spinner className="text-accent" data-icon="inline-start" />
              ) : (
                <MessageSquare data-icon="inline-start" />
              )}
              <span>{isMessagePending ? "Opening..." : "Message"}</span>
            </Button>
          ) : null}
          {isAlreadySaved ? (
            <RemoveAgent
              recordId={savedAgent?.id}
              label="Remove Agent"
              description="This will remove the agent from your saved results."
              buttonClassName="w-auto"
            />
          ) : (
            <Button
              className="text-sm"
              onClick={handleSaveAgent}
              disabled={isSaving}
            >
              <div className="flex items-center gap-2">
                {isSaving ? (
                  <Spinner className="text-white" />
                ) : (
                  <Heart />
                )}
                <span>Save Agent</span>
              </div>
            </Button>
          )}
        </div>
      </div>
      <div className="glass-panel-strong p-4 py-8 md:p-16">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-bold capitalize">{agent.name}</h2>
              {agent.status && agent.status !== "closed" && (
                <span className="bg-accent text-white text-xs p-1 px-3 rounded-xl font-semibold w-fit">
                  Open to Submissions
                </span>
              )}
            </div>
            <div className="mt-8 flex flex-col items-start gap-1 md:mt-0 md:items-end">
              <TooltipComponent
                asChild
                className="flex w-fit flex-col items-start gap-1 text-left md:items-end"
                content="We analyze agent profiles against your search to estimate how well each agent matches your needs."
              >
                <div>
                  <label className="text-lg font-semibold cursor-pointer">
                    Fit Rating:
                  </label>
                  <FitRatingBadge rating={fitRating} variant="agent" />
                </div>
              </TooltipComponent>
              {isAlreadySaved && (
                <p className="text-lg font-medium text-accent/72 md:text-right mt-4">
                  Agent saved to:{" "}
                  <br />
                  <span className="font-semibold text-accent">
                    {savedProjectName}
                  </span>
                </p>
              )}
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
                Agent details are still available. Try the agency history check
                again later.
              </AlertDescription>
            </Alert>
          ) : null}
          <AgentContactDetails agent={agent} isSubscribed={agentIndex < 6 || isSubscribed} />
          <div className="flex flex-col gap-1">
            <label className="text-lg font-semibold">Matching Genres:</label>
            <div className="flex flex-wrap gap-1">
              {dedupedGenreMatches && dedupedGenreMatches.length > 0 &&
                dedupedGenreMatches.map((genre: string) => (
                  formatGenres(genre).map((genre: string) => (
                    <div
                      key={genre}
                      className="surface-tag border-accent/18 bg-accent/10 px-2 py-1 text-sm text-accent"
                    >
                      {genre}
                    </div>
                  ))
                ))
              }
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-lg font-semibold">Matching Themes:</label>
            <div className="flex flex-wrap gap-1">
              {dedupedThemeMatches && dedupedThemeMatches.length > 0 &&
                dedupedThemeMatches.map((theme: string) => (
                  <div
                    key={theme}
                    className="surface-tag border-accent/18 bg-accent/10 px-2 py-1 text-sm text-accent"
                  >
                    {theme}
                  </div>
                ))
              }
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-lg font-semibold">All Genres:</label>
            <div className="flex flex-wrap gap-1">
              {formatGenres(agent.genres).map((genre: string) => (
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
      </div>
    </div>
  );
};

// Wrap the export with the AgentMatchesProvider
export default function AgentProfilePage() {
  return (
    <AgentMatchesProvider>
      <AgentProfile />
      {/* <TypeForm id="BgfNaWmd" /> */}
    </AgentMatchesProvider>
  );
}
