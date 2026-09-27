import "server-only";
import { createServerSupabase } from "@/app/api/supabase/server";
import { AGENT_MATCHES_TABLE } from "@/app/constants";
import {
  buildAgencyGuard,
  rowIdentity,
  type AgencyGuardInput,
  type ManualHistoryRow,
} from "./agency-guard";
import { fetchAgencyIdentities } from "./agency-identity.server";
import { getAgencyHistoryCapabilities } from "./entitlements.server";
export class AgencyGuardError extends Error {
  constructor(
    public code: string,
    public status: number,
  ) {
    super(code);
  }
}
const FIELDS =
  "id,dashboard_project_id,project_name,name,index_id,agency,agency_url,column_name,query_sent_date";
const PAGE_SIZE = 500;
const MAX_ROWS = 10000;
export async function getAgencyGuardForUser(
  userId: string,
  input: AgencyGuardInput,
) {
  const db = createServerSupabase();
  const { data: project, error: projectError } = await db
    .from("dashboard_projects")
    .select("id")
    .eq("id", input.dashboardProjectId)
    .eq("user_id", userId)
    .maybeSingle();
  if (projectError) throw new AgencyGuardError("HISTORY_UNAVAILABLE", 503);
  if (!project) throw new AgencyGuardError("NOT_FOUND", 404);
  let savedCandidate: ManualHistoryRow | null = null;
  if (input.candidateRecordId) {
    const { data, error } = await db
      .from(AGENT_MATCHES_TABLE)
      .select(FIELDS)
      .eq("id", input.candidateRecordId)
      .eq("user_id", userId)
      .eq("dashboard_project_id", input.dashboardProjectId)
      .maybeSingle();
    if (error) throw new AgencyGuardError("HISTORY_UNAVAILABLE", 503);
    if (
      !data ||
      (input.candidateIndexId !== undefined &&
        input.candidateIndexId !== data.index_id)
    )
      throw new AgencyGuardError("NOT_FOUND", 404);
    savedCandidate = data;
  }
  if (
    input.includeAllProjects &&
    !(await getAgencyHistoryCapabilities(userId)).allProjectsAgencyHistory
  )
    throw new AgencyGuardError("CAPABILITY_REQUIRED", 403);
  const history: ManualHistoryRow[] = [];
  let historyComplete = false;
  // Keep paging until an empty page, even if the database's own cap is smaller than PAGE_SIZE.
  while (history.length < MAX_ROWS) {
    let query = db
      .from(AGENT_MATCHES_TABLE)
      .select(FIELDS)
      .eq("user_id", userId);
    if (!input.includeAllProjects)
      query = query.eq("dashboard_project_id", input.dashboardProjectId);
    const { data, error } = await query
      .order("id", { ascending: true })
      .range(history.length, history.length + PAGE_SIZE - 1);
    if (error || !data) throw new AgencyGuardError("HISTORY_UNAVAILABLE", 503);
    if (!data.length) {
      historyComplete = true;
      break;
    }
    history.push(...data);
  }
  const indexId = savedCandidate
    ? savedCandidate.index_id
    : input.candidateIndexId;
  const identities = await fetchAgencyIdentities([
    indexId ?? "",
    ...history.map((row) => row.index_id ?? ""),
  ]);
  const candidate =
    identities.get(indexId?.toLowerCase() ?? "") ??
    (savedCandidate
      ? rowIdentity(savedCandidate)
      : {
          agencyName: input.candidateAgencyName,
          agencyUrl: input.candidateAgencyUrl,
        });
  return buildAgencyGuard(
    input,
    candidate,
    history.map((row) => ({
      ...row,
      identity: identities.get(row.index_id?.toLowerCase() ?? ""),
    })),
    historyComplete,
  );
}
