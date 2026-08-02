import "server-only";

import { clerkClient } from "@/lib/clerk-utils";
import {
  RADAR_EVENT_TYPES,
  type RadarWatchCapabilities,
} from "@/app/utils/personalized-radar/contracts";

export function getRadarWatchCapabilities(input: {
  isAuthenticated: boolean;
  isSubscribed: boolean;
}): RadarWatchCapabilities {
  const isSubscribed = input.isAuthenticated && input.isSubscribed;

  return {
    maxActiveWatches: isSubscribed ? 250 : input.isAuthenticated ? 5 : 0,
    allowedEventTypes: isSubscribed
      ? [...RADAR_EVENT_TYPES]
      : ["submission_reopened"],
    emailDigest: isSubscribed,
    targetedHistoryDays: isSubscribed ? 365 : 30,
    isSubscribed,
  };
}

export async function getRadarWatchCapabilitiesForUser(
  userId: string,
): Promise<RadarWatchCapabilities> {
  const normalizedUserId = userId.trim();
  if (!normalizedUserId) {
    return getRadarWatchCapabilities({
      isAuthenticated: false,
      isSubscribed: false,
    });
  }

  const user = await clerkClient.users.getUser(normalizedUserId);
  return getRadarWatchCapabilities({
    isAuthenticated: true,
    isSubscribed: user.publicMetadata?.isSubscribed === true,
  });
}

