"use client";

import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
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
} from "@/app/(app)/context/agent-matches-context";
import { useAgentMatches } from "@/app/(app)/context/agent-matches-context";
import TooltipComponent from "@/app/components/tooltip";
import StarRating from "@/app/components/star-rating";
import { Spinner } from "@/app/ui-primitives/spinner";
import { useClerkUser } from "@/app/hooks/use-clerk-user";
import AgentContactDetails from "@/app/components/agent-contact-details";
import { Button } from "@/app/ui-primitives/button";
import { useProfileContext } from "../../context/profile-context";
import { normalizeAndDedup } from "@/app/utils/string-utils";
import TypeForm from "@/app/components/type-form";

const AgentProfile = () => {
  const params = useParams();
  const { isSubscribed, isLoading } = useClerkUser();
  const matchesContext = useAgentMatches();
  const matches = useMemo(
    () => matchesContext?.matches || [],
    [matchesContext?.matches]
  );
  const [agent, setAgent] = useState<AgentMatch | null>(null);

  const { saveAgent, isSaving } = useProfileContext();

  useEffect(() => {
    if (matches.length > 0) {
      const foundAgent = matches.find(
        (data, index) => index === Number(params["agent-number"])
      );
      setAgent(foundAgent as AgentMatch | null);
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
  const themeMatches = [...(agent.match_hits?.direct.themes || []), ...(agent.match_hits?.cluster.themes || [])];
  const dedupedThemeMatches = normalizeAndDedup(themeMatches);

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
    };
    await saveAgent(payload);
  };

  return (
    <div className="flex flex-col gap-4 w-full lg:w-3/4 mx-auto md:mt-15 mt-0">
      <div className="flex justify-between items-end">
        <Link
          href="/agent-matches"
          className="flex items-center gap-2 hover:text-accent transition-colors duration-300"
        >
          <ArrowLeft className="w-6 h-6" />
          <h2 className="text-md font-medium">Back</h2>
        </Link>
        {!isSubscribed ? (
          <TooltipComponent
            className="w-fit"
            contentClass="text-center"
            content="Subscribe to activate save agent feature!"
          >
            <Button
              className="text-sm shadow-lg hover:shadow-xl"
              disabled={true}
            >
              <div className="flex items-center gap-2">
                <span>Save Agent</span>
              </div>
            </Button>
          </TooltipComponent>
        ) : (
          <Button
            className="text-sm shadow-lg hover:shadow-xl"
            onClick={handleSaveAgent}
            disabled={isSaving}
          >
            <div className="flex items-center gap-2">
              {isSaving && <Spinner />}
              <span>Save Agent</span>
            </div>
          </Button>
        )}
      </div>
      <div className="bg-white rounded-lg p-4 py-8 md:p-16 shadow-lg">
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
            <div className="text-xl font-semibold flex flex-col gap-1 mt-8 md:mt-0">
              <label className="text-lg font-semibold">Match Score:</label>
              <TooltipComponent
                className="w-fit"
                content="Our Agent Match Score uses keywords and data points from your manuscript elements to match you with agents who actually seek your specific work. No more “spray and pray.” Just smart targeting, so you pitch agents actively looking for work like yours."
              >
                <div className="text-xl font-semibold flex items-center gap-1">
                  <StarRating rateNum={agent.normalized_score} />
                  {agent.normalized_score}
                </div>
              </TooltipComponent>
            </div>
          </div>
          <AgentContactDetails agent={agent} isSubscribed={isSubscribed} />
          <div className="flex flex-col gap-1">
            <label className="text-lg font-semibold">Matching Genres:</label>
            <div className="flex flex-wrap gap-1">
              {dedupedGenreMatches && dedupedGenreMatches.length > 0 &&
                dedupedGenreMatches.map((genre: string) => (
                  formatGenres(genre).map((genre: string) => (
                    <div
                      key={genre}
                      className="bg-accent text-white px-2 py-1 text-sm rounded-md"
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
                  formatGenres(theme).map((theme: string) => (
                    <div
                      key={theme}
                      className="bg-accent text-white px-2 py-1 text-sm rounded-md"
                    >
                      {theme}
                    </div>
                  ))
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
                  className="bg-gray-100 px-2 py-1 text-sm rounded-md"
                >
                  {genre}
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-lg font-semibold">Favorites:</label>
            <p className="text-base leading-relaxed text-gray-800">
              {agent.favorites
                ? capitalizeFirstCharacter(formatDisplayString(agent.favorites))
                : "Info Unavailable"}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-lg font-semibold">Interests:</label>
            <p className="text-base leading-relaxed text-gray-800">
              {agent.extra_interest
                ? capitalizeFirstCharacter(
                    formatDisplayString(agent.extra_interest)
                  )
                : "Info Unavailable"}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-lg font-semibold">Negatives:</label>
            <p className="text-base leading-relaxed text-gray-800">
              {agent.negatives
                ? capitalizeFirstCharacter(formatDisplayString(agent.negatives))
                : "Info Unavailable"}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-lg font-semibold">Bio:</label>
            <p className="text-base leading-relaxed text-gray-800">
              {agent.bio
                ? capitalizeFirstCharacter(agent.bio)
                : "Info Unavailable"}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-lg font-semibold">Clients:</label>
            <p className="text-base leading-relaxed text-gray-800">
              {agent.clients
                ? capitalizeFirstCharacter(agent.clients)
                : "Info Unavailable"}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-lg font-semibold">Sales:</label>
            <p className="text-base leading-relaxed text-gray-800">
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
      <TypeForm />
    </AgentMatchesProvider>
  );
}
