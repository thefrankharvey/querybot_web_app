"use client";

import React, { useState } from "react";
import Link from "next/link";
import { cn, formatDisplayString, formatGenres } from "../utils";
import { AgentMatch } from "../(app)/context/agent-matches-context";
import { Skeleton } from "../ui-primitives/skeleton";
import TooltipComponent from "./tooltip";
import AnimatedScoreDisplay from "./animated-score-display";
import { useProfileContext } from "../(app)/context/profile-context";
import { Heart } from "lucide-react";

export const AgentCards = ({
  agent,
  index,
  id,
  isSubscribed,
  isLoading,
}: {
  agent: AgentMatch;
  isSubscribed?: boolean;
  index: number;
  id: string;
  isLoading: boolean;
}) => {
  const { agentsList } = useProfileContext();
  const [isHovered, setIsHovered] = useState(false);
  const isDisabled = index > 2 && !isSubscribed;

  return (
    <div
      id={id}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "bg-white rounded-lg p-4 py-8 md:p-8 w-full shadow-md hover:cursor-pointer",
        isDisabled
          ? "opacity-60"
          : "hover:shadow-2xl transition-shadow duration-300"
      )}
    >
      <Link
        href={isDisabled ? "#" : `/agent-matches/${index}`}
        className="block w-full h-full"
      >
        <div className="flex flex-col gap-4">
          <div className="flex justify-between">
            <Skeleton isLoading={isLoading} className="w-1/2 h-6">
              <h2 className="text-xl font-bold capitalize">{agent.name}</h2>
            </Skeleton>
            {agentsList &&
              agentsList.find((a) => a.index_id === agent.agent_id) && (
                <Heart className="w-6 h-6 text-accent" />
              )}
          </div>
          <Skeleton isLoading={isLoading} className="w-20 h-6">
            <div className="flex flex-col items-start gap-1 w-fit">
              <TooltipComponent
                className="text-left"
                content="Our Agent Match Score uses keywords and data points from your manuscript elements to match you with agents who actually seek your specific work. No more “spray and pray.” Just smart targeting, so you pitch agents actively looking for work like yours."
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
            <label className="text-sm font-semibold cursor-pointer">
              Agency:
            </label>
            <Skeleton isLoading={isLoading} className="h-6 w-full">
              <p className="text-sm">
                {agent.agency ? agent.agency : "Info Unavailable"}
              </p>
            </Skeleton>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold cursor-pointer">
              Favorites:
            </label>
            <Skeleton isLoading={isLoading} className="h-[60px] w-full">
              <p className="text-sm line-clamp-3">
                {agent.favorites
                  ? formatDisplayString(agent.favorites)
                  : "Info Unavailable"}
              </p>
            </Skeleton>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold cursor-pointer">
              Top Genres:
            </label>
            <Skeleton isLoading={isLoading} className="h-[60px] w-full">
              <div className="flex flex-wrap gap-1">
                {agent.genres
                  ? formatGenres(agent.genres)
                      .slice(0, 8)
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
        </div>
      </Link>
    </div>
  );
};

export default AgentCards;
