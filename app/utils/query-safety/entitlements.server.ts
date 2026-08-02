import "server-only";

import { clerkClient } from "@/lib/clerk-utils";

export const QUERY_SAFETY_ENTITLEMENT_REQUIRED =
  "QUERY_SAFETY_ENTITLEMENT_REQUIRED";

export type QuerySafetyCapabilities = {
  sameProjectAgencyGuard: boolean;
  allProjectsAgencyHistory: boolean;
  queryRounds: boolean;
  customReminderSchedules: boolean;
  multipleReminderKindsPerAgent: boolean;
  projectReminderSummaries: boolean;
  futureEmailDelivery: boolean;
  isSubscribed: boolean;
};

export function getQuerySafetyCapabilities(input: {
  isAuthenticated: boolean;
  isSubscribed: boolean;
}): QuerySafetyCapabilities {
  const isSubscribed = input.isAuthenticated && input.isSubscribed;

  return {
    sameProjectAgencyGuard: input.isAuthenticated,
    allProjectsAgencyHistory: isSubscribed,
    queryRounds: isSubscribed,
    customReminderSchedules: isSubscribed,
    multipleReminderKindsPerAgent: isSubscribed,
    projectReminderSummaries: isSubscribed,
    futureEmailDelivery: isSubscribed,
    isSubscribed,
  };
}

export async function getQuerySafetyCapabilitiesForUser(
  userId: string,
): Promise<QuerySafetyCapabilities> {
  const normalizedUserId = userId.trim();
  if (!normalizedUserId) {
    return getQuerySafetyCapabilities({
      isAuthenticated: false,
      isSubscribed: false,
    });
  }

  const user = await clerkClient.users.getUser(normalizedUserId);
  return getQuerySafetyCapabilities({
    isAuthenticated: true,
    isSubscribed: user.publicMetadata?.isSubscribed === true,
  });
}
