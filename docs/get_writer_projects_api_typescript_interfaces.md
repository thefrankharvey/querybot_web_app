# Get Writer Projects API TypeScript Interfaces

This file documents TypeScript interfaces for the request query parameters and
JSON responses for:

- `GET /get-writer-projects`

Use this endpoint when the UI needs to list a user's saved writer projects,
usually so the user can pick a project before viewing saved agent matches or
appending new matches.

## Endpoint Summary

```ts
export type GetWriterProjectsEndpoint = "/get-writer-projects";
```

| Field | Value |
|-------|-------|
| Method | `GET` |
| Path | `/get-writer-projects` |
| Content-Type | None |
| Auth | None |
| Request body | None |

The endpoint returns all non-deleted `writer_projects` rows for the user
resolved by `email`, sorted by `created_at` descending so the most recent
project appears first.

If the email does not match a user row, the endpoint still returns `200` with
an empty `writer_projects` array.

## Request Query Parameters

```ts
export interface GetWriterProjectsQueryParams {
  /**
   * Required. User email address used to resolve ownership.
   *
   * The backend trims leading and trailing whitespace after decoding the query
   * string. Callers should still trim and URL-encode before sending.
   */
  email: string;
}
```

### Query Formatting

Build the URL with `URLSearchParams` so special characters are encoded
correctly:

```ts
export function buildGetWriterProjectsUrl(
  baseUrl: string,
  params: GetWriterProjectsQueryParams,
): string {
  const query = new URLSearchParams({
    email: params.email.trim(),
  });

  return `${baseUrl}/get-writer-projects?${query.toString()}`;
}
```

Example request:

```text
GET /get-writer-projects?email=writer%40example.com
```

Formatting rules:

- `email` is required.
- `email` should be a normal email string, for example `writer@example.com`.
- URL-encode the value. `URLSearchParams` encodes `@` as `%40`.
- Do not send a JSON body.
- There is no pagination, status filter, or sort parameter for this endpoint.

## Response Types

The route returns `SELECT *` from `writer_projects`, so the response can include
database columns beyond the fields listed below. Known timestamp and UUID values
are serialized as strings.

```ts
export interface WriterProject {
  id: string;
  user_id: string;
  genre?: string | null;
  subgenres?: string[] | string | null;
  format?: string | null;
  target_audience?: string | null;
  comps?: string[] | string | null;
  themes?: string[] | string | null;
  enable_ai?: boolean | null;
  non_fiction?: boolean | null;
  project_name?: string | null;
  project_description?: string | null;
  project_manuscript_pages?: string[] | null;
  project_images?: string[] | null;
  project_cover_image?: string | null;
  match_count?: number | null;
  content_hash?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;

  /**
   * The backend returns every column from writer_projects.
   * Keep this index signature so frontend code tolerates additive DB columns.
   */
  [column: string]: unknown;
}

export interface GetWriterProjectsSuccessResponse {
  status: "success";
  writer_projects: WriterProject[];
}

export interface ApiErrorResponse {
  status: "error";
  message: string;
}

export type GetWriterProjectsResponse =
  | GetWriterProjectsSuccessResponse
  | ApiErrorResponse;
```

## Response Examples

### `200` Success

```json
{
  "status": "success",
  "writer_projects": [
    {
      "id": "2a22f4b1-d4a4-4fa5-a373-96b939b58d47",
      "user_id": "7e8cc91d-2ff1-45c2-8a65-76795b85396d",
      "genre": "fantasy",
      "subgenres": ["romantasy"],
      "format": "novel",
      "target_audience": "adult",
      "comps": ["A Court of Thorns and Roses"],
      "themes": ["magic", "political intrigue"],
      "enable_ai": false,
      "non_fiction": false,
      "project_name": "The Glass Crown",
      "project_description": "Adult fantasy with court intrigue.",
      "project_manuscript_pages": [],
      "project_images": [],
      "project_cover_image": null,
      "match_count": 50,
      "created_at": "2026-06-28T11:45:00+00:00",
      "updated_at": "2026-06-28T11:45:00+00:00",
      "deleted_at": null
    }
  ]
}
```

### `200` Unknown Email Or No Projects

```json
{
  "status": "success",
  "writer_projects": []
}
```

### `400` Missing Email

```json
{
  "status": "error",
  "message": "email parameter is required"
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
export async function getWriterProjects(
  baseUrl: string,
  params: GetWriterProjectsQueryParams,
): Promise<GetWriterProjectsSuccessResponse> {
  const response = await fetch(buildGetWriterProjectsUrl(baseUrl, params));
  const body = (await response.json()) as GetWriterProjectsResponse;

  if (!response.ok || body.status === "error") {
    throw Object.assign(new Error(body.message), { status: response.status });
  }

  return body;
}
```

## Behavior Notes

- Soft-deleted projects are excluded with `deleted_at IS NULL`.
- Projects are sorted newest first by `created_at DESC`.
- Unknown email is not an error; callers should show an empty-project state.
- Missing or blank `email` returns `400`.
