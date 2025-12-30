"use client";

import { AgentMatchesProvider } from "../context/agent-matches-context";
import { useClerkUser } from "../../hooks/use-clerk-user";
import AgentMatchesPaywall from "./components/agent-matches-paywall";
import AgentMatchesFull from "./components/agent-matches-full";

export default function AgentMatchesPage() {
  const { isSubscribed, isLoading } = useClerkUser();

  if (isLoading) {
    return null;
  }

  return (
    <AgentMatchesProvider>
      <div className="md:w-[90%] w-full mx-auto min-h-[700px]">
        {isSubscribed ? <AgentMatchesFull /> : <AgentMatchesPaywall />}
      </div>
    </AgentMatchesProvider>
  );
}
