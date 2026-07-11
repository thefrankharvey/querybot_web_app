"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getAgentActivityApiHref,
  getAgentMessageThreadApiHref,
  getAgentMessageThreadsApiHref,
  getAgentQueryTimelineApiHref,
  getAgentQueryTransitionApiHref,
  getAgentReadStateApiHref,
  getAgentThreadMessagesApiHref,
  getWriterAgentActivityApiHref,
  getWriterMessageThreadApiHref,
  getWriterMessageThreadsApiHref,
  getWriterQueryTimelineApiHref,
  getWriterQueryTransitionApiHref,
  getWriterReadStateApiHref,
  getWriterThreadMessagesApiHref,
} from "@/app/utils/message-routes";
import {
  getWriterThreadsByAgentIdentifier,
  type AgentActivityResponse,
  type AgentActivityWindow,
  type AgentMessageThreadsResponse,
  type AgentReplyResponse,
  type AgentThreadDetailResponse,
  type AgentThreadMessagesResponse,
  type MessageReadStateResponse,
  type MessageThreadFilters,
  type QueryStatusTransitionInput,
  type QueryStatusTransitionResponse,
  type QueryTimelineResponse,
  type WriterCreateThreadResponse,
  type WriterMessageThread,
  type WriterMessageThreadsResponse,
  type WriterReplyResponse,
  type WriterThreadDetailResponse,
  type WriterThreadMessagesResponse,
} from "@/app/utils/message-types";

const LIFECYCLE_STALE_TIME_MS = 30 * 1000;
const THREAD_LIST_REFETCH_INTERVAL_MS = 60 * 1000;

export const messageQueryKeys = {
  all: ["message-query-lifecycle"] as const,
  writer: {
    all: () => [...messageQueryKeys.all, "writer"] as const,
    project: (projectId: string) =>
      [...messageQueryKeys.all, "writer", projectId] as const,
    threads: (projectId: string, filters: MessageThreadFilters = {}) =>
      [
        ...messageQueryKeys.writer.project(projectId),
        "threads",
        filters.queryStatus ?? null,
        filters.terminal ?? null,
      ] as const,
    thread: (projectId: string, threadId: string) =>
      [
        ...messageQueryKeys.writer.project(projectId),
        "thread",
        threadId,
      ] as const,
    detail: (projectId: string, threadId: string) =>
      [
        ...messageQueryKeys.writer.thread(projectId, threadId),
        "detail",
      ] as const,
    messages: (
      projectId: string,
      threadId: string,
      before: string | null,
      limit: number,
    ) =>
      [
        ...messageQueryKeys.writer.thread(projectId, threadId),
        "messages",
        before,
        limit,
      ] as const,
    timeline: (projectId: string, threadId: string) =>
      [
        ...messageQueryKeys.writer.thread(projectId, threadId),
        "timeline",
      ] as const,
    agentActivity: (
      projectId: string,
      threadId: string,
      window: AgentActivityWindow,
    ) =>
      [
        ...messageQueryKeys.writer.thread(projectId, threadId),
        "agent-activity",
        window,
      ] as const,
  },
  agent: {
    all: () => [...messageQueryKeys.all, "agent"] as const,
    threads: (filters: MessageThreadFilters = {}) =>
      [
        ...messageQueryKeys.agent.all(),
        "threads",
        filters.queryStatus ?? null,
        filters.terminal ?? null,
      ] as const,
    thread: (threadId: string) =>
      [...messageQueryKeys.agent.all(), "thread", threadId] as const,
    detail: (threadId: string) =>
      [...messageQueryKeys.agent.thread(threadId), "detail"] as const,
    messages: (threadId: string, before: string | null, limit: number) =>
      [
        ...messageQueryKeys.agent.thread(threadId),
        "messages",
        before,
        limit,
      ] as const,
    timeline: (threadId: string) =>
      [...messageQueryKeys.agent.thread(threadId), "timeline"] as const,
    activity: (threadId: string, window: AgentActivityWindow) =>
      [
        ...messageQueryKeys.agent.thread(threadId),
        "agent-activity",
        window,
      ] as const,
  },
};

