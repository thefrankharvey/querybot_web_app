import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/ui-primitives/accordion";
import { DatabaseZap, MailCheck, Newspaper, ScanSearch } from "lucide-react";
import React from "react";

const SubscriptionDetails = () => {
  return (
    <div className="pb-4 w-full md:w-3/4 mx-auto text-left">
      <h1 className="text-[22px] md:text-[30px] font-semibold leading-tight text-center">
        What You Get with a Write Query Hook Subscription:
      </h1>
      <div className="w-fit mx-auto flex flex-col mt-8" id="content">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="smart-match">
            <AccordionTrigger className="[&>svg]:text-accent">
              <div className="text-base font-normal flex gap-3 items-center">
                <ScanSearch className="w-8 h-8" />{" "}
                <span>
                  <span className="font-semibold bg-accent px-2 py-1 mr-1 rounded-md">
                    Smart Match
                  </span>
                  finds agents tailored specifically to your work
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-4 font-normal text-base ml-2 md:ml-11 w-full md:w-[450px]">
                <div className="flex gap-3 items-center">
                  <span className="text-xl">✅</span>
                  <span>
                    Smart agent ranking & scores agents for your who can serve
                    your project best
                  </span>
                </div>
                <div className="flex gap-3 items-center">
                  <span className="text-xl">✅</span>
                  <span>
                    Real, actionable insights, not just another pile of names
                  </span>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="slushwire-dispatch">
            <AccordionTrigger className="[&>svg]:text-accent">
              <div className="text-base font-normal flex gap-3 items-center">
                <Newspaper className="w-8 h-8" />
                <span>
                  <span className="font-semibold bg-accent px-2 py-1 mr-1 rounded-md">
                    Dispatch
                  </span>
                  provides a real time industry news feed
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-4 font-normal text-base ml-2 md:ml-11 w-full md:w-[450px]">
                <div className="flex gap-3 items-center">
                  <span className="text-xl">✅</span>
                  <span>
                    Your Secret Weapon, Get daily real-time updates from top
                    industry sources
                  </span>
                </div>
                <div className="flex gap-3 items-center">
                  <span className="text-xl">✅</span>
                  <span>
                    Recently Active Agents, know who&apos;s actively seeking
                    queries so you pitch at the right time
                  </span>
                </div>
                <div className="flex gap-3 items-center">
                  <span className="text-xl">✅</span>
                  <span>
                    Monitor Multiple Platforms, Essential updates from across
                    social media and professional platforms
                  </span>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="agent-database">
            <AccordionTrigger className="[&>svg]:text-accent">
              <div className="text-base font-normal flex gap-3 items-center">
                <DatabaseZap className="w-8 h-8" />{" "}
                <div>
                  <span className="font-semibold bg-accent px-2 py-1 mr-1 rounded-md">
                    The largest data base
                  </span>
                  of literary agents in existence
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-4 font-normal text-base ml-2 md:ml-11 w-full md:w-[450px]">
                <div className="flex gap-3 items-center">
                  <span className="text-xl">✅</span>
                  <span>
                    The most comprehensive agent database (bigger than the
                    &quot;Big Two&quot;)
                  </span>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="weekly-newsletter">
            <AccordionTrigger className="[&>svg]:text-accent">
              <div className="text-base font-normal flex gap-3 items-center">
                <MailCheck className="w-8 h-8" />
                <div>
                  <span className="font-semibold bg-accent px-2 py-1 mr-1 rounded-md">
                    Weekly email newsletter
                  </span>
                  of curated industry intel
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-4 font-normal text-base ml-2 md:ml-11 w-full md:w-[450px]">
                <div className="flex gap-3 items-center">
                  <span className="text-xl">✅</span>
                  <span>
                    Unmissable Industry Threads, The top agent AMAs, real
                    guidance, success stories, and insider analysis
                  </span>
                </div>
                <div className="flex gap-3 items-center">
                  <span className="text-xl">✅</span>
                  <span>
                    Unlock Submission Strategies, Proven tips &amp; tactics for
                    crafting pitches, synopses, and queries that hook
                  </span>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      {/* <p className="text-base font-medium text-center w-full md:w-[550px] mx-auto p-4">
        We&apos;re just getting started! We have a lot of new features in the
        pipeline. Get early access with Write Query Hook!
      </p> */}
    </div>
  );
};

export default SubscriptionDetails;
