"use client";

import { DISCOUNT_MODAL_STORAGE_KEYS } from "@/app/constants";
import { DiscountCodeModalGate } from "@/app/components/discount-code-modal-gate";
import { useClerkUser } from "../../hooks/use-clerk-user";
import AgentMatchesPaywall from "./components/agent-matches-paywall";
import AgentMatchesFull from "./components/agent-matches-full";

export default function AgentMatchesPage() {
  const { isSubscribed, isLoading, user } = useClerkUser();

  if (isLoading) {
    return null;
  }

  return (
    <div className="mx-auto min-h-[700px] w-full pb-10 pt-8 md:w-[full] md:px-6 md:pb-82">
      <DiscountCodeModalGate
        enabled={!isSubscribed && Boolean(user)}
        storageKey={DISCOUNT_MODAL_STORAGE_KEYS.AGENT_MATCHES}
      />
      {isSubscribed ? <AgentMatchesFull /> : <AgentMatchesPaywall />}
    </div>
  );
}