export class MessageClientApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "MessageClientApiError";
    this.status = status;
  }
}

async function fetchMessageJson<T>(
  url: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(url, { ...init, cache: "no-store" });
  const body = (await response.json().catch(() => null)) as
    (T & { message?: string }) | null;

  if (!response.ok || !body) {
    throw new MessageClientApiError(
      body?.message || "The messaging request failed",
      response.status || 500,
    );
  }

  return body;
}

function jsonRequest(method: "POST" | "PUT", body: Record<string, unknown>) {
  return {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  } satisfies RequestInit;
}

type QueryHookOptions<TData> = {
  enabled?: boolean;
  initialData?: TData;
};

export function useWriterMessageThreads({
  projectId,
  filters = {},
  enabled = true,
  initialData,
}: QueryHookOptions<WriterMessageThreadsResponse> & {
  projectId: string;
  filters?: MessageThreadFilters;
}) {
  return useQuery({
    queryKey: messageQueryKeys.writer.threads(projectId, filters),
    queryFn: () =>
      fetchMessageJson<WriterMessageThreadsResponse>(
        getWriterMessageThreadsApiHref(projectId, filters),
      ),
    enabled: enabled && Boolean(projectId),
    initialData,
    staleTime: LIFECYCLE_STALE_TIME_MS,
    refetchOnWindowFocus: true,
    refetchInterval: THREAD_LIST_REFETCH_INTERVAL_MS,
  });
}

export function useWriterThreadsByAgentIdentifier(
  threads: readonly WriterMessageThread[],
) {
  return useMemo(() => getWriterThreadsByAgentIdentifier(threads), [threads]);
}

export function useAgentMessageThreads({
  filters = {},
  enabled = true,
  initialData,
}: QueryHookOptions<AgentMessageThreadsResponse> & {
  filters?: MessageThreadFilters;
} = {}) {
  return useQuery({
    queryKey: messageQueryKeys.agent.threads(filters),
    queryFn: () =>
      fetchMessageJson<AgentMessageThreadsResponse>(
        getAgentMessageThreadsApiHref(filters),
      ),
    enabled,
    initialData,
    staleTime: LIFECYCLE_STALE_TIME_MS,
    refetchOnWindowFocus: true,
    refetchInterval: THREAD_LIST_REFETCH_INTERVAL_MS,
  });
}

export function useWriterMessageThread({
  projectId,
  threadId,
  enabled = true,
  initialData,
}: QueryHookOptions<WriterThreadDetailResponse> & {
  projectId: string;
  threadId: string;
}) {
  return useQuery({
    queryKey: messageQueryKeys.writer.detail(projectId, threadId),
    queryFn: () =>
      fetchMessageJson<WriterThreadDetailResponse>(
        getWriterMessageThreadApiHref(projectId, threadId),
      ),
    enabled: enabled && Boolean(projectId && threadId),
    initialData,
    staleTime: LIFECYCLE_STALE_TIME_MS,
    refetchOnWindowFocus: true,
  });
}

export function useAgentMessageThread({
  threadId,
  enabled = true,
  initialData,
}: QueryHookOptions<AgentThreadDetailResponse> & { threadId: string }) {
  return useQuery({
    queryKey: messageQueryKeys.agent.detail(threadId),
    queryFn: () =>
      fetchMessageJson<AgentThreadDetailResponse>(
        getAgentMessageThreadApiHref(threadId),
      ),
    enabled: enabled && Boolean(threadId),
    initialData,
    staleTime: LIFECYCLE_STALE_TIME_MS,
    refetchOnWindowFocus: true,
  });
}

