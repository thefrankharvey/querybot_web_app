"use client";

import { useParams } from "next/navigation";
import { ArrowLeft, Star } from "lucide-react";
import Link from "next/link";
import { isValidData, formatGenres } from "@/app/utils";
import React, { useState, useEffect, useMemo } from "react";
import {
  AgentMatchesProvider,
  AgentMatch,
} from "@/app/context/agent-matches-context";
import { useAgentMatches } from "@/app/context/agent-matches-context";

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
    return <div>Agent not found</div>;
  }

  return (
    <div className="flex flex-col gap-4 w-full lg:w-3/4 mx-auto mt-30">
      <Link href="/agent-matches" className="flex items-center gap-2">
        <ArrowLeft className="w-8 h-8" />
        <h2 className="text-2xl">Back</h2>
      </Link>
      <div className="bg-white rounded-lg p-4 py-8 md:p-16 shadow-lg">
        <div className="flex flex-col gap-8">
          <div className="flex justify-between">
            <h2 className="text-2xl font-bold capitalize">{agent.name}</h2>
            <p className="text-xl font-semibold flex items-center gap-1">
              <Star className="w-6 h-6" />
              {agent.total_score}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            {isValidData(agent.email) ? (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1">
                  <label className="text-lg font-semibold">Email:</label>
                  <a href={`mailto:${agent.email}`}>{agent.email}</a>
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
    </AgentMatchesProvider>
  );
}
