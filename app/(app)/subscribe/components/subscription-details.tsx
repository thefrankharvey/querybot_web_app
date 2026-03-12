"use client";

import { useState } from "react";
import { Button } from "@/app/ui-primitives/button";
import { Switch } from "@/app/ui-primitives/switch";
import { motion } from "framer-motion";
import { useClerkUser } from "@/app/hooks/use-clerk-user";
import { Spinner } from "@/app/ui-primitives/spinner";
import { useStripeSubscribe } from "@/app/hooks/use-stripe-subscribe";
import { Check, Sparkles } from "lucide-react";

const trustStats = [
  "3,300+ agents in database",
  "Built specifically for querying writers",
  "Multiple manuscript support",
  "Export-ready spreadsheet",
  "Real-time industry updates",
] as const;

const featureColumns = [
  {
    title: "Smart Match",
    items: [
      "Ranked agent matches based on your project details",
      "Country and submission-status filters that narrow the list fast",
      "One-click saving for the agents you want to pursue",
      "Export-ready spreadsheet when you want an offline list",
    ],
  },
  {
    title: "Query Dashboard",
    items: [
      "Keep every saved agent and submission in one place",
      "Track multiple manuscripts without juggling separate systems",
      "Add notes, fit ratings, and query readiness as you go",
      "See how long it has been since each query or request was sent",
    ],
  },
  {
    title: "Dispatch",
    items: [
      "Track open and closed submission status changes",
      "Catch MSWL updates and preference shifts earlier",
      "Keep AMA takeaways and query advice in view",
      "Follow relevant publishing intel in one feed",
    ],
  },
] as const;

const SubscriptionDetails = () => {
  const [isYearly, setIsYearly] = useState(false);
  const { isLoading } = useClerkUser();
  const { handleSubscribe, isSubscribing } = useStripeSubscribe();

  const handleToggle = (checked: boolean) => {
    setIsYearly(checked);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center pt-20">
        <Spinner className="size-16 text-accent" />
      </div>
    );
  }

  return (
    <section className="relative w-full pt-4 md:pt-8">
      <motion.div
        className="mx-auto max-w-4xl text-center"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{
          duration: 0.6,
          delay: 0.15,
          ease: "easeOut",
        }}
      >
        <div className="rounded-[36px] border border-white/80 bg-white/72 px-5 py-10 shadow-[0_28px_72px_rgba(24,44,69,0.1)] ring-1 ring-accent/8 backdrop-blur-md sm:px-6 sm:py-12 lg:px-10 lg:py-14">
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/10 bg-white/82 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-accent/65 shadow-[0_12px_32px_rgba(24,44,69,0.06)] backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" />
            Subscribe
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl font-serif text-4xl leading-tight text-accent md:text-[56px]">
            Find the best fit agents, stay organized, and stop missing opportunities.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-accent/78 md:text-lg">
            Get full access to Smart Match, Query Dashboard, and Dispatch so you can
            build a stronger list, track every submission, and stay current as agent
            openings and preferences change.
          </p>

          <div className="mx-auto mt-10 max-w-[440px] rounded-[30px] border border-white/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,249,250,0.94))] p-6 shadow-[0_24px_62px_rgba(24,44,69,0.12)] sm:p-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent/58">
              Full access
            </p>
            <h2 className="mt-4 font-serif text-3xl leading-tight text-accent">
              Everything you need to query smarter.
            </h2>
            <div className="mt-8 rounded-[26px] border border-accent/8 bg-[#f7fafb] px-5 py-6 text-center">
              <div className="flex items-end justify-center gap-2">
                <h3 className="text-5xl font-bold text-accent">
                  {isYearly ? "$30" : "$7"}
                </h3>
                <p className="pb-1 text-base text-accent/58">
                  / {isYearly ? "year" : "month"}
                </p>
              </div>
              <p className="mt-3 text-sm leading-6 text-accent/62">
                {isYearly
                  ? "Billed annually for the best value."
                  : "Flexible monthly access."}
              </p>
              <div className="mt-6 flex items-center justify-center gap-3">
                <Switch onToggle={handleToggle} />
                <p className="text-sm font-medium text-accent/72">
                  Billed yearly
                </p>
              </div>
            </div>

            <Button
              className="mt-8 w-full rounded-full px-7 py-6 text-base font-semibold shadow-[0_18px_40px_rgba(56,88,116,0.24)]"
              onClick={() => handleSubscribe(isYearly ? "yearly" : "monthly")}
              disabled={isLoading || isSubscribing}
            >
              Subscribe
            </Button>

            <div className="mt-6 flex flex-col gap-3 text-sm leading-6 text-accent/66">
              <p>Find stronger agent matches in less time.</p>
              <p>Keep every project and submission organized.</p>
              <p>Stay ahead of openings, MSWL shifts, and query intel.</p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {trustStats.map((stat) => (
              <div
                key={stat}
                className="rounded-full border border-accent/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(247,250,251,0.88))] px-4 py-2 text-sm font-medium leading-6 text-accent/72"
              >
                {stat}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div
        className="mt-12 rounded-[36px] border border-white/80 bg-white/64 p-5 shadow-[0_24px_60px_rgba(24,44,69,0.08)] ring-1 ring-accent/8 backdrop-blur-sm sm:p-6 lg:p-8 max-w-5xl mx-auto"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{
          duration: 0.6,
          delay: 0.2,
          ease: "easeOut",
        }}
      >
        <div className="grid gap-5 lg:grid-cols-3">
          {featureColumns.map((column, index) => (
            <motion.article
              key={column.title}
              className="rounded-[28px] border border-white/90 bg-white/86 p-5 shadow-[0_18px_44px_rgba(24,44,69,0.08)] backdrop-blur-sm"
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{
                duration: 0.45,
                delay: index * 0.08,
                ease: "easeOut",
              }}
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent/56">
                {column.title}
              </p>
              <ul className="mt-5 flex flex-col gap-4">
                {column.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm leading-6 text-accent/78"
                  >
                    <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-accent text-white">
                      <Check className="h-4 w-4" />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.article>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default SubscriptionDetails;
