"use client";

import { motion } from "framer-motion";
import { Check, Minus } from "lucide-react";
import HomeContentShell from "./home-content-shell";

const oldWayItems = [
  "Search for agents one by one",
  "Build and maintain spreadsheets manually",
  "Check submission status by hand",
  "Miss changing agent preferences and openings",
  "Piece together advice from scattered sources",
] as const;

const modernWayItems = [
  "Get ranked matches in one search",
  "Save matches instantly to your dashboard",
  "Track queries and requests in one place",
  "Stay current with real-time publishing intel",
  "Work from one connected system",
] as const;

const ComparisonSection = () => {
  return (
    <section className="relative w-full overflow-hidden py-24 md:py-28 lg:py-32">
      <div className="pointer-events-none absolute inset-x-0 top-8 -z-10 mx-auto h-[620px] w-[min(1180px,96vw)] bg-[radial-gradient(circle_at_24%_30%,rgba(231,234,236,0.84),transparent_28%),radial-gradient(circle_at_76%_28%,rgba(112,193,202,0.16),transparent_24%),radial-gradient(circle_at_60%_76%,rgba(255,255,255,0.9),transparent_34%)] blur-3xl" />

      <HomeContentShell>
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
          </div>

          <div className="mt-12 grid gap-6 lg:mt-14 lg:grid-cols-2">
            <article className="rounded-[32px] border border-[#d8dde2] bg-[linear-gradient(180deg,rgba(244,246,247,0.96),rgba(235,239,242,0.88))] p-6 shadow-[0_20px_50px_rgba(24,44,69,0.06)] sm:p-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent/45">
                Old way
              </p>
              <ul className="mt-6 space-y-4">
                {oldWayItems.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 rounded-[22px] border border-white/70 bg-white/54 px-4 py-4 text-sm leading-6 text-accent/64 sm:text-[15px]"
                  >
                    <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/85 text-accent/42 ring-1 ring-black/5">
                      <Minus className="h-4 w-4" />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="rounded-[32px] border border-white/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,249,250,0.94))] p-6 shadow-[0_26px_64px_rgba(24,44,69,0.12)] ring-1 ring-accent/8 sm:p-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent/62">
                With Write Query Hook
              </p>
              <ul className="mt-6 space-y-4">
                {modernWayItems.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 rounded-[22px] border border-white/90 bg-white/88 px-4 py-4 text-sm leading-6 text-accent/78 shadow-[0_14px_34px_rgba(24,44,69,0.08)] sm:text-[15px]"
                  >
                    <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-white">
                      <Check className="h-4 w-4" />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </motion.div>
      </HomeContentShell>
    </section>
  );
};

export default ComparisonSection;
