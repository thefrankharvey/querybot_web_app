"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { Blips, FeedItem, FlattenedSlushFeed } from "../types";
import { formatDisplayString, urlFormatter } from "../utils";

const LIMIT = 10;

const formatBlips = (blip: Blips): Blips => {
  return {
    ...blip,
    extra_interest: blip.extra_interest
      ? formatDisplayString(blip.extra_interest)
      : undefined,
    website: blip.website ? urlFormatter(blip.website) || "" : "",
  };
};

const formatFeedItem = (item: FeedItem): FeedItem => {
  if (item.type === "new_opening" || item.type === "agent_activity") {
    return {
      ...item,
      data: formatBlips(item.data),
    };
  }
  return item;
};

const fetchDispatchFeed = async (
  offset: number
): Promise<FlattenedSlushFeed> => {
  console.log(`[Dispatch] Fetching offset: ${offset}`);

  const res = await fetch(
    `/api/dispatch-feed?limit=${LIMIT}&offset=${offset}`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch dispatch feed");
  }

  const raw: FeedItem[] = await res.json();
  const formatted = raw.map(formatFeedItem);

  return formatted;
};

export const useDispatchFeed = (initialData?: FlattenedSlushFeed) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["dispatchFeed"],
    queryFn: ({ pageParam }) => fetchDispatchFeed(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const hasMoreData = lastPage.length > 0;
      const nextOffset = hasMoreData ? allPages.length * LIMIT : undefined;
      return nextOffset;
    },
    initialData: initialData
      ? {
          pages: [initialData],
          pageParams: [0],
        }
      : undefined,
    enabled: !initialData, // prevent duplicate first fetch when SSR data is provided
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
  });

  // Flatten all pages into a single array
  const flattenedData: FlattenedSlushFeed =
    data?.pages.reduce((acc, page) => [...acc, ...page], [] as FeedItem[]) ??
    [];

  return {
    data: flattenedData,
    isLoading,
    isFetchingMore: isFetchingNextPage,
    hasMore: hasNextPage ?? false,
    isError,
    fetchMore: fetchNextPage,
  };
};
