"use client";

import { useParams } from "next/navigation";
import { useAgentMatches } from "@/app/(app)/context/agent-matches-context";
import { useClerkUser } from "@/app/hooks/use-clerk-user";
import { Spinner } from "@/app/ui-primitives/spinner";
import AgentProfileDetails from "../components/agent-profile-details";

export default function AgentProfile() {
  const params = useParams();
  const { isSubscribed, isLoading } = useClerkUser();
  const { matches, projectName, writerProjectId, formData } = useAgentMatches();
  const index = Number(params["agent-number"]);
  const agent = matches[index];

  if (!agent || isLoading) {
    return <div className="flex min-h-80 items-center justify-center"><Spinner className="size-16" /></div>;
  }

  return <AgentProfileDetails
    agent={agent}
    hasFullAccess={index < 6 || isSubscribed}
    project={{ projectName, writerProjectId, dashboardProjectId: formData?.save_project?.dashboardProjectId }}
  />;
}
