"use client";

import React, { useState } from "react";
import { formatDisplayString, formatGenres } from "@/app/utils";
import { AgentMatch } from "@/app/(app)/context/agent-matches-context";
import AnimatedScoreDisplay from "@/app/components/animated-score-display";

export const DisplayAgentCards = ({
  agent,
  id,
}: {
  agent: AgentMatch;
  id: string;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      id={id}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="bg-white rounded-lg p-4 py-8 md:p-8 w-full shadow-md hover:shadow-2xl transition-all duration-300"
    >
      <div className="flex flex-col gap-4">
        <div className="flex justify-between">
          <h2 className="text-2xl font-bold capitalize">{agent.name}</h2>
        </div>
        <div className="flex flex-col items-start gap-1 w-fit">
          <label className="text-sm font-semibold">Match Score:</label>
          <AnimatedScoreDisplay
            score={agent.normalized_score}
            size="xl"
            isHovered={isHovered}
          />
        </div>
        <span className="bg-accent text-white text-xs p-1 px-3 rounded-xl font-semibold w-fit">
          Open to Submissions
        </span>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold">Agency:</label>
          <p className="text-sm">{agent.agency}</p>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold">Favorites:</label>
          <p className="text-sm line-clamp-3">
            {formatDisplayString(agent.favorites)}
          </p>
        </div>
        {/* <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold">Interests:</label>
          <p className="text-sm line-clamp-3">
            {formatDisplayString(agent.extra_interest)}
          </p>
        </div> */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold">Top Genres:</label>
          <div className="flex flex-wrap gap-1">
            {formatGenres(agent.genres)
              .slice(0, 6)
              .map((genre: string) => (
                <div
                  key={genre}
                  className="bg-gray-100 px-2 py-1 text-sm rounded-md"
                >
                  {genre}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisplayAgentCards;
