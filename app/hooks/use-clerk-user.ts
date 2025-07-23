import { useUser } from "@clerk/nextjs";

export function useClerkUser() {
  const { user, isLoaded } = useUser();

  return {
    isSubscribed: user?.publicMetadata?.isSubscribed as boolean,
    // Note: stripeCustomerId is now in privateMetadata and not accessible on client
    // If needed server-side, access via clerkClient.users.getUser()
    isLoading: !isLoaded,
    user,
  };
}
