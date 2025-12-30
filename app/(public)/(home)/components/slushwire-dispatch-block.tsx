import React, { useEffect, useMemo, useState } from "react";
import { feedDemoData } from "@/app/constants";
import BlueskyCard from "@/app/components/bluesky-card";
import RedditCard from "@/app/components/reddit-card";
import BlipsCard from "@/app/components/blips-card";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/app/ui-primitives/button";
import Link from "next/link";

const SlushwireDispatchBlock = () => {
  const items = useMemo(
    () => [
      {
        title: "Bluesky",
        content: <BlueskyCard post={feedDemoData.bluesky} />,
      },
      {
        title: "Reddit",
        content: <RedditCard post={feedDemoData.reddit} />,
      },
      {
        title: "Submission Openings",
        content: <BlipsCard blips={feedDemoData.pm_blips} isOpenToSubs />,
      },
    ],
    []
  );

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, 2000);

    return () => clearInterval(id);
  }, [items.length]);

  const cardVariants = {
    enter: { opacity: 0, y: 20 },
    center: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <div className="w-full mx-auto flex flex-col md:flex-row gap-8 pt-40 pb-20 justify-center items-center">
      <div className="w-full md:w-[60%]">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h1 className="text-2xl md:text-[40px] leading-normal text-accent">
            Get all of the latest industry news in a real time feed. Never miss
            a opportunity again.
          </h1>
          <div className="hidden justify-center w-full md:flex">
            <Link href="/sign-up" className="w-full md:w-fit">
              <Button className="cursor-pointer w-full md:w-fit text-3xl p-8 font-semibold mt-12 shadow-lg hover:shadow-xl">
                TRY FOR FREE
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
      <div className="hidden md:flex flex-col items-start justify-start gap-4 w-[60%] h-[320px]">
        <AnimatePresence mode="wait">
          {items.map(
            (item, index) =>
              index === activeIndex && (
                <motion.div
                  key={item.title}
                  variants={cardVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <h2 className="text-xl font-semibold mb-2 text-accent">
                    {item.title}
                  </h2>
                  <div className="pointer-events-none">{item.content}</div>
                </motion.div>
              )
          )}
        </AnimatePresence>
      </div>
      <div className="flex flex-col gap-4 w-full md:hidden">
        <div>
          <h2 className="text-lg font-semibold mb-2 text-accent">Bluesky</h2>
          <div className="pointer-events-none">
            <BlueskyCard post={feedDemoData.bluesky} />
          </div>
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2 text-accent">Reddit</h2>
          <div className="pointer-events-none">
            <RedditCard post={feedDemoData.reddit} />
          </div>
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2 text-accent">
            Submission Openings
          </h2>
          <div className="pointer-events-none">
            <BlipsCard blips={feedDemoData.pm_blips} isOpenToSubs />
          </div>
        </div>
      </div>
      <div className="flex justify-center w-full md:hidden">
        <Link href="/sign-up" className="w-full">
          <Button className="cursor-pointer w-full md:w-fit md:text-3xl text-2xl p-8 font-semibold mt-4 shadow-lg hover:shadow-xl">
            TRY FOR FREE
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default SlushwireDispatchBlock;
