import "server-only";
import { clerkClient } from "@/lib/clerk-utils";
export async function getAgencyHistoryCapabilities(userId: string) {
  const user = await clerkClient.users.getUser(userId);
  return {
    sameProjectAgencyGuard: true,
    allProjectsAgencyHistory: user.publicMetadata?.isSubscribed === true,
  };
}
