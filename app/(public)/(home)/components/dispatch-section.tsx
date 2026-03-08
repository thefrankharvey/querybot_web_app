"use client";

import { motion } from "framer-motion";
import { Check, Newspaper } from "lucide-react";
import Image from "next/image";
import HomeContentShell from "./home-content-shell";

const dispatchBullets = [
  "Track agent open and closed status changes",
  "Surface MSWL and preference updates",
  "Collect AMA takeaways and query tips",
  "Keep relevant publishing intel in one feed",
] as const;

const dispatchTags = [
  {
    label: "Query tip",
    className:
      "right-[7%] bottom-[10%] sm:right-[9%] sm:bottom-[12%]",
  },
] as const;

const editorialCards = [
  {
    source: "Agent intel",
    headline: "Submission windows move fast. Dispatch keeps the changes visible.",
    className: "left-[7%] top-[22%] max-w-[220px] sm:max-w-[250px]",
  },
  {
    source: "WQH Dispatch",
    headline: "One feed for openings, wishlist shifts, AMA notes, and practical advice.",
    className: "right-[6%] bottom-[22%] max-w-[210px] text-right sm:max-w-[250px]",
  },
] as const;

const DispatchSection = () => {
  return (
    <section className="relative w-full overflow-hidden py-24 md:py-28 lg:py-32">
      <div className="pointer-events-none absolute inset-x-0 top-6 -z-10 mx-auto h-[820px] w-[min(1380px,100vw)] bg-[radial-gradient(circle_at_24%_26%,rgba(250,242,232,0.92),transparent_30%),radial-gradient(circle_at_74%_28%,rgba(112,193,202,0.16),transparent_28%),radial-gradient(circle_at_62%_78%,rgba(56,88,116,0.12),transparent_32%)] blur-3xl" />

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
              <Newspaper className="h-3.5 w-3.5" />
              Dispatch
            </span>

            <h2 className="mt-6 max-w-lg font-serif text-4xl leading-tight text-accent md:text-[54px]">
              Stay current as the industry changes.
            </h2>

            <p className="mt-6 max-w-2xl text-base leading-8 text-accent/78 md:text-lg">
              Dispatch brings together real-time publishing intel inside Write Query Hook, so writers can keep up with agent openings, MSWL updates, AMA moments, and practical query advice in one place. Instead of finding out too late, you can adjust your strategy as information changes.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {dispatchBullets.map((bullet, index) => (
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
              The signal stays usable, current, and easy to act on.
            </p>
          </motion.div>

          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 52 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <div className="pointer-events-none absolute -inset-4 rounded-[44px] bg-[radial-gradient(circle_at_30%_20%,rgba(112,193,202,0.22),transparent_32%),radial-gradient(circle_at_84%_70%,rgba(56,88,116,0.18),transparent_34%)] blur-2xl" />

            <div className="relative mx-auto max-w-[1000px] rounded-[38px] border border-white/80 bg-white/88 p-3 shadow-[0_36px_110px_rgba(24,44,69,0.14)] ring-1 ring-accent/8 backdrop-blur-md sm:p-4">
              <div className="relative overflow-hidden rounded-[32px] border border-[#ece8e1] bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
                <div className="flex items-center justify-between border-b border-[#ece8e1] bg-white px-4 py-3 sm:px-5">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#ff605c]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd44]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#00ca4e]" />
                  </div>
                  <div className="hidden rounded-full border border-[#e7ddd1] bg-white/88 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-accent/55 sm:block">
                    Dispatch
                  </div>
                </div>

                <div className="relative aspect-[1.76/1] min-h-[300px] overflow-hidden sm:min-h-[400px] lg:min-h-[520px]">
                  <div className="absolute inset-y-0 left-0 w-[124%] -translate-x-[30%] sm:w-[121%] sm:-translate-x-[26%] lg:w-[118%] lg:-translate-x-[24%]">
                    <Image
                      src="/dispatch-ss.png"
                      alt="Dispatch feed showing publishing updates, submission openings, wishlist changes, AMA takeaways, and query advice inside Write Query Hook."
                      fill
                      sizes="(max-width: 767px) 124vw, (max-width: 1279px) 118vw, 1240px"
                      className="object-cover object-left-top"
                      priority={false}
                    />
                  </div>

                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02)_38%,rgba(17,33,48,0.12)_100%)]" />

                  {dispatchTags.map((tag) => (
                    <div
                      key={tag.label}
                      className={`pointer-events-none absolute rounded-full border border-white/92 bg-white/90 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-accent/65 shadow-[0_10px_28px_rgba(24,44,69,0.12)] backdrop-blur-md sm:px-3.5 sm:text-[11px] ${tag.className}`}
                    >
                      {tag.label}
                    </div>
                  ))}

                  {editorialCards.map((card) => (
                    <div
                      key={card.headline}
                      className={`pointer-events-none absolute rounded-[24px] border border-white/88 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(249,247,243,0.9))] px-4 py-4 shadow-[0_18px_40px_rgba(24,44,69,0.14)] backdrop-blur-md sm:px-5 sm:py-5 ${card.className}`}
                    >
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent/52">
                        {card.source}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-accent/82 sm:text-[15px]">
                        {card.headline}
                      </p>
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

export default DispatchSection;
