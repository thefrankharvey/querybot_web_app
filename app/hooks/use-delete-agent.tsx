import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

interface UseDeleteAgentMatchOptions {
  onSuccess?: (recordId: string) => void;
}

export const useDeleteAgentMatch = (options?: UseDeleteAgentMatchOptions) => {
  return useMutation({
    mutationFn: async (recordId: string) => {
      const response = await fetch(
        `/api/agent-match-records/${encodeURIComponent(recordId)}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete agent match");
      }

      return { recordId };
    },
    onSuccess: (data) => {
      toast.success("Agent removed successfully");
      options?.onSuccess?.(data.recordId);
    },
    onError: () => {
      toast.error("Failed to delete agent match");
    },
  });
};
