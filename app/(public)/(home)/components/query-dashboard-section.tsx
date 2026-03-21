"use client";

import { motion } from "framer-motion";
import { Check, LayoutDashboard } from "lucide-react";
import Image from "next/image";
import HomeContentShell from "./home-content-shell";

const dashboardBullets = [
  "Save all matches or selected agents instantly",
  "Track multiple manuscripts at once",
  "Add notes, fit ratings, and query readiness",
  "See how many days it has been since a query or request was sent",
  "Filter by project, fit, and submission status",
] as const;

const dashboardCallouts = [
  {
    title: "Multi-book tracking",
    description: "Project tags, fit level, readiness, and notes stay connected.",
    className: "left-[4%] bottom-[8%] sm:left-[5%] sm:bottom-[10%]",
  },
  {
    title: "Submission timing",
    description: "Track how long it has been since each query or request was sent.",
    className: "right-[4%] bottom-[8%] text-right sm:right-[5%] sm:bottom-[10%]",
  },
] as const;

const QueryDashboardSection = () => {
  return (
    <section className="relative w-full overflow-hidden py-24 md:py-28 lg:py-32">
      <div className="pointer-events-none absolute inset-x-0 top-4 -z-10 mx-auto h-[820px] w-[min(1380px,100vw)] bg-[radial-gradient(circle_at_28%_34%,rgba(250,242,232,0.9),transparent_30%),radial-gradient(circle_at_72%_28%,rgba(112,193,202,0.14),transparent_26%),radial-gradient(circle_at_58%_72%,rgba(56,88,116,0.12),transparent_30%)] blur-3xl" />

      <HomeContentShell>
        <div className="mx-auto grid w-full min-w-0 items-center gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(0,460px)] xl:gap-16">
          <motion.div
            className="relative order-2 min-w-0 xl:order-1"
            initial={{ opacity: 0, y: 52 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <div className="pointer-events-none absolute -inset-4 rounded-[44px] bg-[radial-gradient(circle_at_24%_24%,rgba(250,242,232,0.94),transparent_32%),radial-gradient(circle_at_84%_74%,rgba(112,193,202,0.2),transparent_34%)] blur-2xl" />

            <div className="relative mx-auto w-full max-w-[1020px] rounded-[38px] border border-white/80 bg-white/88 p-2.5 shadow-[0_36px_110px_rgba(24,44,69,0.14)] ring-1 ring-accent/8 backdrop-blur-md sm:p-4">
              <div className="relative overflow-hidden rounded-[32px] border border-[#ece8e1] bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
                <div className="flex items-center justify-between border-b border-[#ece8e1] bg-white px-4 py-3 sm:px-5">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#ff605c]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd44]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#00ca4e]" />
                  </div>
                  <div className="hidden rounded-full border border-[#e7ddd1] bg-white/88 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-accent/55 sm:block">
                    Query Dashboard
                  </div>
                </div>

                <div className="relative aspect-[1.72/1] min-h-[280px] sm:min-h-[420px] lg:min-h-[540px]">
                  <Image
                    src="/query-dashboard-ss.png"
                    alt="Query Dashboard showing saved literary agent matches organized by submission status, manuscript readiness, notes, fit level, project name, and request progress."
                    fill
                    sizes="(max-width: 767px) 94vw, (max-width: 1279px) 92vw, 1020px"
                    className="object-cover object-[-175px_top]"
                    priority={false}
                  />

                  {/* {dashboardCallouts.map((callout) => (
                    <div
                      key={callout.title}
                      className={`pointer-events-none absolute z-20 hidden max-w-[180px] rounded-2xl border border-white/90 bg-white/88 px-3 py-2 shadow-[0_16px_36px_rgba(24,44,69,0.14)] backdrop-blur-md sm:block sm:max-w-[210px] sm:px-4 sm:py-3 ${callout.className}`}
                    >
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent/54">
                        {callout.title}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-accent/72 sm:text-[13px]">
                        {callout.description}
                      </p>
                    </div>
                  ))} */}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="relative z-10 order-1 min-w-0 max-w-xl xl:order-2"
            initial={{ opacity: 0, y: 42 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/10 bg-white/82 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-accent/65 shadow-[0_12px_32px_rgba(24,44,69,0.06)] backdrop-blur-sm">
              <LayoutDashboard className="h-3.5 w-3.5" />
              Query Dashboard
            </span>

            <h2 className="mt-6 max-w-lg font-serif text-4xl leading-tight text-accent md:text-[54px]">
              Stop building spreadsheets just to stay organized.
            </h2>

            <p className="mt-6 max-w-2xl text-base leading-8 text-accent/78 md:text-lg">
              Save your Smart Match results in one click and manage your entire query process from one dashboard. Track submissions, pages requested, fit level, manuscript readiness, project names, notes, and status across multiple books - without maintaining a manual spreadsheet.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {dashboardBullets.map((bullet, index) => (
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

            <p className="mt-8 max-w-md text-sm font-medium leading-6 text-accent/62 md:text-[15px]">
              Everything stays organized from first query to final response.
            </p>
          </motion.div>
        </div>
      </HomeContentShell>
    </section>
  );
};

export default QueryDashboardSection;
