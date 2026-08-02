import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import type { FeedItem, SlushFeed } from "@/app/types";
import { flattenAndSortFeed } from "@/app/utils/dispatch-utils";
import {
  decodeWatchedDispatchCursor,
  encodeWatchedDispatchCursor,
} from "@/app/utils/personalized-radar/dispatch-cursor";
import { getRadarWatchCapabilitiesForUser } from "@/app/utils/personalized-radar/entitlements.server";
import { getRadarFeatureFlags } from "@/app/utils/personalized-radar/feature-flags.server";
import { listOwnedAgentWatches } from "@/app/utils/personalized-radar/repository.server";
import {
  RADAR_EVENT_TYPES,
  type AgentChangeEventPage,
  type RadarEventType,
} from "@/app/utils/personalized-radar/contracts";
import {
  AgentChangeSourceContractError,
  parseAgentChangeEventPage,
  watchMatchesAgentChangeEvent,
} from "@/app/utils/personalized-radar/source-events";
import { getWqhApiUrl } from "@/lib/config";

export const dynamic = "force-dynamic";

const NO_STORE_HEADERS = { "Cache-Control": "private, no-store" } as const;
const MAX_WATCHED_SCAN_PAGES = 8;

type DispatchScope = "all" | "all_agents" | "community" | "watched";
type DispatchPage = {
  items: FeedItem[];
  nextCursor: string | null;
  hasMore: boolean;
  scannedPages: number;
};

function response(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: NO_STORE_HEADERS });
}

function parseBoundedInteger(value: string | null, fallback: number) {
  if (value === null) return fallback;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= 50
    ? parsed
    : null;
}

function parseScope(value: string | null): DispatchScope | null {
  const scope = value?.trim() || "all";
  return ["all", "all_agents", "community", "watched"].includes(scope)
    ? (scope as DispatchScope)
    : null;
}

async function fetchLegacyPage(
  limit: number,
  offset: number,
  signal: AbortSignal,
): Promise<FeedItem[]> {
  const url = new URL(`${getWqhApiUrl().replace(/\/$/, "")}/recent-activity`);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("offset", String(offset));
  const external = await fetch(url, {
    headers: { Accept: "application/json" },
    signal,
    cache: "no-store",
  });
  if (!external.ok) throw new Error("Recent activity service failed");
  return flattenAndSortFeed((await external.json()) as SlushFeed);
}

async function fetchEventPage(
  limit: number,
  cursor: string | null,
  signal: AbortSignal,
): Promise<AgentChangeEventPage> {
  const url = new URL(`${getWqhApiUrl().replace(/\/$/, "")}/recent-activity`);
  url.searchParams.set("contract", "agent-change-v1");
  url.searchParams.set("order", "desc");
  url.searchParams.set("limit", String(limit));
  if (cursor) url.searchParams.set("cursor", cursor);
  const external = await fetch(url, {
    headers: { Accept: "application/json" },
    signal,
    cache: "no-store",
  });
  if (!external.ok) throw new Error("Canonical activity service failed");
  return parseAgentChangeEventPage(await external.json());
}

