import { isDashboardProjectId } from "@/app/utils/project-dashboard-route";
import type { AgencyGuardInput } from "./agency-guard";
const FIELDS = new Set([
  "dashboardProjectId",
  "candidateRecordId",
  "candidateIndexId",
  "candidateAgencyName",
  "candidateAgencyUrl",
  "includeAllProjects",
]);
export function parseAgencyGuardInput(value: unknown): AgencyGuardInput | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const body = value as Record<string, unknown>;
  if (Object.keys(body).some((field) => !FIELDS.has(field))) return null;
  if (
    typeof body.dashboardProjectId !== "string" ||
    !isDashboardProjectId(body.dashboardProjectId)
  )
    return null;
  const limits = {
    candidateRecordId: 36,
    candidateIndexId: 200,
    candidateAgencyName: 200,
    candidateAgencyUrl: 1000,
  };
  for (const [key, max] of Object.entries(limits)) {
    const field = body[key];
    if (
      field !== undefined &&
      (typeof field !== "string" ||
        !field.trim() ||
        field.length > max ||
        /[\u0000-\u001f\u007f]/.test(field))
    )
      return null;
  }
  if (
    body.candidateRecordId !== undefined &&
    !isDashboardProjectId(body.candidateRecordId as string)
  )
    return null;
  if (
    body.includeAllProjects !== undefined &&
    typeof body.includeAllProjects !== "boolean"
  )
    return null;
  if (body.candidateAgencyUrl !== undefined) {
    try {
      if (
        !["http:", "https:"].includes(
          new URL(body.candidateAgencyUrl as string).protocol,
        )
      )
        return null;
    } catch {
      return null;
    }
  }
  return {
    ...body,
    dashboardProjectId: body.dashboardProjectId.toLowerCase(),
    ...(typeof body.candidateRecordId === "string"
      ? { candidateRecordId: body.candidateRecordId.toLowerCase() }
      : {}),
  } as AgencyGuardInput;
}
