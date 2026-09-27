"use client";
import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AGENCY_HISTORY_KEY } from "@/app/hooks/use-agency-guard";

type Config = {
  agencyHistory: boolean;
  capabilities: {
    sameProjectAgencyGuard: boolean;
    allProjectsAgencyHistory: boolean;
  };
};
const Context = createContext<Config | undefined>(undefined);
export function AgencyHistoryProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const userId = user?.id;
  const client = useQueryClient();
  const config = useQuery<Config>({
    queryKey: ["agency-history-config", userId],
    enabled: !!userId,
    staleTime: 60000,
    gcTime: 0,
    retry: false,
    queryFn: async ({ signal }) => {
      const response = await fetch("/api/query-safety/config", {
        cache: "no-store",
        signal,
      });
      if (!response.ok) throw new Error("Agency history unavailable");
      return response.json();
    },
  });
  useEffect(() => {
    const unsubscribe = client.getQueryCache().subscribe((event) => {
      // The saved-agent cache changes only after persistence or a successful server read.
      if (
        event.type === "updated" &&
        event.action.type === "success" &&
        event.query.queryKey[0] === "agent-matches" &&
        event.query.queryKey[1] === userId
      ) {
        void client
          .cancelQueries({ queryKey: [AGENCY_HISTORY_KEY, userId] })
          .then(() =>
            client.invalidateQueries({
              queryKey: [AGENCY_HISTORY_KEY, userId],
            }),
          );
      }
    });
    return () => {
      unsubscribe();
      void client.cancelQueries({ queryKey: [AGENCY_HISTORY_KEY, userId] });
      client.removeQueries({ queryKey: [AGENCY_HISTORY_KEY, userId] });
      client.removeQueries({ queryKey: ["agency-history-config", userId] });
    };
  }, [client, userId]);
  return (
    <Context.Provider value={userId ? config.data : undefined}>
      {children}
    </Context.Provider>
  );
}
export function useAgencyHistoryConfig() {
  return useContext(Context);
}
