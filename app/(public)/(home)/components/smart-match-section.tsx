"use client";

import { cn } from "@/app/utils";
import { Button } from "@/app/ui-primitives/button";
import { motion } from "framer-motion";
import { ArrowUpRight, Check, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import HomeContentShell from "./home-content-shell";

const smartMatchBullets = [
  "Ranked matches based on your project details",
  "Filter by country and open or closed status",
  "Save individual agents or your full list in one click",
  "Export a query spreadsheet pre-filled with your matches",
] as const;

const screenshotCallouts = [
  {
    label: "Match scores",
    description: "Ranked fit indicators at a glance",
    className: "left-[25%] top-[8%] sm:left-[8%] sm:top-[10%]",
    lineClassName: "left-[calc(100%+0.5rem)] top-1/2 hidden h-px w-10 -translate-y-1/2 bg-accent/30 sm:block",
  },
  {
    label: "Open to submissions",
    description: "Live-ready status tags",
    className: "right-[6%] top-[18%] text-right sm:right-[8%] sm:top-[20%]",
    lineClassName: "right-[calc(100%+0.5rem)] top-1/2 hidden h-px w-12 -translate-y-1/2 bg-accent/30 sm:block",
  },
  {
    label: "Matching genres + themes",
    description: "Proof of why each agent fits",
    className: "left-[4%] bottom-[12%] sm:left-[7%] sm:bottom-[14%]",
    lineClassName: "left-[calc(100%+0.5rem)] top-1/2 hidden h-px w-16 -translate-y-1/2 bg-accent/30 sm:block",
  },
  {
    label: "Country + status filters",
    description: "Refine results in seconds",
    className: "right-[3%] bottom-[8%] text-right sm:right-[7%] sm:bottom-[10%]",
    lineClassName: "right-[calc(100%+0.5rem)] top-1/2 hidden h-px w-14 -translate-y-1/2 bg-accent/30 sm:block",
  },
] as const;

const SmartMatchSection = () => {
  return (
    <section className="relative w-full overflow-hidden py-24 md:py-28 lg:py-32">
      <div className="pointer-events-none absolute inset-x-0 top-[70px] -z-10 mx-auto h-[820px] w-[min(1360px,100vw)] bg-[radial-gradient(circle_at_22%_24%,rgba(112,193,202,0.18),transparent_28%),radial-gradient(circle_at_72%_34%,rgba(56,88,116,0.16),transparent_34%),radial-gradient(circle_at_50%_72%,rgba(255,255,255,0.94),transparent_36%)] blur-3xl" />

      <HomeContentShell>
        <div className="mx-auto grid w-[90%] items-center gap-14 md:w-[92%] xl:grid-cols-[minmax(0,460px)_minmax(0,1fr)] xl:gap-16">
          <motion.div
            className="relative z-10 max-w-xl"
            initial={{ opacity: 0, y: 42 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/10 bg-white/82 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-accent/65 shadow-[0_12px_32px_rgba(24,44,69,0.06)] backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Smart Match
            </span>

            <h2 className="mt-6 max-w-lg font-serif text-4xl leading-tight text-accent md:text-[54px]">
              Find the best fit literary agents fast.
            </h2>

            <p className="mt-6 max-w-2xl text-base leading-8 text-accent/78 md:text-lg">
              Smart Match combines a database of more than 3,300 literary agents with a matching system built for querying writers. Enter your project details and get ranked agent matches based on genre, subgenre, format, themes, comp titles, and audience. Filter by country and submission status, then save matches to your dashboard or export a ready-to-use spreadsheet.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {smartMatchBullets.map((bullet, index) => (
                <motion.div
                  key={bullet}
                  className="flex items-center gap-3 rounded-[22px] border border-white/90 bg-white/86 px-4 py-4 shadow-[0_18px_44px_rgba(24,44,69,0.08)] backdrop-blur-sm"
                  initial={{ opacity: 0, y: 26 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{
                    duration: 0.45,
                    delay: index * 0.08,
                    ease: "easeOut",
                  }}
                >
                  <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-white">
                    <Check className="h-4 w-4" />
                  </span>
                  <p className="text-sm leading-6 text-accent/78">{bullet}</p>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-6">
              <Link href="/sign-up" className="w-full sm:w-auto">
                <Button className="w-full rounded-full px-7 py-6 text-base font-semibold shadow-[0_18px_40px_rgba(56,88,116,0.26)] sm:w-auto">
                  Get started
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </Link>
              <p className="max-w-sm text-sm font-medium leading-6 text-accent/62 md:text-[15px]">
                One search can surface hundreds of relevant agents for a project.
              </p>
            </div>
          </motion.div>

          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 52 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <div className="pointer-events-none absolute -inset-4 rounded-[44px] bg-[radial-gradient(circle_at_30%_20%,rgba(112,193,202,0.24),transparent_30%),radial-gradient(circle_at_78%_74%,rgba(56,88,116,0.18),transparent_34%)] blur-2xl" />

            <div className="relative mx-auto max-w-[980px] rounded-[36px] border border-white/70 bg-white/75 p-3 shadow-[0_36px_110px_rgba(24,44,69,0.16)] ring-1 ring-accent/10 backdrop-blur-md sm:p-4">
              <div className="relative overflow-hidden rounded-[30px] border border-accent/8 bg-[#f7fafb] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
                <div className="flex items-center justify-between border-b border-accent/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(245,248,250,0.92))] px-4 py-3 sm:px-5">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#ff605c]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd44]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#00ca4e]" />
                  </div>
                  <div className="hidden rounded-full border border-accent/8 bg-white/90 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-accent/55 sm:block">
                    Smart Match
                  </div>
                </div>

                <div className="relative aspect-[1.76/1] min-h-[300px] sm:min-h-[400px] lg:min-h-[520px]">
                  <Image
                    src="/smart-match-ss.png"
                    alt="Smart Match interface showing ranked literary agent matches, match scores, submission status tags, matching genres and themes, and country and status filters."
                    fill
                    sizes="(max-width: 767px) 94vw, (max-width: 1279px) 92vw, 980px"
                    className="object-cover object-left-top"
                    priority={false}
                  />

                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02)_34%,rgba(17,33,48,0.06)_100%)]" />

                  {screenshotCallouts.map((callout) => (
                    <div
                      key={callout.label}
                      className={cn(
                        "pointer-events-none absolute max-w-[170px] rounded-2xl border border-white/90 bg-white/88 px-3 py-2 shadow-[0_16px_36px_rgba(24,44,69,0.14)] backdrop-blur-md sm:max-w-[200px] sm:px-4 sm:py-3",
                        callout.className
                      )}
                    >
                      <div className="relative">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent/54">
                          {callout.label}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-accent/72 sm:text-[13px]">
                          {callout.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </HomeContentShell>
    </section>
  );
};

export default SmartMatchSection;
