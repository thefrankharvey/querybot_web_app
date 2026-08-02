import { auth } from "@clerk/nextjs/server";
import {
  radarError,
  radarErrorResponse,
  radarJson,
  readRadarJson,
} from "@/app/utils/personalized-radar/api.server";
import { getRadarWatchCapabilitiesForUser } from "@/app/utils/personalized-radar/entitlements.server";
import {
  deleteOwnedAgentWatch,
  updateOwnedAgentWatch,
} from "@/app/utils/personalized-radar/repository.server";
import {
  enforceWatchCapabilities,
  isUuid,
  parseUpdateAgentWatchInput,
} from "@/app/utils/personalized-radar/validation";

type WatchRouteContext = { params: Promise<{ watchId: string }> };

async function readWatchId(context: WatchRouteContext) {
  const { watchId } = await context.params;
  const normalized = watchId.trim().toLowerCase();
  if (!isUuid(normalized)) return null;
  return normalized;
}

export async function PATCH(request: Request, context: WatchRouteContext) {
  const { userId } = await auth();
  if (!userId) {
    return radarError(401, "RADAR_UNAUTHORIZED", "Authentication is required");
  }
  try {
    const watchId = await readWatchId(context);
    if (!watchId) {
      return radarError(400, "RADAR_INVALID_REQUEST", "watchId must be a UUID");
    }
    const input = parseUpdateAgentWatchInput(await readRadarJson(request));
    if (input.action === "update") {
      const capabilities = await getRadarWatchCapabilitiesForUser(userId);
      enforceWatchCapabilities(input, capabilities);
    }
    const watch = await updateOwnedAgentWatch(userId, watchId, input);
    if (!watch) {
      return radarError(404, "RADAR_WATCH_NOT_FOUND", "Watch not found");
    }
    return radarJson({ watch });
  } catch (error) {
    return radarErrorResponse(error);
  }
}

export async function DELETE(_request: Request, context: WatchRouteContext) {
  const { userId } = await auth();
  if (!userId) {
    return radarError(401, "RADAR_UNAUTHORIZED", "Authentication is required");
  }
  try {
    const watchId = await readWatchId(context);
    if (!watchId) {
      return radarError(400, "RADAR_INVALID_REQUEST", "watchId must be a UUID");
    }
    if (!(await deleteOwnedAgentWatch(userId, watchId))) {
      return radarError(404, "RADAR_WATCH_NOT_FOUND", "Watch not found");
    }
    return radarJson({ deleted: true });
  } catch (error) {
    return radarErrorResponse(error);
  }
}

