import "server-only";

import { getWqhApiUrl } from "@/lib/config";
import type { AgentIdentityKey } from "@/app/utils/personalized-radar/contracts";

export class RadarIdentityError extends Error {}

export async function verifyRadarAgentIdentity(
  identity: AgentIdentityKey,
): Promise<boolean> {
  const lookupId = identity.indexId ?? identity.agentProfileId;
  if (!lookupId) return false;

  const usesCanonicalProfile = !identity.indexId && Boolean(identity.agentProfileId);
  const endpoint = usesCanonicalProfile ? "/get-agent-profile" : "/get-agent";
  const url = new URL(`${getWqhApiUrl().replace(/\/$/, "")}${endpoint}`);
  url.searchParams.set("lookup_by", usesCanonicalProfile ? "profile_id" : "id");
  url.searchParams.set("value", lookupId);

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(5_000),
    });
  } catch {
    throw new RadarIdentityError("Agent identity service is unavailable");
  }
  if (response.status === 404) return false;
  if (!response.ok) {
    throw new RadarIdentityError("Agent identity service is unavailable");
  }
  const payload = (await response.json()) as {
    status?: unknown;
    agent?: { agent_id?: unknown; profile_id?: unknown };
  };
  const returnedId = usesCanonicalProfile
    ? payload.agent?.profile_id
    : payload.agent?.agent_id;
  return (
    payload.status === "success" &&
    typeof returnedId === "string" &&
    returnedId.trim().toLowerCase() === lookupId.toLowerCase()
  );
}
