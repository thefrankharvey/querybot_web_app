"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";

import {
  getAgentIdentityKey,
  type AgentIdentityKey,
  type AgentWatch,
  type RadarEventType,
  type RadarOriginSurface,
  type RadarWatchCapabilities,
  type WatchLookupResult,
} from "@/app/utils/personalized-radar/contracts";
import { captureRadarEvent } from "@/app/utils/personalized-radar/product-analytics.client";

export const agentWatchKeys = {
  all: ["agent-watches"] as const,
  list: () => [...agentWatchKeys.all, "list"] as const,
  lookup: (keys: readonly string[]) =>
    [...agentWatchKeys.all, "lookup", ...keys] as const,
};

export function useAgentWatches() {
  return useQuery({
    queryKey: agentWatchKeys.list(),
    queryFn: () =>
      fetchRadarJson<{
        watches: AgentWatch[];
        capabilities: RadarWatchCapabilities;
      }>("/api/agent-watches?status=all"),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}

type RadarApiErrorBody = { code?: string; message?: string; error?: string };

export class RadarClientApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string | null,
  ) {
    super(message);
    this.name = "RadarClientApiError";
  }
}

async function fetchRadarJson<T>(url: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      cache: "no-store",
      ...init,
      headers: {
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...init?.headers,
      },
    });
  } catch {
    throw new RadarClientApiError(
      "Radar could not be reached. Try again in a moment.",
      0,
      "NETWORK_ERROR",
    );
  }
  const payload = (await response.json().catch(() => null)) as
    | (T & RadarApiErrorBody)
    | null;
  if (!response.ok) {
    throw new RadarClientApiError(
      payload?.message ?? payload?.error ?? "Radar could not be updated.",
      response.status,
      payload?.code ?? null,
    );
  }
  if (!payload) {
    throw new RadarClientApiError(
      "Radar returned an unexpected response.",
      response.status,
      "INVALID_RESPONSE",
    );
  }
  return payload;
}

function normalizeLookupIdentities(identities: readonly AgentIdentityKey[]) {
  const byKey = new Map<string, AgentIdentityKey>();
  for (const identity of identities) {
    const key = getAgentIdentityKey(identity);
    if (key && !byKey.has(key)) byKey.set(key, identity);
  }
  return Array.from(byKey, ([key, identity]) => ({ key, ...identity })).toSorted(
    (left, right) => left.key.localeCompare(right.key),
  );
}

type AgentWatchLookupContextValue = {
  capabilities: RadarWatchCapabilities | null;
  isLoading: boolean;
  isError: boolean;
  watchByKey: ReadonlyMap<string, AgentWatch>;
};

const AgentWatchLookupContext = createContext<AgentWatchLookupContextValue | null>(
  null,
);

export function AgentWatchLookupProvider({
  children,
  identities,
}: {
  children: ReactNode;
  identities: readonly AgentIdentityKey[];
}) {
  const normalized = useMemo(
    () => normalizeLookupIdentities(identities),
    [identities],
  );
  const lookupKeys = useMemo(
    () => normalized.map((identity) => identity.key),
    [normalized],
  );
  const query = useQuery({
    queryKey: agentWatchKeys.lookup(lookupKeys),
    queryFn: () =>
      fetchRadarJson<{
        results: WatchLookupResult[];
        capabilities: RadarWatchCapabilities;
      }>("/api/agent-watches/lookup", {
        method: "POST",
        body: JSON.stringify({
          agentKeys: normalized.map(({ agentProfileId, indexId }) => ({
            agentProfileId,
            indexId,
          })),
        }),
      }),
    enabled: normalized.length > 0,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
  const value = useMemo<AgentWatchLookupContextValue>(() => {
    const watchByKey = new Map<string, AgentWatch>();
    for (const result of query.data?.results ?? []) {
      if (result.watch) watchByKey.set(result.key, result.watch);
    }
    return {
      capabilities: query.data?.capabilities ?? null,
      isLoading: query.isLoading,
      isError: query.isError,
      watchByKey,
    };
  }, [query.data, query.isError, query.isLoading]);

  return (
    <AgentWatchLookupContext.Provider value={value}>
      {children}
    </AgentWatchLookupContext.Provider>
  );
}

export function useAgentWatchState(identity: AgentIdentityKey) {
  const context = useContext(AgentWatchLookupContext);
  const key = getAgentIdentityKey(identity);
  return {
    capabilities: context?.capabilities ?? null,
    isLoading: context?.isLoading ?? false,
    isError: !context || context.isError,
    watch: key ? context?.watchByKey.get(key) ?? null : null,
  };
}

async function invalidateAgentWatchQueries(queryClient: QueryClient) {
  await queryClient.invalidateQueries({ queryKey: agentWatchKeys.all });
}

export function useCreateAgentWatch(options: {
  originSurface: RadarOriginSurface;
  onSuccess?: (watch: AgentWatch) => void;
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (variables: {
      identity: AgentIdentityKey;
      originAgentMatchId: string | null;
    }) => {
      const payload = await fetchRadarJson<{ watch: AgentWatch }>(
        "/api/agent-watches",
        {
          method: "POST",
          body: JSON.stringify({
            agentProfileId: variables.identity.agentProfileId,
            indexId: variables.identity.indexId,
            originAgentMatchId: variables.originAgentMatchId,
            originSurface: options.originSurface,
            eventTypes: ["submission_reopened"],
            inAppEnabled: true,
            emailDigestEnabled: false,
          }),
        },
      );
      return payload.watch;
    },
    onSuccess: async (watch) => {
      await invalidateAgentWatchQueries(queryClient);
      captureRadarEvent("agent_watch_created", {
        eventCategory: "submission_reopened",
        originSurface: options.originSurface,
        channel: "in_app",
      });
      options.onSuccess?.(watch);
    },
  });
}

export function useUpdateAgentWatch(options: {
  originSurface: RadarOriginSurface;
  onSuccess?: (watch: AgentWatch) => void;
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (variables: {
      watchId: string;
      action: "mute" | "unmute" | "update";
      eventTypes?: RadarEventType[];
      inAppEnabled?: boolean;
    }) => {
      const body =
        variables.action === "update"
          ? {
              action: "update",
              eventTypes: variables.eventTypes,
              inAppEnabled: variables.inAppEnabled,
              emailDigestEnabled: false,
            }
          : { action: variables.action };
      const payload = await fetchRadarJson<{ watch: AgentWatch }>(
        `/api/agent-watches/${variables.watchId}`,
        { method: "PATCH", body: JSON.stringify(body) },
      );
      return payload.watch;
    },
    onSuccess: async (watch, variables) => {
      await invalidateAgentWatchQueries(queryClient);
      captureRadarEvent(
        variables.action === "mute"
          ? "agent_watch_muted"
          : "agent_watch_updated",
        { originSurface: options.originSurface, channel: "in_app" },
      );
      options.onSuccess?.(watch);
    },
  });
}

export function useDeleteAgentWatch(options: {
  originSurface: RadarOriginSurface;
  onSuccess?: () => void;
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (watchId: string) =>
      fetchRadarJson<{ deleted: true }>(`/api/agent-watches/${watchId}`, {
        method: "DELETE",
      }),
    onSuccess: async () => {
      await invalidateAgentWatchQueries(queryClient);
      captureRadarEvent("agent_watch_deleted", {
        originSurface: options.originSurface,
        channel: "in_app",
      });
      options.onSuccess?.();
    },
  });
}
