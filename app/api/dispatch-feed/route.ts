import { WQH_API_URL } from "@/app/constants";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  SlushFeed,
  FeedItem,
  BlueskyPost,
  RedditPost,
  Blips,
} from "@/app/types";

/**
 * Flattens and sorts feed results by timestamp in ascending order.
 * Each item is tagged with its type for rendering.
 */
function flattenAndSortFeed(feed: SlushFeed): FeedItem[] {
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

export async function GET(req: NextRequest) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 1 minute timeout

  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = searchParams.get("limit") || "10";
    const offset = searchParams.get("offset") || "0";

    const externalRes = await fetch(
      `${WQH_API_URL}/recent-activity?limit=${limit}&offset=${offset}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        cache: "no-store",
      }
    );

    const data: SlushFeed = await externalRes.json();
    const flattenedFeed = flattenAndSortFeed(data);

    return NextResponse.json(flattenedFeed, { status: externalRes.status });
  } catch (error) {
    console.error("Dispatch feed API error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch dispatch feed",
      },
      { status: 500 }
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
