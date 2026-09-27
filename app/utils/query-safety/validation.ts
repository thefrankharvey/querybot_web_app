import { isDashboardProjectId } from "@/app/utils/project-dashboard-route";
// Only catalog IDs are accepted. Ownership and saved agency data come from the server.
export function parseAgencyBatchInput(value: unknown): string[] | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const body = value as Record<string, unknown>;
  if (
    Object.keys(body).some((key) => key !== "candidateIds") ||
    !Array.isArray(body.candidateIds) ||
    body.candidateIds.length > 1000
  )
    return null;
  if (
    !body.candidateIds.every(
      (id) => typeof id === "string" && isDashboardProjectId(id),
    )
  )
    return null;
  return [
    ...new Set((body.candidateIds as string[]).map((id) => id.toLowerCase())),
  ];
}
