"use client";

import { SlushFeed } from "@/app/types";
import BlueskyCard from "@/app/components/bluesky-card";
import BlipsCard from "@/app/components/blips-card";
import RedditCard from "@/app/components/reddit-card";
import { Button } from "@/app/ui-primitives/button";
import { Check, X } from "lucide-react";
import { useRef, useState } from "react";
import PayWall from "@/app/components/pay-wall";
import { useClerkUser } from "@/app/hooks/use-clerk-user";

enum SOCIAL_DATA {
  AGENT_INFO = "AGENT_INFO",
  REDDIT = "REDDIT",
  BLUESKY = "BLUESKY",
}

export const Feed = ({ data }: { data: SlushFeed }) => {
  const { isSubscribed, user } = useClerkUser();
  const gridRef = useRef<HTMLDivElement>(null);
  const [activeData, setActiveData] = useState({
    [SOCIAL_DATA.AGENT_INFO]: true,
    [SOCIAL_DATA.REDDIT]: true,
    [SOCIAL_DATA.BLUESKY]: true,
  });

  // Ensure arrays exist with fallbacks
  const {
    bluesky = [],
    new_openings = [],
    agent_activity = [],
    reddit = [],
  } = data || {};

  console.log({ isSubscribed });
  console.log({ user });

  return (
    <>
      <div className="flex gap-2">
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
        {activeData[SOCIAL_DATA.AGENT_INFO] &&
          new_openings.length > 0 &&
          new_openings.some((blip) => blip.bio && blip.name) && (
            <>
              <h2 className="text-xl mt-6"></h2>
              {new_openings.map((blips, index) => (
                <BlipsCard blips={blips} key={index} isOpenToSubs />
              ))}
            </>
          )}
        {activeData[SOCIAL_DATA.AGENT_INFO] &&
          agent_activity.length > 0 &&
          agent_activity.some((blip) => blip.bio && blip.name) && (
            <>
              <h2 className="text-xl mt-6"></h2>
              {agent_activity.map((blips, index) => (
                <BlipsCard blips={blips} key={index} />
              ))}
            </>
          )}
        {activeData[SOCIAL_DATA.REDDIT] && reddit.length > 0 && (
          <>
            <h2 className="text-xl font-semibold mt-6">Reddit</h2>
            {reddit.map((post, index) => (
              <RedditCard post={post} key={index} />
            ))}
          </>
        )}
        {activeData[SOCIAL_DATA.BLUESKY] && bluesky.length > 0 && (
          <>
            <h2 className="text-xl font-semibold mt-6">Bluesky</h2>
            {bluesky.map((post, index) => (
              <BlueskyCard post={post} key={index} />
            ))}
          </>
        )}
      </div>
      {!isSubscribed && (
        <PayWall
          title="Want the full slushwire dispatch?"
          gridRef={gridRef}
          resultLength={
            bluesky.length +
            new_openings.length +
            agent_activity.length +
            reddit.length
          }
        />
      )}
      {!activeData[SOCIAL_DATA.AGENT_INFO] &&
        !activeData[SOCIAL_DATA.REDDIT] &&
        !activeData[SOCIAL_DATA.BLUESKY] && (
          <h2 className="text-xl font-semibold mt-6">
            Select a option to view
          </h2>
        )}
    </>
  );
};
