"use client";

import { PricingTable, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "../ui-primitives/button";
import { getFromLocalStorage } from "../utils";

export default function Subscription() {
  const { has } = useAuth();
  const hasProPlan = has?.({ plan: "slushwire_pro" });
  const hasAgentMatches = getFromLocalStorage("agent_matches");

  return (
    <div className="pt-20 flex flex-col gap-4 items-center">
      <div className="pt-20 pb-4 w-1/2 mx-auto text-left">
        <h1 className="text-[40px] font-extrabold leading-tight">
          Unlock Your Publishing Breakthrough
        </h1>
        <p className="text-xl mt-4">
          Get real-time industry updates, proven query strategies, and instant
          access to the largest, most comprehensive agent database—tailored to
          your book. Find the right agent, at the right moment, with the only
          tool built by authors for authors.
        </p>
      </div>
      <div className="w-1/2 mx-auto">
        <PricingTable />
      </div>

      {hasProPlan && (
        <div className="w-1/2 mx-auto flex flex-col items-center">
          <p className="text-xl mt-4 mb-8 font-bold text-green-500 text-center">
            Congrats, you&apos;re in! Check out your full agents search results
            now!
          </p>
          <div className="flex gap-4">
            <Link href="/query-form">
              <Button className="cursor-pointer text-xl p-8 font-semibold">
                QUERY AGENTS
              </Button>
            </Link>
            {hasAgentMatches && hasAgentMatches.length > 0 && (
              <Link href="/agent-matches">
                <Button className="cursor-pointer text-xl p-8 font-semibold">
                  SEE FULL AGENT RESULTS
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
