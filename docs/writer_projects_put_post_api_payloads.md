# Writer Project PUT/POST API Payloads

This file documents request payloads and JSON responses for:

- `POST /writer-projects`
- `PUT /writer-projects/<writer_project_id>`

Use these endpoints when the UI needs to create or edit a saved writer project
without running agent search. Existing saved agent matches are not created by
`POST` and are not modified by `PUT`.

## Endpoint Summary

```ts
export type CreateWriterProjectEndpoint = "/writer-projects";
export type UpdateWriterProjectEndpoint = `/writer-projects/${string}`;
```

| Field | POST | PUT |
|-------|------|-----|
| Method | `POST` | `PUT` |
| Path | `/writer-projects` | `/writer-projects/<writer_project_id>` |
| Content-Type | `application/json` | `application/json` |
| Auth | None | None |
| Required owner field | `email` in JSON body | `email` in JSON body |
| Required project identifier | None | `writer_project_id` URL path param |
| Required editable field | `project_name` | At least one editable writer project field |
| Success status | `201` | `200` |

## Request Types

Both endpoints validate the JSON body with `WriterProjectData`. `POST` requires
`project_name`; `PUT` requires `email` plus at least one editable field.

```ts
export interface WriterProjectPayloadFields {
  /**
   * Required. User email address used to resolve ownership.
   *
   * POST creates a user row if the email does not already exist.
   * PUT only updates projects owned by this email.
   */
  email: string;

  /**
   * Optional. The backend accepts a string or a list, but normalizes list input
   * to the first non-empty string.
   */
  genre?: string | string[] | null;

  subgenres?: string[] | null;
  format?: string | null;
  target_audience?: string | null;
  comps?: string[] | null;
  themes?: string[] | null;
  enable_ai?: boolean | null;
  non_fiction?: boolean | null;

  /**
   * Required for POST. Optional for PUT, but cannot be blank if included.
   */
  project_name?: string | null;

  project_description?: string | null;
  project_manuscript_pages?: string[] | null;
  project_images?: string[] | null;
  project_cover_image?: string | null;
}

export interface CreateWriterProjectRequestBody
  extends WriterProjectPayloadFields {
  email: string;
  project_name: string;
}

export type UpdateWriterProjectRequestBody =
  WriterProjectPayloadFields & {
    email: string;
  };
```

### Editable Fields

These fields can be created or updated:

- `genre`
- `subgenres`
- `format`
- `target_audience`
- `comps`
- `themes`
- `enable_ai`
- `non_fiction`
- `project_name`
- `project_description`
- `project_manuscript_pages`
- `project_images`
- `project_cover_image`

`email` is required for owner lookup but is not stored as a writer project
column. `synopsis`, `query_letter`, and `manuscript` are accepted by the shared
Pydantic model elsewhere in the app, but these endpoints do not persist them to
`writer_projects`.

## POST Request Example

```http
POST /writer-projects
Content-Type: application/json
```

```json
{
  "email": "writer@example.com",
  "genre": "fantasy",
  "subgenres": ["cozy fantasy"],
  "format": "novel",
  "target_audience": "adult",
  "comps": ["The Teller of Small Fortunes"],
  "themes": ["friendship", "magic"],
  "enable_ai": false,
  "non_fiction": false,
  "project_name": "The Glass Crown",
  "project_description": "A warm fantasy about a wandering cartographer.",
  "project_manuscript_pages": ["https://cdn.example.com/page-1.pdf"],
  "project_images": ["https://cdn.example.com/image-1.png"],
  "project_cover_image": "https://cdn.example.com/cover.png"
}
```

## PUT Request Example

```http
PUT /writer-projects/2a22f4b1-d4a4-4fa5-a373-96b939b58d47
Content-Type: application/json
```

```json
{
  "email": "writer@example.com",
  "project_description": "Updated fantasy project description.",
  "themes": ["friendship", "magic", "political intrigue"]
}
```

## Response Types

Both endpoints return the same success envelope. The nested `writer_project`
object is returned from `RETURNING *`, so it can include database columns beyond
the fields listed below. UUID and timestamp values are serialized as strings.

```ts
export interface WriterProject {
  id: string;
  user_id: string;
  project_id?: string | null;
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

export interface WriterProjectSuccessResponse {
  status: "success";
  writer_project_id: string;
  project_id?: string | null;
  writer_project: WriterProject;
}

export interface ApiErrorResponse {
  status: "error";
  message: string;
}

export type CreateWriterProjectResponse =
  | WriterProjectSuccessResponse
  | ApiErrorResponse;

export type UpdateWriterProjectResponse =
  | WriterProjectSuccessResponse
  | ApiErrorResponse;
```

## Response Examples

### POST `201` Success

