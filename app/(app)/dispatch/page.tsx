import React from "react";
import { Feed } from "./components/feed";
import { Newspaper } from "lucide-react";
import { FlattenedSlushFeed, FeedItem } from "@/app/types";
import { formatFeedItem } from "@/app/utils/dispatch-utils";

const Dispatch = async () => {
  try {
    const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const url = new URL("/api/dispatch-feed", base);
    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) {
      const defaultData: FlattenedSlushFeed = [];
      return renderContent(defaultData);
    }

    const data: FeedItem[] = await res.json();
    const formattedFeed: FlattenedSlushFeed = data.map(formatFeedItem);

    return renderContent(formattedFeed);
  } catch (error) {
    console.error("Error fetching slush feed data:", error);
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
