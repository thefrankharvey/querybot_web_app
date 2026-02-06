import React from "react";
import { Feed } from "./components/feed";
import { Newspaper } from "lucide-react";
import {
  SlushFeed,
  FlattenedSlushFeed,
} from "@/app/types";
import { flattenAndSortFeed, formatFeedItem } from "@/app/utils/dispatch-utils";
import { getWqhApiUrl } from "@/lib/config";
import { auth } from "@clerk/nextjs/server";

const Dispatch = async () => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 1 minute timeout

  try {
    const { userId } = await auth();
    if (!userId) {
      return renderContent([]);
    }

    const res = await fetch(`${getWqhApiUrl()}recent-activity?limit=10&offset=0`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return renderContent([]);
    }

    const data: SlushFeed = await res.json();
    const flattenedFeed = flattenAndSortFeed(data);
    const formattedFeed: FlattenedSlushFeed = flattenedFeed.map(formatFeedItem);

    return renderContent(formattedFeed);
  } catch (error) {
    console.error("Error fetching dispatch feed:", error);
    return renderContent([]);
  } finally {
    clearTimeout(timeoutId);
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