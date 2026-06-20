"use server";

import { auth, currentUser } from "@clerk/nextjs/server";

import { getAccountMetadata } from "@/lib/clerk-metadata";
import { syncAgentMetadataToClerk } from "@/lib/clerk-utils";

export async function syncCurrentAgentIdToClerk(agentId: string) {
  if (!agentId) {
    return {
      success: false,
      error: "Agent ID is required",
    };
  }

  const { userId } = await auth();
  if (!userId) {
    return {
      success: false,
      error: "Unauthorized",
    };
  }

  const user = await currentUser();
  const { accountType } = getAccountMetadata(user);

  if (accountType !== "agent") {
    return {
      success: false,
      error: "Only agent accounts can sync agent IDs",
    };
  }

  return syncAgentMetadataToClerk(userId, agentId);
}
