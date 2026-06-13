import { useUser } from "@clerk/nextjs";

import { getAccountMetadata } from "@/lib/clerk-metadata";

export function useClerkUser() {
  const { user, isLoaded } = useUser();
  const { accountType, isAgent, agentId } = getAccountMetadata(user);

  return {
    isSubscribed: user?.publicMetadata?.isSubscribed === true,
    accountType,
    isAgent,
    agentId,
    // Note: stripeCustomerId is now in privateMetadata and not accessible on client
    // If needed server-side, access via clerkClient.users.getUser()
    isLoading: !isLoaded,
    user,
  };
}
