import { auth } from "@clerk/nextjs/server";

import {
  radarError,
  radarErrorResponse,
  radarJson,
  readRadarJson,
} from "@/app/utils/personalized-radar/api.server";
import { getRadarWatchCapabilitiesForUser } from "@/app/utils/personalized-radar/entitlements.server";
import { getRadarFeatureFlags } from "@/app/utils/personalized-radar/feature-flags.server";
import {
  getOwnedNotificationPreferences,
  upsertOwnedNotificationPreferences,
} from "@/app/utils/personalized-radar/preference-repository.server";
import {
  PreferenceValidationError,
  parseNotificationPreferencePatch,
} from "@/app/utils/personalized-radar/preference-validation";

export const dynamic = "force-dynamic";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return radarError(401, "NOTIFICATION_PREFERENCE_UNAUTHORIZED", "Authentication is required");
  }
  try {
    const [preferences, capabilities] = await Promise.all([
      getOwnedNotificationPreferences(userId),
      getRadarWatchCapabilitiesForUser(userId),
    ]);
    return radarJson({ preferences, capabilities });
  } catch (error) {
    return radarErrorResponse(error);
  }
}

export async function PATCH(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return radarError(401, "NOTIFICATION_PREFERENCE_UNAUTHORIZED", "Authentication is required");
  }
  try {
    const preferences = parseNotificationPreferencePatch(await readRadarJson(request));
    const capabilities = await getRadarWatchCapabilitiesForUser(userId);
    const emailRequested =
      preferences.emailEnabled || preferences.digestFrequency === "daily";
    if (emailRequested && (!capabilities.emailDigest || !getRadarFeatureFlags().emailPreferences)) {
      return radarError(
        403,
        "RADAR_EMAIL_NOT_AVAILABLE",
        "Radar email is not available in this release",
      );
    }
    return radarJson({
      preferences: await upsertOwnedNotificationPreferences(userId, preferences),
      capabilities,
    });
  } catch (error) {
    if (error instanceof PreferenceValidationError) {
      return radarError(400, error.code, error.message);
    }
    return radarErrorResponse(error);
  }
}

