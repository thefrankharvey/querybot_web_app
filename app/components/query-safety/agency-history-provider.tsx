"use client";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useProfileContext } from "@/app/(app)/context/profile-context";
import { useAgentMatches } from "@/app/(app)/context/agent-matches-context";
import { isDashboardProjectId } from "@/app/utils/project-dashboard-route";
import {
  CONTRACT_VERSION,
  indexSavedAgencies,
  type SavedAgencyIndex,
  type SavedAgencyResponse,
} from "@/app/utils/query-safety/agency-guard";

export const AGENCY_MATCHES_KEY = "saved-agency-matches";
const Context = createContext<{
  index?: SavedAgencyIndex;
  isChecking: boolean;
}>({
  isChecking: false,
});
export function AgencyHistoryProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const userId = user?.id;
  const pathname = usePathname();
  const { agentsList } = useProfileContext();
  const { matches } = useAgentMatches();
  const client = useQueryClient();
  const candidateIds = useMemo(
    () =>
      pathname.startsWith("/agent-matches")
        ? [
            ...new Set(
              matches
                .map((agent) => agent.agent_id)
                .filter((id): id is string => !!id && isDashboardProjectId(id)),
            ),
          ]
            .sort()
            .slice(0, 1000)
        : [],
    [matches, pathname],
  );
  // The profile cache changes after successful persistence. Only matching fields matter;
  // stage/date edits do not need a new agency lookup. Changed keys cancel obsolete reads.
  const savedRevision = useMemo(
    () =>
      JSON.stringify(
        agentsList
          ?.map((row) => [
            row.id,
            row.index_id,
            row.dashboard_project_id,
            row.project_name,
            row.name,
            row.agency,
            row.agency_url,
          ])
          .sort((a, b) => (a[0] ?? "").localeCompare(b[0] ?? "")),
      ),
    [agentsList],
  );
  const query = useQuery<SavedAgencyResponse>({
    queryKey: [
      AGENCY_MATCHES_KEY,
      userId,
      CONTRACT_VERSION,
      pathname,
      candidateIds,
      savedRevision,
    ],
    enabled: !!userId && agentsList !== undefined,
    staleTime: 0,
    gcTime: 0,
    retry: false,
    refetchOnMount: "always",
    queryFn: async ({ signal }) => {
      const response = await fetch("/api/query-safety/agency-guard", {
        method: "POST",
        cache: "no-store",
        signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateIds }),
      });
      if (!response.ok)
        throw new Error("Saved agency matches are unavailable.");
      return response.json();
    },
  });
  useEffect(
    () => () => {
      void client.cancelQueries({ queryKey: [AGENCY_MATCHES_KEY, userId] });
      client.removeQueries({ queryKey: [AGENCY_MATCHES_KEY, userId] });
    },
    [client, userId],
  );
  const index = useMemo(
    () =>
      userId && !query.isError && query.data?.enabled
        ? indexSavedAgencies(query.data)
        : undefined,
    [userId, query.data, query.isError],
  );
  const value = useMemo(
    () => ({
      index,
      isChecking:
        !!userId &&
        !query.isError &&
        (agentsList === undefined || query.isPending),
    }),
    [index, userId, agentsList, query.isError, query.isPending],
  );
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useSavedAgencyIndex() {
  return useContext(Context).index;
}

export function useSavedAgencyCheck() {
  return useContext(Context);
}
