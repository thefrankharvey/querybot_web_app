"use client";

import { DISCOUNT_MODAL_STORAGE_KEYS } from "@/app/constants";
import { DiscountCodeModalGate } from "@/app/components/discount-code-modal-gate";
import { useClerkUser } from "../../hooks/use-clerk-user";
import AgentMatchesPaywall from "./components/agent-matches-paywall";
import AgentMatchesFull from "./components/agent-matches-full";
import { useState } from "react";
import { AgentSearchProgress } from "../components/agent-search-progress";
import { useAgentMatches } from "../context/agent-matches-context";

export default function AgentMatchesPage() {
  const { isSubscribed, isLoading } = useClerkUser();
  const [isWalkthroughActive, setIsWalkthroughActive] = useState(false);
  const { previousSearchStatus, completePreviousSearchRefresh } =
    useAgentMatches();

  if (previousSearchStatus !== "idle") {
    return (
      <div className="ambient-page px-4 pb-48 pt-6 md:px-6 md:pb-48 md:pt-4">
        <AgentSearchProgress
          isSuccess={previousSearchStatus === "success"}
          onComplete={completePreviousSearchRefresh}
        />
      </div>
    );
  }

  if (isLoading) {
    return null;
  }

  return (
    <div className="mx-auto min-h-[700px] w-full pb-10 pt-8 md:w-[full] md:px-6 md:pb-82">
      <DiscountCodeModalGate
        enabled={!isWalkthroughActive}
        storageKey={DISCOUNT_MODAL_STORAGE_KEYS.AGENT_MATCHES}
      />
      {isSubscribed ? (
        <AgentMatchesFull
          onWalkthroughActiveChange={setIsWalkthroughActive}
        />
      ) : (
        <AgentMatchesPaywall
          onWalkthroughActiveChange={setIsWalkthroughActive}
        />
      )}
    </div>
  );
}
