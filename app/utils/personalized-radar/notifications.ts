import type { RadarEventType } from "@/app/utils/personalized-radar/contracts";

export type UserNotificationKind = "agent_watch_event" | "query_reminder_due";

export type UserNotificationRow = {
  id: string;
  kind: UserNotificationKind;
  source_event_id: string;
  watch_id: string | null;
  query_reminder_id: string | null;
  agent_profile_id: string | null;
  index_id: string | null;
  event_type: RadarEventType | null;
  occurred_at: string;
  title: string;
  summary: string;
  target_href: string;
  read_at: string | null;
  archived_at: string | null;
  created_at: string;
};

export type UserNotification = {
  id: string;
  kind: UserNotificationKind;
  sourceEventId: string;
  watchId: string | null;
  queryReminderId: string | null;
  agentProfileId: string | null;
  indexId: string | null;
  eventType: RadarEventType | null;
  occurredAt: string;
  title: string;
  summary: string;
  targetHref: string;
  readAt: string | null;
  createdAt: string;
};

export function normalizeUserNotification(
  row: UserNotificationRow,
): UserNotification {
  return {
    id: row.id,
    kind: row.kind,
    sourceEventId: row.source_event_id,
    watchId: row.watch_id,
    queryReminderId: row.query_reminder_id,
    agentProfileId: row.agent_profile_id,
    indexId: row.index_id,
    eventType: row.event_type,
    occurredAt: row.occurred_at,
    title: row.title,
    summary: row.summary,
    targetHref: row.target_href,
    readAt: row.read_at,
    createdAt: row.created_at,
  };
}

export type WatchNotificationInsert = {
  user_id: string;
  kind: "agent_watch_event";
  source_event_id: string;
  watch_id: string;
  query_reminder_id: null;
  agent_profile_id: string | null;
  index_id: string | null;
  event_type: RadarEventType;
  occurred_at: string;
  title: string;
  summary: string;
  target_href: string;
};