async function getWatchedDispatchPage(input: {
  userId: string;
  cursor: string | null;
  eventType: RadarEventType | null;
  limit: number;
  signal: AbortSignal;
}): Promise<DispatchPage> {
  if (!getRadarFeatureFlags().targetedDispatch) {
    throw new AgentChangeSourceContractError("Targeted Dispatch is disabled");
  }
  const capabilitiesPromise = getRadarWatchCapabilitiesForUser(input.userId);
  const watchesPromise = listOwnedAgentWatches(input.userId, "all");
  const [capabilities, allWatches] = await Promise.all([
    capabilitiesPromise,
    watchesPromise,
  ]);
  const watches = allWatches.filter(
    (watch) =>
      !input.eventType ||
      (watch.eventTypes.includes(input.eventType) &&
        capabilities.allowedEventTypes.includes(input.eventType)),
  );
  if (!watches.length) {
    return { items: [], nextCursor: null, hasMore: false, scannedPages: 0 };
  }

  const cutoff = Date.now() - capabilities.targetedHistoryDays * 86_400_000;
  let position = decodeWatchedDispatchCursor(input.cursor);
  const items: FeedItem[] = [];
  let scannedPages = 0;
  let hasMore = true;

  while (items.length < input.limit && hasMore && scannedPages < MAX_WATCHED_SCAN_PAGES) {
    const pageStartCursor = position.sourceCursor;
    const page = await fetchEventPage(input.limit, pageStartCursor, input.signal);
    scannedPages += 1;
    let index = position.eventOffset;
    position = { sourceCursor: page.next_cursor, eventOffset: 0 };

    for (; index < page.events.length; index += 1) {
      const event = page.events[index];
      if (Date.parse(event.recorded_at) < cutoff) {
        return { items, nextCursor: null, hasMore: false, scannedPages };
      }
      const matches =
        (!input.eventType || event.event_type === input.eventType) &&
        capabilities.allowedEventTypes.includes(event.event_type) &&
        watches.some((watch) => watchMatchesAgentChangeEvent(watch, event));
      if (matches) items.push({ type: "agent_event", data: event });

      if (items.length === input.limit) {
        const stillInPage = index + 1 < page.events.length;
        const nextPosition = stillInPage
          ? { sourceCursor: pageStartCursor, eventOffset: index + 1 }
          : { sourceCursor: page.next_cursor, eventOffset: 0 };
        return {
          items,
          nextCursor:
            stillInPage || page.has_more
              ? encodeWatchedDispatchCursor(nextPosition)
              : null,
          hasMore: stillInPage || page.has_more,
          scannedPages,
        };
      }
    }
    hasMore = page.has_more;
    if (!page.next_cursor && page.has_more) {
      throw new AgentChangeSourceContractError("Source cursor is missing");
    }
  }

  const canContinue = hasMore && Boolean(position.sourceCursor);
  return {
    items,
    nextCursor: canContinue ? encodeWatchedDispatchCursor(position) : null,
    hasMore: canContinue,
    scannedPages,
  };
}

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return response({ error: "Unauthorized" }, 401);

  const { searchParams } = new URL(request.url);
  const limit = parseBoundedInteger(searchParams.get("limit"), 10);
  const scope = parseScope(searchParams.get("scope"));
  if (!limit || !scope) return response({ error: "Invalid Dispatch request" }, 400);

  const rawEventType = searchParams.get("eventType")?.trim() || null;
  const eventType = rawEventType as RadarEventType | null;
  if (eventType && !RADAR_EVENT_TYPES.includes(eventType)) {
    return response({ error: "Unsupported event type" }, 400);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15_000);
  try {
    if (scope === "watched") {
      return response(
        await getWatchedDispatchPage({
          userId,
          cursor: searchParams.get("cursor"),
          eventType,
          limit,
          signal: controller.signal,
        }),
      );
    }

    const rawOffset = Number(searchParams.get("cursor") ?? "0");
    const offset = Number.isInteger(rawOffset) && rawOffset >= 0 ? rawOffset : null;
    if (offset === null) return response({ error: "Invalid Dispatch cursor" }, 400);
    const rawItems = await fetchLegacyPage(limit, offset, controller.signal);
    const items = rawItems.filter((item) => {
      if (scope === "all_agents") {
        return item.type === "new_opening" || item.type === "agent_activity";
      }
      if (scope === "community") {
        return item.type === "reddit" || item.type === "bluesky";
      }
      return true;
    });
    return response({
      items,
      nextCursor: rawItems.length ? String(offset + limit) : null,
      hasMore: rawItems.length > 0,
      scannedPages: 1,
    } satisfies DispatchPage);
  } catch (error) {
    const message =
      error instanceof AgentChangeSourceContractError
        ? error.message
        : "Dispatch is temporarily unavailable";
    return response({ error: message }, error instanceof AgentChangeSourceContractError ? 400 : 503);
  } finally {
    clearTimeout(timeoutId);
  }
}
