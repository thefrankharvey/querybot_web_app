import type { WriterMessageThread } from "@/app/utils/message-types";

import type { KanbanCardData } from "./components/kanban-card";
import type { QueryDashColumnId } from "./components/kanban-config";

export function getLiveQueryDashboardColumn(
  thread: WriterMessageThread,
  fallback: QueryDashColumnId,
): QueryDashColumnId {
  switch (thread.queryProgress?.currentCode) {
    case "query_sent":
    case "query_viewed":
      return "submitted-query";
    case "manuscript_requested":
    case "manuscript_under_review":
      return "pages-requested";
    case "rejected":
      return "rejected";
    case "closed_no_response":
      return "closed-no-response";
    case "offer_of_representation":
      return "offer-made";
    default:
      return fallback;
  }
}

export function applyLiveQueryThreadToCard(
  card: KanbanCardData,
  thread: WriterMessageThread | null,
): KanbanCardData {
  if (!thread?.queryProgress) {
    return {
      ...card,
      trackingMode: "manual",
      messageThreadId: null,
      queryProgress: null,
    };
  }

  return {
    ...card,
    trackingMode: "live",
    messageThreadId: thread.threadId,
    queryProgress: thread.queryProgress,
    columnId: getLiveQueryDashboardColumn(
      thread,
      card.columnId as QueryDashColumnId,
    ),
    query_sent_date: thread.queryProgress.sentAt,
    pages_requested_date:
      thread.queryProgress.currentCode === "manuscript_requested"
        ? thread.queryProgress.changedAt
        : null,
    rejected_date:
      thread.queryProgress.currentCode === "rejected"
        ? thread.queryProgress.changedAt
        : null,
    offer_date:
      thread.queryProgress.currentCode === "offer_of_representation"
        ? thread.queryProgress.changedAt
        : null,
    updated_date: thread.queryProgress.changedAt,
  };
}
