import { useQuery } from "@tanstack/react-query";
import { FetchAgentResponse } from "../types";

export const useFetchAgent = (agentId: string | null) => {
  return useQuery({
    queryKey: ["agent", agentId],
    queryFn: async () => {
      if (!agentId) {
        throw new Error("Agent ID is required");
      }

      const response = await fetch(
        `/api/get-agent?agent_id=${encodeURIComponent(agentId)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch agent");
      }

      return response.json() as Promise<FetchAgentResponse>;
    },
    enabled: !!agentId,
  });
};
