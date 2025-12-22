import { useState } from "react";
import { initializeSubscription } from "../actions/subscription-actions";
import { useClerkUser } from "./use-clerk-user";

export const useStripeSubscribe = () => {
  const [isSubscribing, setIsSubscribing] = useState(false);
  const { user } = useClerkUser();

  const handleSubscribe = async (priceId: string) => {
    setIsSubscribing(true);
    try {
      const result = await initializeSubscription(
        user?.id || "",
        user?.emailAddresses[0]?.emailAddress || "",
        priceId
      );

      if (result.success && result.url) {
        // Redirect to Stripe Checkout
        window.location.href = result.url;
      }
    } catch (error) {
      console.error("Subscription error:", error);
    } finally {
      setIsSubscribing(false);
    }
  };

  return {
    isSubscribing,
    handleSubscribe,
  };
};
