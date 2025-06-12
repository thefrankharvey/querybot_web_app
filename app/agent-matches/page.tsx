"use client";

import { AgentMatchesProvider } from "../context/agent-matches-context";
// import { useAuth } from "@clerk/nextjs";
// import AgentMatchesPaywall from "./components/agent-matches-paywall";
import AgentMatchesFull from "./components/agent-matches-full";

export default function AgentMatchesPage() {
  // const { has, isLoaded } = useAuth();
  // const hasProPlan = has?.({ plan: "slushwire_pro" });

  // if (!isLoaded) {
  //   return null;
  // }

  return (
    <AgentMatchesProvider>
      {/* {hasProPlan ? <AgentMatchesFull /> : <AgentMatchesPaywall />} */}
      <AgentMatchesFull />
    </AgentMatchesProvider>
  );
}
