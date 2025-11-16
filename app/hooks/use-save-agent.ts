import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { SaveAgentPayload, SaveAgentResponse } from "../types";

export const useSaveAgent = () => {
  return useMutation({
    mutationFn: async (payload: SaveAgentPayload) => {
      const response = await fetch("/api/agent-matches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save agent");
      }

      return response.json() as Promise<SaveAgentResponse>;
    },
    onSuccess: (data) => {
      toast.success("Agent saved successfully!", {
        description: "You can view your saved agents anytime.",
        duration: 3000,
      });
    },
    onError: (error: Error) => {
      toast.error("Failed to save agent", {
        description: error.message || "Please try again later.",
        duration: 4000,
      });
    },
  });
};
