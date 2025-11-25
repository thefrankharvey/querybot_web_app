"use client";

import { useClerkUser } from "../hooks/use-clerk-user";
import { getFromLocalStorage } from "../utils";
import Spinner from "../components/spinner";
import { useState, useEffect } from "react";
import { initializeSubscription } from "../actions/subscription-actions";
import { useRouter } from "next/navigation";
import SubscriberOptions from "./components/subscriber-options";
import { MONTHLY_SUB_PRICE_ID, YEARLY_SUB_PRICE_ID } from "../constants";
import SubscriptionCard from "./components/subscription-card";
import SubscriptionDetails from "./components/subscription-details";

const Subscription = () => {
  const router = useRouter();
  const { isSubscribed, isLoading, user } = useClerkUser();
  const hasAgentMatches = getFromLocalStorage("agent_matches");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Check for success/cancel params from Stripe redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("success") === "true") {
      setMessage({
        type: "success",
        text: "Subscription successful! Welcome to Write Query Hook!",
      });
    } else if (urlParams.get("canceled") === "true") {
      setMessage({
        type: "error",
        text: "Subscription was canceled. You can try again anytime.",
      });
    }
  }, []);

  const handleSubscribe = async (priceId: string) => {
    if (!user) {
      router.push("/sign-in");
      return;
    }

    setIsSubscribing(true);
    setMessage(null);

    try {
      const result = await initializeSubscription(
        user.id,
        user.emailAddresses[0]?.emailAddress || "",
        priceId
      );

      if (result.success && result.url) {
        // Redirect to Stripe Checkout
        window.location.href = result.url;
      } else {
        setMessage({
          type: "error",
          text:
            result.error ||
            "Failed to initialize subscription. Please try again.",
        });
      }
    } catch (error) {
      console.error("Subscription error:", error);
      setMessage({
        type: "error",
        text: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="pt-20 flex justify-center items-center">
        <Spinner size={100} />
      </div>
    );
  }

  return (
    <div className="pt-12 flex flex-col gap-4 items-center">
      {isSubscribed ? (
        <SubscriberOptions hasAgentMatches={hasAgentMatches || []} />
      ) : (
        <>
          <SubscriptionDetails />

          <div className="flex flex-col gap-2 items-center mt-8 mb-8">
            <h1 className="text-2xl font-semibold text-accent">
              Choose a plan that works for you.
            </h1>
          </div>
          <div className="flex flex-col md:flex-row gap-16 w-full items-center justify-center">
            <SubscriptionCard
              message={message}
              isMonthly={true}
              priceId={MONTHLY_SUB_PRICE_ID}
              handleSubscribe={handleSubscribe}
              isSubscribing={isSubscribing}
            />
            <SubscriptionCard
              message={message}
              isMonthly={false}
              priceId={YEARLY_SUB_PRICE_ID}
              handleSubscribe={handleSubscribe}
              isSubscribing={isSubscribing}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Subscription;
