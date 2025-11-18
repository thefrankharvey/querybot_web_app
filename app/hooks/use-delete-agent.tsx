import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

interface UseDeleteAgentMatchOptions {
  onSuccess?: (agentId: string) => void;
}

export const useDeleteAgentMatch = (options?: UseDeleteAgentMatchOptions) => {
  return useMutation({
    mutationFn: async (agentId: string) => {
      const response = await fetch(`/api/agent-matches/${agentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete agent match");
      }

      return { agentId };
    },
    onSuccess: (data) => {
      toast.success("Agent match deleted successfully");
      options?.onSuccess?.(data.agentId);
    },
    onError: () => {
      toast.error("Failed to delete agent match");
    },
  });
};
