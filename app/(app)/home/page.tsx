"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Spinner } from "@/app/ui-primitives/spinner";
import { useUser } from "@clerk/nextjs";
import { useClerkUser } from "@/app/hooks/use-clerk-user";
import { useProfileContext } from "../context/profile-context";
import FreeUser from "./components/free-user";
import SubscriberEmpty from "./components/subscriber-empty";
import QDashDialog from "./components/q-dash-dialog";
import ButtonBar from "./components/button-bar";
import QueryDashboardStats from "./components/query-dashboard-stats";

const PAYMENT_PENDING_KEY = "payment_verification_pending";
const RETRY_DELAYS_MS = [0, 1500, 3000, 4000] as const;

async function verifySubscriptionServer(): Promise<boolean> {
  try {
    const res = await fetch("/api/verify-subscription");
    if (!res.ok) return false;
    const data = await res.json();
    return data.isSubscribed === true;
  } catch {
    return false;
  }
}

const HomePage = () => {
  const { agentsList, isLoading: isProfileLoading, refetch } = useProfileContext();
  const { isSubscribed, isLoading } = useClerkUser();
  const { user } = useUser();
  const hasReloadedRef = useRef(false);
  const [isQDashDialogOpen, setIsQDashDialogOpen] = useState(false);
  const [isRefreshingHomeData, setIsRefreshingHomeData] = useState(true);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);

  const qDashDismissedKey = useMemo(
    () =>
      user?.id
        ? `q_dash_migration_dismissed:${user.id}`
        : "q_dash_migration_dismissed",
    [user?.id]
  );

  const persistQDashDismissal = useCallback(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(qDashDismissedKey, "true");
  }, [qDashDismissedKey]);

  // Handle return from successful Stripe payment
  useEffect(() => {
    const urlHasPaymentSuccess =
      new URLSearchParams(window.location.search).get("payment") === "success";
    const hasPendingFlag =
      sessionStorage.getItem(PAYMENT_PENDING_KEY) === "true";
    const needsVerification = urlHasPaymentSuccess || hasPendingFlag;

    if (!needsVerification || !user || hasReloadedRef.current) return;
    hasReloadedRef.current = true;

    if (urlHasPaymentSuccess) {
      sessionStorage.setItem(PAYMENT_PENDING_KEY, "true");
    }

    setIsVerifyingPayment(true);

    const checkSubscription = async () => {
      for (const delay of RETRY_DELAYS_MS) {
        if (delay > 0) {
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
        await user.reload();
        if (user.publicMetadata?.isSubscribed) {
          sessionStorage.removeItem(PAYMENT_PENDING_KEY);
          window.location.replace("/home");
          return;
        }
      }

      // Client-side retries exhausted -- verify directly against Stripe
      const verified = await verifySubscriptionServer();
      if (verified) {
        sessionStorage.removeItem(PAYMENT_PENDING_KEY);
        window.location.replace("/home");
        return;
      }

      // Final attempt after giving the server-side verification time to propagate
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await user.reload();

      sessionStorage.removeItem(PAYMENT_PENDING_KEY);
      window.location.replace("/home");
    };

    checkSubscription();
  }, [user]);

  useEffect(() => {
    let isMounted = true;

    const refreshHomeData = async () => {
      try {
        await refetch();
      } finally {
        if (isMounted) {
          setIsRefreshingHomeData(false);
        }
      }
    };

    void refreshHomeData();

    return () => {
      isMounted = false;
    };
  }, [refetch]);

  useEffect(() => {
    if (isLoading || isProfileLoading) return;
    if (isRefreshingHomeData) return;
    if (!isSubscribed || !agentsList || agentsList.length === 0) return;
    if (typeof window === "undefined") return;

    const hasDismissed = window.localStorage.getItem(qDashDismissedKey) === "true";
    if (!hasDismissed) {
      setIsQDashDialogOpen(true);
    }
  }, [
    agentsList,
    isLoading,
    isProfileLoading,
    isRefreshingHomeData,
    isSubscribed,
    qDashDismissedKey,
  ]);

  const handleQDashOpenChange = (open: boolean) => {
    if (!open) {
      persistQDashDismissal();
    }
    setIsQDashDialogOpen(open);
  };

  const handleQDashCtaClick = () => {
    persistQDashDismissal();
    setIsQDashDialogOpen(false);
  };

  const shouldShowStats =
    !isLoading &&
    !isProfileLoading &&
    !isRefreshingHomeData &&
    isSubscribed &&
    Boolean(agentsList?.length);

  const isLoadingState = isLoading || isProfileLoading || isRefreshingHomeData || isVerifyingPayment;

  return (
    <div className="relative overflow-hidden pb-48 pt-6 md:px-6 md:pb-48 md:pt-4">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 md:gap-4 px-4 md:px-0">
        <QDashDialog
          open={isQDashDialogOpen}
          onOpenChange={handleQDashOpenChange}
          onCtaClick={handleQDashCtaClick}
        />

        <section className="rounded-[24px] border border-white/80 bg-white/64 p-3 shadow-[0_18px_40px_rgba(24,44,69,0.08)] ring-1 ring-accent/8 backdrop-blur-sm sm:p-4">
          <ButtonBar />
        </section>

        <div className="mt-3 min-h-[100vh] rounded-[24px]">
          {isLoadingState ? (
            <div className="flex min-h-[200px] flex-1 items-center justify-center">
              <Spinner className="size-16" />
            </div>
          ) : isSubscribed ? (
            <div className="flex items-center justify-center mt-3 min-h-[350px] rounded-[24px] border border-white/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,249,250,0.94))] p-3 shadow-[0_18px_40px_rgba(24,44,69,0.12)] sm:p-4">
              <div className="flex flex-1 flex-col items-center justify-center">
                <SubscriberEmpty showSmartMatchPrompt={!shouldShowStats} />
                {shouldShowStats && <QueryDashboardStats agentsList={agentsList} />}
              </div>
            </div>
          ) : (
            <div className="mt-3 min-h-[240px] rounded-[24px] border border-white/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,249,250,0.94))] p-3 shadow-[0_18px_40px_rgba(24,44,69,0.12)] sm:p-4">
              <div className="flex flex-1 flex-col items-center justify-center">
                <FreeUser />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
