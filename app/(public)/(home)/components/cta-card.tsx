"use client";

import { motion } from "framer-motion";
import HomeContentShell from "./home-content-shell";

const painCards = [
  {
    title: "Agent research takes too long",
    description:
      "The setup work can swallow hours before you send a single thoughtful query.",
  },
  {
    title: "Spreadsheets break down fast",
    description:
      "A system built by hand gets harder to trust as submissions, notes, and projects pile up.",
  },
  {
    title: "Industry information changes constantly",
    description:
      "Openings, wishlists, and query advice keep moving, which makes fragmented research easy to miss.",
  },
];

export const CtaCard = () => {
  return (
    <section className="w-full py-24 md:py-32">
      <HomeContentShell>
        <div className="mx-auto w-full rounded-[2rem] border border-accent/10 bg-white/70 px-5 py-12 shadow-[0_20px_60px_rgba(20,40,60,0.06)] backdrop-blur-sm sm:px-6 md:px-12 md:py-16 lg:px-16">
          <motion.div
            className="max-w-3xl"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h2 className="font-serif text-3xl leading-tight text-accent md:text-[40px]">
              Querying should not feel like a second job.
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-8 text-accent/80 md:text-lg">
              Most writers still manage the query process with a patchwork of
              browser tabs, notes, spreadsheets, and scattered industry updates.
              The work becomes slow and fragmented long before the actual
              querying starts.
            </p>
          </motion.div>

          <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-6">
            {painCards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.15,
                  ease: "easeOut",
                }}
              >
                <article className="flex h-full flex-col gap-5 rounded-3xl border border-accent/10 bg-white p-7 shadow-[0_12px_30px_rgba(20,40,60,0.05)] transform transition-transform duration-200 ease-out hover:-translate-y-2 md:p-8">
                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold leading-snug text-accent">
                      {card.title}
                    </h3>
                    <p className="text-base leading-7 text-accent/75">
                      {card.description}
                    </p>
                  </div>
                </article>
              </motion.div>
            ))}
          </div>
        </div>
      </HomeContentShell>
    </section>
  );
};
