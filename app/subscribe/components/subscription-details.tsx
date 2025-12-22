import React, { useState } from "react";
import { Button } from "@/app/ui-primitives/button";
import { Switch } from "@/app/ui-primitives/switch";
import { MONTHLY_SUB_PRICE_ID, YEARLY_SUB_PRICE_ID } from "@/app/constants";
import { motion } from "framer-motion";
import { useClerkUser } from "@/app/hooks/use-clerk-user";
import Spinner from "@/app/components/spinner";
import { useStripeSubscribe } from "@/app/hooks/use-stripe-subscribe";

const SubscriptionDetails = () => {
  const [isYearly, setIsYearly] = useState(false);
  const { isLoading } = useClerkUser();
  const { handleSubscribe, isSubscribing } = useStripeSubscribe();
  const priceId = isYearly ? YEARLY_SUB_PRICE_ID : MONTHLY_SUB_PRICE_ID;

  const handleToggle = (checked: boolean) => {
    setIsYearly(checked);
  };

  if (isLoading) {
    return (
      <div className="pt-20 flex justify-center items-center">
        <Spinner size={100} />
      </div>
    );
  }

  return (
    <div className="pb-4 w-full md:w-3/4 mx-auto text-left">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{
          duration: 0.6,
          delay: 0.15,
          ease: "easeOut",
        }}
      >
        <h1 className="text-[28px] md:text-[36px] font-semibold leading-tight text-accent text-center mb-8">
          Query smarter. <br className="md:hidden" />
          Get repped faster.
        </h1>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{
          duration: 0.6,
          delay: 0.2,
          ease: "easeOut",
        }}
      >
        <div className="flex flex-col gap-4 bg-white rounded-lg p-4 md:p-12 w-full mx-auto shadow-xl justify-center items-center mt-4 border-2 border-accent">
          <h1 className="text-2xl font-semibold leading-tight text-accent mt-6 w-[95%] mx-auto md:text-center text-left">
            The all in one system that finds your best-fit agents, tracks the
            industry in real time, and keeps you ahead of every opportunity.
          </h1>
          <div className="flex flex-col md:flex-row gap-24 w-full items-center justify-center mt-10 mb-10">
            <div className="flex flex-col justify-start items-center w-[200px]">
              <div className="flex items-baseline justify-center mb-8">
                <h3 className="text-5xl font-bold">
                  {isYearly ? "$30" : "$7"}
                </h3>
                <p className="text-gray-600 text-base">
                  {isYearly ? "year" : "month"}
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 mb-4 w-full">
                <Switch onToggle={handleToggle} />
                <p className="text-sm">Billed yearly</p>
              </div>

              <Button
                className="w-full text-lg py-6 font-semibold shadow-lg hover:shadow-xl"
                onClick={() => handleSubscribe(priceId)}
                disabled={isLoading || isSubscribing}
              >
                Subscribe
              </Button>
            </div>
          </div>
          <div className="flex flex-col w-full gap-8 pt-8 pb-8">
            <div className="flex flex-col w-full">
              <ul className="list-disc pl-5 gap-3 flex flex-col text-xl">
                <li>
                  <span className="font-semibold">
                    Find your best-fit agents automatically
                  </span>{" "}
                  tailored specifically to your manuscript.
                </li>
                <li>
                  <span className="font-semibold">
                    Smart Ranking & Compatibility Scores
                  </span>{" "}
                  Know instantly which agents are most likely to request your
                  pages.
                </li>
                <li>
                  <span className="font-semibold">No more rabbit holes</span> we
                  track 3,200+ literary agents and surface the strongest fits,
                  not giant heaps of unsorted data.
                </li>
                <li>
                  <span className="font-semibold">Instant alerts</span> know the
                  moment agents open or close to queries.
                </li>
                <li>
                  <span className="font-semibold">Event tracking</span> catch
                  wishlists, pitch contests, opportunities, and query tips as
                  they drop.
                </li>
                <li>
                  <span className="font-semibold">Always current</span> no more
                  stale data or discovering an agent closed three weeks ago.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SubscriptionDetails;
