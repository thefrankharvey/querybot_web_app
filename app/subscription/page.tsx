"use client";

import { PricingTable } from "@clerk/nextjs";

export default function Subscription() {
  return (
    <div className="pt-20 flex flex-col gap-4 items-center">
      <div className="pt-20 pb-10 w-1/2 mx-auto text-left">
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
    </div>
  );
}
