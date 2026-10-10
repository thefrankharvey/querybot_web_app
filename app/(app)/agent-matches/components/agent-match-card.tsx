"use client";

import { AgentSubmissionStatus } from "@/app/components/agent-vocabulary-sections";

import { DiscoveryAgencyGuard } from "@/app/components/query-safety/discovery-agency-guard";

import React from "react";
import { useAgencySaveConfirmation } from "@/app/components/query-safety/agency-save-confirmation";
import { isSameProjectScope } from "@/app/utils/project-scope";
import Link from "next/link";
import { cn } from "@/app/utils";
import {
  AgentMatch,
  useAgentMatches,
} from "@/app/(app)/context/agent-matches-context";
import { Skeleton } from "@/app/ui-primitives/skeleton";
import TooltipComponent from "@/app/components/tooltip";
import { useProfileContext } from "@/app/(app)/context/profile-context";
import { Heart } from "lucide-react";
import { AgentSaveButton } from "@/app/components/agent-save-button";
import { matchingLabels } from "@/lib/agent-vocabulary";
import { SaveAgentPayload } from "@/app/types";
import { ALL_COUNTRY_FLAG_LABELS, DEFAULT_PROJECT_NAME } from "@/app/constants";
import {
  FitRatingBadge,
  getFitRatingFromScore,
} from "@/app/components/fit-rating-badge";

