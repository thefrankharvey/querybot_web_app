"use client";

import { agentDemoData } from "@/app/constants";
import React from "react";
import { motion } from "framer-motion";
import DisplayAgentCards from "./display-agent-cards";
import { Button } from "@/app/ui-primitives/button";
import Link from "next/link";

const displayCardMocks = [
  {
    countryCode: "US" as const,
    isSaved: true,
    matchingGenres: [
      "Literary Fiction",
      "Contemporary",
      "Upmarket",
      "Book Club Fiction",
      "Character-Driven",
    ],
    matchingThemes: [
      "Family secrets",
      "Identity",
      "Belonging",
      "Generational trauma",
      "Moral ambiguity",
    ],
  },
  {
    countryCode: "GB" as const,
    isSaved: false,
    matchingGenres: [
      "Romance",
      "Women's Fiction",
      "Commercial Fiction",
      "Contemporary Romance",
    ],
    matchingThemes: [
      "Second chance love",
      "Grief and healing",
      "Found purpose",
      "Self-discovery",
      "Workplace tension",
    ],
  },
  {
    countryCode: "CA" as const,
    isSaved: false,
    matchingGenres: [
      "Speculative",
      "Magical Realism",
      "Science Fiction",
      "Dystopian",
      "Literary Speculative",
    ],
    matchingThemes: [
      "Memory",
      "Climate anxiety",
      "Hope",
      "Collective resilience",
    ],
  },
];

const SmartMatchBlock = () => {
  return (
    <div>
      <div className="pt-40 pb-10 md:pt-60 md:pb-20 w-full md:w-[85%] mx-auto text-left md:text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h1 className="text-2xl md:text-[40px] leading-normal text-accent">
            Find the best agents for
            <br className="md:hidden visible" />{" "}
            <span className="bg-accent text-white p-1 px-3 rounded-xl font-semibold">
              your writing
            </span>.{" "}
            <br className="md:visible hidden" />
            We rank agents by how well they match your work. Save all of your matches or just your favorites with one click.
          </h1>
        </motion.div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {agentDemoData.map((match, index: number) => (
          <motion.div
            key={index}
            className="h-full"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{
              duration: 0.6,
              delay: index * 0.15,
              ease: "easeOut",
            }}
          >
            {(() => {
              const mockData = displayCardMocks[index % displayCardMocks.length];
              const openAgent = { ...match, status: "open" };
              return (
                <DisplayAgentCards
                  agent={openAgent}
                  index={index}
                  id={`agent-${index}`}
                  isLoading={false}
                  isSubscribed
                  isSaved={mockData.isSaved}
                  mockCountryCode={mockData.countryCode}
                  mockMatchingGenres={mockData.matchingGenres}
                  mockMatchingThemes={mockData.matchingThemes}
                />
              );
            })()}
          </motion.div>
        ))}
      </div>
      <div className="flex justify-center w-full">
        <Link href="/sign-up" className="w-full md:w-fit">
          <Button className="cursor-pointer w-full md:w-fit md:text-3xl text-2xl p-8 font-semibold mt-12 shadow-lg hover:shadow-xl">
            TRY FOR FREE
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default SmartMatchBlock;
