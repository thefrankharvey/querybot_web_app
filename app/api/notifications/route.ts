import { auth } from "@clerk/nextjs/server";

import {
  radarError,
  radarErrorResponse,
  radarJson,
} from "@/app/utils/personalized-radar/api.server";
import { listOwnedNotifications } from "@/app/utils/personalized-radar/notification-repository.server";
import { getRadarFeatureFlags } from "@/app/utils/personalized-radar/feature-flags.server";
import {
  NotificationValidationError,
  parseNotificationListFilters,
} from "@/app/utils/personalized-radar/notification-validation";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return radarError(401, "NOTIFICATION_UNAUTHORIZED", "Authentication is required");
  }
  if (!getRadarFeatureFlags().notificationCenter) {
    return radarError(503, "NOTIFICATION_CENTER_DISABLED", "Notifications are unavailable");
  }
  try {
    const filters = parseNotificationListFilters(new URL(request.url).searchParams);
    return radarJson(await listOwnedNotifications(userId, filters));
  } catch (error) {
    if (error instanceof NotificationValidationError) {
      return radarError(400, error.code, error.message);
    }
    return radarErrorResponse(error);
  }
}
