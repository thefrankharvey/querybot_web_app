"use client";

import { Button } from "@/app/ui-primitives/button";
import { motion } from "framer-motion";
import Link from "next/link";
import HomeContentShell from "./home-content-shell";
import { Sparkles } from "lucide-react";

const FinalCtaSection = () => {
  return (
    <section className="relative w-full overflow-hidden pb-68 pt-8">
      <div className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 mx-auto h-[520px] w-[min(980px,92vw)] -translate-y-1/2 bg-[radial-gradient(circle_at_50%_50%,rgba(112,193,202,0.16),transparent_34%),radial-gradient(circle_at_50%_64%,rgba(56,88,116,0.12),transparent_42%),radial-gradient(circle_at_50%_48%,rgba(255,255,255,0.82),transparent_54%)] blur-3xl" />

      <HomeContentShell>
        <motion.div
          className="mx-auto flex w-full flex-col items-center rounded-[36px] border border-white/80 bg-white/58 px-5 py-14 text-center shadow-[0_28px_72px_rgba(24,44,69,0.08)] backdrop-blur-sm sm:px-6 md:px-10 md:py-16"
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

          <div className="flex gap-4 mt-10">
            <Link href="/sign-up">
              <Button className="rounded-full px-8 py-6 text-base font-semibold shadow-[0_20px_44px_rgba(56,88,116,0.22)]">
                Start free
              </Button>
            </Link>
            <Link href="/subscribe-public" className="w-full sm:w-auto">
              <Button variant="outline" className="cursor-pointer w-full sm:w-auto text-lg px-8 py-6 font-semibold shadow-lg hover:shadow-xl">
                Subscribe
                <Sparkles className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </HomeContentShell>
    </section>
  );
};

export default FinalCtaSection;
