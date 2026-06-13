import type { Metadata } from "next";
import { randomUUID } from "crypto";

import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { getAccountMetadata } from "@/lib/clerk-metadata";
import { syncAgentMetadataToClerk } from "@/lib/clerk-utils";
import {
  AGENT_ACCOUNT_MISMATCH_PATH,
  AGENT_HOME_PATH,
  buildAgentCompleteAuthPath,
  getSafeAgentRedirectPath,
} from "../auth-redirects";

export const metadata: Metadata = {
  title: "Preparing Agent Workspace",
  robots: { index: false, follow: false },
};

type CompleteAgentAuthPageProps = {
  searchParams?: Promise<{
    redirect_url?: string | string[];
  }>;
};

function buildAgentSignInRedirect(redirectPath: string) {
  const completePath = buildAgentCompleteAuthPath(redirectPath);
  const params = new URLSearchParams({ redirect_url: completePath });

  return `/literary-agents/sign-in?${params.toString()}`;
}

export default async function CompleteAgentAuthPage({
  searchParams,
}: CompleteAgentAuthPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const redirectPath =
    getSafeAgentRedirectPath(params?.redirect_url) ?? AGENT_HOME_PATH;
  const { userId } = await auth();

  if (!userId) {
    redirect(buildAgentSignInRedirect(redirectPath));
  }

  const user = await currentUser();

  if (!user) {
    redirect(buildAgentSignInRedirect(redirectPath));
  }

  const accountMetadata = getAccountMetadata(user);

  if (accountMetadata.accountType === "agent") {
    redirect(redirectPath);
  }

  if (accountMetadata.canPromoteAgentSignup) {
    const agentId = accountMetadata.agentId ?? randomUUID();
    const result = await syncAgentMetadataToClerk(userId, agentId);

    if (!result.success) {
      throw new Error(result.error ?? "Failed to prepare agent account");
    }

    redirect(redirectPath);
  }

  redirect(AGENT_ACCOUNT_MISMATCH_PATH);
}
