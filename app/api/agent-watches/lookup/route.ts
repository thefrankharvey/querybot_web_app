import { auth } from "@clerk/nextjs/server";
import {
  radarError,
  radarErrorResponse,
  radarJson,
  readRadarJson,
} from "@/app/utils/personalized-radar/api.server";
import { getRadarWatchCapabilitiesForUser } from "@/app/utils/personalized-radar/entitlements.server";
import { lookupOwnedAgentWatches } from "@/app/utils/personalized-radar/repository.server";
import { parseWatchLookupInput } from "@/app/utils/personalized-radar/validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return radarError(401, "RADAR_UNAUTHORIZED", "Authentication is required");
  }
  try {
    const identities = parseWatchLookupInput(await readRadarJson(request));
    const capabilitiesPromise = getRadarWatchCapabilitiesForUser(userId);
    const resultsPromise = lookupOwnedAgentWatches(userId, identities);
    const [capabilities, results] = await Promise.all([
      capabilitiesPromise,
      resultsPromise,
    ]);
    return radarJson({ results, capabilities });
  } catch (error) {
    return radarErrorResponse(error);
  }
}
