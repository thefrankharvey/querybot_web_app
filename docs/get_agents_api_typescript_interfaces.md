# Get-Agents API TypeScript Interfaces

This file documents TypeScript interfaces for the request payloads and JSON
responses for:

- `POST /get-agents-paid`
- `POST /get-agents-free`

Both endpoints accept JSON request bodies and currently require no auth. Add
`async_sheet: true` to the request body when the caller wants the API to start
Google Sheet creation in the background and return `sheet_status: "creating"`.

## Endpoint Summary

```ts
export type GetAgentsEndpoint = "/get-agents-paid" | "/get-agents-free";
```

`/get-agents-paid` returns a paginated slice of all ranked matches, but sends
the full ranked set to the paid Google Sheet.

`/get-agents-free` samples up to 9 matches across high, medium, and low score
tiers, then returns and persists that sampled set.

## Request Payloads

```ts
export interface GetAgentsRequestBody {
  email: string;
  genre?: string | string[] | null;
  subgenres?: string[] | null;
  target_audience?: string | null;
  comps?: string[] | null;
  themes?: string[] | null;
  synopsis?: string | null;
  query_letter?: string | null;
  manuscript?: string | null;
  non_fiction?: boolean | null;
  enable_ai?: boolean | null;
  format?: string | null;
  project_name?: string | null;
  project_description?: string | null;
  project_manuscript_pages?: string[] | null;
  project_images?: string[] | null;
  project_cover_image?: string | null;

  /**
   * Optional append-mode identifiers.
   * If supplied, matches are appended to an existing persisted writer project.
   */
  writer_project_id?: string | null;
  project_id?: string | null;

  /**
   * Optional. When true, the response returns immediately with task_id and
   * sheet_status instead of waiting for spreadsheet_id/spreadsheet_url.
   */
  async_sheet?: boolean;
}

export interface GetAgentsPaidQueryParams {
  /**
   * Optional response page size. Defaults to 50.
   * Matching still runs over the full set for sheet generation.
   */
  limit?: number;

  /**
   * Optional offset cursor. Defaults to 0.
   */
  last_index?: number;

  /**
   * Optional status filter passed through to matching.
   */
  status?: string;

  /**
   * Optional country filter, for example "US", "GB", "CA", or "AU".
   */
  country_code?: string;
}

export interface GetAgentsFreeQueryParams {
  /**
   * Optional status filter passed through to matching.
   */
  status?: string;

  /**
   * Optional country filter, for example "US", "GB", "CA", or "AU".
   */
  country_code?: string;
}
```

## Shared Response Types

```ts
export interface AgentLocation {
  state_province?: string | null;
  country_code?: string | null;
}

export interface MatchHitsBuckets {
  genres?: string[];
  subgenres?: string[];
  target_audience?: string[];
  comps?: string[];
  themes?: string[];
}

export interface MatchHits {
  direct: MatchHitsBuckets;
  cluster: MatchHitsBuckets;
}

export interface ProvenanceCounts {
  direct: number;
  alias: number;
  hierarchy: number;
  crossover: number;
  adjacent: number;
}

export interface MatchProvenance {
  genres?: ProvenanceCounts;
  subgenres?: ProvenanceCounts;
  comps?: ProvenanceCounts;
  clients?: ProvenanceCounts;
  sales?: ProvenanceCounts;
  extra_interests?: ProvenanceCounts;
  favorites?: ProvenanceCounts;
  bio?: ProvenanceCounts;
  themes?: ProvenanceCounts;
  audience?: ProvenanceCounts;
}

export interface AgentMatch {
  agent_id: string | number | null;
  name: string;
  score: number;
  normalized_score: number;
  match_hits: MatchHits;

  /**
   * Present when cluster policy v2 telemetry is enabled.
   */
  match_provenance?: MatchProvenance;

  bio?: string | null;
  genres?: string | null;
  extra_interest?: string | null;
  favorites?: string | null;
  sales?: string | null;
  clients?: string | null;
  negatives?: string | null;
  status?: string | null;
  agency?: string | null;
  email?: string | null;
  website?: string | null;
  submission_req?: string | null;
  pubmarketplace?: string | null;
  querymanager?: string | null;
  querytracker?: string | null;
  twitter_handle?: string | null;
  extra_links?: string | null;
  aala_member?: boolean | null;
  location?: AgentLocation;
}

export interface ParsedWriterProjectData {
  email?: string | null;
  genre?: string | string[] | null;
  subgenres?: string[];
  target_audience?: string | null;
  format?: string | null;
  comps?: string[];
  themes?: string[];
  non_fiction?: boolean;
  enable_ai?: boolean;
  synopsis?: string | null;
  query_letter?: string | null;
  manuscript?: string | null;
  project_name?: string | null;
  project_description?: string | null;
  project_manuscript_pages?: string[];
  project_images?: string[];
  project_cover_image?: string | null;
}

export type PersistenceStatus =
  | "created_project"
  | "duplicate_project"
  | "existing_project_appended"
  | string;

export interface PersistedWriterProject {
  id: string;
  user_id: string;
  project_id?: string | null;
  genre?: string | null;
  subgenres?: string | string[] | null;
  format?: string | null;
  target_audience?: string | null;
  comps?: string | string[] | null;
  themes?: string | string[] | null;
  enable_ai?: boolean | null;
  non_fiction?: boolean | null;
  project_name?: string | null;
  project_description?: string | null;
  project_manuscript_pages?: string | string[] | null;
  project_images?: string | string[] | null;
  project_cover_image?: string | null;
  match_count?: number | null;
  content_hash?: string | null;
  created_at?: string | null;
  updated_at?: string | null;

  /**
   * The API returns the full writer_projects row, so deployments with extra
   * columns may include additional JSON-safe values.
   */
  [key: string]: unknown;
}

export interface GetAgentsErrorResponse {
  status: "error";
  message: string;
  persistence_error?: string;
}
```

