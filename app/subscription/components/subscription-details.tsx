import { Newspaper, ScanSearch } from "lucide-react";
import React from "react";
import { Button } from "@/app/ui-primitives/button";

const SubscriptionDetails = () => {
  return (
    <div className="pb-4 w-full md:w-3/4 mx-auto text-left">
      <h1 className="text-[22px] md:text-[30px] font-semibold leading-tight text-accent text-center mb-8">
        Query smarter. Get repped faster.
      </h1>
      <div className="flex flex-col gap-4 bg-white rounded-lg p-4 md:p-12 w-[90%] mx-auto shadow-lg justify-center items-center mt-4">
        <h1 className="text-xl font-semibold leading-tight text-center text-accent mt-6 w-[90%] mx-auto">
          The all-in-one system that finds your best-fit agents, tracks the
          industry in real time, and keeps you ahead of every opportunity.
        </h1>
        <div className="flex flex-col w-full gap-8 pt-8">
          <div className="flex flex-col w-full">
            <div className="flex justify-start items-center gap-2 mb-4">
              <ScanSearch className="w-8 h-8" />{" "}
              <span className="font-semibold text-lg">Smart Match</span>
            </div>
            <ul className="list-disc pl-5 gap-3 flex flex-col">
              <li>
                Find your best-fit agents automatically — tailored specifically
                to your manuscript.
              </li>
              <li>
                Smart Ranking & Compatibility Scores — know instantly which
                agents are most likely to request your pages.
              </li>
              <li>
                No more rabbit holes — we track 3,200+ literary agents and
                surface the strongest fits, not giant heaps of unsorted data.
              </li>
              <li>
                Fast — results land directly in your tracker, ready to query.
              </li>
            </ul>
          </div>
          <div className="flex flex-col w-full">
            <div className="flex justify-start items-center gap-2 mb-4">
              <Newspaper className="w-8 h-8" />{" "}
              <span className="font-semibold text-lg">Dispatch</span>
            </div>
            <ul className="list-disc pl-5 gap-3 flex flex-col">
              <li>
                Instant alerts — know the moment agents open or close to
                queries.
              </li>
              <li>
                Event tracking — catch wishlists, pitch contests, opportunities,
                and query tips as they drop.
              </li>
              <li>
                Always current — no more stale data or discovering an agent
                closed three weeks ago.
              </li>
              <li>
                Fast — updates land directly in your dashboard, ready to act on.
              </li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-24 w-full items-center justify-center mt-10 mb-10">
          <div className="text-center w-[200px]">
            <h3 className="text-4xl font-semibold mb-2">$7</h3>
            <p className="text-gray-600 mb-6 text-base">a month</p>

            <Button className="w-full text-lg py-6 font-semibold shadow-lg hover:shadow-xl">
              Subscribe
            </Button>
          </div>
          <div className="text-center w-[200px]">
            <h3 className="text-4xl font-semibold mb-2">$30</h3>
            <p className="text-gray-600 mb-6 text-base">a year</p>

            <Button className="w-full text-lg py-6 font-semibold shadow-lg hover:shadow-xl">
              Subscribe
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionDetails;
