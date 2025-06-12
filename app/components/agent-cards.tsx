import React from "react";
import { Star } from "lucide-react";
import Link from "next/link";
import { cn, isValidData } from "../utils";
import { AgentMatch } from "../context/agent-matches-context";
import { Skeleton } from "../ui-primitives/skeleton";
import TooltipComponent from "./tooltip";

export const AgentCards = ({
  agent,
  index,
  id,
  hasProPlan,
  isLoading,
}: {
  agent: AgentMatch;
  hasProPlan?: boolean;
  index: number;
  id: string;
  isLoading: boolean;
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
            <Skeleton isLoading={isLoading} className="w-1/2 h-6">
              <h2 className="text-2xl font-bold capitalize">{agent.name}</h2>
            </Skeleton>
            <Skeleton isLoading={isLoading} className="w-20 h-6">
              <TooltipComponent
                content="Our Agent Rank scores are based on data and keywords from your work which are matched against agent data in our comprehensive database.
Our ranking system helps you avoid the generalized spray and pray approach - and aim for agents actively seeking your specific niche and story traits based on what an agent has sold and represented in the past or has a specific interest in the type of work you are submitting."
              >
                <p className="text-xl font-semibold flex items-center gap-1">
                  <Star className="w-6 h-6" />
                  {agent.score}
                </p>
              </TooltipComponent>
            </Skeleton>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">Bio:</label>
            <Skeleton isLoading={isLoading} className="h-[60px] w-full">
              <p className="text-sm line-clamp-3">
                {isValidData(agent.bio) ? agent.bio : "Info Unavailable"}
              </p>
            </Skeleton>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">Agency:</label>
            <Skeleton isLoading={isLoading} className="h-6 w-full">
              <p className="text-sm">
                {isValidData(agent.agency) ? agent.agency : "Info Unavailable"}
              </p>
            </Skeleton>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">Clients:</label>
            <Skeleton isLoading={isLoading} className="h-[60px] w-full">
              <p className="text-sm line-clamp-3">
                {isValidData(agent.clients)
                  ? agent.clients
                  : "Info Unavailable"}
              </p>
            </Skeleton>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">Sales:</label>
            <Skeleton isLoading={isLoading} className="h-[60px] w-full">
              <p className="text-sm line-clamp-3">
                {isValidData(agent.sales) ? agent.sales : "Info Unavailable"}
              </p>
            </Skeleton>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default AgentCards;
