"use client";

import { Button } from "@/app/ui-primitives/button";
import { motion } from "framer-motion";
import Link from "next/link";
import React, { useState } from "react";
import { TypeAnimation } from "react-type-animation";

const PROOF_ITEMS = [
  "3,300+ agents",
  "Save matches in one click",
  "Modern query dashboard",
  "Real-time publishing intel",
];

const TypeAnimationBlock = () => {
  const [firstDone, setFirstDone] = useState(false);

  return (
    <div className="pt-15 md:pt-26 sm:w-[90%] md:w-[80%] mx-auto text-left">
      <h1 className="text-4xl md:text-[40px] font-semibold leading-tight text-accent">
        <TypeAnimation
          className="block h-[100px] md:h-[60px] whitespace-pre-linen font-serif"
          speed={70}
          sequence={["Write Query Hook.", () => setFirstDone(true)]}
          repeat={0}
          omitDeletionAnimation={true}
          cursor={false}
        />
        {firstDone && (
          <TypeAnimation
            className="block h-[100px] md:h-[60px] whitespace-pre-linen font-serif"
            speed={70}
            sequence={["The modern way to query literary agents."]}
            repeat={0}
            omitDeletionAnimation={true}
            cursor={false}
          />
        )}
      </h1>

      <motion.p
        className="text-lg md:text-xl text-accent leading-relaxed max-w-2xl mt-4"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3, ease: "easeOut", delay: 1.5 }}
      >
        Find the best agents for your writing fast, track every query in one place, and
        stay current on agent openings, MSWLs, and publishing intel,
        without juggling spreadsheets and scattered research.
      </motion.p>

      <motion.div
        className="flex flex-col sm:flex-row gap-4 mt-10"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3, ease: "easeOut", delay: 2.1 }}
      >
        <Link href="/sign-up" className="w-full sm:w-auto">
          <Button className="cursor-pointer w-full sm:w-auto text-lg px-8 py-6 font-semibold shadow-lg hover:shadow-xl">
            Get started <span className="font-normal text-sm">&mdash; it&apos;s free</span>
          </Button>
        </Link>
      </motion.div>

      <motion.div
        className="mt-8 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-accent"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 2.7 }}
      >
        {PROOF_ITEMS.map((item, i) => (
          <React.Fragment key={item}>
            {i > 0 && <span className="text-accent">•</span>}
            <span className="text-base">{item}</span>
          </React.Fragment>
        ))}
      </motion.div>
    </div >
  );
};

export default TypeAnimationBlock;
