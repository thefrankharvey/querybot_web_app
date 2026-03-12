"use client";

import { motion } from "framer-motion";
import HomeContentShell from "./home-content-shell";

const stats = [
  "3,300+ agents in database",
  "Built specifically for querying writers",
  "Multiple manuscript support",
  "Export-ready spreadsheet",
  "Real-time industry updates",
] as const;

const TrustStatsSection = () => {
  return (
    <section className="relative w-full pt-16">
      <HomeContentShell>
        <div className="mx-auto w-full">
          <motion.div
            className="rounded-[32px] border border-white/80 bg-white/72 p-5 shadow-[0_22px_58px_rgba(24,44,69,0.08)] backdrop-blur-sm sm:p-6 lg:p-7"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {stats.map((stat) => (
                <div
                  key={stat}
                  className="rounded-[22px] border border-accent/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(247,250,251,0.86))] px-4 py-4 text-center text-sm font-medium leading-6 text-accent/72 sm:px-5"
                >
                  {stat}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </HomeContentShell>
    </section>
  );
};

export default TrustStatsSection;
