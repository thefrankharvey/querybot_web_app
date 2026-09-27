"use client";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@clerk/nextjs";
import {
  CONTRACT_VERSION,
  type AgencyGuardInput,
  type ManualAgencyGuardResponse,
} from "@/app/utils/query-safety/agency-guard";
export const AGENCY_HISTORY_KEY = "manual-agency-history";
export function useAgencyGuard(input: AgencyGuardInput, enabled: boolean) {
  const { user } = useUser();
  return useQuery({
    queryKey: [AGENCY_HISTORY_KEY, user?.id, CONTRACT_VERSION, input],
    enabled: enabled && !!user?.id,
    staleTime: 0,
    gcTime: 0,
    retry: false,
    queryFn: async ({ signal }) => {
      const response = await fetch("/api/query-safety/agency-guard", {
        method: "POST",
        cache: "no-store",
        signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(
          body?.code === "CAPABILITY_REQUIRED"
            ? "All-project history requires a subscription."
            : body?.code === "FEATURE_DISABLED"
              ? "Agency history is currently disabled."
              : body?.code === "RATE_LIMITED"
                ? "Too many history checks. Try again in a minute."
                : "Unable to load agency history. Try again.",
        );
      }
      return response.json() as Promise<ManualAgencyGuardResponse>;
    },
  });
}
