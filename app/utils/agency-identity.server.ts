import "server-only";

import { getWqhApiUrl } from "@/lib/config";

export type CanonicalAgencyIdentity = {
  agency_id: string;
  agency_name: string;
  agency_url: string | null;
};

type AgencyIdentityLookupResponse = {
  status?: "success" | "error";
  identities?: Array<{
    agent_id?: string;
    agency_identity?: CanonicalAgencyIdentity | null;
  }>;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const AGENCY_IDENTITY_LOOKUP_TIMEOUT_MS = 3_000;

function normalizeAgentId(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Resolve reviewed agency membership from the catalogue service. Callers must
 * treat an absent identity as unknown, not as evidence that an agency is safe.
 * The lookup deliberately fails open so an enrichment outage cannot regress
 * existing save and query workflows.
 */
export async function fetchCanonicalAgencyIdentities(
  agentIds: readonly string[],
) {
  const uniqueAgentIds = Array.from(
    new Set(
      agentIds
        .map(normalizeAgentId)
        .filter((agentId) => UUID_PATTERN.test(agentId)),
    ),
  );

  if (uniqueAgentIds.length === 0) {
    return new Map<string, CanonicalAgencyIdentity>();
  }

  const chunks = Array.from(
    { length: Math.ceil(uniqueAgentIds.length / 100) },
    (_, index) => uniqueAgentIds.slice(index * 100, (index + 1) * 100),
  );

  try {
    const responses = await Promise.all(
      chunks.map(async (agentIdsChunk) => {
        const response = await fetch(
          `${getWqhApiUrl().replace(/\/$/, "")}/get-agent-agency-identities`,
          {
            method: "POST",
            cache: "no-store",
            signal: AbortSignal.timeout(AGENCY_IDENTITY_LOOKUP_TIMEOUT_MS),
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ agent_ids: agentIdsChunk }),
          },
        );
        const body = (await response.json().catch(() => null)) as
          | AgencyIdentityLookupResponse
          | null;

        return response.ok && body?.status === "success"
          ? (body.identities ?? [])
          : [];
      }),
    );
    const identityByAgentId = new Map<string, CanonicalAgencyIdentity>();

    for (const record of responses.flat()) {
      const agentId = normalizeAgentId(record.agent_id);
      const identity = record.agency_identity;
      if (!agentId || !identity?.agency_id) continue;
      identityByAgentId.set(agentId.toLowerCase(), identity);
    }

    return identityByAgentId;
  } catch {
    return new Map<string, CanonicalAgencyIdentity>();
  }
}
