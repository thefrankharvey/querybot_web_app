import React from "react";
import { Feed } from "./components/feed";
import { Newspaper } from "lucide-react";
import { formatDisplayString, urlFormatter } from "@/app/utils";
import { Blips, FlattenedSlushFeed, FeedItem } from "@/app/types";
import { WQH_API_URL } from "@/app/constants";

const Dispatch = async () => {
  try {
    const res = await fetch(
      `${WQH_API_URL}/recent-activity?limit=10&offset=0`,
      {
        cache: "no-store",
      }
    );

    if (!res.ok) {
      // Return default empty data structure if API fails
      const defaultData: FlattenedSlushFeed = [];
      return renderContent(defaultData);
    }

    const data = await res.json();

    // The data from WQH_API_URL is in old format, we need to flatten it here
    const formatBlips = (blip: Blips): Blips => {
      return {
        ...blip,
        extra_interest: blip.extra_interest
          ? formatDisplayString(blip.extra_interest)
          : undefined,
        website: blip.website ? urlFormatter(blip.website) || "" : "",
      };
    };

    // Transform the old format to flattened format
    const flattenedFeed: FlattenedSlushFeed = [];

    // Add bluesky posts
    if (Array.isArray(data.bluesky)) {
      data.bluesky.forEach((post: any) => {
        flattenedFeed.push({ type: "bluesky", data: post });
      });
    }

    // Add reddit posts
    if (Array.isArray(data.reddit)) {
      data.reddit.forEach((post: any) => {
        flattenedFeed.push({ type: "reddit", data: post });
      });
    }

    // Add new openings
    if (Array.isArray(data.new_openings)) {
      data.new_openings.forEach((blip: Blips) => {
        flattenedFeed.push({ type: "new_opening", data: formatBlips(blip) });
      });
    }

    // Add agent activity
    if (Array.isArray(data.agent_activity)) {
      data.agent_activity.forEach((blip: Blips) => {
        flattenedFeed.push({
          type: "agent_activity",
          data: formatBlips(blip),
        });
      });
    }

    // Sort by timestamp (ascending - oldest to newest)
    flattenedFeed.sort((a, b) => {
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

    return renderContent(flattenedFeed);
  } catch (error) {
    console.error("Error fetching slush feed data:", error);
    // Return default empty data structure if there's an error
    const defaultData: FlattenedSlushFeed = [];
    return renderContent(defaultData);
  }
};

const renderContent = (data: FlattenedSlushFeed) => {
  return (
    <div className="w-full flex flex-col justify-start md:w-[700px] md:mx-auto">
      <h1 className="text-4xl md:text-[32px] font-semibold leading-tight mb-[27px] flex gap-4 items-center text-accent">
        <Newspaper className="w-10 h-10" />
        Dispatch
      </h1>
      <Feed initialData={data} />
    </div>
  );
};

export default Dispatch;
