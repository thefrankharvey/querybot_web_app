"use client";

import HomeContentShell from "@/app/(public)/(home)/components/home-content-shell";
import SubscriptionDetails from "./components/subscription-details";
import { CompareCompetitors } from "./components/compare-competitors";
import { SubscriptionFAQs } from "./components/subscription-faqs";

const Subscription = () => {
  return (
    <div className="relative overflow-hidden pb-28 pt-8 md:pt-14">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 mx-auto h-[620px] w-[min(1260px,100vw)] bg-[radial-gradient(circle_at_22%_18%,rgba(112,193,202,0.18),transparent_30%),radial-gradient(circle_at_76%_22%,rgba(56,88,116,0.14),transparent_30%),radial-gradient(circle_at_52%_58%,rgba(255,255,255,0.92),transparent_44%)] blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 top-[38%] -z-10 mx-auto h-[760px] w-[min(1320px,100vw)] bg-[radial-gradient(circle_at_28%_30%,rgba(250,242,232,0.84),transparent_28%),radial-gradient(circle_at_72%_34%,rgba(112,193,202,0.14),transparent_30%),radial-gradient(circle_at_58%_72%,rgba(56,88,116,0.1),transparent_34%)] blur-3xl" />

      <HomeContentShell className="flex flex-col gap-24 md:gap-28">
        <SubscriptionDetails />
        <CompareCompetitors />
        <SubscriptionFAQs />
      </HomeContentShell>
    </div>
  );
};

export default Subscription;
