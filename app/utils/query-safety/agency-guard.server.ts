import "server-only";
import { createServerSupabase } from "@/app/api/supabase/server";
import { AGENT_MATCHES_TABLE } from "@/app/constants";
import { CONTRACT_VERSION, type SavedAgencyResponse } from "./agency-guard";
import { fetchAgencyIdentities } from "./agency-identity.server";
const FIELDS =
  "id,dashboard_project_id,project_name,name,index_id,agency,agency_url";
const PAGE_SIZE = 500;
const MAX_ROWS = 10000;
export async function getSavedAgenciesForUser(
  userId: string,
  candidateIds: string[],
): Promise<SavedAgencyResponse> {
  const db = createServerSupabase();
  type Row = {
    id: string;
    dashboard_project_id: string | null;
    project_name: string | null;
    name: string;
    index_id: string | null;
    agency: string | null;
    agency_url: string | null;
  };
  const rows: Row[] = [];
  // Read every project owned by this account, including research and terminal stages.
  // An extra page confirms completeness even if the database enforces a lower page cap.
  while (true) {
    const { data, error } = await db
      .from(AGENT_MATCHES_TABLE)
      .select(FIELDS)
      .eq("user_id", userId)
      .order("id", { ascending: true })
      .range(rows.length, rows.length + PAGE_SIZE - 1);
    if (error || !data) throw new Error("Saved agencies unavailable");
    if (!data.length) break;
    rows.push(...data);
    // Never present a partial scan as complete evidence.
    if (rows.length > MAX_ROWS) throw new Error("Saved agency limit exceeded");
  }
  const identities = await fetchAgencyIdentities([
    ...candidateIds,
    ...rows.map((row) => row.index_id ?? ""),
  ]);
  return {
    contractVersion: CONTRACT_VERSION,
    enabled: true,
    identities: Object.fromEntries(identities),
    records: rows
      .filter((row) => row.dashboard_project_id)
      .map((row) => ({
        id: row.id,
        dashboard_project_id: row.dashboard_project_id!,
        project_name: row.project_name || "Untitled Project",
        name: row.name,
        index_id: row.index_id,
        identity: identities.get(row.index_id?.toLowerCase() ?? "") ?? {
          agencyName: row.agency,
          agencyUrl: row.agency_url,
        },
      })),
  };
}
