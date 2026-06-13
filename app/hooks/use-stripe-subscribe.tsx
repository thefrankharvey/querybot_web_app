import { useCallback, useState } from "react";
import { initializeSubscription } from "../actions/subscription-actions";
import { useClerkUser } from "./use-clerk-user";

type SubscribeOptions = {
  discountCode?: "WELCOME30";
};

type SubscribeResult = Awaited<ReturnType<typeof initializeSubscription>>;

export const useStripeSubscribe = () => {
  const [isSubscribing, setIsSubscribing] = useState(false);
  const { user } = useClerkUser();
  const userId = user?.id || "";
  const userEmail = user?.emailAddresses[0]?.emailAddress || "";

  const handleSubscribe = useCallback(
    async (
      plan: "monthly" | "yearly",
      options: SubscribeOptions = {}
    ): Promise<SubscribeResult> => {
      setIsSubscribing(true);
      try {
        const result = await initializeSubscription(
          userId,
          userEmail,
          plan,
          options.discountCode
        );

        if (result.success && result.url) {
          // Redirect to Stripe Checkout
          window.location.href = result.url;
        }

        return result;
      } catch (error) {
        console.error("Subscription error:", error);
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to initialize subscription",
        };
      } finally {
        setIsSubscribing(false);
      }
    },
    [userEmail, userId]
  );

  return {
    isSubscribing,
    handleSubscribe,
  };
};
