"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

import type { FeedItem, FlattenedSlushFeed } from "@/app/types";
import { formatFeedItem } from "@/app/utils/dispatch-utils";
import type { RadarEventType } from "@/app/utils/personalized-radar/contracts";

const LIMIT = 10;

export type DispatchScope = "all" | "all_agents" | "community" | "watched";

type DispatchPage = {
  items: FeedItem[];
  nextCursor: string | null;
  hasMore: boolean;
  scannedPages: number;
};

export const dispatchFeedKeys = {
  all: ["dispatch-feed"] as const,
  list: (scope: DispatchScope, eventType: RadarEventType | null) =>
    [...dispatchFeedKeys.all, scope, eventType] as const,
};

async function fetchDispatchFeed(input: {
  cursor: string | null;
  eventType: RadarEventType | null;
  scope: DispatchScope;
}): Promise<DispatchPage> {
  const params = new URLSearchParams({ scope: input.scope, limit: String(LIMIT) });
  if (input.cursor) params.set("cursor", input.cursor);
  if (input.eventType) params.set("eventType", input.eventType);
  const response = await fetch(`/api/dispatch-feed?${params}`, { cache: "no-store" });
  const payload = (await response.json().catch(() => null)) as
    | (DispatchPage & { error?: string })
    | null;
  if (!response.ok || !payload) {
    throw new Error(payload?.error ?? "Dispatch could not be loaded");
  }
  return {
    ...payload,
    items: payload.items.map(formatFeedItem),
  };
}
export function useDispatchFeed(
  initialData: FlattenedSlushFeed | undefined,
  options: { scope: DispatchScope; eventType?: RadarEventType | null },
) {
  const eventType = options.eventType ?? null;
  const query = useInfiniteQuery({
    queryKey: dispatchFeedKeys.list(options.scope, eventType),
    queryFn: ({ pageParam }) =>
      fetchDispatchFeed({ cursor: pageParam, eventType, scope: options.scope }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    initialData:
      initialData && options.scope === "all"
        ? {
            pages: [
              {
                items: initialData,
                nextCursor: initialData.length ? String(LIMIT) : null,
                hasMore: initialData.length > 0,
                scannedPages: 1,
              },
            ],
            pageParams: [null],
          }
        : undefined,
    refetchOnWindowFocus: false,
    staleTime: 30_000,
  });

  return {
    data: query.data?.pages.flatMap((page) => page.items) ?? [],
    error: query.error,
    fetchMore: query.fetchNextPage,
    hasMore: query.hasNextPage ?? false,
    isError: query.isError,
    isFetchingMore: query.isFetchingNextPage,
    isLoading: query.isLoading,
  };
}
