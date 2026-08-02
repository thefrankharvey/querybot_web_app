import "server-only";

import { createHash, randomUUID } from "node:crypto";

import { createServerSupabase } from "@/app/api/supabase/server";
import { getRadarWatchCapabilitiesForUser } from "@/app/utils/personalized-radar/entitlements.server";
import {
  normalizeAgentWatch,
  type AgentChangeEvent,
  type AgentWatch,
  type AgentWatchRow,
  type RadarWatchCapabilities,
} from "@/app/utils/personalized-radar/contracts";
import {
  type WatchNotificationInsert,
} from "@/app/utils/personalized-radar/notifications";
import {
  getAgentChangeEventTargetHref,
  parseAgentChangeEvent,
  watchMatchesAgentChangeEvent,
} from "@/app/utils/personalized-radar/source-events";
import { getWqhApiUrl } from "@/lib/config";

const PROCESSOR_NAME = "agent-change-v1-fanout";
const SOURCE_PAGE_LIMIT = 100;
const MAX_PAGES_PER_RUN = 8;
const OVERLAP_MS = 5 * 60 * 1_000;
const FIRST_RUN_LOOKBACK_MS = 24 * 60 * 60 * 1_000;
const LEASE_SECONDS = 300;

type ProcessorStateRow = {
  processor_name: string;
  source_cursor: string | null;
  last_recorded_at: string | null;
  lease_token: string | null;
};

type SourcePageEnvelope = {
  schemaVersion: string;
  events: unknown[];
  nextCursor: string | null;
  hasMore: boolean;
};

export type RadarProcessorSummary = {
  read: number;
  eligible: number;
  inserted: number;
  duplicate: number;
  invalid: number;
  unmatched: number;
  failed: number;
  pages: number;
  leaseAcquired: boolean;
};

export class RadarProcessorError extends Error {
  readonly status = 500;
  readonly code = "RADAR_PROCESSOR_FAILED";
}

function notificationSnapshot(event: AgentChangeEvent) {
  const title = event.agent.name
    ? `${event.agent.name}: ${event.headline}`
    : event.headline;
  const summary = event.agent.agency_name
    ? `${event.agent.agency_name} — ${event.summary}`
    : event.summary;
  return {
    title: title.slice(0, 200),
    summary: summary.slice(0, 500),
  };
}

function parseSourcePageEnvelope(value: unknown): SourcePageEnvelope {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new RadarProcessorError("Invalid source page");
  }
  const page = value as Record<string, unknown>;
  if (
    typeof page.schema_version !== "string" ||
    !Array.isArray(page.events) ||
    typeof page.has_more !== "boolean" ||
    (page.next_cursor !== null && typeof page.next_cursor !== "string")
  ) {
    throw new RadarProcessorError("Invalid source page");
  }
  return {
    schemaVersion: page.schema_version,
    events: page.events,
    nextCursor: page.next_cursor as string | null,
    hasMore: page.has_more,
  };
}

async function fetchSourcePage(input: {
  recordedAfter?: string;
  cursor?: string;
}): Promise<SourcePageEnvelope> {
  const url = new URL(`${getWqhApiUrl().replace(/\/$/, "")}/recent-activity`);
  url.searchParams.set("contract", "agent-change-v1");
  url.searchParams.set("order", "asc");
  url.searchParams.set("limit", String(SOURCE_PAGE_LIMIT));
  if (input.cursor) url.searchParams.set("cursor", input.cursor);
  if (input.recordedAfter) url.searchParams.set("recorded_after", input.recordedAfter);

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new RadarProcessorError("Source service failed");
  return parseSourcePageEnvelope(await response.json());
}

function getRawString(value: unknown, key: string): string | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const candidate = (value as Record<string, unknown>)[key];
  return typeof candidate === "string" ? candidate : null;
}

async function quarantineInvalidEvent(raw: unknown, error: unknown) {
  const serialized = JSON.stringify(raw);
  const fingerprint = createHash("sha256").update(serialized).digest("hex");
  const supabase = createServerSupabase();
  const { error: quarantineError } = await supabase.rpc("quarantine_radar_event", {
    p_source_event_id: getRawString(raw, "event_id"),
    p_schema_version: getRawString(raw, "schema_version"),
    p_error_code:
      error instanceof Error ? error.constructor.name : "UNKNOWN_CONTRACT_ERROR",
    p_payload_fingerprint: fingerprint,
  });
  if (quarantineError) {
    throw new RadarProcessorError("Event quarantine failed");
  }
}

