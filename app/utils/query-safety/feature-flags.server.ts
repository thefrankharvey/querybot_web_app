import "server-only";
export function agencyHistoryEnabled() {
  return process.env.QUERY_SAFETY_AGENCY_HISTORY_ENABLED === "true";
}
