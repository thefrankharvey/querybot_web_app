import { AgentMatch } from "@/app/context/agent-matches-context";
import { Button } from "@/app/ui-primitives/button";
import Link from "next/link";
import React from "react";

const SubscriberOptions = ({
  hasAgentMatches,
}: {
  hasAgentMatches: AgentMatch[];
}) => {
  return (
    <>
      <div className="w-full md:w-3/4 mx-auto flex flex-col items-center pt-16">
        <h1 className="text-[24px] md:text-[32px] mb-8 font-semibold leading-tight text-center">
          Welcome Write Query Hook Subscriber!
          <br />
        </h1>
        <div className="flex flex-col md:flex-row gap-8 mt-8 w-full justify-center">
          <Link href="/smart-match">
            <Button className="cursor-pointer text-xl p-8 font-semibold w-full md:w-auto shadow-lg hover:shadow-xl">
              Smart Match
            </Button>
          </Link>
          <Link href="/slush-feed">
            <Button className="cursor-pointer text-xl p-8 font-semibold w-full md:w-auto shadow-lg hover:shadow-xl">
              Dispatch
            </Button>
          </Link>
          {hasAgentMatches && hasAgentMatches.length > 0 && (
            <Link href="/agent-matches">
              <Button className="cursor-pointer text-xl p-8 font-semibold w-full md:w-auto shadow-lg hover:shadow-xl">
                Full Agent Results
              </Button>
            </Link>
          )}
          <Link href="/profile/saved-match">
            <Button className="cursor-pointer text-xl p-8 font-semibold w-full md:w-auto shadow-lg hover:shadow-xl">
              Profile
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
};

export default SubscriberOptions;
