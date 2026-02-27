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
    <div className="w-full flex flex-col justify-start md:w-[1000px] md:mx-auto mt-13 md:pt-5 p-4 h-[100vh]">
      <QDashDialog
        open={isQDashDialogOpen}
        onOpenChange={handleQDashOpenChange}
        onCtaClick={handleQDashCtaClick}
      />
      {/* <ActionCards /> */}
      <ButtonBar />
      <div className="flex flex-col gap-6 bg-white min-h-[400px] rounded-lg py-10 px-4 md:p-12 w-full shadow-lg border border-accent/20">
        {isLoadingState ? (
          <div className="flex flex-1 justify-center items-center">
            <Spinner className="size-16" />
          </div>
        ) : isSubscribed ? (
          <>
            <div className="flex flex-1 flex-col justify-center items-center">
              <SubscriberEmpty hideCopy={shouldShowStats} />
              {shouldShowStats && <QueryDashboardStats agentsList={agentsList} />}
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col justify-center items-center">
            <FreeUser />
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
