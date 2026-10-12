"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { RefreshCw, ScanSearch } from "lucide-react";
import { AgentMatchCard } from "@/app/(app)/agent-matches/components/agent-match-card";
import { useProfileContext } from "@/app/(app)/context/profile-context";
import { useHomeAgentRecommendations } from "@/app/hooks/use-home-agent-recommendations";
import { Button } from "@/app/ui-primitives/button";
import { Skeleton } from "@/app/ui-primitives/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/app/ui-primitives/alert";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/app/ui-primitives/empty";
import { getRecommendationAgentHref } from "@/app/utils/home-agent-recommendations";
import type { SaveAgentPayload } from "@/app/types";

export default function HomeAgentRecommendations() {
  const { isLoaded, user } = useUser();
  const { data, isPending, isError, refetch, isFetching } = useHomeAgentRecommendations();
  const { agentsList, saveAgent, savingAgentId } = useProfileContext();
  const project = data?.project;
  const savedIds = new Set(agentsList?.map((agent) => agent.index_id));
  const matches = data?.matches.filter((agent) => !savedIds.has(agent.agent_id)) ?? [];

  const handleSaveAgent = async (payload: SaveAgentPayload) => {
    if (!project) return;
    const saved = await saveAgent({
      ...payload,
      project_name: project.projectName,
      writer_project_id: project.writerProjectId,
      dashboard_project_id: project.dashboardProjectId,
    });
    if (saved) await refetch();
  };

  if (isLoaded && !user) return null;

  return (
    <section aria-labelledby="home-agent-recommendations-title" className="mt-6 flex flex-col gap-5 pb-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h2 id="home-agent-recommendations-title" className="break-words font-serif text-2xl font-semibold leading-tight text-accent md:text-[30px]">
            {project ? `Agents for ${project.projectName}` : "Agent recommendations"}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-accent/70">
            Open to queries and matched to your latest project.
          </p>
        </div>
      </div>

      {isPending ? (
        <div role="status" aria-label="Loading agent recommendations" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <div key={index} className="glass-panel flex min-h-[430px] flex-col gap-6 p-5">
              <Skeleton className="h-6 w-3/4 motion-reduce:animate-none" />
              <Skeleton className="h-12 w-28 motion-reduce:animate-none" />
              <Skeleton className="h-6 w-40 motion-reduce:animate-none" />
              <Skeleton className="h-12 w-full motion-reduce:animate-none" />
              <Skeleton className="h-16 w-full motion-reduce:animate-none" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <Alert>
          <ScanSearch aria-hidden="true" />
          <AlertTitle>Agent recommendations couldn&apos;t load</AlertTitle>
          <AlertDescription>
            <p>Your projects are still available. Try loading your matches again.</p>
            <Button variant="outline" size="sm" onClick={() => void refetch()} disabled={isFetching}>
              <RefreshCw data-icon="inline-start" />
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      ) : matches.length > 0 && project ? (
        <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {matches.map((agent, index) => (
            <AgentMatchCard
              key={agent.agent_id}
              agent={agent}
              index={index}
              id={`home-agent-${agent.agent_id}`}
              isSubscribed={data?.isSubscribed}
              isLoading={false}
              projectName={project.projectName}
              projectWriterId={project.writerProjectId}
              href={getRecommendationAgentHref(agent.agent_id, project.searchWriterProjectId)}
              onSaveAgent={(payload) => void handleSaveAgent(payload)}
              savingAgentId={savingAgentId}
              className="min-w-0 p-5 py-6 md:p-5 motion-reduce:transform-none motion-reduce:transition-none [&_h2]:break-words"
            />
          ))}
        </div>
      ) : (
        <Empty className="glass-panel">
          <EmptyHeader>
            <EmptyTitle>{project ? "No new open agents to recommend" : "Find agents for your project"}</EmptyTitle>
            <EmptyDescription>
              {project
                ? "Available matches may already be saved. Try Smart Match to explore more agents."
                : "Add manuscript details to a project or run Smart Match to see recommendations here."}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild><Link href="/smart-match">Find agent matches</Link></Button>
          </EmptyContent>
        </Empty>
      )}
    </section>
  );
}
