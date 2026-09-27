import "server-only";
import { getWqhApiUrl } from "@/lib/config";
import { isDashboardProjectId } from "@/app/utils/project-dashboard-route";
import type { AgencyIdentity } from "./agency-guard";

// The catalog accepts UUIDs in batches of 100. Opaque/manual IDs stay on the fallback path.
// One total deadline and two workers bound latency and concurrency, even for large histories.
export async function fetchAgencyIdentities(ids: readonly string[]) {
  const unique = [
    ...new Set(ids.filter(isDashboardProjectId).map((id) => id.toLowerCase())),
  ];
  const result = new Map<string, AgencyIdentity>();
  if (!unique.length) return result;
  const signal = AbortSignal.timeout(3000);
  let offset = 0;
  async function worker() {
    while (offset < unique.length && !signal.aborted) {
      const batch = unique.slice(offset, (offset += 100));
      try {
        const response = await fetch(
          `${getWqhApiUrl().replace(/\/$/, "")}/get-agent-agency-identities`,
          {
            method: "POST",
            cache: "no-store",
            signal,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ agent_ids: batch }),
          },
        );
        if (!response.ok) return;
        const body = await response.json();
        if (body?.status !== "success" || !Array.isArray(body.identities))
          return;
        for (const record of body.identities) {
          const identity = record?.agency_identity;
          const agentId =
            typeof record?.agent_id === "string"
              ? record.agent_id.toLowerCase()
              : "";
          if (
            !batch.includes(agentId) ||
            !identity ||
            typeof identity.agency_id !== "string" ||
            !isDashboardProjectId(identity.agency_id) ||
            typeof identity.agency_name !== "string" ||
            identity.agency_name.length > 200
          )
            continue;
          result.set(agentId, {
            agencyId: identity.agency_id.toLowerCase(),
            agencyName: identity.agency_name,
            agencyUrl:
              typeof identity.agency_url === "string" &&
              identity.agency_url.length <= 1000
                ? identity.agency_url
                : null,
          });
        }
      } catch {
        return;
      }
    }
  }
  await Promise.all([worker(), worker()]);
  return result;
}
