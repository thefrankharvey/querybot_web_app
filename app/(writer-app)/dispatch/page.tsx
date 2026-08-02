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
import type { DispatchScope } from "@/app/hooks/use-dispatch-feed";

export const dynamic = "force-dynamic";

type DispatchPageProps = {
  searchParams: Promise<{ scope?: string }>;
};

const Dispatch = async ({ searchParams }: DispatchPageProps) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 1 minute timeout
  const requestedScope = (await searchParams).scope;
  const initialScope: DispatchScope = [
    "all",
    "all_agents",
    "community",
    "watched",
  ].includes(requestedScope ?? "")
    ? (requestedScope as DispatchScope)
    : "watched";

  try {
    const { userId } = await auth();
    if (!userId) {
      return renderContent([], initialScope);
    }
    if (initialScope !== "all") {
      return renderContent([], initialScope);
    }

    const res = await fetch(`${getWqhApiUrl().replace(/\/$/, "")}/recent-activity?limit=10&offset=0`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return renderContent([], initialScope);
    }

    const data: SlushFeed = await res.json();
    const flattenedFeed = flattenAndSortFeed(data);
    const formattedFeed: FlattenedSlushFeed = flattenedFeed.map(formatFeedItem);

    return renderContent(formattedFeed, initialScope);
  } catch (error) {
    console.error("Error fetching dispatch feed:", error);
    return renderContent([], initialScope);
  } finally {
    clearTimeout(timeoutId);
  }
};

const renderContent = (data: FlattenedSlushFeed, initialScope: DispatchScope) => {
  return (
    <div className="ambient-page px-4 pb-10 pt-8 md:px-6 md:pt-10">
      <div className="ambient-orb-top" />
      <div className="ambient-orb-bottom" />
      <div className="mx-auto flex w-full max-w-screen-md flex-col justify-start">
        <h1 className="mb-[27px] flex items-center gap-2 text-4xl font-semibold leading-tight text-accent md:text-[32px] ] font-serif">
          <Newspaper className="w-10 h-10" />
          Dispatch
        </h1>
        <Feed initialData={data} initialScope={initialScope} />
      </div>
    </div>
  );
};

export default Dispatch;
