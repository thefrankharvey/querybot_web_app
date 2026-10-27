export interface SearchFitMetadata {
  ranking_version?: string;
  fit_rating?: string;
  score_meaning?: string;
  fit_score?: number;
  match_rank?: number;
  match_explanation?: {
    label?: string;
    kind: "explicit" | "broader" | "conditional" | "context";
    explanation: string;
    source_evidence?: { source_field: string; quote: string }[];
  }[];
  match_uncertainty?: { raw_value: unknown; reason?: string }[];
}

export function resultSetQuery(resultSetId: string | undefined, newSearch: boolean): string {
  return resultSetId && !newSearch ? `&result_set_id=${encodeURIComponent(resultSetId)}` : "";
}
