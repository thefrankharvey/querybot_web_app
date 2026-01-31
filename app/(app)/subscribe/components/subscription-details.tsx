import React, { useState } from "react";
import { Button } from "@/app/ui-primitives/button";
import { Switch } from "@/app/ui-primitives/switch";
import { MONTHLY_SUB_PRICE_ID, YEARLY_SUB_PRICE_ID } from "@/app/constants";
import { motion } from "framer-motion";
import { useClerkUser } from "@/app/hooks/use-clerk-user";
import { Spinner } from "@/app/ui-primitives/spinner";
import { useStripeSubscribe } from "@/app/hooks/use-stripe-subscribe";
import { Check } from "lucide-react";

const smartMatchCopy = [
  {
    textDefault: "Matches you with over 3,200 agents",
    textHover: "The internets largest agent database",
  },
  {
    textDefault: "Agents matched to your manuscript",
    textHover: "Target agents precisely",
  },
  {
    textDefault: "Agent scores based on your query",
    textHover: "Improve your request rate",
  },
  {
    textDefault: "Best-fit results instantly",
    textHover: "Skip months of research",
  },
];

const dispatchCopy = [
  {
    textDefault: "Daily news feed across multiple sources",
    textHover: "Monitor the industry in real time",
  },
  {
    textDefault: "Agent openings alerts",
    textHover: "Know when to query",
  },
  {
    textDefault: "Query tips & industry news",
    textHover: "Level up your query",
  },
  {
    textDefault: "MSWL & wishlist tracking",
    textHover: "Never miss an opportunity",
  },
];

const slushwireBlogCopy = [
  {
    textDefault: "Weekly newsletter delivered to your inbox",
    textHover: "Stay updated",
  },
  {
    textDefault: "Curated industry intel delivered to your inbox",
    textHover: "We scan the industry",
  },
];

type HoverListItemProps = {
  textDefault: string;
  textHover: string;
};

const HoverListItem = ({ textDefault, textHover }: HoverListItemProps) => (
  <li className="list-disc group overflow-hidden leading-snug flex items-center min-h-14">
    <div className="grid relative cursor-pointer">
      <span className="col-start-1 row-start-1 w-full transition-all duration-400 ease-out group-hover:-translate-y-1.5 group-hover:opacity-0">
        <div className="flex items-center">
          <Check className="w-6 h-6 min-w-6 min-h-6 mr-4 shrink-0" />
          {textDefault}
        </div>
      </span>
      <span className="col-start-1 row-start-1 w-full translate-y-2 opacity-0 transition-all duration-400 ease-out group-hover:translate-y-0 group-hover:opacity-100">
        <div className="flex items-center">
          <Check className="w-6 h-6 min-w-6 min-h-6 mr-4 shrink-0" />
          {textHover}
        </div>
      </span>
    </div>
  </li>
);
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
        <Spinner className="size-16 text-accent" />
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
        <h1 className="text-4xl md:text-[40px] font-semibold leading-tight text-accent text-center mb-5">
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
        <div className="flex flex-col gap-4 bg-white rounded-lg p-4 md:p-10 w-full mx-auto shadow-xl justify-center items-center mt-4 border-2 border-accent">
          <h1 className="text-2xl md:text-3xl leading-tight text-accent mt-6 w-[95%] mx-auto md:text-center text-left">
            The all in one system that finds{" "}
            <span className="font-semibold">your best-fit</span> agents, tracks
            the industry in <span className="font-semibold">real time</span>,
            and keeps you ahead of every opportunity.
          </h1>
          <div className="flex flex-col md:flex-row gap-24 w-full items-center justify-center mt-10 mb-10">
            <div className="flex flex-col justify-start items-center w-full">
              <div className="flex items-baseline justify-center mb-10">
                <h3 className="text-5xl font-bold">
                  {isYearly ? "$30" : "$7"}
                </h3>
                <p className="text-gray-600 text-base">
                  {isYearly ? "year" : "month"}
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 mb-6 w-full">
                <Switch onToggle={handleToggle} />
                <p className="text-sm">Billed yearly</p>
              </div>

              <Button
                className="w-full md:w-[250px] md:text-3xl text-2xl p-8 font-semibold shadow-lg hover:shadow-xl"
                onClick={() => handleSubscribe(priceId)}
                disabled={isLoading || isSubscribing}
              >
                SUBSCRIBE
              </Button>
            </div>
          </div>
          <div className="flex md:flex-row flex-col w-full gap-8 pt-8 pb-8">
            <div className="flex flex-col w-full">
              <span className="font-semibold text-accent text-xl pb-4 text-left ml-10">
                Smart Match
              </span>
              <ul className="list-disc gap-6 flex flex-col text-base">
                {smartMatchCopy.map((item) => (
                  <HoverListItem
                    key={item.textDefault}
                    textDefault={item.textDefault}
                    textHover={item.textHover}
                  />
                ))}
              </ul>
            </div>
            <div className="flex flex-col w-full">
              <span className="font-semibold text-accent text-xl pb-4 text-left ml-10">
                Dispatch
              </span>
              <ul className="list-disc gap-6 flex flex-col text-base">
                {dispatchCopy.map((item) => (
                  <HoverListItem
                    key={item.textDefault}
                    textDefault={item.textDefault}
                    textHover={item.textHover}
                  />
                ))}
              </ul>
            </div>
            <div className="flex flex-col w-full">
              <span className="font-semibold text-accent text-xl pb-4 text-left ml-10">
                Slushwire/Blog
              </span>
              <ul className="list-disc gap-6 flex flex-col text-base">
                {slushwireBlogCopy.map((item) => (
                  <HoverListItem
                    key={item.textDefault}
                    textDefault={item.textDefault}
                    textHover={item.textHover}
                  />
                ))}
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SubscriptionDetails;
