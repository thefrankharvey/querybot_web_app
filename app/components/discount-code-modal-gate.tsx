"use client";

import { useCallback, useState } from "react";

import {
  DISCOUNT_CODE,
  DISCOUNT_MODAL_DELAY_MS,
} from "@/app/constants";
import { useClerkUser } from "@/app/hooks/use-clerk-user";
import { useStripeSubscribe } from "@/app/hooks/use-stripe-subscribe";
import { useVisibleDwellGate } from "@/app/hooks/use-visible-dwell-gate";
import { DiscountCodeModal } from "./discount-code-modal";

type Plan = "monthly" | "yearly";

type DiscountCodeModalGateProps = {
  delayMs?: number;
  storageKey: string;
};

export function DiscountCodeModalGate({
  delayMs = DISCOUNT_MODAL_DELAY_MS,
  storageKey,
}: DiscountCodeModalGateProps) {
  const { isLoading, isSubscribed, user } = useClerkUser();
  const enabled =
    !isLoading && Boolean(user) && !isSubscribed;

  const { handleSubscribe, isSubscribing } = useStripeSubscribe();
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const { dismiss, open, setOpen } = useVisibleDwellGate({
    delayMs,
    enabled,
    storageKey,
  });

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        dismiss();
        return;
      }

      setCheckoutError(null);
      setOpen(true);
    },
    [dismiss, setOpen],
  );

  const handleSelectPlan = useCallback(
    async (plan: Plan) => {
      setCheckoutError(null);
      const result = await handleSubscribe(plan, { discountCode: DISCOUNT_CODE });

      if (result.success && result.url) {
        dismiss();
        return;
      }

      setCheckoutError(
        result.error || "Checkout could not be started. Please try again."
      );
    },
    [dismiss, handleSubscribe],
  );

  return (
    <DiscountCodeModal
      checkoutError={checkoutError}
      discountCode={DISCOUNT_CODE}
      isSubscribing={isSubscribing}
      onOpenChange={handleOpenChange}
      onSelectPlan={handleSelectPlan}
      open={open}
    />
  );
}
