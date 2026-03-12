"use client";

import { motion } from "framer-motion";
import { Check, Minus } from "lucide-react";

export const CompareCompetitors = () => {
  const items = [
    [
      "Finding agents",
      "Search one by one across scattered lists and guesswork",
      "Get ranked matches in one search with Smart Match",
    ],
    [
      "Knowing who's open",
      "Check submission status by hand and miss fast-moving windows",
      "Track open and closed status changes inside Dispatch",
    ],
    [
      "Staying current",
      "Piece together advice, MSWL shifts, and openings from multiple sources",
      "Keep real-time publishing intel in one connected feed",
    ],
    [
      "Organization",
      "Build and maintain spreadsheets manually",
      "Save matches instantly and track submissions in one dashboard",
    ],
    [
      "Multiple projects",
      "Split your process across notes, tabs, and duplicate trackers",
      "Track multiple manuscripts with notes, fit, and readiness in one place",
    ],
    [
      "Time spent",
      "Spend hours on research before you send a thoughtful query",
      "Move faster and get back to writing sooner",
    ],
    [
      "Confidence",
      "Wonder if you're missing changes or better-fit agents",
      "Work from one modern system built for querying writers",
    ],
  ];

  return (
    <section className="relative w-full">
      <motion.div
        className="mx-auto w-full"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
      >
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-serif text-4xl leading-tight text-accent md:text-[52px]">
            The old way vs the modern way
          </h2>
          <p className="mt-6 text-base leading-8 text-accent/76 md:text-lg">
            Subscribe for a workflow that keeps agent discovery, submission
            tracking, and live publishing intel connected.
          </p>
        </div>

        <div className="mt-12 hidden gap-6 lg:grid lg:grid-cols-2 max-w-5xl mx-auto">
          <article className="rounded-[32px] border border-[#d8dde2] bg-[linear-gradient(180deg,rgba(244,246,247,0.96),rgba(235,239,242,0.88))] p-6 shadow-[0_20px_50px_rgba(24,44,69,0.06)] sm:p-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent/45">
              Old way
            </p>
            <ul className="mt-6 flex flex-col gap-4">
              {items.map((item) => (
                <li
                  key={item[0]}
                  className="flex items-start gap-3 rounded-[22px] border border-white/70 bg-white/54 px-4 py-4 text-sm leading-6 text-accent/64 sm:text-[15px]"
                >
                  <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-white/85 text-accent/42 ring-1 ring-black/5">
                    <Minus className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block font-semibold text-accent/75">
                      {item[0]}
                    </span>
                    <span>{item[1]}</span>
                  </span>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-[32px] border border-white/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,249,250,0.94))] p-6 shadow-[0_26px_64px_rgba(24,44,69,0.12)] ring-1 ring-accent/8 sm:p-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent/62">
              Modern way
            </p>
            <ul className="mt-6 flex flex-col gap-4">
              {items.map((item) => (
                <li
                  key={item[0]}
                  className="flex items-start gap-3 rounded-[22px] border border-white/90 bg-white/88 px-4 py-4 text-sm leading-6 text-accent/78 shadow-[0_14px_34px_rgba(24,44,69,0.08)] sm:text-[15px]"
                >
                  <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-accent text-white">
                    <Check className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block font-semibold text-accent">
                      {item[0]}
                    </span>
                    <span>{item[2]}</span>
                  </span>
                </li>
              ))}
            </ul>
          </article>
        </div>

        <div className="mt-10 grid gap-4 lg:hidden">
          {items.map((item) => (
            <article
              key={item[0]}
              className="overflow-hidden rounded-[28px] border border-white/85 bg-white/80 shadow-[0_20px_50px_rgba(24,44,69,0.08)] backdrop-blur-sm"
            >
              <div className="border-b border-accent/8 px-5 py-4">
                <h3 className="text-lg font-semibold text-accent">{item[0]}</h3>
              </div>
              <div className="grid gap-3 p-4">
                <div className="rounded-[20px] border border-[#d8dde2] bg-[linear-gradient(180deg,rgba(244,246,247,0.96),rgba(235,239,242,0.88))] px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent/45">
                    Old way
                  </p>
                  <p className="mt-2 text-sm leading-6 text-accent/66">
                    {item[1]}
                  </p>
                </div>
                <div className="rounded-[20px] border border-white/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,249,250,0.94))] px-4 py-4 shadow-[0_14px_34px_rgba(24,44,69,0.08)]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent/62">
                    Modern way
                  </p>
                  <p className="mt-2 text-sm leading-6 text-accent/78">
                    {item[2]}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </motion.div>
    </section>
  );
};
