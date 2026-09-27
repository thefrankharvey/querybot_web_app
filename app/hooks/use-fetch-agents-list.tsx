import { useUser } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { AgentMatch, DashboardProject } from "../types";

type FetchAgentsListResponse = {
  agent_matches: AgentMatch[];
  projects: DashboardProject[];
};

export const useFetchAgentsList = () => {
  const { user } = useUser();
  return useQuery({
    queryKey: ["agent-matches", user?.id],
    enabled: !!user?.id,
    gcTime: 0,
    queryFn: async ({ signal }) => {
      const response = await fetch("/api/agent-matches", {
        method: "GET",
        cache: "no-store",
        signal,
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch agent matches");
      }

      return response.json() as Promise<FetchAgentsListResponse>;
    },
  });
};
