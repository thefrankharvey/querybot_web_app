"use client";
import { AgencyWarning } from "./agency-guard";
export function DiscoveryAgencyGuard({
  agent,
}: {
  agent: { agent_id?: string; agency?: string | null; website?: string | null };
}) {
  return (
    <AgencyWarning
      candidate={{
        indexId: agent.agent_id,
        agencyName: agent.agency,
        agencyUrl: agent.website,
      }}
    />
  );
}
