import { useState } from "react";

export type ManuscriptProcessorStatus =
  | "idle"
  | "loading"
  | "success"
  | "error";

export const useManuscriptProcessor = () => {
  const [manuscriptText, setManuscriptText] = useState<string>("");
  const [status, setStatus] = useState<ManuscriptProcessorStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const processManuscript = async (file: File | null | undefined) => {
    if (!file) {
      setManuscriptText("");
      return "";
    }

    try {
      setStatus("loading");
      setError(null);

      const formData = new FormData();
      formData.append("manuscript", file);

      const response = await fetch("/api/process-manuscript", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to process manuscript: ${response.status}`);
      }

      const data = await response.json();
      setManuscriptText(data.text || "");
      setStatus("success");
      return data.text || "";
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      setStatus("error");
      console.error("Error processing manuscript:", err);
      return "";
    }
  };

  return {
    manuscriptText,
    processManuscript,
    status,
    error,
    isProcessing: status === "loading",
  };
};
