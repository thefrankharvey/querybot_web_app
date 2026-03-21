"use client";

import { useClerkUser } from "../../hooks/use-clerk-user";
import AgentMatchesPaywall from "./components/agent-matches-paywall";
import AgentMatchesFull from "./components/agent-matches-full";

export default function AgentMatchesPage() {
  const { isSubscribed, isLoading } = useClerkUser();

  if (isLoading) {
    return null;
  }

  return (
    <div className="mx-auto min-h-[700px] w-full pb-10 pt-8 md:w-[full] md:px-6 md:pb-82">
      {isSubscribed ? <AgentMatchesFull /> : <AgentMatchesPaywall />}
    </div>
  );
}
