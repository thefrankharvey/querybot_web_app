"use client";

import React, { useState } from "react";
import { AgentMatch } from "@/app/(app)/context/agent-matches-context";
import AnimatedScoreDisplay from "@/app/components/animated-score-display";
import { Skeleton } from "@/app/ui-primitives/skeleton";
import TooltipComponent from "@/app/components/tooltip";
import { Heart, Save } from "lucide-react";
import { COUNTRY_FLAG_LABELS } from "@/app/constants";

export const DisplayAgentCards = ({
  agent,
  index,
  id,
  isSubscribed,
  isLoading,
  isSaved,
  mockCountryCode,
  mockMatchingGenres,
  mockMatchingThemes,
}: {
  agent: AgentMatch;
  isSubscribed?: boolean;
  index: number;
  id: string;
  isLoading: boolean;
  isSaved?: boolean;
  mockCountryCode?: "US" | "GB" | "CA";
  mockMatchingGenres?: string[];
  mockMatchingThemes?: string[];
}) => {
  void index;
  void isSubscribed;
  const [isHovered, setIsHovered] = useState(false);
  const countryCode = mockCountryCode;
  const MAX_MATCH_TAGS = 4;

  return (
    <div
      id={id}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="bg-white rounded-lg p-4 py-8 md:p-8 w-full h-full min-h-[520px] shadow-md hover:cursor-pointer hover:shadow-2xl transition-shadow duration-300"
    >
      <div className="flex flex-col gap-4">
        <div className="flex justify-between">
          <Skeleton isLoading={isLoading} className="w-1/2 h-6">
            <h2 className="text-xl font-bold capitalize">{agent.name}</h2>
          </Skeleton>
          <div>
            {isSaved ? (
              <TooltipComponent
                className="w-full"
                contentClass="text-left w-[200px]"
                content="Agent saved to Query Dashboard"
              >
                <div className="flex items-center justify-center gap-2">
                  <Heart className="w-7 h-7 text-accent" />
                </div>
              </TooltipComponent>
            ) : (
              <TooltipComponent
                className="w-full"
                contentClass="text-left w-[200px]"
                content="Save agent to your query dashboard"
              >
                <div className="flex items-center justify-center gap-2">
                  <Save className="w-7 h-7 text-accent" />
                </div>
              </TooltipComponent>
            )}
          </div>
        </div>
        <Skeleton isLoading={isLoading} className="w-20 h-6">
          <div className="flex flex-col items-start gap-1 w-fit">
            <TooltipComponent
              className="text-left"
              content="Our 5-star score measures agent fit using your search query data points. Giving you an accurate idea of agent match potential."
            >
              <label className="text-sm font-semibold cursor-pointer">
                Match Score:
              </label>
              <AnimatedScoreDisplay
                score={agent.normalized_score}
                isHovered={isHovered}
              />
            </TooltipComponent>
          </div>
        </Skeleton>
        <Skeleton isLoading={isLoading} className="w-1/2 h-6">
          {agent.status && agent.status !== "closed" ? (
            <span className="bg-accent text-white text-xs p-1 px-3 rounded-xl font-semibold w-fit">
              Open to Submissions
            </span>
          ) : null}
        </Skeleton>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold cursor-pointer">Agency:</label>
          <Skeleton isLoading={isLoading} className="h-6 w-full">
            <p className="text-sm">
              {agent.agency ? agent.agency : "Info Unavailable"}
            </p>
          </Skeleton>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold cursor-pointer">
            Country:
          </label>
          <Skeleton isLoading={isLoading} className="h-6 w-full">
            <p className="text-sm">
              {countryCode ? (
                <>
                  <span>
                    {
                      COUNTRY_FLAG_LABELS[
                        countryCode as keyof typeof COUNTRY_FLAG_LABELS
                      ]?.flag
                    }
                  </span>
                  <span className="ml-1">
                    {
                      COUNTRY_FLAG_LABELS[
                        countryCode as keyof typeof COUNTRY_FLAG_LABELS
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
          <Skeleton isLoading={isLoading} className="h-[60px] w-full">
            <div className="flex flex-wrap gap-1">
              {mockMatchingGenres && mockMatchingGenres.length > 0
                ? mockMatchingGenres
                  .slice(0, MAX_MATCH_TAGS)
                  .map((genre: string) => (
                    <div
                      key={genre}
                      className="bg-gray-100 px-2 py-1 text-sm rounded-md"
                    >
                      {genre}
                    </div>
                  ))
                : "Info Unavailable"}
            </div>
          </Skeleton>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold cursor-pointer">
            Matching Themes:
          </label>
          <Skeleton isLoading={isLoading} className="h-[60px] w-full">
            <div className="flex flex-wrap gap-1">
              {mockMatchingThemes && mockMatchingThemes.length > 0
                ? mockMatchingThemes
                  .slice(0, MAX_MATCH_TAGS)
                  .map((theme: string) => (
                    <div
                      key={theme}
                      className="bg-gray-100 px-2 py-1 text-sm rounded-md"
                    >
                      {theme}
                    </div>
                  ))
                : "Info Unavailable"}
            </div>
          </Skeleton>
        </div>
      </div>
    </div>
  );
};

export default DisplayAgentCards;
