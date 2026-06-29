# Get Writer Project Agents API TypeScript Interfaces

This file documents TypeScript interfaces for the request query parameters and
JSON responses for:

- `GET /get-writer-project-agents`

Use this endpoint when the UI needs to show agent matches that were previously
saved to a specific writer project.

## Endpoint Summary

```ts
export type GetWriterProjectAgentsEndpoint = "/get-writer-project-agents";
```

| Field | Value |
|-------|-------|
| Method | `GET` |
| Path | `/get-writer-project-agents` |
| Content-Type | None |
| Auth | None |
| Request body | None |

The endpoint ownership-validates the requested `writer_project_id` against the
user resolved by `email`, excludes soft-deleted projects, and returns saved
agent matches ordered by `rank` ascending.

## Request Query Parameters

```ts
export interface GetWriterProjectAgentsQueryParams {
  /**
   * Required. User email address used to validate ownership.
   *
   * The backend trims leading and trailing whitespace after decoding the query
   * string. Callers should still trim and URL-encode before sending.
   */
  email: string;

  /**
   * Required. Canonical writer_projects.id UUID returned by project creation
   * or by GET /get-writer-projects.
   */
  writer_project_id: string;
}
```

### Query Formatting

Build the URL with `URLSearchParams` so email addresses and UUIDs are encoded
consistently:

```ts
export function buildGetWriterProjectAgentsUrl(
  baseUrl: string,
  params: GetWriterProjectAgentsQueryParams,
): string {
  const query = new URLSearchParams({
    email: params.email.trim(),
    writer_project_id: params.writer_project_id.trim(),
  });

  return `${baseUrl}/get-writer-project-agents?${query.toString()}`;
}
```

Example request:

```text
GET /get-writer-project-agents?email=writer%40example.com&writer_project_id=2a22f4b1-d4a4-4fa5-a373-96b939b58d47
```

Formatting rules:

- `email` is required.
- `writer_project_id` is required.
- `writer_project_id` should be the UUID from `writer_projects.id`.
- Use the exact query key `writer_project_id`; this endpoint does not accept `project_id`.
- URL-encode all query values with `URLSearchParams`.
- Do not send a JSON body.
- There is no pagination, limit, cursor, sort, or filter parameter for this endpoint.

## Response Types

Each returned agent row is a join of saved-match fields from
`writer_project_agent_matches` plus all columns from `agents_metadata_enriched`.
Known timestamp and UUID values are serialized as strings.

```ts
export type MatchHits = Record<string, unknown> | null;

export interface WriterProjectSavedAgent {
  /**
   * Saved-match fields from writer_project_agent_matches.
   */
  rank: number;
  score: number | null;
  match_hits: MatchHits;

  /**
   * Common fields from agents_metadata_enriched.
   * The route returns ame.*, so additive metadata columns may also be present.
   */
  agent_id: string;
  name?: string | null;
  agency?: string | null;
  website?: string | null;
  email?: string | null;
  country_code?: string | null;
  state_province?: string | null;
  bio?: string | null;
  submission_req?: string | null;
  clients?: string | null;
  sales?: string | null;
  genres?: string | null;
  extra_interest?: string | null;
  favorites?: string | null;
  negatives?: string | null;
  status?: string | null;
  twitter_handle?: string | null;
  aala_member?: boolean | null;
  pubmarketplace?: string | null;
  querymanager?: string | null;
  querytracker?: string | null;
  extra_links?: string | null;

  /**
   * The backend returns every column from agents_metadata_enriched.
   * Keep this index signature so frontend code tolerates additive DB columns.
   */
  [column: string]: unknown;
}

export interface GetWriterProjectAgentsSuccessResponse {
  status: "success";
  writer_project_id: string;
  match_count: number;
  agents: WriterProjectSavedAgent[];
}

export interface ApiErrorResponse {
  status: "error";
  message: string;
}

export type GetWriterProjectAgentsResponse =
  | GetWriterProjectAgentsSuccessResponse
  | ApiErrorResponse;
```

## Response Examples

### `200` Success

```json
{
  "status": "success",
  "writer_project_id": "2a22f4b1-d4a4-4fa5-a373-96b939b58d47",
  "match_count": 2,
  "agents": [
    {
      "rank": 1,
      "score": 4.7,
      "match_hits": {
        "genres": ["fantasy"],
        "themes": ["magic"]
      },
      "agent_id": "9ff2d1c8-6c5f-40b7-b102-fb7303c5ad42",
      "name": "Example Agent",
      "agency": "Example Literary",
      "website": "https://example.com",
      "email": "agent@example.com",
      "country_code": "US",
      "state_province": "NY",
      "bio": "Represents adult fantasy and speculative fiction.",
      "submission_req": "Query letter and first ten pages.",
      "clients": "Example Client",
      "sales": "Example Sale",
      "genres": "fantasy, science fiction",
      "extra_interest": "High-concept speculative fiction",
      "favorites": "Voice-driven fantasy",
      "negatives": "No poetry",
      "status": "open",
      "twitter_handle": "@exampleagent",
      "aala_member": true,
      "pubmarketplace": "https://www.publishersmarketplace.com/example",
      "querymanager": "https://querymanager.com/example",
      "querytracker": "https://querytracker.net/example",
      "extra_links": "https://example.com/submissions"
    },
    {
      "rank": 2,
      "score": 4.5,
      "match_hits": null,
      "agent_id": "355dcd25-8cd1-4ba5-90bf-6541d84c7ca2",
      "name": "Second Example Agent",
      "agency": "Another Agency"
    }
  ]
}
```

### `400` Missing Email

```json
{
  "status": "error",
  "message": "email parameter is required"
}
```

### `400` Missing Writer Project ID

```json
{
  "status": "error",
  "message": "writer_project_id parameter is required"
}
```

### `404` Not Found, Not Owned, Or Deleted

```json
{
  "status": "error",
  "message": "writer_project not found, not owned by this email, or deleted"
}
```

### `500` Server Error

```json
{
  "status": "error",
  "message": "database error message"
}
```

## Frontend Fetch Example

```ts
export async function getWriterProjectAgents(
  baseUrl: string,
  params: GetWriterProjectAgentsQueryParams,
): Promise<GetWriterProjectAgentsSuccessResponse> {
  const response = await fetch(buildGetWriterProjectAgentsUrl(baseUrl, params));
  const body = (await response.json()) as GetWriterProjectAgentsResponse;

  if (!response.ok || body.status === "error") {
    throw Object.assign(new Error(body.message), { status: response.status });
  }

  return body;
}
```

## Behavior Notes

- Results are ordered by `rank ASC`.
- `match_count` is the number of joined agent rows returned in this response.
- A wrong email, bogus `writer_project_id`, or soft-deleted project returns `404`.
- Missing or blank `email` returns `400`.
- Missing or blank `writer_project_id` returns `400`.
- The endpoint only returns projects owned by the email's user.
