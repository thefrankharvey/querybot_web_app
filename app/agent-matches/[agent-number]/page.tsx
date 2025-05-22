"use client";

import { useParams } from "next/navigation";
import { ArrowLeft, Star } from "lucide-react";
import Link from "next/link";
import { isValidData } from "@/app/utils";
import React, { useState, useEffect, useMemo } from "react";
import { Skeleton } from "@/app/ui-primitives/skeleton";
import { AgentMatchesProvider } from "@/app/context/agent-matches-context";

import { useAgentMatches } from "@/app/context/agent-matches-context";
// Define the interface for agent data
interface AgentData {
  name: string;
  bio: string | null;
  agency: string | null;
  clients: string | null;
  sales: string | null;
  total_score?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any; // For other potential properties
}

const AgentProfile = () => {
  const params = useParams();
  const matchesContext = useAgentMatches();
  const matches = useMemo(
    () => matchesContext?.matches || [],
    [matchesContext?.matches]
  );
  const [agent, setAgent] = useState<AgentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (matches.length > 0) {
      const foundAgent = matches.find(
        (data, index) => index === Number(params["agent-number"])
      );
      setAgent(foundAgent as AgentData | null);
      setLoading(false);
    }
  }, [matches, params]);

  const formatGenres = (genres: string) => {
    const result = [];

    // Narrative Non-Fiction, Other non-fiction, Mystery, Commercial, Crime, thriller, action, General Fiction | Accepting Submissions |
    const genresArray = genres.split(",");

    // List of strings to filter out
    const stringsToFilter = [
      "Accepting Submissions",
      "Member of",
      "Special Experience",
      "ORGANIZATIONS",
      "HONORS & MEDIA",
      "Forbes",
      "Jane Friedman's Blog",
      "Electric Literature",
      "Latino Leaders Magazine",
      "Minorities in Publishing",
      "in",
      "read more",
      "read less",
      "Sub-agents",
      "Rights contacts",
      "International Rights:",
      "Ellen K. Greenberg",
      "Non-fiction",
      "CLOSED to Submissions",
      "Authors and Illustrators Only",
    ];

    for (const genre of genresArray) {
      if (genre.includes("|")) {
        const genreArray = genre.split("|").filter((str) => {
          // Remove empty strings and whitespace-only strings
          if (!str.trim()) return false;

          // Check if it contains any number
          if (/\d/.test(str)) return false;

          // Check if it contains any string from the filter list
          if (stringsToFilter.some((filterStr) => str.includes(filterStr)))
            return false;

          // Check for symbols
          if (str.includes("•") || str.includes("@")) return false;

          return true;
        });
        result.push(...genreArray);
      } else {
        const trimmedGenre = genre.trim();
        if (
          trimmedGenre &&
          !/\d/.test(trimmedGenre) &&
          !stringsToFilter.some((filterStr) =>
            trimmedGenre.includes(filterStr)
          ) &&
          !trimmedGenre.includes("•") &&
          !trimmedGenre.includes("@")
        ) {
          result.push(trimmedGenre);
        }
      }
    }

    const uniqueResult: string[] = [];

    for (const genre of result) {
      if (!uniqueResult.includes(genre.trim())) {
        uniqueResult.push(genre.trim());
      }
    }

    return uniqueResult;
  };

  return (
    <div className="flex flex-col gap-4 w-full lg:w-3/4 mx-auto mt-30">
      <Link href="/agent-matches" className="flex items-center gap-2">
        <ArrowLeft className="w-8 h-8" />
        <h2 className="text-2xl">Back</h2>
      </Link>
      <div className="bg-white rounded-lg p-4 py-8 md:p-16 shadow-lg">
        <div className="flex flex-col gap-8">
          <div className="flex justify-between">
            {loading ? (
              <Skeleton className="h-8 w-40" />
            ) : agent ? (
              <h2 className="text-2xl font-bold capitalize">{agent.name}</h2>
            ) : (
              <p className="text-2xl font-bold">Agent Not Found</p>
            )}
            {loading ? (
              <Skeleton className="h-6 w-16 flex items-center" />
            ) : agent?.total_score ? (
              <p className="text-xl font-semibold flex items-center gap-1">
                <Star className="w-6 h-6" />
                {agent.total_score}
              </p>
            ) : null}
          </div>
          {agent &&
            (isValidData(agent.email) || isValidData(agent.twitter_url)) && (
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
            )}
          <div className="flex flex-col gap-1">
            <label className="text-lg font-semibold">Genres:</label>
            <div className="flex flex-wrap gap-1">
              {loading ? (
                <Skeleton className="h-16 w-full flex items-center" />
              ) : agent && agent.genres ? (
                formatGenres(agent.genres).map((genre: string) => (
                  <div
                    key={genre}
                    className="bg-gray-100 px-2 py-1 text-sm rounded-md"
                  >
                    {genre}
                  </div>
                ))
              ) : null}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-lg font-semibold">Bio:</label>
            {loading ? (
              <Skeleton className="h-8 w-full" />
            ) : agent ? (
              <p className="text-base leading-relaxed text-gray-800">
                {isValidData(agent.bio) ? agent.bio : "Info Unavailable"}
              </p>
            ) : (
              <p className="text-sm">Info Unavailable</p>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-lg font-semibold">Agency:</label>
            {loading ? (
              <Skeleton className="h-8 w-full" />
            ) : agent ? (
              <p className="text-base leading-relaxed text-gray-800">
                {isValidData(agent.agency) ? agent.agency : "Info Unavailable"}
              </p>
            ) : (
              <p className="text-sm">Info Unavailable</p>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-lg font-semibold">Clients:</label>
            {loading ? (
              <Skeleton className="h-8 w-full" />
            ) : agent ? (
              <p className="text-base leading-relaxed text-gray-800">
                {isValidData(agent.clients)
                  ? agent.clients
                  : "Info Unavailable"}
              </p>
            ) : (
              <p className="text-sm">Info Unavailable</p>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-lg font-semibold">Sales:</label>
            {loading ? (
              <Skeleton className="h-8 w-full" />
            ) : agent ? (
              <p className="text-base leading-relaxed text-gray-800">
                {isValidData(agent.sales) ? agent.sales : "Info Unavailable"}
              </p>
            ) : (
              <p className="text-sm">Info Unavailable</p>
            )}
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
