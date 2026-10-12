"use client";

import { useAgencySaveConfirmation } from "@/app/components/query-safety/agency-save-confirmation";
import { DiscoveryAgencyGuard } from "@/app/components/query-safety/discovery-agency-guard";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import {
  formatGenres,
  formatDisplayString,
  capitalizeFirstCharacter,
} from "@/app/utils";
import React from "react";
import { AgentMatch } from "@/app/(app)/context/agent-matches-context";
import { isSameProjectScope } from "@/app/utils/project-scope";
import TooltipComponent from "@/app/components/tooltip";
import { AgentSaveButton } from "@/app/components/agent-save-button";
import type { SmartMatchProjectReference } from "@/app/utils/smart-match-projects";
import AgentContactDetails from "@/app/components/agent-contact-details";
import { useProfileContext } from "@/app/(app)/context/profile-context";
import { normalizeAndDedup } from "@/app/utils/string-utils";
import { DEFAULT_PROJECT_NAME } from "@/app/constants";
// import TypeForm from "@/app/components/type-form";
import { RemoveAgent } from "@/app/(app)/query-dashboard/components/remove-agent";
import {
  FitRatingBadge,
  getFitRatingFromScore,
} from "@/app/components/fit-rating-badge";

export default function AgentProfileDetails({
  agent,
  hasFullAccess,
  project,
  backHref = "/agent-matches",
}: {
  agent: AgentMatch;
  hasFullAccess: boolean;
  project: SmartMatchProjectReference;
  backHref?: string;
}) {
  const { agentsList, saveAgent, savingAgentId } = useProfileContext();
  const isSaving = savingAgentId !== null;
  const { requestSave, isChecking, confirmation } = useAgencySaveConfirmation({
    indexId: agent?.agent_id,
    agencyName: agent?.agency,
    agencyUrl: agent?.website,
  });

  const genreMatches = [
    ...(agent.match_hits?.direct.genres || []),
    ...(agent.match_hits?.cluster.genres || []),
  ];
  const dedupedGenreMatches = normalizeAndDedup(genreMatches);
  const themeMatches = [
    ...(agent.match_hits?.direct.themes || []),
    ...(agent.match_hits?.cluster.themes || []),
  ];
  const dedupedThemeMatches = normalizeAndDedup(themeMatches);
  const savedAgent = agentsList?.find(
    (savedMatch) =>
      savedMatch.index_id === agent.agent_id &&
      isSameProjectScope(
        {
          projectName: savedMatch.project_name,
          writerProjectId: savedMatch.writer_project_id,
        },
        {
          projectName: project.projectName,
          writerProjectId: project.writerProjectId,
        },
      ),
  );
  const isAlreadySaved = Boolean(savedAgent);
  const savedProjectName =
    savedAgent?.project_name?.trim() || DEFAULT_PROJECT_NAME;
  const fitRating = getFitRatingFromScore(agent.normalized_score);

  const handleSaveAgent = async () => {
    const payload = {
      name: agent.name,
      email: agent.email || null,
      agency: agent.agency || null,
      agency_url: agent.website || null,
      index_id: agent.agent_id || null,
      query_tracker: agent.querytracker || null,
      pub_marketplace: agent.pubmarketplace || null,
      match_score: agent.normalized_score || null,
      dashboard_project_id:
        project.dashboardProjectId,
      project_name: project.projectName || null,
      writer_project_id: project.writerProjectId,
    };
    await saveAgent(payload);
  };

  return (
    <div className="mx-auto flex w-full flex-col gap-4 p-4 md:w-[90%] pb-10 md:pb-82">
      {confirmation}
      <div className="flex items-end justify-between">
        <Link
          href={backHref}
          className="flex items-center gap-2 text-accent/72 transition-colors duration-300 hover:text-accent"
        >
          <ArrowLeft className="w-6 h-6" />
          <h2 className="text-md font-medium">Back</h2>
        </Link>
        {isAlreadySaved ? (
          <RemoveAgent
            recordId={savedAgent?.id}
            label="Remove Agent"
            description="This will remove the agent from your saved results."
            buttonClassName="w-auto"
          />
        ) : (
          <AgentSaveButton
            agentId={agent.agent_id}
            onSave={(event) =>
              requestSave(() => {
                void handleSaveAgent();
              }, event.currentTarget)
            }
            disabled={isSaving || isChecking}
            saving={isSaving}
          />
        )}
      </div>
      <div className="glass-panel-strong p-4 py-8 md:p-16">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1">
                <h2 className="text-2xl font-bold capitalize">{agent.name}</h2>
                {(hasFullAccess) && (
                  <DiscoveryAgencyGuard agent={agent} />
                )}
              </div>
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
                  Agent saved to: <br />
                  <span className="font-semibold text-accent">
                    {savedProjectName}
                  </span>
                </p>
              )}
            </div>
          </div>
          <AgentContactDetails
            agent={agent}
            isSubscribed={hasFullAccess}
          />
          <div className="flex flex-col gap-1">
            <label className="text-lg font-semibold">Matching Genres:</label>
            <div className="flex flex-wrap gap-1">
              {dedupedGenreMatches &&
                dedupedGenreMatches.length > 0 &&
                dedupedGenreMatches.map((genre: string) =>
                  formatGenres(genre).map((genre: string) => (
                    <div
                      key={genre}
                      className="surface-tag border-accent/18 bg-accent/10 px-2 py-1 text-sm text-accent"
                    >
                      {genre}
                    </div>
                  )),
                )}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-lg font-semibold">Matching Themes:</label>
            <div className="flex flex-wrap gap-1">
              {dedupedThemeMatches &&
                dedupedThemeMatches.length > 0 &&
                dedupedThemeMatches.map((theme: string) => (
                  <div
                    key={theme}
                    className="surface-tag border-accent/18 bg-accent/10 px-2 py-1 text-sm text-accent"
                  >
                    {theme}
                  </div>
                ))}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-lg font-semibold">All Genres:</label>
            <div className="flex flex-wrap gap-1">
              {formatGenres(agent.genres).map((genre: string) => (
                <div key={genre} className="surface-tag px-2 py-1 text-sm">
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
                    formatDisplayString(agent.extra_interest),
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
}
