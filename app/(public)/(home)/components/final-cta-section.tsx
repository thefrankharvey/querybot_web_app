"use client";

import { Button } from "@/app/ui-primitives/button";
import { motion } from "framer-motion";
import Link from "next/link";
import HomeContentShell from "./home-content-shell";

const FinalCtaSection = () => {
  return (
    <section className="relative w-full overflow-hidden pb-28 pt-8">
      <div className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 mx-auto h-[520px] w-[min(980px,92vw)] -translate-y-1/2 bg-[radial-gradient(circle_at_50%_50%,rgba(112,193,202,0.16),transparent_34%),radial-gradient(circle_at_50%_64%,rgba(56,88,116,0.12),transparent_42%),radial-gradient(circle_at_50%_48%,rgba(255,255,255,0.82),transparent_54%)] blur-3xl" />

      <HomeContentShell>
        <motion.div
          className="mx-auto flex w-[90%] flex-col items-center rounded-[36px] border border-white/80 bg-white/58 px-6 py-14 text-center shadow-[0_28px_72px_rgba(24,44,69,0.08)] backdrop-blur-sm md:w-[92%] md:px-10 md:py-16"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <div className="max-w-3xl">
            <h2 className="font-serif text-4xl leading-tight text-accent md:text-[56px]">
              Query smarter from the start.
            </h2>
            <p className="mt-6 text-base leading-8 text-accent/76 md:text-lg">
              Find the best fit agents, track every submission, and stay current - all in one place.
            </p>
          </div>

          <Link href="/sign-up" className="mt-10">
            <Button className="rounded-full px-8 py-6 text-base font-semibold shadow-[0_20px_44px_rgba(56,88,116,0.22)]">
              Start free
            </Button>
          </Link>
        </motion.div>
      </HomeContentShell>
    </section>
  );
};

export default FinalCtaSection;