export function prepareWatchNotifications(input: {
  events: readonly AgentChangeEvent[];
  watches: readonly AgentWatch[];
  capabilitiesByUser: ReadonlyMap<string, RadarWatchCapabilities>;
  disabledPreferenceUserIds: ReadonlySet<string>;
  watchOwnerById: ReadonlyMap<string, string>;
}): { notifications: WatchNotificationInsert[]; unmatched: number } {
  const notifications: WatchNotificationInsert[] = [];
  const dedupe = new Set<string>();
  let unmatched = 0;

  for (const event of input.events) {
    let eventMatched = false;
    for (const watch of input.watches) {
      if (!watchMatchesAgentChangeEvent(watch, event)) continue;
      const userId = input.watchOwnerById.get(watch.id);
      if (!userId || input.disabledPreferenceUserIds.has(userId)) continue;
      const capabilities = input.capabilitiesByUser.get(userId);
      if (!capabilities?.allowedEventTypes.includes(event.event_type)) continue;

      const dedupeKey = `${userId}:${event.event_id}`;
      if (dedupe.has(dedupeKey)) continue;
      dedupe.add(dedupeKey);
      eventMatched = true;
      const snapshot = notificationSnapshot(event);
      notifications.push({
        user_id: userId,
        kind: "agent_watch_event",
        source_event_id: event.event_id,
        watch_id: watch.id,
        query_reminder_id: null,
        agent_profile_id: event.agent.profile_id,
        index_id: event.agent.index_id,
        event_type: event.event_type,
        occurred_at: event.occurred_at,
        title: snapshot.title,
        summary: snapshot.summary,
        target_href: getAgentChangeEventTargetHref(event.event_id),
      });
    }
    if (!eventMatched) unmatched += 1;
  }
  return { notifications, unmatched };
}

async function findMatchingWatches(events: readonly AgentChangeEvent[]): Promise<{
  watches: AgentWatch[];
  ownerByWatchId: Map<string, string>;
}> {
  const profileIds = Array.from(
    new Set(events.flatMap((event) => event.agent.profile_id ? [event.agent.profile_id] : [])),
  );
  const indexIds = Array.from(
    new Set(events.flatMap((event) => event.agent.index_id ? [event.agent.index_id] : [])),
  );
  const supabase = createServerSupabase();
  const queries = [
    ...(profileIds.length
      ? [
          supabase
            .from("agent_watches")
            .select("*")
            .eq("status", "active")
            .eq("in_app_enabled", true)
            .in("agent_profile_id", profileIds),
        ]
      : []),
    ...(indexIds.length
      ? [
          supabase
            .from("agent_watches")
            .select("*")
            .eq("status", "active")
            .eq("in_app_enabled", true)
            .in("index_id", indexIds),
        ]
      : []),
  ];
  const results = await Promise.all(queries);
  if (results.some((result) => result.error)) {
    throw new RadarProcessorError("Watch lookup failed");
  }
  const rowsById = new Map<string, AgentWatchRow>();
  for (const result of results) {
    for (const row of (result.data ?? []) as AgentWatchRow[]) rowsById.set(row.id, row);
  }
  return {
    watches: Array.from(rowsById.values(), normalizeAgentWatch),
    ownerByWatchId: new Map(
      Array.from(rowsById.values(), (row) => [row.id, row.user_id]),
    ),
  };
}

async function getDeliveryControls(
  userIds: readonly string[],
): Promise<{
  capabilitiesByUser: Map<string, RadarWatchCapabilities>;
  disabledPreferenceUserIds: Set<string>;
}> {
  const capabilities = await Promise.all(
    userIds.map(async (userId) => [userId, await getRadarWatchCapabilitiesForUser(userId)] as const),
  );
  const disabledPreferenceUserIds = new Set<string>();
  if (userIds.length) {
    const supabase = createServerSupabase();
    const { data, error } = await supabase
      .from("user_notification_preferences")
      .select("user_id,watch_in_app_enabled")
      .in("user_id", [...userIds]);
    if (error) throw new RadarProcessorError("Preference lookup failed");
    for (const row of data ?? []) {
      if (row.watch_in_app_enabled === false) disabledPreferenceUserIds.add(String(row.user_id));
    }
  }
  return {
    capabilitiesByUser: new Map(capabilities),
    disabledPreferenceUserIds,
  };
}

