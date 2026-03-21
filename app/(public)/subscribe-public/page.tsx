"use client";

import SubscriptionDetails from "./components/subscription-details";
import { CompareCompetitors } from "./components/compare-competitors";
import { SubscriptionFAQs } from "./components/subscription-faqs";

const SubscribePublic = () => {
  return (
    <div className="flex flex-col gap-24 md:gap-28 pb-28 px-4">
      <SubscriptionDetails />
      <CompareCompetitors />
      <SubscriptionFAQs />
    </div>
  );
};

export default SubscribePublic;