export function useWriterThreadMessages({
  projectId,
  threadId,
  before = null,
  limit = 50,
  enabled = true,
  initialData,
}: QueryHookOptions<WriterThreadMessagesResponse> & {
  projectId: string;
  threadId: string;
  before?: string | null;
  limit?: number;
}) {
  return useQuery({
    queryKey: messageQueryKeys.writer.messages(
      projectId,
      threadId,
      before,
      limit,
    ),
    queryFn: () =>
      fetchMessageJson<WriterThreadMessagesResponse>(
        getWriterThreadMessagesApiHref({
          projectId,
          threadId,
          before,
          limit,
        }),
      ),
    enabled: enabled && Boolean(projectId && threadId),
    initialData,
    staleTime: LIFECYCLE_STALE_TIME_MS,
    refetchOnWindowFocus: true,
  });
}

export function useAgentThreadMessages({
  threadId,
  before = null,
  limit = 50,
  enabled = true,
  initialData,
}: QueryHookOptions<AgentThreadMessagesResponse> & {
  threadId: string;
  before?: string | null;
  limit?: number;
}) {
  return useQuery({
    queryKey: messageQueryKeys.agent.messages(threadId, before, limit),
    queryFn: () =>
      fetchMessageJson<AgentThreadMessagesResponse>(
        getAgentThreadMessagesApiHref({ threadId, before, limit }),
      ),
    enabled: enabled && Boolean(threadId),
    initialData,
    staleTime: LIFECYCLE_STALE_TIME_MS,
    refetchOnWindowFocus: true,
  });
}

export function useWriterQueryTimeline({
  projectId,
  threadId,
  enabled = true,
  initialData,
}: QueryHookOptions<QueryTimelineResponse> & {
  projectId: string;
  threadId: string;
}) {
  return useQuery({
    queryKey: messageQueryKeys.writer.timeline(projectId, threadId),
    queryFn: () =>
      fetchMessageJson<QueryTimelineResponse>(
        getWriterQueryTimelineApiHref(projectId, threadId),
      ),
    enabled: enabled && Boolean(projectId && threadId),
    initialData,
    staleTime: LIFECYCLE_STALE_TIME_MS,
    refetchOnWindowFocus: true,
  });
}

export function useAgentQueryTimeline({
  threadId,
  enabled = true,
  initialData,
}: QueryHookOptions<QueryTimelineResponse> & { threadId: string }) {
  return useQuery({
    queryKey: messageQueryKeys.agent.timeline(threadId),
    queryFn: () =>
      fetchMessageJson<QueryTimelineResponse>(
        getAgentQueryTimelineApiHref(threadId),
      ),
    enabled: enabled && Boolean(threadId),
    initialData,
    staleTime: LIFECYCLE_STALE_TIME_MS,
    refetchOnWindowFocus: true,
  });
}

export function useWriterAgentActivity({
  projectId,
  threadId,
  window = "90",
  enabled = true,
  initialData,
}: QueryHookOptions<AgentActivityResponse> & {
  projectId: string;
  threadId: string;
  window?: AgentActivityWindow;
}) {
  return useQuery({
    queryKey: messageQueryKeys.writer.agentActivity(
      projectId,
      threadId,
      window,
    ),
    queryFn: () =>
      fetchMessageJson<AgentActivityResponse>(
        getWriterAgentActivityApiHref(projectId, threadId, window),
      ),
    enabled: enabled && Boolean(projectId && threadId),
    initialData,
    staleTime: LIFECYCLE_STALE_TIME_MS,
    refetchOnWindowFocus: true,
  });
}

export function useAgentActivity({
  threadId,
  window = "90",
  enabled = true,
  initialData,
}: QueryHookOptions<AgentActivityResponse> & {
  threadId: string;
  window?: AgentActivityWindow;
}) {
  return useQuery({
    queryKey: messageQueryKeys.agent.activity(threadId, window),
    queryFn: () =>
      fetchMessageJson<AgentActivityResponse>(
        getAgentActivityApiHref(threadId, window),
      ),
    enabled: enabled && Boolean(threadId),
    initialData,
    staleTime: LIFECYCLE_STALE_TIME_MS,
    refetchOnWindowFocus: true,
  });
}

async function invalidateWriterThreadQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  projectId: string,
  threadId: string,
) {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: messageQueryKeys.writer.project(projectId),
    }),
    queryClient.invalidateQueries({
      queryKey: messageQueryKeys.writer.thread(projectId, threadId),
    }),
  ]);
}

