export type AgentExportApiStatus =
  | "creating"
  | "error"
  | "failed"
  | "ready"
  | "success";

export interface AgentExportApiResponse {
  download_url?: string | null;
  error_message?: string | null;
  export_format?: "google_sheets" | "xlsx" | string | null;
  message?: string | null;
  sheet_status?: "creating" | "failed" | "ready" | null;
  spreadsheet_url?: string | null;
  status?: AgentExportApiStatus | null;
  task_id?: string | null;
}

function nonEmptyString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0
    ? value
    : null;
}

export function getAgentExportDownloadUrl(
  response: AgentExportApiResponse,
): string | null {
  return (
    nonEmptyString(response.download_url) ??
    nonEmptyString(response.spreadsheet_url)
  );
}

export function getAgentExportErrorMessage(
  response: AgentExportApiResponse,
): string | null {
  return (
    nonEmptyString(response.error_message) ?? nonEmptyString(response.message)
  );
}
