"use client";
import { useAgentMatches } from "@/app/(app)/context/agent-matches-context";
import { useProfileContext } from "@/app/(app)/context/profile-context";
import { isSameProjectScope } from "@/app/utils/project-scope";
import { AgencyGuard, AgencyHistoryIndicator } from "./agency-guard";

export function DiscoveryAgencyGuard({
  agent,
  indicator = false,
}: {
  agent: { agent_id?: string; agency?: string | null; website?: string | null };
  indicator?: boolean;
}) {
  const { projects, agentsList } = useProfileContext();
  const context = useAgentMatches();
  const selectedId = context.formData?.save_project?.dashboardProjectId;
  const matching = projects.filter((project) =>
    selectedId
      ? project.id === selectedId
      : isSameProjectScope(
          {
            projectName: project.project_name,
            writerProjectId: project.writer_project_id,
          },
          {
            projectName: context.projectName,
            writerProjectId: context.writerProjectId,
          },
        ),
  );
  const project = matching.length === 1 ? matching[0] : undefined;
  const saved = agentsList?.find(
    (row) =>
      row.dashboard_project_id === project?.id &&
      row.index_id === agent.agent_id,
  );
  let url: string | undefined;
  try {
    if (
      agent.website &&
      ["https:", "http:"].includes(new URL(agent.website).protocol)
    )
      url = agent.website;
  } catch {
    /* Missing/legacy URL uses the agency-name fallback. */
  }
  const candidate = {
    dashboardProjectId: project?.id,
    candidateRecordId: saved?.id,
    candidateIndexId: agent.agent_id || undefined,
    candidateAgencyName: agent.agency?.trim() || undefined,
    candidateAgencyUrl: url,
  };
  return indicator ? (
    <AgencyHistoryIndicator candidate={candidate} />
  ) : (
    <AgencyGuard candidate={candidate} />
  );
}
