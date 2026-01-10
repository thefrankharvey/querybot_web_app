"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { Blips, FeedItem, FlattenedSlushFeed } from "../types";
import { formatDisplayString, urlFormatter } from "../utils";
import { useMemo } from "react";

const LIMIT = 10;

type FilterState = {
  showAgentInfo: boolean;
  showReddit: boolean;
  showBluesky: boolean;
};

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

const itemMatchesFilters = (item: FeedItem, filters: FilterState): boolean => {
  if (item.type === "bluesky" && filters.showBluesky) {
    return true;
  }
  if (item.type === "reddit" && filters.showReddit) {
    return true;
  }
  if (
    (item.type === "new_opening" || item.type === "agent_activity") &&
    filters.showAgentInfo
  ) {
    return true;
  }
  return false;
};

export const useDispatchFeed = (
  initialData?: FlattenedSlushFeed,
  filters?: FilterState
) => {
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
      if (lastPage.length === 0) {
        return undefined;
      }

      if (
        !filters ||
        (filters.showAgentInfo && filters.showReddit && filters.showBluesky)
      ) {
        return allPages.length * LIMIT;
      }

      const hasMatchingItems = lastPage.some((item) =>
        itemMatchesFilters(item, filters)
      );

      if (!hasMatchingItems) {
        return undefined;
      }

      return allPages.length * LIMIT;
    },
    initialData: initialData
      ? {
          pages: [initialData],
          pageParams: [0],
        }
      : undefined,
    enabled: !initialData,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
  });

  // Flatten all pages into a single array
  const flattenedData: FlattenedSlushFeed =
    data?.pages.reduce((acc, page) => [...acc, ...page], [] as FeedItem[]) ??
    [];

  // Check if we stopped due to no matching results in the filter
  const stoppedDueToFilters = useMemo(() => {
    if (!filters || !data?.pages || data.pages.length === 0) {
      return false;
    }

    // Only check if at least one filter is disabled
    const hasActiveFilters =
      !filters.showAgentInfo || !filters.showReddit || !filters.showBluesky;

    if (!hasActiveFilters) {
      return false;
    }

    const lastPage = data.pages[data.pages.length - 1];
    // We stopped due to filters if the last page has data but no matching items
    return (
      lastPage.length > 0 &&
      !lastPage.some((item) => itemMatchesFilters(item, filters)) &&
      !hasNextPage
    );
  }, [data?.pages, filters, hasNextPage]);

  return {
    data: flattenedData,
    isLoading,
    isFetchingMore: isFetchingNextPage,
    hasMore: hasNextPage ?? false,
    isError,
    fetchMore: fetchNextPage,
    stoppedDueToFilters,
  };
};
