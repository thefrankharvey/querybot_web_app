"use client";

import type {
  RadarEventType,
  RadarOriginSurface,
} from "@/app/utils/personalized-radar/contracts";

export const RADAR_ANALYTICS_EVENTS = [
  "agent_watch_created",
  "agent_watch_updated",
  "agent_watch_muted",
  "agent_watch_deleted",
  "watched_dispatch_viewed",
  "watched_event_opened",
  "notification_center_opened",
  "notification_marked_read",
  "notification_archived",
] as const;

export type RadarAnalyticsEvent = (typeof RADAR_ANALYTICS_EVENTS)[number];

export type RadarAnalyticsProperties = {
  eventCategory?: RadarEventType;
  originSurface?: RadarOriginSurface;
  watchCountBucket?: "0" | "1_5" | "6_25" | "26_plus";
  channel?: "in_app" | "email_digest";
  entitlementState?: "free" | "subscribed" | "unknown";
  notificationAgeBucket?: "under_hour" | "same_day" | "older";
};

type RadarAnalyticsSink = (
  event: RadarAnalyticsEvent,
  properties: RadarAnalyticsProperties,
) => void;

let analyticsSink: RadarAnalyticsSink | null = null;

export function configureRadarAnalytics(sink: RadarAnalyticsSink | null) {
  analyticsSink = sink;
}

export function captureRadarEvent(
  event: RadarAnalyticsEvent,
  properties: RadarAnalyticsProperties = {},
) {
  analyticsSink?.(event, properties);
}

