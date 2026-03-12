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

const HomePage = () => {
  const { agentsList, isLoading: isProfileLoading, refetch } = useProfileContext();
  const { isSubscribed, isLoading } = useClerkUser();
  const { user } = useUser();
  const hasReloadedRef = useRef(false);
  const [isQDashDialogOpen, setIsQDashDialogOpen] = useState(false);
  const [isRefreshingHomeData, setIsRefreshingHomeData] = useState(true);

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
    const paymentSuccess = new URLSearchParams(window.location.search).get(
      "payment"
    );

    if (paymentSuccess === "success" && user && !hasReloadedRef.current) {
      hasReloadedRef.current = true;

      const checkSubscription = async () => {
        // Initial reload
        await user.reload();

        // Check if subscription is now active
        if (user.publicMetadata?.isSubscribed) {
          window.location.replace("/home");
          return;
        }

        // Retry after 1 second
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await user.reload();

        if (user.publicMetadata?.isSubscribed) {
          window.location.replace("/home");
          return;
        }

        // Retry after 2 more seconds (3 seconds total)
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await user.reload();

        // Clean up URL regardless of outcome
        window.location.replace("/home");
      };

      checkSubscription();
    }
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

  const isLoadingState = isLoading || isProfileLoading || isRefreshingHomeData;

  return (
    <div className="relative overflow-hidden px-4 pb-8 pt-6 md:px-6 md:pb-12 md:pt-4">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 mx-auto h-[620px] w-[min(1180px,100vw)] bg-[radial-gradient(circle_at_22%_18%,rgba(112,193,202,0.18),transparent_30%),radial-gradient(circle_at_76%_22%,rgba(56,88,116,0.14),transparent_30%),radial-gradient(circle_at_52%_58%,rgba(255,255,255,0.92),transparent_44%)] blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 top-[34%] -z-10 mx-auto h-[760px] w-[min(1260px,100vw)] bg-[radial-gradient(circle_at_28%_30%,rgba(250,242,232,0.84),transparent_28%),radial-gradient(circle_at_72%_34%,rgba(112,193,202,0.14),transparent_30%),radial-gradient(circle_at_58%_72%,rgba(56,88,116,0.1),transparent_34%)] blur-3xl" />

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 md:gap-4">
        <QDashDialog
          open={isQDashDialogOpen}
          onOpenChange={handleQDashOpenChange}
          onCtaClick={handleQDashCtaClick}
        />

        <section className="rounded-[24px] border border-white/80 bg-white/64 p-3 shadow-[0_18px_40px_rgba(24,44,69,0.08)] ring-1 ring-accent/8 backdrop-blur-sm sm:p-4">
          <ButtonBar />
        </section>

        <div className="mx-auto max-w-5xl">
          <div className="mt-3 min-h-[240px] rounded-[24px] border border-white/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,249,250,0.94))] p-3 shadow-[0_18px_40px_rgba(24,44,69,0.12)] sm:p-4">
            {isLoadingState ? (
              <div className="flex min-h-[200px] flex-1 items-center justify-center">
                <Spinner className="size-16" />
              </div>
            ) : isSubscribed ? (
              <div className="flex flex-1 flex-col items-center justify-center">
                <SubscriberEmpty hideCopy={shouldShowStats} />
                {shouldShowStats && <QueryDashboardStats agentsList={agentsList} />}
              </div>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center">
                <FreeUser />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
