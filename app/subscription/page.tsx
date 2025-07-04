"use client";

import { PricingTable, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "../ui-primitives/button";
import { getFromLocalStorage } from "../utils";
import Spinner from "../components/spinner";
import { DatabaseZap, MailCheck, Newspaper, ScanSearch } from "lucide-react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../ui-primitives/accordion";

export default function Subscription() {
  const { has, isLoaded } = useAuth();
  const hasProPlan = has?.({ plan: "slushwire_pro" });
  const hasAgentMatches = getFromLocalStorage("agent_matches");

  if (!isLoaded) {
    return (
      <div className="pt-20 flex justify-center items-center">
        <Spinner size={100} />
      </div>
    );
  }

  // most comprehensive agent database (bigger than the "Big Two").

  return (
    <div className="pt-12 flex flex-col gap-4 items-center">
      {hasProPlan ? (
        <>
          <div className="w-full md:w-3/4 mx-auto flex flex-col items-center">
            <h1 className="text-[24px] md:text-[40px] font-semibold leading-tight text-left md:text-center">
              Welcome Slushwire Pro Subscriber!
              <br />
            </h1>
            <div className="flex flex-col md:flex-row gap-4 mt-8">
              <Link href="/query-form">
                <Button className="cursor-pointer text-xl p-8 font-semibold w-full md:w-auto shadow-lg hover:shadow-xl">
                  Smart Query
                </Button>
              </Link>
              <Link href="/slush-feed">
                <Button className="cursor-pointer text-xl p-8 font-semibold w-full md:w-auto shadow-lg hover:shadow-xl">
                  Slushwire Dispatch
                </Button>
              </Link>
              {hasAgentMatches && hasAgentMatches.length > 0 && (
                <Link href="/agent-matches">
                  <Button className="cursor-pointer text-xl p-8 font-semibold w-full md:w-auto shadow-lg hover:shadow-xl">
                    Full Agent Results
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="pb-4 w-full md:w-3/4 mx-auto text-left">
            <h1 className="text-[24px] md:text-[30px] font-semibold leading-tight text-center">
              Join the Slushwire community!
            </h1>
            <div className="w-fit mx-auto flex flex-col mt-8" id="content">
              <p className="text-xl font-bold">What you get:</p>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="smart-query">
                  <AccordionTrigger className="[&>svg]:text-accent">
                    <div className="text-base font-normal flex gap-3 items-center">
                      <ScanSearch className="w-8 h-8" />{" "}
                      <span>
                        <span className="font-semibold bg-accent px-2 py-1 mr-1 rounded-md">
                          Smart Query
                        </span>
                        finds agents tailored specifically to your work.
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col font-normal text-base ml-2 md:ml-11 w-full md:w-[450px] gap-2">
                      <span>
                        - Smart agent ranking & scores agents for your who can
                        serve your project best.
                      </span>
                      <span>
                        - Real, actionable insights, not just another pile of
                        names.
                      </span>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="slushwire-dispatch">
                  <AccordionTrigger className="[&>svg]:text-accent">
                    <div className="text-base font-normal flex gap-3 items-center">
                      <Newspaper className="w-8 h-8" />
                      <span>
                        <span className="font-semibold bg-accent px-2 py-1 mr-1 rounded-md">
                          Slushwire Dispatch
                        </span>
                        provides a real time industry news feed.
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col font-normal text-base ml-2 md:ml-11 w-full md:w-[450px]">
                      <span className="mt-2">
                        - Your Secret Weapon, Get daily real-time updates from
                        top industry sources
                      </span>
                      <span className="mt-2">
                        - Recently Active Agents, know who&apos;s actively
                        seeking queries so you pitch at the right time
                      </span>
                      <span className="mt-2">
                        - Monitor Multiple Platforms, Essential updates from
                        across social media and professional platforms
                      </span>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="agent-database">
                  <AccordionTrigger className="[&>svg]:text-accent">
                    <div className="text-base font-normal flex gap-3 items-center">
                      <DatabaseZap className="w-8 h-8" /> The largest data base
                      of literary agents in the industry.
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col font-normal text-base ml-2 md:ml-11 w-full md:w-[450px]">
                      <span>
                        - The most comprehensive agent database (bigger than the
                        &quot;Big Two&quot;).
                      </span>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="weekly-newsletter">
                  <AccordionTrigger className="[&>svg]:text-accent">
                    <div className="text-base font-normal flex gap-3 items-center">
                      <MailCheck className="w-8 h-8" />
                      Weekly email newsletter of curated industry intel.
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col font-normal text-base ml-2 md:ml-11 w-full md:w-[450px] gap-2">
                      <span>
                        - Unmissable Industry Threads, The top agent AMAs, real
                        guidance, success stories, and insider analysis
                      </span>
                      <span>
                        - Unlock Submission Strategies, Proven tips &amp;
                        tactics for crafting pitches, synopses, and queries that
                        hook
                      </span>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
            <p className="text-base font-normal text-left w-full md:w-[550px] mx-auto p-4 pb-0">
              And we&apos;re just getting started! We have a lot of new features
              in the pipeline. Get early access with Slushwire Pro!
            </p>
          </div>
          <div className="w-full md:w-[450px] mx-auto">
            <PricingTable
              appearance={{
                elements: {
                  pricingTableCardFooterButton: {
                    fontSize: 16,
                    padding: "16px",
                    textTransform: "none",
                    backgroundColor: "#F77AE8",
                    fontWeight: "semibold",
                    border: "none",
                    color: "black",
                    "&:hover, &:focus, &:active": {
                      color: "white",
                      backgroundColor: "#F77AE8",
                    },
                  },
                  pricingTableCardTitleContainer: {
                    justifyContent: "center",
                  },
                  pricingTableCardTitle: {
                    fontSize: 24,
                    fontWeight: "semibold",
                  },
                  pricingTableCardDescription: {
                    fontSize: 16,
                    color: "black",
                    fontWeight: "normal",
                  },
                  pricingTableCardFee: {
                    fontSize: 32,
                    fontWeight: "semibold",
                    color: "black",
                  },
                  pricingTableCardFeePeriod: {
                    fontSize: 16,
                    color: "black",
                    fontWeight: "normal",
                  },
                  pricingTableCardFeePeriodNotice: {
                    fontSize: 12,
                    color: "black",
                    fontWeight: "normal",
                  },
                },
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}
