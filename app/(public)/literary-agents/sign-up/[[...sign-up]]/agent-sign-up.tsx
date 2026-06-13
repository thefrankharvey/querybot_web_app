"use client";

import { SignUp } from "@clerk/nextjs";
import { useMemo } from "react";

import { clerkAuthAppearance } from "../../../components/clerk-auth-appearance";

function createAgentId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `agent_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
}

type AgentSignUpProps = {
  completeAuthPath: string;
};

export function AgentSignUp({ completeAuthPath }: AgentSignUpProps) {
  const agentId = useMemo(() => createAgentId(), []);

  return (
    <SignUp
      forceRedirectUrl={completeAuthPath}
      fallbackRedirectUrl={completeAuthPath}
      signInForceRedirectUrl={completeAuthPath}
      signInFallbackRedirectUrl={completeAuthPath}
      signInUrl="/literary-agents/sign-in"
      unsafeMetadata={{
        accountType: "agent",
        isAgent: true,
        agentId,
      }}
      appearance={clerkAuthAppearance}
    />
  );
}
