export function isDashboardProjectId(projectId: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(projectId);
}

export function getProjectDashboardHrefById(projectId: string) {
  return `/projects/${encodeURIComponent(projectId)}/dashboard`;
}
