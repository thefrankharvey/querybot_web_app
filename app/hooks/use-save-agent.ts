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
    onSuccess: () => {
      toast.success("Agent saved successfully!", {
        description: "You can view your saved agents anytime in your profile.",
        duration: 3000,
      });
    },
    onError: (error: Error) => {
      const errorMessage = error.message.includes(
        "duplicate key value violates"
      )
        ? "Agent already exists in your saved agents"
        : "An error occurred while attempting to save the agent";

      toast.error("An error occurred", {
        description: errorMessage,
        duration: 4000,
      });
    },
  });
};
