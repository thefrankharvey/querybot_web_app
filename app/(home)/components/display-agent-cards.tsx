import React from "react";
import { formatDisplayString, formatGenres } from "@/app/utils";
import { AgentMatch } from "@/app/context/agent-matches-context";
import StarRating from "@/app/components/star-rating";

export const DisplayAgentCards = ({
  agent,
  id,
}: {
  agent: AgentMatch;
  id: string;
}) => {
  return (
    <div
      id={id}
      className="bg-white rounded-lg p-4 py-8 md:p-8 w-full shadow-md"
    >
      <div className="flex flex-col gap-4">
        <div className="flex justify-between">
          <h2 className="text-2xl font-bold capitalize">{agent.name}</h2>
        </div>
        <div className="flex flex-col items-start gap-1 w-fit">
          <label className="text-sm font-semibold">Match Score:</label>
          <div className="text-xl font-semibold flex items-center gap-1">
            <StarRating rateNum={agent.normalized_score} />
            {agent.normalized_score}
          </div>
        </div>
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
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold">Interests:</label>
          <p className="text-sm line-clamp-3">
            {formatDisplayString(agent.extra_interest)}
          </p>
        </div>
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
