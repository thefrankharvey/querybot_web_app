import React from "react";
import { Star } from "lucide-react";
import Link from "next/link";
import { cn, isValidData } from "../utils";
import { AgentMatch } from "../context/agent-matches-context";

export const AgentCards = ({
  agent,
  index,
  id,
  hasProPlan,
}: {
  agent: AgentMatch;
  hasProPlan?: boolean;
  index: number;
  id: string;
}) => {
  const isDisabled = index > 2 && !hasProPlan;

  return (
    <div
      id={id}
      className={cn(
        "bg-white rounded-lg p-4 py-8 md:p-8 w-full shadow-md",
        isDisabled
          ? "opacity-60"
          : "hover:shadow-xl transition-shadow duration-300 hover:cursor-pointer"
      )}
    >
      <Link href={isDisabled ? "#" : `/agent-matches/${index}`}>
        <div className="flex flex-col gap-4">
          <div className="flex justify-between">
            <h2 className="text-2xl font-bold capitalize">{agent.name}</h2>
            {agent.total_score && (
              <p className="text-xl font-semibold flex items-center gap-1">
                <Star className="w-6 h-6" />
                {agent.total_score}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">Bio:</label>
            <p className="text-sm line-clamp-3">
              {isValidData(agent.bio) ? agent.bio : "Info Unavailable"}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">Agency:</label>
            <p className="text-sm">
              {isValidData(agent.agency) ? agent.agency : "Info Unavailable"}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">Clients:</label>
            <p className="text-sm line-clamp-3">
              {isValidData(agent.clients) ? agent.clients : "Info Unavailable"}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">Sales:</label>
            <p className="text-sm line-clamp-3">
              {isValidData(agent.sales) ? agent.sales : "Info Unavailable"}
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default AgentCards;
