"use client";

import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useProfileContext } from "@/app/(app)/context/profile-context";
import { Spinner } from "@/app/ui-primitives/spinner";
import { useUser } from "@clerk/nextjs";
import { ActionCards } from "@/app/components/action-cards";
import { useClerkUser } from "@/app/hooks/use-clerk-user";
import FreeUser from "./components/free-user";
import SubscriberEmpty from "./components/subscriber-empty";

const SavedAgents = () => {
  const { agentsList, isLoading } = useProfileContext();
  const { isSubscribed } = useClerkUser();
  const router = useRouter();
  const { user } = useUser();
  const hasReloadedRef = useRef(false);

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
          router.replace("/saved-agents");
          return;
        }

        // Retry after 1 second
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await user.reload();

        if (user.publicMetadata?.isSubscribed) {
          router.replace("/saved-agents");
          return;
        }

        // Retry after 2 more seconds (3 seconds total)
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await user.reload();

        // Clean up URL regardless of outcome
        router.replace("/saved-agents");
      };

      checkSubscription();
    }
  }, [user, router]);

  useEffect(() => {
    if (!isLoading && agentsList && agentsList.length > 0) {
      router.replace(`/saved-agents/${agentsList[0].index_id}`);
    }
  }, [agentsList, isLoading, router]);

  if (isLoading || (agentsList && agentsList.length > 0)) {
    return (
      <div className="w-full flex flex-col justify-start md:w-[1000px] md:mx-auto mt-13">
        <div className="flex flex-col gap-4 bg-white rounded-lg p-4 md:p-12 w-full shadow-lg h-[500px] justify-center items-center">
          <Spinner className="size-16" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col justify-start md:w-[1000px] md:mx-auto mt-13">
      <ActionCards />
      {/* <ButtonBar /> */}
      <div className="flex flex-col gap-4 bg-white rounded-lg p-10 md:p-12 w-full shadow-lg justify-center items-center border border-accent/20">
        {isSubscribed ? <SubscriberEmpty /> : <FreeUser />}
      </div>
    </div>
  );
};

export default SavedAgents;
