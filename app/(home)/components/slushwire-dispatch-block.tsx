import React from "react";
import { feedDemoData } from "@/app/constants";
import BlueskyCard from "@/app/components/bluesky-card";
import RedditCard from "@/app/components/reddit-card";
import BlipsCard from "@/app/components/blips-card";
import { motion } from "framer-motion";
import { Button } from "@/app/ui-primitives/button";
import Link from "next/link";

const SlushwireDispatchBlock = () => {
  return (
    <div className="w-full mx-auto flex flex-col md:flex-row gap-8 pt-40 pb-20 justify-center items-center">
      <div className="w-full md:w-[60%]">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h1 className="text-2xl md:text-[40px] leading-normal">
            <span className="font-semibold">Slushwire Dispatch</span>, provides
            you with all of the latest industry news in a real time feed.
          </h1>
          <div className="flex justify-center w-full">
            <Link href="/slush-feed" className="w-full md:w-fit">
              <Button className="cursor-pointer w-full md:w-fit text-xl p-8 font-semibold mt-12 hover:border-accent border-2 border-transparent shadow-lg hover:shadow-xl">
                TRY SLUSHWIRE DISPATCH
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
      <div className="hidden md:flex flex-col gap-4 w-[60%]">
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{
            duration: 0.6,
            delay: 0.15,
            ease: "easeOut",
          }}
        >
          <h2 className="text-lg font-semibold mb-2">Bluesky</h2>
          <BlueskyCard post={feedDemoData.bluesky_post} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{
            duration: 0.6,
            delay: 0.25,
            ease: "easeOut",
          }}
        >
          <h2 className="text-lg font-semibold mb-2">Reddit</h2>
          <RedditCard post={feedDemoData.reddit_post} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{
            duration: 0.6,
            delay: 0.3,
            ease: "easeOut",
          }}
        >
          <h2 className="text-lg font-semibold mb-2">Submission Openings</h2>
          <BlipsCard blips={feedDemoData.pm_blips} />
        </motion.div>
      </div>
      <div className="flex flex-col gap-4 w-full md:hidden">
        <div>
          <h2 className="text-lg font-semibold mb-2">Bluesky</h2>
          <BlueskyCard post={feedDemoData.bluesky_post} />
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2">Reddit</h2>
          <RedditCard post={feedDemoData.reddit_post} />
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2">Submission Openings</h2>
          <BlipsCard blips={feedDemoData.pm_blips} />
        </div>
      </div>
    </div>
  );
};

export default SlushwireDispatchBlock;
