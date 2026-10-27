"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AgentMatch, useAgentMatches } from "@/app/(app)/context/agent-matches-context";
import { useClerkUser } from "@/app/hooks/use-clerk-user";
import { useFetchAgent } from "@/app/hooks/use-fetch-agent";
import { Spinner } from "@/app/ui-primitives/spinner";
import AgentProfileDetails from "../components/agent-profile-details";

export default function AgentProfile() {
  const params = useParams();
  const { isSubscribed, isLoading } = useClerkUser();
  const matchesContext = useAgentMatches();
  const index = Number(params["agent-number"]);
  const cachedAgent = matchesContext.matches[index];
  const { data: details, isFetching: isRefreshingDetails, error: detailError } = useFetchAgent(cachedAgent?.ranking_version ? null : cachedAgent?.agent_id ?? null);
  const agent = cachedAgent ? {
    ...cachedAgent, ...details?.agent,
    score: cachedAgent.score, normalized_score: cachedAgent.normalized_score,
    trait_matches: cachedAgent.trait_matches, match_hits: cachedAgent.match_hits,
  } as AgentMatch : null;

  if (isLoading || matchesContext.isLoading) {
    return <div className="flex min-h-80 items-center justify-center"><Spinner className="size-16" /></div>;
  }
  if (!agent) return <p className="p-8">This search result is unavailable. <Link href="/agent-matches" className="underline">Return to agent matches</Link> or run your search again.</p>;

  return <AgentProfileDetails
    agent={agent}
    hasFullAccess={index < 6 || isSubscribed}
    detailRefreshStatus={detailError ? "error" : isRefreshingDetails ? "loading" : undefined}
    project={{ projectName: matchesContext.projectName, writerProjectId: matchesContext.writerProjectId, dashboardProjectId: matchesContext.formData?.save_project?.dashboardProjectId }}
  />;
}
