"use client";

import { useQuery } from "@tanstack/react-query";
import { useUser } from "@clerk/nextjs";
import type { HomeAgentRecommendations } from "@/app/utils/home-agent-recommendations";

export function useHomeAgentRecommendations(projectId?: string, agentId?: string) {
  const { user, isLoaded } = useUser();
  return useQuery<HomeAgentRecommendations>({
    queryKey: ["home-agent-recommendations", user?.id, projectId ?? null, agentId ?? null],
    queryFn: async ({ signal }) => {
      const params = new URLSearchParams();
      if (projectId && agentId) {
        params.set("project", projectId);
        params.set("agent", agentId);
      }
      const response = await fetch(`/api/home/agent-recommendations?${params}`, {
        cache: "no-store",
        signal,
      });
      if (!response.ok) throw new Error("Unable to load agent recommendations");
      return response.json();
    },
    enabled: isLoaded && Boolean(user),
    retry: false,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
  });
}
