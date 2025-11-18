"use client";

import React from "react";
import { useFetchAgent } from "@/app/hooks/use-fetch-agent";
import TooltipComponent from "@/app/components/tooltip";
import StarRating from "@/app/components/star-rating";
import Contact from "./components/contact";
import { formatDisplayString, formatGenres, urlFormatter } from "@/app/utils";
import Link from "next/link";
import { Button } from "@/app/ui-primitives/button";
import { useDeleteAgentMatch } from "@/app/hooks/use-delete-agent";
import { Spinner } from "@/app/ui-primitives/spinner";
import { useProfileContext } from "@/app/context/profile-context";
import { useRouter } from "next/navigation";

interface SavedMatchProps {
  params: Promise<{
    "agent-id": string;
  }>;
}

const SavedMatch = ({ params }: SavedMatchProps) => {
  const unwrappedParams = React.use(params);
  const agentId = unwrappedParams["agent-id"];
  const { data, isLoading, error } = useFetchAgent(agentId);
  const { agentsList, removeAgent } = useProfileContext();
  const router = useRouter();

  const { mutate: deleteAgentMatch, isPending: isDeleting } =
    useDeleteAgentMatch({
      onSuccess: (deletedAgentId) => {
        // Remove agent from context immediately
        removeAgent(deletedAgentId);

        // Get remaining agents after deletion
        const remainingAgents = agentsList?.filter(
          (agent) => agent.index_id !== deletedAgentId
        );

        // Route based on remaining agents
        if (remainingAgents && remainingAgents.length > 0) {
          router.replace(`/profile/saved-match/${remainingAgents[0].index_id}`);
        } else {
          router.replace("/profile/saved-match");
        }
      },
    });

  const agent = data?.agent;
  const agentMatch = agentsList?.find((match) => match.index_id === agentId);

  const handleDeleteAgentMatch = () => {
    deleteAgentMatch(agentId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner />
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div>
        <h1 className="text-2xl md:text-[40px] font-extrabold leading-tight mb-4 flex items-center gap-4">
          Error
        </h1>
        <p className="text-red-500">
          {error instanceof Error ? error.message : "Failed to load agent"}
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div>
        <h1 className="text-2xl md:text-[40px] font-extrabold leading-tight mb-4 flex items-center gap-4">
          Not Found
        </h1>
        <p>Agent not found</p>
      </div>
    );
  }

  const hasContactInfo =
    agent.email ||
    agent.querymanager ||
    agent.pubmarketplace ||
    agent.querytracker;

  return (
    <div>
      <div className="max-w-[1000px] mx-auto pb-4 flex justify-end pt-4">
        <Button
          className="text-sm shadow-lg hover:shadow-xl"
          onClick={handleDeleteAgentMatch}
          disabled={isDeleting}
        >
          <div className="flex items-center gap-2">
            {isDeleting && <Spinner />}
            <span>Delete Agent</span>
          </div>
        </Button>
      </div>
      <div className="bg-white rounded-lg p-4 py-8 md:p-16 shadow-lg mx-auto max-w-[1000px]">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-bold capitalize">{agent.name}</h2>
              {agent.status && agent.status !== "closed" ? (
                <span className="bg-accent text-xs p-1 px-3 rounded-xl font-semibold w-fit">
                  Open to Submissions
                </span>
              ) : null}
            </div>
            <div className="text-xl font-semibold flex flex-col gap-1 mt-8 md:mt-0">
              <label className="text-lg font-semibold">Match Score:</label>
              <TooltipComponent
                className="w-fit"
                content="Our Agent Match Score uses keywords and data points from your manuscript elements to match you with agents who actually seek your specific work. No more “spray and pray.” Just smart targeting, so you pitch agents actively looking for work like yours."
              >
                <div className="text-xl font-semibold flex items-center gap-1">
                  <StarRating rateNum={agentMatch?.match_score || 0} />
                  {agentMatch?.match_score}
                </div>
              </TooltipComponent>
            </div>
          </div>
          {hasContactInfo ? <Contact agent={agent} /> : null}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-1 w-fit">
            <label className="text-lg font-semibold">Agency:</label>
            {urlFormatter(agent.website) ? (
              <Link
                href={urlFormatter(agent.website) || ""}
                target="_blank"
                rel="noopener noreferrer"
              >
                <p className="text-base leading-relaxed text-gray-800 underline hover:text-accent">
                  {agent.agency ? agent.agency : "Info Unavailable"}
                </p>
              </Link>
            ) : (
              <p className="text-base leading-relaxed text-gray-800">
                {agent.agency ? agent.agency : "Info Unavailable"}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-lg font-semibold">Genres:</label>
            <div className="flex flex-wrap gap-1">
              {formatGenres(agent.genres || "").map((genre: string) => (
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
                ? formatDisplayString(agent.favorites)
                : "Info Unavailable"}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-lg font-semibold">Interests:</label>
            <p className="text-base leading-relaxed text-gray-800">
              {agent.extra_interest
                ? formatDisplayString(agent.extra_interest)
                : "Info Unavailable"}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-lg font-semibold">Negatives:</label>
            <p className="text-base leading-relaxed text-gray-800">
              {agent.negatives
                ? formatDisplayString(agent.negatives)
                : "Info Unavailable"}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-lg font-semibold">Bio:</label>
            <p className="text-base leading-relaxed text-gray-800">
              {agent.bio ? agent.bio : "Info Unavailable"}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-lg font-semibold">Clients:</label>
            <p className="text-base leading-relaxed text-gray-800">
              {agent.clients ? agent.clients : "Info Unavailable"}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-lg font-semibold">Sales:</label>
            <p className="text-base leading-relaxed text-gray-800">
              {agent.sales ? agent.sales : "Info Unavailable"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavedMatch;
