"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { BellRing, Building2, MessagesSquare, Newspaper } from "lucide-react";
import { useOnInView } from "react-intersection-observer";

import type { FlattenedSlushFeed } from "@/app/types";
import BlueskyCard from "@/app/components/bluesky-card";
import BlipsCard from "@/app/components/blips-card";
import { AgentChangeEventCard } from "@/app/components/personalized-radar/agent-change-event-card";
import RedditCard from "@/app/components/reddit-card";
import PayWall from "@/app/components/pay-wall";
import { Alert, AlertDescription, AlertTitle } from "@/app/ui-primitives/alert";
import { Button } from "@/app/ui-primitives/button";
import { Spinner } from "@/app/ui-primitives/spinner";
import {
  useDispatchFeed,
  type DispatchScope,
} from "@/app/hooks/use-dispatch-feed";
import { useClerkUser } from "@/app/hooks/use-clerk-user";
import { AgentWatchLookupProvider } from "@/app/hooks/use-agent-watches";
import {
  RADAR_EVENT_TYPES,
  type RadarEventType,
} from "@/app/utils/personalized-radar/contracts";
import { captureRadarEvent } from "@/app/utils/personalized-radar/product-analytics.client";

const SCOPE_OPTIONS: Array<{
  value: DispatchScope;
  label: string;
  icon: typeof Newspaper;
}> = [
  { value: "watched", label: "Watched Agents", icon: BellRing },
  { value: "all_agents", label: "All Agent Updates", icon: Building2 },
  { value: "community", label: "Community / Industry", icon: MessagesSquare },
];

const EVENT_FILTER_LABELS: Record<RadarEventType, string> = {
  submission_reopened: "Reopened",
  submission_closed: "Closed",
  mswl_or_interest_update: "Interests",
  official_profile_update: "Profile",
  agency_change: "Agency",
};