## Paid Response

```ts
export interface GetAgentsPaidSuccessResponse {
  status: "success";
  matches: AgentMatch[];
  persisted_writer_project: PersistedWriterProject;
  persisted_writer_project_id: string;
  writer_project_id: string;
  project_id: string | null;
  persistence_status: PersistenceStatus;
  matches_added: number;
  matches_existing: number;
  match_count: number;

  /**
   * Sync mode returns string values.
   * Async mode returns null and includes task_id/sheet_status.
   */
  spreadsheet_id: string | null;
  spreadsheet_url: string | null;
  task_id?: string;
  sheet_status?: "creating";

  /**
   * Total number of cleaned matches sent to the paid Google Sheet.
   */
  total_agents: number;

  /**
   * Number of matches in this paginated HTTP response.
   */
  total_in_response: number;

  parsed: ParsedWriterProjectData;
  next_cursor: number | null;
  limit: number;
}

export type GetAgentsPaidResponse =
  | GetAgentsPaidSuccessResponse
  | GetAgentsErrorResponse;
```

## Free Response

```ts
export interface TierInfo {
  high: "4.0 - 5.0";
  medium: "3.25 - 3.99";
  low: "2.5 - 3.24";
}

export interface GetAgentsFreeSuccessResponse {
  status: "success";
  matches: AgentMatch[];
  persisted_writer_project: PersistedWriterProject;
  persisted_writer_project_id: string;
  writer_project_id: string;
  project_id: string | null;
  persistence_status: PersistenceStatus;
  matches_added: number;
  matches_existing: number;
  match_count: number;

  /**
   * Sync mode returns string values.
   * Async mode returns null and includes task_id/sheet_status.
   */
  spreadsheet_id: string | null;
  spreadsheet_url: string | null;
  task_id?: string;
  sheet_status?: "creating";

  /**
   * Number of cleaned sampled matches returned and persisted.
   */
  total_sampled: number;

  /**
   * Full eligible match count before free-tier sampling.
   */
  total_available: number;

  parsed: ParsedWriterProjectData;
  tier_info: TierInfo;
}

export type GetAgentsFreeResponse =
  | GetAgentsFreeSuccessResponse
  | GetAgentsErrorResponse;
```

## Notes For UI Callers

- `genre` may be sent as a string or string array, but the API normalizes list
  input to the first non-empty genre for matching.
- `query_letter` and `manuscript` may be raw text or file URLs. URL processing
  happens server-side before matching.
- `matches` are cleaned before these two endpoint responses are returned:
  internal `form_*` fields are removed, contact fields are simplified, and
  `location` is returned as `{ state_province, country_code }`.
- For async sheet creation, poll the separate sheet-status endpoint with the
  returned `task_id`.
