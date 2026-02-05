"use client";

import React from "react";
import { useFetchAgent } from "@/app/hooks/use-fetch-agent";
import TooltipComponent from "@/app/components/tooltip";
import StarRating from "@/app/components/star-rating";
import AgentContactDetails from "@/app/components/agent-contact-details";
import {
  formatDisplayString,
  formatGenres,
  capitalizeFirstCharacter,
} from "@/app/utils";
import { Button } from "@/app/ui-primitives/button";
import { useDeleteAgentMatch } from "@/app/hooks/use-delete-agent";
import { Spinner } from "@/app/ui-primitives/spinner";
import { useProfileContext } from "@/app/(app)/context/profile-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface SavedAgentProps {
  params: Promise<{
    "agent-id": string;
  }>;
}

const SavedAgent = ({ params }: SavedAgentProps) => {
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
          router.replace(`/saved-agents/${remainingAgents[0].index_id}`);
        } else {
          router.replace("/saved-agents");
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
        <Spinner className="size-16" />
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

  return (
    <div>
      <div className="max-w-[1000px] mx-auto pb-4 flex justify-between items-center pt-3">
        <Link
          href="/query-dashboard"
          className="flex items-center gap-2 hover:text-accent transition-colors duration-300"
        >
          <ArrowLeft className="w-6 h-6" />
          <h2 className="text-md font-medium">Back</h2>
        </Link>
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
                <span className="bg-accent text-white text-xs p-1 px-3 rounded-xl font-semibold w-fit">
                  Open to Submissions
                </span>
              ) : null}
            </div>
            <div className="text-xl font-semibold flex flex-col mt-8 md:mt-0">
              <label className="text-lg font-semibold">Match Score:</label>
              <TooltipComponent
                className="w-fit"
                content="Our 5-star score measures agent fit using your search query data points. Giving you an accurate idea of agent match potential."
              >
                <div className="text-xl font-semibold flex items-center gap-1">
                  <StarRating rateNum={agentMatch?.match_score || 0} />
                  {agentMatch?.match_score}
                </div>
              </TooltipComponent>
            </div>
          </div>
          <AgentContactDetails agent={agent} isSubscribed={true} />
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
      </div >
    </div >
  );
};

export default SavedAgent;