function latestRecordedAt(
  rawEvents: readonly unknown[],
  fallback: string,
  maximum: Date,
) {
  let latest = Date.parse(fallback);
  const maximumTimestamp = maximum.getTime() + 5 * 60 * 1_000;
  for (const raw of rawEvents) {
    const value = getRawString(raw, "recorded_at");
    const timestamp = value ? Date.parse(value) : Number.NaN;
    if (!Number.isNaN(timestamp) && timestamp <= maximumTimestamp) {
      latest = Math.max(latest, timestamp);
    }
  }
  return new Date(latest).toISOString();
}

export async function runRadarEventProcessor(
  now: Date = new Date(),
): Promise<RadarProcessorSummary> {
  const supabase = createServerSupabase();
  const leaseToken = randomUUID();
  const { data: claimed, error: claimError } = await supabase.rpc(
    "claim_radar_processor_lease",
    {
      p_processor_name: PROCESSOR_NAME,
      p_lease_token: leaseToken,
      p_lease_seconds: LEASE_SECONDS,
    },
  );
  if (claimError) throw new RadarProcessorError("Processor lease failed");
  const state = (Array.isArray(claimed) ? claimed[0] : claimed) as ProcessorStateRow | null;
  if (!state) {
    return {
      read: 0,
      eligible: 0,
      inserted: 0,
      duplicate: 0,
      invalid: 0,
      unmatched: 0,
      failed: 0,
      pages: 0,
      leaseAcquired: false,
    };
  }

  const summary: RadarProcessorSummary = {
    read: 0,
    eligible: 0,
    inserted: 0,
    duplicate: 0,
    invalid: 0,
    unmatched: 0,
    failed: 0,
    pages: 0,
    leaseAcquired: true,
  };
  const startingPoint = state.last_recorded_at
    ? new Date(Date.parse(state.last_recorded_at) - OVERLAP_MS)
    : new Date(now.getTime() - FIRST_RUN_LOOKBACK_MS);
  let recordedAfter: string | undefined = startingPoint.toISOString();
  let cursor: string | undefined;
  let lastRecordedAt = startingPoint.toISOString();

  try {
    while (summary.pages < MAX_PAGES_PER_RUN) {
      const page = await fetchSourcePage({ recordedAfter, cursor });
      if (page.schemaVersion !== "agent-change-v1") {
        throw new RadarProcessorError("Unsupported source schema");
      }
      summary.pages += 1;
      summary.read += page.events.length;
      lastRecordedAt = latestRecordedAt(page.events, lastRecordedAt, now);

      const validEvents: AgentChangeEvent[] = [];
      for (const raw of page.events) {
        try {
          validEvents.push(parseAgentChangeEvent(raw));
        } catch (error) {
          summary.invalid += 1;
          await quarantineInvalidEvent(raw, error);
        }
      }

      if (validEvents.length) {
        const { watches, ownerByWatchId } = await findMatchingWatches(validEvents);
        const userIds = Array.from(new Set(ownerByWatchId.values()));
        const controls = await getDeliveryControls(userIds);
        const prepared = prepareWatchNotifications({
          events: validEvents,
          watches,
          capabilitiesByUser: controls.capabilitiesByUser,
          disabledPreferenceUserIds: controls.disabledPreferenceUserIds,
          watchOwnerById: ownerByWatchId,
        });
        summary.eligible += prepared.notifications.length;
        summary.unmatched += prepared.unmatched;

        if (prepared.notifications.length) {
          const { data, error } = await supabase
            .from("user_notifications")
            .upsert(prepared.notifications, {
              onConflict: "user_id,kind,source_event_id",
              ignoreDuplicates: true,
            })
            .select("id");
          if (error) throw new RadarProcessorError("Notification insert failed");
          const inserted = data?.length ?? 0;
          summary.inserted += inserted;
          summary.duplicate += prepared.notifications.length - inserted;
        }
      }

      cursor = page.nextCursor ?? undefined;
      recordedAfter = undefined;
      if (!page.hasMore) break;
      if (!cursor) throw new RadarProcessorError("Source cursor is missing");
    }

    const { data: completed, error } = await supabase.rpc(
      "complete_radar_processor_run",
      {
        p_processor_name: PROCESSOR_NAME,
        p_lease_token: leaseToken,
        p_source_cursor: cursor ?? null,
        p_last_recorded_at: lastRecordedAt,
      },
    );
    if (error || completed !== true) throw new RadarProcessorError("Processor lease was lost");
    return summary;
  } catch (error) {
    summary.failed += 1;
    await supabase.rpc("fail_radar_processor_run", {
      p_processor_name: PROCESSOR_NAME,
      p_lease_token: leaseToken,
      p_error_code: error instanceof Error ? error.constructor.name : "UNKNOWN_ERROR",
    });
    throw error;
  }
}
