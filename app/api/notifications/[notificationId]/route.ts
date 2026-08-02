import { auth } from "@clerk/nextjs/server";

import {
  radarError,
  radarErrorResponse,
  radarJson,
  readRadarJson,
} from "@/app/utils/personalized-radar/api.server";
import { updateOwnedNotification } from "@/app/utils/personalized-radar/notification-repository.server";
import { getRadarFeatureFlags } from "@/app/utils/personalized-radar/feature-flags.server";
import {
  isNotificationUuid,
  NotificationValidationError,
  parseNotificationAction,
} from "@/app/utils/personalized-radar/notification-validation";

type NotificationRouteContext = {
  params: Promise<{ notificationId: string }>;
};

export async function PATCH(request: Request, context: NotificationRouteContext) {
  const { userId } = await auth();
  if (!userId) {
    return radarError(401, "NOTIFICATION_UNAUTHORIZED", "Authentication is required");
  }
  if (!getRadarFeatureFlags().notificationCenter) {
    return radarError(503, "NOTIFICATION_CENTER_DISABLED", "Notifications are unavailable");
  }
  try {
    const { notificationId } = await context.params;
    const normalizedId = notificationId.trim().toLowerCase();
    if (!isNotificationUuid(normalizedId)) {
      throw new NotificationValidationError("notificationId must be a UUID");
    }
    const { action } = parseNotificationAction(await readRadarJson(request));
    const notification = await updateOwnedNotification(userId, normalizedId, action);
    if (!notification) {
      return radarError(404, "NOTIFICATION_NOT_FOUND", "Notification not found");
    }
    return radarJson({ notification });
  } catch (error) {
    if (error instanceof NotificationValidationError) {
      return radarError(400, error.code, error.message);
    }
    return radarErrorResponse(error);
  }
}
