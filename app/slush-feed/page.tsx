import React from "react";
import { Feed } from "./components/feed";
import { Newspaper } from "lucide-react";
import { formatDisplayString, urlFormatter } from "../utils";
import { Blips, SlushFeed, BlueskyPost, RedditPost } from "../types";

// Type for the raw API response that might have missing properties
type ApiResponse = {
  bluesky?: BlueskyPost[];
  new_openings?: Blips[];
  agent_activity?: Blips[];
  reddit?: RedditPost[];
};

const SlushReport = async () => {
  try {
    const res = await fetch("http://querybot-api.onrender.com/recent-activity");

    if (!res.ok) {
      // Return default empty data structure if API fails
      const defaultData: SlushFeed = {
        bluesky: [],
        new_openings: [],
        agent_activity: [],
        reddit: [],
      };
      return renderContent(defaultData);
    }

    const data: ApiResponse = await res.json();

    const formatBlips = (data: Blips[]) => {
      if (!Array.isArray(data)) return [];
      return data.map((blip) => {
        return {
          ...blip,
          extra_interest: blip.extra_interest
            ? formatDisplayString(blip.extra_interest)
            : undefined,
          website: blip.website ? urlFormatter(blip.website) || "" : "",
        };
      });
    };

    const formatSlushFeed = (data: ApiResponse): SlushFeed => {
      return {
        bluesky: Array.isArray(data.bluesky) ? data.bluesky : [],
        new_openings: formatBlips(data.new_openings || []),
        agent_activity: formatBlips(data.agent_activity || []),
        reddit: Array.isArray(data.reddit) ? data.reddit : [],
      };
    };

    const formattedFeed = formatSlushFeed(data);
    return renderContent(formattedFeed);
  } catch (error) {
    console.error("Error fetching slush feed data:", error);
    // Return default empty data structure if there's an error
    const defaultData: SlushFeed = {
      bluesky: [],
      new_openings: [],
      agent_activity: [],
      reddit: [],
    };
    return renderContent(defaultData);
  }
};

const renderContent = (data: SlushFeed) => {
  return (
    <div className="w-full flex flex-col justify-start md:w-[700px] md:mx-auto pt-12">
      <h1 className="text-4xl font-extrabold leading-tight mb-4 flex gap-4 items-center">
        <Newspaper className="w-10 h-10" />
        Dispatch
      </h1>
      <Feed data={data} />
    </div>
  );
};

export default SlushReport;