export function Feed({
  initialData,
  initialScope = "watched",
}: {
  initialData: FlattenedSlushFeed;
  initialScope?: DispatchScope;
}) {
  const { isSubscribed } = useClerkUser();
  const gridRef = useRef<HTMLDivElement>(null);
  const [scope, setScope] = useState<DispatchScope>(initialScope);
  const [eventType, setEventType] = useState<RadarEventType | null>(null);
  const feed = useDispatchFeed(initialData, {
    scope,
    eventType: scope === "watched" ? eventType : null,
  });
  const identities = useMemo(
    () =>
      feed.data.flatMap((item) => {
        if (item.type === "agent_event") {
          return [
            {
              agentProfileId: item.data.agent.profile_id,
              indexId: item.data.agent.index_id,
            },
          ];
        }
        if (item.type === "new_opening" || item.type === "agent_activity") {
          return [{ agentProfileId: null, indexId: item.data.id ?? null }];
        }
        return [];
      }),
    [feed.data],
  );

  useEffect(() => {
    if (scope === "watched") captureRadarEvent("watched_dispatch_viewed");
  }, [scope]);

  const trackingRef = useOnInView(
    (inView) => {
      if (inView && feed.hasMore && !feed.isFetchingMore) {
        void feed.fetchMore();
      }
    },
    { threshold: 0, rootMargin: "400px" },
  );

  const changeScope = (nextScope: DispatchScope) => {
    setScope(nextScope);
    if (nextScope !== "watched") setEventType(null);
  };

  return (
    <>
      <div className="mb-5 flex max-w-full gap-2 overflow-x-auto pb-2 scrollbar-transparent">
        {SCOPE_OPTIONS.map((option) => {
          const Icon = option.icon;
          return (
            <Button
              key={option.value}
              aria-pressed={scope === option.value}
              className="shrink-0"
              onClick={() => changeScope(option.value)}
              size="sm"
              type="button"
              variant={scope === option.value ? "default" : "secondary"}
            >
              <Icon data-icon="inline-start" />
              {option.label}
            </Button>
          );
        })}
      </div>

      {scope === "watched" ? (
        <div className="mb-7 flex flex-col gap-3">
        <div
          aria-label="Filter watched agent updates"
          className="flex max-w-full gap-2 overflow-x-auto pb-2 scrollbar-transparent"
          role="group"
        >
          <Button
            aria-pressed={eventType === null}
            className="shrink-0"
            onClick={() => setEventType(null)}
            size="sm"
            type="button"
            variant={eventType === null ? "outline" : "ghost"}
          >
            All changes
          </Button>
          {RADAR_EVENT_TYPES.map((value) => (
            <Button
              key={value}
              aria-pressed={eventType === value}
              className="shrink-0"
              onClick={() => setEventType(value)}
              size="sm"
              type="button"
              variant={eventType === value ? "outline" : "ghost"}
            >
              {EVENT_FILTER_LABELS[value]}
            </Button>
          ))}
        </div>
        <Button asChild className="w-fit" size="sm" variant="link">
          <Link href="/radar">Manage watches and preferences</Link>
        </Button>
        </div>
      ) : null}

      {feed.isError ? (
        <Alert role="alert" variant="destructive">
          <AlertTitle>Dispatch could not refresh</AlertTitle>
          <AlertDescription>
            {feed.error instanceof Error
              ? feed.error.message
              : "Try again in a moment."}
          </AlertDescription>
        </Alert>
      ) : null}

      {feed.isLoading ? (
        <div className="flex min-h-52 items-center justify-center" role="status">
          <Spinner className="size-8" />
          <span className="sr-only">Loading Dispatch</span>
        </div>
      ) : (
        <AgentWatchLookupProvider identities={identities}>
          <div className="flex flex-col gap-4" ref={gridRef}>
            {feed.data.map((item) => {
              switch (item.type) {
                case "bluesky":
                  return <BlueskyCard post={item.data} key={`bluesky-${item.data.id}`} />;
                case "reddit":
                  return <RedditCard post={item.data} key={`reddit-${item.data.id}`} />;
                case "new_opening":
                  return <BlipsCard blips={item.data} key={`opening-${item.data.id}`} isOpenToSubs />;
                case "agent_activity":
                  return <BlipsCard blips={item.data} key={`activity-${item.data.id}`} />;
                case "agent_event":
                  return <AgentChangeEventCard event={item.data} key={item.data.event_id} />;
              }
            })}
          </div>
        </AgentWatchLookupProvider>
      )}

      {!feed.isLoading && !feed.isError && feed.data.length === 0 ? (
        <div className="glass-panel flex min-h-52 flex-col items-center justify-center gap-3 p-8 text-center">
          <BellRing aria-hidden className="size-8 text-accent/60" />
          <h2 className="text-xl font-semibold text-accent">
            {scope === "watched" ? "Your Radar is quiet" : "No recent updates"}
          </h2>
          <p className="max-w-md text-sm text-accent/68">
            {scope === "watched"
              ? "Watch saved agents from Smart Match or your Query Dashboard. Verified official changes will appear here."
              : "Check back later for new activity."}
          </p>
          {scope === "watched" ? (
            <div className="flex flex-wrap justify-center gap-2">
              <Button asChild size="sm">
                <Link href="/smart-match">Find agents</Link>
              </Button>
              <Button asChild size="sm" variant="secondary">
                <Link href="/query-dashboard">View saved agents</Link>
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}

      {(isSubscribed || scope === "watched") && feed.hasMore ? (
        <div ref={trackingRef} className="flex h-[150px] w-full justify-center py-4">
          {feed.isFetchingMore ? <Spinner className="size-8" /> : null}
        </div>
      ) : null}

      {!isSubscribed && scope !== "watched" ? (
        <PayWall title="Want the full dispatch?" gridRef={gridRef} resultLength={feed.data.length} />
      ) : null}
    </>
  );
}
