"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/app/ui-primitives/spinner";
import { useUser } from "@clerk/nextjs";
import { useClerkUser } from "@/app/hooks/use-clerk-user";
import { useProfileContext } from "../context/profile-context";
import FreeUser from "./components/free-user";
import SubscriberEmpty from "./components/subscriber-empty";
import QDashDialog from "./components/q-dash-dialog";
import ButtonBar from "./components/button-bar";

const HomePage = () => {
  const { agentsList, isLoading: isProfileLoading } = useProfileContext();
  const { isSubscribed, isLoading } = useClerkUser();
  const router = useRouter();
  const { user } = useUser();
  const hasReloadedRef = useRef(false);
  const [isQDashDialogOpen, setIsQDashDialogOpen] = useState(false);

  console.log("user", user?.id);
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
          router.replace("/home");
          return;
        }

        // Retry after 1 second
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await user.reload();

        if (user.publicMetadata?.isSubscribed) {
          router.replace("/home");
          return;
        }

        // Retry after 2 more seconds (3 seconds total)
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await user.reload();

        // Clean up URL regardless of outcome
        router.replace("/home");
      };

      checkSubscription();
    }
  }, [user, router]);

  useEffect(() => {
    if (isLoading || isProfileLoading) return;
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

  return (
    <div className="w-full flex flex-col justify-start md:w-[1000px] md:mx-auto mt-13 md:pt-5 p-4">
      <QDashDialog
        open={isQDashDialogOpen}
        onOpenChange={handleQDashOpenChange}
        onCtaClick={handleQDashCtaClick}
      />
      {/* <ActionCards /> */}
      <ButtonBar />
      <div className="flex flex-col gap-4 bg-white min-h-[400px] rounded-lg py-10 px-4 md:p-12 w-full shadow-lg justify-center items-center border border-accent/20">
        {isLoading ? <Spinner className="size-16" /> : isSubscribed ? <SubscriberEmpty /> : <FreeUser />}
      </div>
    </div>
  );
};

export default HomePage;