export const AgentMatchCard = ({
  agent,
  index,
  id,
  isSubscribed,
  isLoading,
  onSaveAgent,
  savingAgentId,
  tourTarget,
  projectName,
  projectWriterId,
  href,
  className,
}: {
  agent: AgentMatch;
  isSubscribed?: boolean;
  index: number;
  id: string;
  isLoading: boolean;
  onSaveAgent?: (payload: SaveAgentPayload) => void;
  savingAgentId?: string | null;
  tourTarget?: string;
  projectName?: string;
  projectWriterId?: string | null;
  href?: string;
  className?: string;
}) => {
  const { agentsList, isFreeSaveLimitReached } = useProfileContext();
  const { requestSave, isChecking, confirmation } = useAgencySaveConfirmation({
    indexId: agent.agent_id,
    agencyName: agent.agency,
    agencyUrl: agent.website,
  });
  const isDisabled = index >= 6 && !isSubscribed;
  const fitRating = getFitRatingFromScore(agent.normalized_score);
  const agentMatchSkeletonClass =
    "border-white/50 bg-[linear-gradient(135deg,rgba(245,249,250,0.92),rgba(224,233,236,0.86))] shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]";
  const dedupedGenreMatches = matchingLabels(agent.trait_matches, "genres");
  const dedupedThemeMatches = matchingLabels(agent.trait_matches, "themes");

  const { writerProjectId } = useAgentMatches();
  const savedAgent = agentsList?.find(
    (a) =>
      a.index_id === agent.agent_id &&
      isSameProjectScope(
        { projectName: a.project_name, writerProjectId: a.writer_project_id },
        { projectName, writerProjectId: projectWriterId === undefined ? writerProjectId : projectWriterId },
      ),
  );
  const isAlreadySaved = Boolean(savedAgent);
  const savedProjectName =
    savedAgent?.project_name?.trim() || DEFAULT_PROJECT_NAME;
  const currentProjectName = projectName?.trim() || DEFAULT_PROJECT_NAME;

  const handleSaveClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (onSaveAgent && !isAlreadySaved && !savingAgentId && !isDisabled) {
      const payload: SaveAgentPayload = {
        name: agent.name,
        email: agent.email || null,
        agency: agent.agency || null,
        agency_url: agent.website || null,
        index_id: agent.agent_id || null,
        query_tracker: agent.querytracker || null,
        pub_marketplace: agent.pubmarketplace || null,
        match_score: agent.normalized_score || null,
      };
      requestSave(() => onSaveAgent(payload), e.currentTarget);
    }
  };

  return (
    <div
      data-tour-target={tourTarget}
      id={id}
      className={cn(
        "glass-panel flex w-full flex-col p-4 py-8 hover:cursor-pointer md:p-8",
        isDisabled
          ? "opacity-60"
          : "transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_72px_rgba(24,44,69,0.14)]",
        className,
      )}
    >
      <Link
        href={isDisabled ? "#" : href ?? `/agent-matches/${index}`}
        className="block h-full w-full rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4"
      >
        <div className="flex flex-col gap-4">
          <div className="flex justify-between">
            <Skeleton
              isLoading={isLoading}
              className={cn("h-6 w-1/2", agentMatchSkeletonClass)}
            >
              <div className="flex items-center gap-1">
                <h2 className="text-xl font-bold capitalize text-accent">
                  {agent.name}
                </h2>
                {!isDisabled && <DiscoveryAgencyGuard agent={agent} />}
              </div>
            </Skeleton>
            <div>
              {!isSubscribed && isDisabled && !isFreeSaveLimitReached ? (
                <TooltipComponent
                  className="w-full"
                  contentClass="text-center w-[250px]"
                  content="Subscribe to save all agent matches!"
                >
                  <div>
                    <div className="flex items-center justify-center gap-2">
                      <Heart className="w-7 h-7 text-accent" />
                    </div>
                  </div>
                </TooltipComponent>
              ) : savedAgent ? (
                <TooltipComponent
                  asChild
                  className="inline-flex"
                  contentClass="text-left w-[220px]"
                  content={`agent saved for ${savedProjectName}`}
                >
                  <span tabIndex={0}>
                    <Heart className="w-7 h-7 fill-[#1D4A4E] text-[#1D4A4E]" />
                  </span>
                </TooltipComponent>
              ) : (
                <AgentSaveButton
                  agentId={agent.agent_id}
                  iconOnly
                  label={`Save ${agent.name}`}
                  description={`Save agent to your ${currentProjectName} dashboard`}
                  onSave={handleSaveClick}
                  disabled={!!savingAgentId || isChecking}
                  saving={savingAgentId === agent.agent_id}
                />
              )}
            </div>
          </div>
          <Skeleton
            isLoading={isLoading}
            className={cn("h-11 w-28", agentMatchSkeletonClass)}
          >
            <TooltipComponent
              asChild
              className="flex w-fit flex-col items-start gap-1 text-left"
              content="We analyze agent profiles against your search to estimate how well each agent matches your needs."
            >
              <div>
                <label className="text-sm font-semibold cursor-pointer">
                  Fit Rating:
                </label>
                <FitRatingBadge rating={fitRating} variant="agent" />
              </div>
            </TooltipComponent>
          </Skeleton>
          <Skeleton
            isLoading={isLoading}
            className={cn("h-6 w-1/2", agentMatchSkeletonClass)}
          >
            <AgentSubmissionStatus vocabulary={agent.vocabulary} />
          </Skeleton>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold cursor-pointer">
              Agency:
            </label>
            <Skeleton
              isLoading={isLoading}
              className={cn("h-6 w-full", agentMatchSkeletonClass)}
            >
              <p className="text-sm text-accent/78">
                {agent.agency ? agent.agency : "Info Unavailable"}
              </p>
            </Skeleton>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold cursor-pointer">
              Country:
            </label>
            <Skeleton
              isLoading={isLoading}
              className={cn("h-6 w-full", agentMatchSkeletonClass)}
            >
              <p className="text-sm text-accent/78">
                {agent.location?.country_code ? (
                  <>
                    <span>
                      {
                        ALL_COUNTRY_FLAG_LABELS[
                          agent.location
                            ?.country_code as keyof typeof ALL_COUNTRY_FLAG_LABELS
                        ]?.flag
                      }
                    </span>
                    <span className="ml-1">
                      {
                        ALL_COUNTRY_FLAG_LABELS[
                          agent.location
                            ?.country_code as keyof typeof ALL_COUNTRY_FLAG_LABELS
                        ]?.label
                      }
                    </span>
                  </>
                ) : (
                  "Info Unavailable"
                )}
              </p>
            </Skeleton>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold cursor-pointer">
              Matching Genres:
            </label>
            <Skeleton isLoading={isLoading} className={cn("h-[60px] w-full", agentMatchSkeletonClass)}>
              <div className="flex flex-wrap gap-1">
                {dedupedGenreMatches.length > 0 ? dedupedGenreMatches.slice(0, 8).map((genre) => (
                  <div key={genre} className="surface-tag px-2 py-1 text-sm">{genre}</div>
                )) : <p className="text-sm text-accent/72">{agent.trait_matches ? "No matching genres." : "Matching information unavailable."}</p>}
              </div>
            </Skeleton>
          </div>
          {dedupedThemeMatches.length > 0 && (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold cursor-pointer">
                Matching Themes:
              </label>
              <Skeleton isLoading={isLoading} className={cn("h-[60px] w-full", agentMatchSkeletonClass)}>
                <div className="flex flex-wrap gap-1">
                  {dedupedThemeMatches.slice(0, 8).map((theme) => (
                    <div key={theme} className="surface-tag px-2 py-1 text-sm">{theme}</div>
                  ))}
                </div>
              </Skeleton>
            </div>
          )}
        </div>
      </Link>
      {confirmation}
    </div>
  );
};

export default AgentMatchCard;
