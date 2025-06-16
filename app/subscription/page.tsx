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
      {hasProPlan ? (
        <>
          <div className="w-full md:w-3/4 mx-auto flex flex-col items-center">
            <h1 className="text-[24px] md:text-[40px] font-extrabold leading-tight text-left md:text-center">
              Congrats, you&apos;re a Slushwire Pro Subscriber!
              <br />
              Check out your full agent search results now!
            </h1>
            <div className="flex flex-col md:flex-row gap-4 mt-8">
              <Link href="/query-form">
                <Button className="cursor-pointer text-xl p-8 font-semibold w-full md:w-auto">
                  Find Agents
                </Button>
              </Link>
              {hasAgentMatches && hasAgentMatches.length > 0 && (
                <Link href="/agent-matches">
                  <Button className="cursor-pointer text-xl p-8 font-semibold w-full md:w-auto">
                    SEE FULL AGENT RESULTS
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="pt-20 pb-4 w-full md:w-1/2 mx-auto text-left">
            <h1 className="text-[24px] md:text-[40px] font-extrabold leading-tight">
              Unlock Your Publishing Breakthrough
            </h1>
            <p className="text-xl mt-4">
              Get real-time industry updates, proven query strategies, and
              instant access to the largest, most comprehensive agent
              database—tailored to your book. Find the right agent, at the right
              moment, with the only tool built by authors for authors.
            </p>
          </div>
          <div className="w-1/2 mx-auto">
            <PricingTable />
          </div>
        </>
      )}
    </div>
  );
}
