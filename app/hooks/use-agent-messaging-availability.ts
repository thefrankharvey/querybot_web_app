"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { normalizeAgentMessagingIds } from "@/app/utils/agent-messaging-availability";

const AGENT_ID_CHUNK_SIZE = 50;
const EMPTY_AGENT_IDS: string[] = [];

type AgentMessagingAvailabilityResponse = {
  availableAgentIds?: unknown;
  error?: string;
};

function chunkAgentIds(agentIds: string[]) {
  const chunks: string[][] = [];

  for (let index = 0; index < agentIds.length; index += AGENT_ID_CHUNK_SIZE) {
    chunks.push(agentIds.slice(index, index + AGENT_ID_CHUNK_SIZE));
  }

  return chunks;
}

async function fetchAvailableAgentIds(agentIds: string[]) {
  const responses = await Promise.all(
    chunkAgentIds(agentIds).map(async (chunk) => {
      const searchParams = new URLSearchParams();
      chunk.forEach((agentId) => searchParams.append("agentId", agentId));

      const response = await fetch(
        `/api/agent-messaging-availability?${searchParams.toString()}`,
        {
          cache: "no-store",
        },
      );
      const body = (await response.json()) as AgentMessagingAvailabilityResponse;

      if (!response.ok) {
        throw new Error(body.error || "Failed to check messaging availability");
      }

      return Array.isArray(body.availableAgentIds)
        ? normalizeAgentMessagingIds(body.availableAgentIds)
        : EMPTY_AGENT_IDS;
    }),
  );

  return normalizeAgentMessagingIds(responses.flat());
}

export function useAgentMessagingAvailability(agentIds: readonly unknown[]) {
  const normalizedAgentIds = useMemo(
    () => normalizeAgentMessagingIds(agentIds),
    [agentIds],
  );
  const query = useQuery({
    queryKey: ["agent-messaging-availability", normalizedAgentIds],
    queryFn: () => fetchAvailableAgentIds(normalizedAgentIds),
    enabled: normalizedAgentIds.length > 0,
    staleTime: 5 * 60 * 1000,
  });
  const availableAgentIds = useMemo(
    () => new Set(query.data ?? EMPTY_AGENT_IDS),
    [query.data],
  );

  return {
    availableAgentIds,
    isError: query.isError,
    isLoading: normalizedAgentIds.length > 0 && query.isPending,
  };
}
