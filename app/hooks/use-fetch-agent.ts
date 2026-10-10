import { useQuery } from "@tanstack/react-query";
import { FetchAgentResponse } from "../types";

export const useFetchAgent = (agentId: string | null, writerProjectId?: string | null) => {
  return useQuery({
    queryKey: ["agent-detail-vocabulary-v1", agentId, writerProjectId ?? null],
    queryFn: async () => {
      if (!agentId) {
        throw new Error("Agent ID is required");
      }

      const response = await fetch(
        `/api/get-agent?agent_id=${encodeURIComponent(agentId)}${writerProjectId ? `&writer_project_id=${encodeURIComponent(writerProjectId)}` : ""}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || "Failed to fetch agent");
      }

      return response.json() as Promise<FetchAgentResponse>;
    },
    enabled: !!agentId,
  });
};
