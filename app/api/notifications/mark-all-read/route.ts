import { auth } from "@clerk/nextjs/server";

import {
  radarError,
  radarErrorResponse,
  radarJson,
  readRadarJson,
} from "@/app/utils/personalized-radar/api.server";
import { markOwnedNotificationsRead } from "@/app/utils/personalized-radar/notification-repository.server";
import { getRadarFeatureFlags } from "@/app/utils/personalized-radar/feature-flags.server";
import {
  NotificationValidationError,
  parseMarkAllReadInput,
} from "@/app/utils/personalized-radar/notification-validation";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return radarError(401, "NOTIFICATION_UNAUTHORIZED", "Authentication is required");
  }
  if (!getRadarFeatureFlags().notificationCenter) {
    return radarError(503, "NOTIFICATION_CENTER_DISABLED", "Notifications are unavailable");
  }
  try {
    const { before } = parseMarkAllReadInput(await readRadarJson(request));
    const updated = await markOwnedNotificationsRead(userId, before);
    return radarJson({ updated });
  } catch (error) {
    if (error instanceof NotificationValidationError) {
      return radarError(400, error.code, error.message);
    }
    return radarErrorResponse(error);
  }
}
