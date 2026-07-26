import { getProjectRouteId } from "@/app/utils/project-profile";
import type {
  AgentActivityWindow,
  MessageThreadFilters,
} from "@/app/utils/message-types";

function appendSearchParams(
  pathname: string,
  params: Record<string, string | null | undefined>,
) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) searchParams.set(key, value);
  }

  const query = searchParams.toString();
  return query ? `${pathname}?${query}` : pathname;
}

function getThreadApiPath(prefix: string, threadId: string, suffix = "") {
  return `${prefix}/${encodeURIComponent(threadId)}${suffix}`;
}

export function getProjectMessagesHref(
  projectName: string,
  writerProjectId?: string | null,
) {
  const routeProjectId =
    writerProjectId?.trim() || getProjectRouteId(projectName);

  return `/messages/${encodeURIComponent(routeProjectId)}`;
}

export function getProjectMessageThreadHref(
  routeProjectId: string,
  threadId: string,
) {
  return `/messages/${encodeURIComponent(routeProjectId)}/threads/${encodeURIComponent(
    threadId,
  )}`;
}

export function getAgentMessagesHref() {
  return "/literary-agents/messages";
}

export function getAgentMessageThreadHref(threadId: string) {
  return `/literary-agents/messages/${encodeURIComponent(threadId)}`;
}

export function getWriterMessageThreadsApiHref(
  projectId: string,
  filters: MessageThreadFilters = {},
) {
  return appendSearchParams("/api/message-threads", {
    projectId,
    queryStatus: filters.queryStatus,
    terminal:
      typeof filters.terminal === "boolean" ? String(filters.terminal) : null,
  });
}

export function getWriterMessageThreadApiHref(
  projectId: string,
  threadId: string,
) {
  return appendSearchParams(
    getThreadApiPath("/api/message-threads", threadId),
    {
      projectId,
    },
  );
}

export function getWriterThreadMessagesApiHref({
  before,
  limit,
  projectId,
  threadId,
}: {
  before?: string | null;
  limit?: number | null;
  projectId: string;
  threadId: string;
}) {
  return appendSearchParams(
    getThreadApiPath("/api/message-threads", threadId, "/messages"),
    {
      projectId,
      before,
      limit: typeof limit === "number" ? String(limit) : null,
    },
  );
}

export function getWriterQueryTimelineApiHref(
  projectId: string,
  threadId: string,
) {
  return appendSearchParams(
    getThreadApiPath("/api/message-threads", threadId, "/timeline"),
    { projectId },
  );
}

export function getWriterAgentActivityApiHref(
  projectId: string,
  threadId: string,
  window: AgentActivityWindow,
) {
  return appendSearchParams(
    getThreadApiPath("/api/message-threads", threadId, "/agent-activity"),
    { projectId, window },
  );
}

export function getWriterReadStateApiHref(threadId: string) {
  return getThreadApiPath("/api/message-threads", threadId, "/read-state");
}

export function getAgentMessageThreadsApiHref(
  filters: MessageThreadFilters = {},
) {
  return appendSearchParams("/api/agent-message-threads", {
    queryStatus: filters.queryStatus,
    terminal:
      typeof filters.terminal === "boolean" ? String(filters.terminal) : null,
  });
}

export function getAgentMessageThreadApiHref(threadId: string) {
  return getThreadApiPath("/api/agent-message-threads", threadId);
}

export function getAgentThreadMessagesApiHref({
  before,
  limit,
  threadId,
}: {
  before?: string | null;
  limit?: number | null;
  threadId: string;
}) {
  return appendSearchParams(
    getThreadApiPath("/api/agent-message-threads", threadId, "/messages"),
    {
      before,
      limit: typeof limit === "number" ? String(limit) : null,
    },
  );
}

export function getAgentQueryTimelineApiHref(threadId: string) {
  return getThreadApiPath("/api/agent-message-threads", threadId, "/timeline");
}

export function getAgentActivityApiHref(
  threadId: string,
  window: AgentActivityWindow,
) {
  return appendSearchParams(
    getThreadApiPath("/api/agent-message-threads", threadId, "/agent-activity"),
    { window },
  );
}

export function getAgentReadStateApiHref(threadId: string) {
  return getThreadApiPath(
    "/api/agent-message-threads",
    threadId,
    "/read-state",
  );
}

export function getAgentQueryTransitionApiHref(threadId: string) {
  return getThreadApiPath(
    "/api/agent-message-threads",
    threadId,
    "/query-status-transitions",
  );
}
