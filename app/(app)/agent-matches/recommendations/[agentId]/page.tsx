"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useHomeAgentRecommendations } from "@/app/hooks/use-home-agent-recommendations";
import { Spinner } from "@/app/ui-primitives/spinner";
import { Button } from "@/app/ui-primitives/button";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent } from "@/app/ui-primitives/empty";
import AgentProfileDetails from "../../components/agent-profile-details";

function RecommendationProfile() {
  const { agentId } = useParams<{ agentId: string }>();
  const projectId = useSearchParams().get("project") ?? "";
  const { data, isPending, isError, refetch, isFetching } = useHomeAgentRecommendations(projectId, agentId);
  if (isPending && projectId) return <ProfileLoading />;
  const agent = data?.matches.find((match) => String(match.agent_id) === agentId);

  if (!projectId || !agent || !data?.project) {
    return <Empty className="mx-auto mt-8 max-w-xl">
      <EmptyHeader>
        <EmptyTitle>{isError ? "Agent profile couldn't load" : "Agent recommendation unavailable"}</EmptyTitle>
        <EmptyDescription>Return home for current recommendations, or try loading this profile again.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        {isError && <Button variant="outline" onClick={() => void refetch()} disabled={isFetching}>Try again</Button>}
        <Button asChild><Link href="/home">Back to home</Link></Button>
      </EmptyContent>
    </Empty>;
  }

  return <AgentProfileDetails agent={agent} hasFullAccess project={data.project} backHref="/home" />;
}

function ProfileLoading() {
  return <div role="status" aria-label="Loading agent profile" className="flex min-h-80 items-center justify-center"><Spinner className="size-16" /></div>;
}

export default function RecommendationProfilePage() {
  return <Suspense fallback={<ProfileLoading />}><RecommendationProfile /></Suspense>;
}