```json
{
  "status": "success",
  "writer_project_id": "2a22f4b1-d4a4-4fa5-a373-96b939b58d47",
  "project_id": "c20f91a5-7a5b-471f-bc38-42b41606cb1c",
  "writer_project": {
    "id": "2a22f4b1-d4a4-4fa5-a373-96b939b58d47",
    "user_id": "7e8cc91d-2ff1-45c2-8a65-76795b85396d",
    "project_id": "c20f91a5-7a5b-471f-bc38-42b41606cb1c",
    "genre": "fantasy",
    "subgenres": ["cozy fantasy"],
    "format": "novel",
    "target_audience": "adult",
    "comps": ["The Teller of Small Fortunes"],
    "themes": ["friendship", "magic"],
    "enable_ai": false,
    "non_fiction": false,
    "project_name": "The Glass Crown",
    "project_description": "A warm fantasy about a wandering cartographer.",
    "project_manuscript_pages": ["https://cdn.example.com/page-1.pdf"],
    "project_images": ["https://cdn.example.com/image-1.png"],
    "project_cover_image": "https://cdn.example.com/cover.png",
    "match_count": 0,
    "content_hash": "e8d00f1ce2e46d0986c62c58d79fba94f4d0a02925b30f12fc969aacd9e4f2c5",
    "created_at": "2026-06-28T12:15:00+00:00",
    "updated_at": "2026-06-28T12:15:00+00:00",
    "deleted_at": null
  }
}
```

### PUT `200` Success

```json
{
  "status": "success",
  "writer_project_id": "2a22f4b1-d4a4-4fa5-a373-96b939b58d47",
  "project_id": "c20f91a5-7a5b-471f-bc38-42b41606cb1c",
  "writer_project": {
    "id": "2a22f4b1-d4a4-4fa5-a373-96b939b58d47",
    "user_id": "7e8cc91d-2ff1-45c2-8a65-76795b85396d",
    "project_id": "c20f91a5-7a5b-471f-bc38-42b41606cb1c",
    "genre": "fantasy",
    "subgenres": ["cozy fantasy"],
    "format": "novel",
    "target_audience": "adult",
    "comps": ["The Teller of Small Fortunes"],
    "themes": ["friendship", "magic", "political intrigue"],
    "enable_ai": false,
    "non_fiction": false,
    "project_name": "The Glass Crown",
    "project_description": "Updated fantasy project description.",
    "project_manuscript_pages": ["https://cdn.example.com/page-1.pdf"],
    "project_images": ["https://cdn.example.com/image-1.png"],
    "project_cover_image": "https://cdn.example.com/cover.png",
    "match_count": 3,
    "content_hash": "c0d4df8fa5cf7fa0d8f2b097dc83ca1f12f1f715de02ef02e8a59ba434f3e4ce",
    "created_at": "2026-06-28T12:15:00+00:00",
    "updated_at": "2026-06-28T12:30:00+00:00",
    "deleted_at": null
  }
}
```

### `400` Non-JSON Body

```json
{
  "status": "error",
  "message": "Request body must be a JSON object"
}
```

### POST `400` Missing Project Name

```json
{
  "status": "error",
  "message": "'project_name' is required"
}
```

### PUT `400` Invalid Path ID

```json
{
  "status": "error",
  "message": "'writer_project_id' must be a valid UUID"
}
```

### PUT `400` No Editable Fields

```json
{
  "status": "error",
  "message": "Request body must include at least one editable writer_project field"
}
```

### PUT `400` Blank Project Name

```json
{
  "status": "error",
  "message": "'project_name' cannot be blank"
}
```

### PUT `404` Not Found, Wrong Owner, Or Deleted

```json
{
  "status": "error",
  "message": "writer_project not found, not owned by this email, or deleted"
}
```

### `409` Duplicate Content

```json
{
  "status": "error",
  "message": "A writer_project with the same content already exists for this user"
}
```

### `500` Server Error

```json
{
  "status": "error",
  "message": "database error message"
}
```

## Frontend Fetch Examples

```ts
export async function createWriterProject(
  baseUrl: string,
  payload: CreateWriterProjectRequestBody,
): Promise<WriterProjectSuccessResponse> {
  const response = await fetch(`${baseUrl}/writer-projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = (await response.json()) as CreateWriterProjectResponse;

  if (!response.ok || body.status === "error") {
    throw Object.assign(new Error(body.message), { status: response.status });
  }

  return body;
}

export async function updateWriterProject(
  baseUrl: string,
  writerProjectId: string,
  payload: UpdateWriterProjectRequestBody,
): Promise<WriterProjectSuccessResponse> {
  const response = await fetch(`${baseUrl}/writer-projects/${writerProjectId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = (await response.json()) as UpdateWriterProjectResponse;

  if (!response.ok || body.status === "error") {
    throw Object.assign(new Error(body.message), { status: response.status });
  }

  return body;
}
```

## Behavior Notes

- `POST` creates a named writer project and returns `201`.
- `POST` creates the `users` row with `subscription_tier = "free"` if the email
  does not already exist.
- `POST` initializes `match_count` to `0` and does not run agent search.
- `PUT` partially updates only the fields included in the JSON body.
- `PUT` requires the path `writer_project_id` to be a valid UUID.
- `PUT` returns `404` if the project does not exist, is owned by another email,
  or has been soft-deleted.
- `PUT` preserves existing `writer_project_agent_matches` rows and does not run
  agent search.
- Both endpoints recompute `content_hash` from the editable project fields.
- Both endpoints can return `409` if the resulting content duplicates another
  writer project for the same user.
