import { formatDisplayString, urlFormatter } from "@/app/utils";
import { Blips, BlueskyPost, FeedItem, RedditPost, SlushFeed } from "../types";

export const formatBlips = (blip: Blips): Blips => {
  return {
    ...blip,
    extra_interest: blip.extra_interest
      ? formatDisplayString(blip.extra_interest)
      : undefined,
    website: blip.website ? urlFormatter(blip.website) || "" : "",
  };
};

export const formatFeedItem = (item: FeedItem): FeedItem => {
  if (item.type === "new_opening" || item.type === "agent_activity") {
    return {
      ...item,
      data: formatBlips(item.data),
    };
  }
  return item;
};

/**
 * Flattens and sorts feed results by timestamp in ascending order.
 * Each item is tagged with its type for rendering.
 */
export function flattenAndSortFeed(feed: SlushFeed): FeedItem[] {
  const allItems: FeedItem[] = [];

  // Add bluesky posts
  feed.bluesky?.forEach((post: BlueskyPost) => {
    allItems.push({ type: "bluesky", data: post });
  });

  // Add reddit posts
  feed.reddit?.forEach((post: RedditPost) => {
    allItems.push({ type: "reddit", data: post });
  });

  // Add new openings
  feed.new_openings?.forEach((blip: Blips) => {
    allItems.push({ type: "new_opening", data: blip });
  });

  // Add agent activity
  feed.agent_activity?.forEach((blip: Blips) => {
    allItems.push({ type: "agent_activity", data: blip });
  });

  // Sort by timestamp (ascending - oldest to newest)
  allItems.sort((a, b) => {
    const getTimestamp = (item: FeedItem): string => {
      switch (item.type) {
        case "bluesky":
          return item.data.datetime || item.data.created_at;
        case "reddit":
          return item.data.datetime_posted || item.data.created_at;
        case "new_opening":
        case "agent_activity":
          return item.data.updated_at || item.data.created_at;
        default:
          return "";
      }
    };

    const timeA = new Date(getTimestamp(a)).getTime();
    const timeB = new Date(getTimestamp(b)).getTime();
    return timeA - timeB;
  });

  return allItems;
}
