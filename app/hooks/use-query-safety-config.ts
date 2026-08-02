"use client";

import { useQuery } from "@tanstack/react-query";

import type { QueryReminderRuleId } from "@/app/utils/query-reminders/contracts";

export type QuerySafetyClientConfig = {
  features: {
    agencyHistory: boolean;
    queryRounds: boolean;
    manualReminders: boolean;
    suggestionRules: Record<QueryReminderRuleId, boolean>;
  };
};

async function fetchQuerySafetyConfig(): Promise<QuerySafetyClientConfig> {
  const response = await fetch("/api/query-safety/config", {
    cache: "no-store",
  });
  const body = (await response.json().catch(() => null)) as
    | (QuerySafetyClientConfig & { error?: string })
    | null;

  if (!response.ok || !body) {
    throw new Error(body?.error || "Query Safety settings are unavailable.");
  }

  return body;
}

export function useQuerySafetyConfig() {
  return useQuery({
    queryKey: ["query-safety", "config"],
    queryFn: fetchQuerySafetyConfig,
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  });
}
