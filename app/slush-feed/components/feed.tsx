"use client";

import { SlushFeed } from "@/app/types";
import BlueskyCard from "@/app/components/bluesky-card";
import BlipsCard from "@/app/components/blips-card";
import RedditCard from "@/app/components/reddit-card";
import { Button } from "@/app/ui-primitives/button";
import { Check, X } from "lucide-react";
import { useRef, useState } from "react";
import PayWall from "@/app/components/pay-wall";
import { useAuth } from "@clerk/nextjs";

enum SOCIAL_DATA {
  AGENT_INFO = "AGENT_INFO",
  REDDIT = "REDDIT",
  BLUESKY = "BLUESKY",
}

export const Feed = ({ data }: { data: SlushFeed }) => {
  const { has } = useAuth();
  const hasProPlan = has?.({ plan: "slushwire_pro" });
  const gridRef = useRef<HTMLDivElement>(null);
  const [activeData, setActiveData] = useState({
    [SOCIAL_DATA.AGENT_INFO]: true,
    [SOCIAL_DATA.REDDIT]: true,
    [SOCIAL_DATA.BLUESKY]: true,
  });

  const {
    data: { bluesky_posts, pm_blips, qt_blips, reddit_posts },
  } = data;

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
          pm_blips.some((blip) => blip.bio && blip.name) && (
            <>
              <h2 className="text-xl font-semibold mt-6">Agent Activity</h2>
              {pm_blips.map((blips) => (
                <BlipsCard blips={blips} key={blips.id} />
              ))}
            </>
          )}
        {activeData[SOCIAL_DATA.AGENT_INFO] &&
          qt_blips.some((blip) => blip.bio && blip.name) && (
            <>
              <h2 className="text-xl font-semibold mt-6">
                Submission Openings
              </h2>
              {qt_blips.map((blips) => (
                <BlipsCard blips={blips} key={blips.id} />
              ))}
            </>
          )}
        {activeData[SOCIAL_DATA.REDDIT] && reddit_posts.length > 0 && (
          <>
            <h2 className="text-xl font-semibold mt-6">Reddit</h2>
            {reddit_posts.map((post) => (
              <RedditCard post={post} key={post.id} />
            ))}
          </>
        )}
        {activeData[SOCIAL_DATA.BLUESKY] && bluesky_posts.length > 0 && (
          <>
            <h2 className="text-xl font-semibold mt-6">Bluesky</h2>
            {bluesky_posts.map((post) => (
              <BlueskyCard post={post} key={post.id} />
            ))}
          </>
        )}
      </div>
      {!hasProPlan && (
        <PayWall
          title="Want the full slushwire dispatch?"
          gridRef={gridRef}
          resultLength={
            bluesky_posts.length +
            pm_blips.length +
            qt_blips.length +
            reddit_posts.length
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
