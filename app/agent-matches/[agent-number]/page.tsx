"use client";

import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { isValidData, formatGenres } from "@/app/utils";
import React, { useState, useEffect, useMemo } from "react";
import {
  AgentMatchesProvider,
  AgentMatch,
} from "@/app/context/agent-matches-context";
import { useAgentMatches } from "@/app/context/agent-matches-context";
import TooltipComponent from "@/app/components/tooltip";
import TypeForm from "@/app/components/type-form";
import CopyToClipboard from "@/app/components/copy-to-clipboard";
import StarRating from "@/app/components/star-rating";
import { Spinner } from "@/app/components/spinner";

const AgentProfile = () => {
  const params = useParams();
  const matchesContext = useAgentMatches();
  const matches = useMemo(
    () => matchesContext?.matches || [],
    [matchesContext?.matches]
  );
  const [agent, setAgent] = useState<AgentMatch | null>(null);

  useEffect(() => {
    if (matches.length > 0) {
      const foundAgent = matches.find(
        (data, index) => index === Number(params["agent-number"])
      );
      setAgent(foundAgent as AgentMatch | null);
    }
  }, [matches, params]);

  if (!agent) {
    return (
      <div className="flex flex-col gap-4 w-full lg:w-3/4 mx-auto pt-12 justify-center items-center">
        <Spinner size={100} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full lg:w-3/4 mx-auto pt-12">
      <Link href="/agent-matches" className="flex items-center gap-2">
        <ArrowLeft className="w-8 h-8" />
        <h2 className="text-2xl">Back</h2>
      </Link>
      <div className="bg-white rounded-lg p-4 py-8 md:p-16 shadow-lg">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <h2 className="text-2xl font-bold capitalize">{agent.name}</h2>
            <div className="text-xl font-semibold flex flex-col gap-1 mt-8 md:mt-0">
              <label className="text-lg font-semibold">Match Score:</label>
              <TooltipComponent
                className="w-fit"
                content="Our Agent match scores are based on data and keywords from your work which are matched against agent data in our comprehensive database.
Our ranking system helps you avoid the generalized spray and pray approach - and aim for agents actively seeking your specific niche and story traits based on what an agent has sold and represented in the past or has a specific interest in the type of work you are submitting."
              >
                <div className="text-xl font-semibold flex items-center gap-1">
                  <StarRating rateNum={agent.normalized_score} />
                  {agent.normalized_score}
                </div>
              </TooltipComponent>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {isValidData(agent.email) ? (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1 w-fit">
                  <label className="text-lg font-semibold">Email:</label>
                  <CopyToClipboard text={agent.email || ""} />
                </div>
              </div>
            ) : null}
            {isValidData(agent.twitter_url) ? (
              <div className="flex items-center gap-1">
                <label className="text-lg font-semibold">Twitter:</label>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`${agent.twitter_url}`}
                >
                  {agent.twitter_handle}
                </a>
              </div>
            ) : null}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-lg font-semibold">Genres:</label>
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
            <label className="text-lg font-semibold">Bio:</label>
            <p className="text-base leading-relaxed text-gray-800">
              {isValidData(agent.bio) ? agent.bio : "Info Unavailable"}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-lg font-semibold">Agency:</label>
            <p className="text-base leading-relaxed text-gray-800">
              {isValidData(agent.agency) ? agent.agency : "Info Unavailable"}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-lg font-semibold">Clients:</label>
            <p className="text-base leading-relaxed text-gray-800">
              {isValidData(agent.clients) ? agent.clients : "Info Unavailable"}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-lg font-semibold">Sales:</label>
            <p className="text-base leading-relaxed text-gray-800">
              {isValidData(agent.sales) ? agent.sales : "Info Unavailable"}
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
