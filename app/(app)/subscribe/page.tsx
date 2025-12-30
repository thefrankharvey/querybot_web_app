"use client";

import SubscriptionDetails from "./components/subscription-details";
import { CompareCompetitors } from "./components/compare-competitors";
import { SubscriptionFAQs } from "./components/subscription-faqs";

const Subscription = () => {
  return (
    <div className="flex flex-col gap-40 items-center">
      <SubscriptionDetails />
      <CompareCompetitors />
      <SubscriptionFAQs />
    </div>
  );
};

export default Subscription;
