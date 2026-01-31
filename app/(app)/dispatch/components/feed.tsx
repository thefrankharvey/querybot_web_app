"use client";

import { FlattenedSlushFeed } from "@/app/types";
import BlueskyCard from "@/app/components/bluesky-card";
import BlipsCard from "@/app/components/blips-card";
import RedditCard from "@/app/components/reddit-card";
import { Button } from "@/app/ui-primitives/button";
import { Check, X } from "lucide-react";
import { useRef, useState, useMemo } from "react";
import PayWall from "@/app/components/pay-wall";
import { useClerkUser } from "@/app/hooks/use-clerk-user";
import { useDispatchFeed } from "@/app/hooks/use-dispatch-feed";
import { Spinner } from "@/app/ui-primitives/spinner";
import { useOnInView } from "react-intersection-observer";
import TypeForm from "@/app/components/type-form";

enum SOCIAL_DATA {
  AGENT_INFO = "AGENT_INFO",
  REDDIT = "REDDIT",
  BLUESKY = "BLUESKY",
}

export const Feed = ({ initialData }: { initialData: FlattenedSlushFeed }) => {
  const { isSubscribed } = useClerkUser();
  const gridRef = useRef<HTMLDivElement>(null);
  const [activeData, setActiveData] = useState({
    [SOCIAL_DATA.AGENT_INFO]: true,
    [SOCIAL_DATA.REDDIT]: true,
    [SOCIAL_DATA.BLUESKY]: true,
  });

  // Create filter state for the hook
  const filterState = useMemo(
    () => ({
      showAgentInfo: activeData[SOCIAL_DATA.AGENT_INFO],
      showReddit: activeData[SOCIAL_DATA.REDDIT],
      showBluesky: activeData[SOCIAL_DATA.BLUESKY],
    }),
    [activeData]
  );

  const { data, isFetchingMore, hasMore, fetchMore, stoppedDueToFilters } =
    useDispatchFeed(initialData, filterState);

  const trackingRef = useOnInView(
    (inView) => {
      if (inView && hasMore) {
        fetchMore();
      }
    },
    {
      threshold: 0,
      rootMargin: "400px",
    }
  );

  // Filter data based on active filters
  const filteredData = data.filter((item) => {
    if (item.type === "bluesky" && activeData[SOCIAL_DATA.BLUESKY]) {
      return true;
    }
    if (item.type === "reddit" && activeData[SOCIAL_DATA.REDDIT]) {
      return true;
    }
    if (
      (item.type === "new_opening" || item.type === "agent_activity") &&
      activeData[SOCIAL_DATA.AGENT_INFO]
    ) {
      return true;
    }
    return false;
  });

  // Get active filter names for the message
  const activeFilterNames = useMemo(() => {
    const names = [];
    if (activeData[SOCIAL_DATA.AGENT_INFO]) names.push("Agent Info");
    if (activeData[SOCIAL_DATA.REDDIT]) names.push("Reddit");
    if (activeData[SOCIAL_DATA.BLUESKY]) names.push("Bluesky");
    return names;
  }, [activeData]);

  return (
    <>
      <div className="flex gap-2 mb-8">
        <Button
          className="shadow-lg hover:shadow-xl"
          size="lg"
          variant={activeData[SOCIAL_DATA.AGENT_INFO] ? "default" : "secondary"}
          onClick={() =>
            setActiveData((prev) => {
              return {
                ...prev,
                [SOCIAL_DATA.AGENT_INFO]: !prev[SOCIAL_DATA.AGENT_INFO],
              };
            })
          }
        >
          Agent Info
          {activeData[SOCIAL_DATA.AGENT_INFO] ? <Check /> : <X />}
        </Button>
        <Button
          className="shadow-lg hover:shadow-xl"
          size="lg"
          variant={activeData[SOCIAL_DATA.REDDIT] ? "default" : "secondary"}
          onClick={() =>
            setActiveData((prev) => {
              return {
                ...prev,
                [SOCIAL_DATA.REDDIT]: !prev[SOCIAL_DATA.REDDIT],
              };
            })
          }
        >
          Reddit
          {activeData[SOCIAL_DATA.REDDIT] ? <Check /> : <X />}
        </Button>
        <Button
          className="shadow-lg hover:shadow-xl"
          size="lg"
          variant={activeData[SOCIAL_DATA.BLUESKY] ? "default" : "secondary"}
          onClick={() =>
            setActiveData((prev) => {
              return {
                ...prev,
                [SOCIAL_DATA.BLUESKY]: !prev[SOCIAL_DATA.BLUESKY],
              };
            })
          }
        >
          BlueSky
          {activeData[SOCIAL_DATA.BLUESKY] ? <Check /> : <X />}
        </Button>
      </div>
      <div className="flex flex-col gap-4" ref={gridRef}>
        {filteredData.map((item, index) => {
          switch (item.type) {
            case "bluesky":
              return <BlueskyCard post={item.data} key={`bluesky-${index}`} />;
            case "reddit":
              return <RedditCard post={item.data} key={`reddit-${index}`} />;
            case "new_opening":
              return (
                <BlipsCard
                  blips={item.data}
                  key={`new-opening-${index}`}
                  isOpenToSubs
                />
              );
            case "agent_activity":
              return (
                <BlipsCard blips={item.data} key={`agent-activity-${index}`} />
              );
            default:
              return null;
          }
        })}
      </div>

      {/* Sentinel element for infinite scroll - only for subscribed users */}
      {isSubscribed && hasMore && (
        <div
          ref={trackingRef}
          className="py-4 flex justify-center h-[150px] w-full"
        >
          {isFetchingMore && <Spinner className="size-8 text-accent" />}
        </div>
      )}

      {/* Message when pagination stopped due to filters */}
      {isSubscribed && stoppedDueToFilters && filteredData.length > 0 && (
        <div className="py-4 text-center">
          <p className="text-gray-600 text-sm">
            No new {activeFilterNames.join(" or ")} posts available. Try
            adjusting your filters.
          </p>
        </div>
      )}

      {!isSubscribed && (
        <PayWall
          title="Want the full dispatch?"
          gridRef={gridRef}
          resultLength={data.length}
        />
      )}
      {!activeData[SOCIAL_DATA.AGENT_INFO] &&
        !activeData[SOCIAL_DATA.REDDIT] &&
        !activeData[SOCIAL_DATA.BLUESKY] && (
          <h2 className="text-xl font-semibold mt-6">
            Select a option to view
          </h2>
        )}
      {filteredData.length === 0 &&
        (activeData[SOCIAL_DATA.AGENT_INFO] ||
          activeData[SOCIAL_DATA.REDDIT] ||
          activeData[SOCIAL_DATA.BLUESKY]) && (
          <h2 className="text-xl font-semibold mt-6">
            No new posts to show, please check back later!
          </h2>
        )}
      <TypeForm />
    </>
  );
};
