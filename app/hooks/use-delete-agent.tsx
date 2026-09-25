import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

interface UseDeleteAgentMatchOptions {
  onSuccess?: (agentId: string) => void | Promise<void>;
}

export const useDeleteAgentMatch = (options?: UseDeleteAgentMatchOptions) => {
  return useMutation({
    mutationFn: async (agentId: string) => {
      const response = await fetch(
        `/api/agent-match-records/${encodeURIComponent(agentId)}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete agent match");
      }

      return { agentId };
    },
    onSuccess: async (data) => {
      await options?.onSuccess?.(data.agentId);
      toast.success("Agent removed successfully");
    },
    onError: () => {
      toast.error("Failed to delete agent match");
    },
  });
};