async function invalidateAgentThreadQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  threadId: string,
) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: messageQueryKeys.agent.all() }),
    queryClient.invalidateQueries({
      queryKey: messageQueryKeys.agent.thread(threadId),
    }),
  ]);
}

export function useWriterReadStateMutation({
  projectId,
  threadId,
}: {
  projectId: string;
  threadId: string;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ throughMessageId }: { throughMessageId: string }) =>
      fetchMessageJson<MessageReadStateResponse>(
        getWriterReadStateApiHref(threadId),
        jsonRequest("PUT", { projectId, throughMessageId }),
      ),
    onSettled: () =>
      invalidateWriterThreadQueries(queryClient, projectId, threadId),
  });
}

export function useAgentReadStateMutation({ threadId }: { threadId: string }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ throughMessageId }: { throughMessageId: string }) =>
      fetchMessageJson<MessageReadStateResponse>(
        getAgentReadStateApiHref(threadId),
        jsonRequest("PUT", { throughMessageId }),
      ),
    onSettled: () => invalidateAgentThreadQueries(queryClient, threadId),
  });
}

function withClientIdempotencyKey(
  transition: QueryStatusTransitionInput,
): QueryStatusTransitionInput {
  if (transition.idempotencyKey) return transition;

  return {
    ...transition,
    idempotencyKey: globalThis.crypto.randomUUID(),
  };
}

export function useWriterQueryStatusTransition({
  projectId,
  threadId,
}: {
  projectId: string;
  threadId: string;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    retry: false,
    mutationFn: (transition: QueryStatusTransitionInput) =>
      fetchMessageJson<QueryStatusTransitionResponse>(
        getWriterQueryTransitionApiHref(threadId),
        jsonRequest("POST", {
          projectId,
          ...withClientIdempotencyKey(transition),
        }),
      ),
    onError: async (error) => {
      if (error instanceof MessageClientApiError && error.status === 409) {
        await queryClient.refetchQueries({
          queryKey: messageQueryKeys.writer.thread(projectId, threadId),
          type: "active",
        });
      }
    },
    onSettled: () =>
      invalidateWriterThreadQueries(queryClient, projectId, threadId),
  });
}

export function useAgentQueryStatusTransition({
  threadId,
}: {
  threadId: string;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    retry: false,
    mutationFn: (transition: QueryStatusTransitionInput) =>
      fetchMessageJson<QueryStatusTransitionResponse>(
        getAgentQueryTransitionApiHref(threadId),
        jsonRequest("POST", {
          ...withClientIdempotencyKey(transition),
        }),
      ),
    onError: async (error) => {
      if (error instanceof MessageClientApiError && error.status === 409) {
        await queryClient.refetchQueries({
          queryKey: messageQueryKeys.agent.thread(threadId),
          type: "active",
        });
      }
    },
    onSettled: () => invalidateAgentThreadQueries(queryClient, threadId),
  });
}

export function useCreateWriterMessageThread(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { agentId: string; subject: string; body: string }) =>
      fetchMessageJson<WriterCreateThreadResponse>(
        "/api/message-threads",
        jsonRequest("POST", { projectId, ...input }),
      ),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: messageQueryKeys.writer.project(projectId),
      }),
  });
}

export function useWriterReplyMutation({
  projectId,
  threadId,
}: {
  projectId: string;
  threadId: string;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ body }: { body: string }) =>
      fetchMessageJson<WriterReplyResponse>(
        getWriterThreadMessagesApiHref({ projectId, threadId }),
        jsonRequest("POST", { projectId, body }),
      ),
    onSettled: () =>
      invalidateWriterThreadQueries(queryClient, projectId, threadId),
  });
}

export function useAgentReplyMutation({ threadId }: { threadId: string }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ body }: { body: string }) =>
      fetchMessageJson<AgentReplyResponse>(
        getAgentThreadMessagesApiHref({ threadId }),
        jsonRequest("POST", { body }),
      ),
    onSettled: () => invalidateAgentThreadQueries(queryClient, threadId),
  });
}
