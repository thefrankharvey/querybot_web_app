import { useQuery } from "@tanstack/react-query";
import { AgentMatch } from "../types";

type FetchAgentsListResponse = {
  agent_matches: AgentMatch[];
};

export const useFetchAgentsList = () => {
  return useQuery({
    queryKey: ["agent-matches"],
    queryFn: async () => {
      const response = await fetch("/api/agent-matches", {
        method: "GET",
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
