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
  createOwnedAgentWatch,
  listOwnedAgentWatches,
} from "@/app/utils/personalized-radar/repository.server";
import {
  enforceWatchCapabilities,
  parseCreateAgentWatchInput,
  parseWatchStatusFilter,
} from "@/app/utils/personalized-radar/validation";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return radarError(401, "RADAR_UNAUTHORIZED", "Authentication is required");
  }
  try {
    const status = parseWatchStatusFilter(new URL(request.url).searchParams);
    const capabilitiesPromise = getRadarWatchCapabilitiesForUser(userId);
    const watchesPromise = listOwnedAgentWatches(userId, status);
    const [capabilities, watches] = await Promise.all([
      capabilitiesPromise,
      watchesPromise,
    ]);
    return radarJson({ watches, capabilities });
  } catch (error) {
    return radarErrorResponse(error);
  }
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return radarError(401, "RADAR_UNAUTHORIZED", "Authentication is required");
  }
  if (!getRadarFeatureFlags().watchCreation) {
    return radarError(503, "RADAR_WATCH_CREATION_DISABLED", "Watch creation is unavailable");
  }
  try {
    const input = parseCreateAgentWatchInput(await readRadarJson(request));
    const capabilities = await getRadarWatchCapabilitiesForUser(userId);
    enforceWatchCapabilities(input, capabilities);
    const result = await createOwnedAgentWatch(userId, input, capabilities);
    return radarJson(
      { watch: result.watch, capabilities },
      result.created ? 201 : 200,
    );
  } catch (error) {
    return radarErrorResponse(error);
  }
}

