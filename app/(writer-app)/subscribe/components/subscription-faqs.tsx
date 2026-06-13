"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/ui-primitives/accordion";
import { motion } from "framer-motion";

export const SubscriptionFAQs = () => {
  const faqs = [
    {
      label:
        "How is this different from QueryTracker or Publisher's Marketplace?",
      content:
        "Those tools give you a database. We give you a system. QueryTracker is a directory—you still have to do all the research, filtering, and monitoring yourself. Write Query Hook does the work for you: Smart Match ranks agents specifically for your manuscript, Dispatch tracks the industry in real time, and everything lands in one dashboard ready to act on. Less hunting, more querying.",
    },

    {
      label: "What if I'm not ready to query yet?",
      content:
        "Even better. Most writers waste their first batch of queries on the wrong agents because they didn't have time to research properly. Start now—build your list while you revise, learn who's opening and closing, and when you're ready, you'll hit the ground running instead of scrambling.",
    },
    {
      label: "How often is the data updated?",
      content:
        "Dispatch monitors sources continuously—social media, MSWLs, agency announcements—and updates flow into your feed in real time. Our 3,300+ agent database is maintained and verified regularly, so you're not querying someone who closed six months ago.",
    },

    {
      label: "What if my genre is niche or uncommon?",
      content:
        "Smart Match is built to handle specificity. The more precise you are about your manuscript, the better your results. We track agents across every major category—literary fiction, upmarket, romance, SFF, thriller, MG, YA, memoir, and more.",
    },
    {
      label: "Can I cancel anytime?",
      content:
        "Yes. One click, no questions, no hoops. If it's not working for you, you're free to go.",
    },
  ];

  return (
    <section className="relative w-full max-w-5xl mx-auto">
      <motion.div
        className="rounded-[36px] border border-white/80 bg-white/70 px-5 py-10 shadow-[0_28px_72px_rgba(24,44,69,0.08)] ring-1 ring-accent/8 backdrop-blur-sm sm:px-6 md:px-10 md:py-12"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
      >
        <div className="max-w-3xl">
          <h2 className="font-serif text-4xl leading-tight text-accent md:text-[48px]">
            FAQs
          </h2>
          <p className="mt-4 text-base leading-8 text-accent/76 md:text-lg">
            The core workflow stays simple: find better-fit agents, keep your
            submissions organized, and stay current as the market changes.
          </p>
        </div>

        <Accordion type="single" collapsible className="mt-8 w-full">
          {faqs.map((faq) => (
            <AccordionItem value={faq.label} key={faq.label}>
              <AccordionTrigger className="py-8 text-left text-lg font-semibold text-accent [&>svg]:text-accent">
                {faq.label}
              </AccordionTrigger>
              <AccordionContent className="text-base leading-8 text-accent/78 md:text-lg">
                {faq.content}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.div>
    </section>
  );
};
