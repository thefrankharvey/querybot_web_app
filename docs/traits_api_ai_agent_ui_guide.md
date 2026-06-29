# Traits API - AI Agent UI Integration Guide

This guide documents the two manuscript trait dictionary routes a UI agent needs
for reading allowed options and adding new trait values:

- `GET /get-traits`
- `POST /create-trait`

Use these APIs to power genre, subgenre, theme, and format dropdowns,
autocomplete inputs, and "add a missing trait" UI flows.

## Base Request Rules

**Base URL**

- Local dev: `http://127.0.0.1:5000`
- Production: the deployed Flask API URL

```ts
const BASE_URL = "http://127.0.0.1:5000";
```

**Auth:** none currently.

**Content type:** `POST /create-trait` must send
`Content-Type: application/json`.

**Allowed trait types:** `genre`, `subgenre`, `theme`, `format`.

## TypeScript Contracts

```ts
export type TraitType = "genre" | "subgenre" | "theme" | "format";

export interface ApiErrorResponse {
  status: "error";
  message: string;
}

export interface GetTraitsQuery {
  /**
   * Optional. When omitted, the API returns all trait groups.
   */
  type?: TraitType;

  /**
   * Optional case-insensitive substring search against trait_value.
   * Useful for autocomplete.
   */
  q?: string;

  /**
   * Optional positive integer row cap. Non-numeric values return 400.
   * Values below 1 are ignored by the server.
   */
  limit?: number;
}

export interface GetTraitsByTypeSuccessResponse {
  status: "success";
  traits: string[];
}

export interface GetTraitsAllSuccessResponse {
  status: "success";
  traits: Record<TraitType, string[]>;
}

export type GetTraitsResponse =
  | GetTraitsByTypeSuccessResponse
  | GetTraitsAllSuccessResponse
  | ApiErrorResponse;

export interface CreateTraitPayload {
  type: TraitType;
  value: string;
}

export interface ManuscriptTrait {
  id: string | number;
  trait_type: TraitType;
  trait_value: string;
  created_at: string;

  /**
   * Present in some environments/docs, but not required by current tests.
   */
  updated_at?: string;
}

export interface CreateTraitSuccessResponse {
  status: "success";
  trait: ManuscriptTrait;
}

export type CreateTraitResponse =
  | CreateTraitSuccessResponse
  | ApiErrorResponse;
```

## `GET /get-traits`

Returns canonical trait values from the `manuscript_traits` dictionary.
Returned values are strings sorted alphabetically.

### Query Parameters

| Param | Type | Required | Description |
|---|---|---:|---|
| `type` | `TraitType` | no | If present, returns one list. If omitted, returns all four lists grouped by type. |
| `q` | string | no | Case-insensitive substring filter. Use for autocomplete. |
| `limit` | number | no | Positive integer cap on returned rows. Useful with `q`. |

### Success Responses

**200 with `type`:**

```json
{
  "status": "success",
  "traits": ["fantasy", "literary-fiction", "romance"]
}
```

**200 without `type`:**

```json
{
  "status": "success",
  "traits": {
    "genre": ["fantasy", "literary-fiction"],
    "subgenre": ["cozy-mystery", "romantasy"],
    "theme": ["found-family", "second-chance"],
    "format": ["novel", "screenplay"]
  }
}
```

### Error Responses

| Status | Meaning | Shape |
|---:|---|---|
| `400` | Invalid `type` or non-numeric `limit` | `{ "status": "error", "message": string }` |
| `500` | Server/database failure | `{ "status": "error", "message": string }` |

### UI Examples

Preload all options when the form opens:

```ts
async function loadAllTraits(): Promise<Record<TraitType, string[]>> {
  const res = await fetch(`${BASE_URL}/get-traits`);
  const body = (await res.json()) as GetTraitsResponse;

  if (!res.ok || body.status === "error") {
    const message = body.status === "error" ? body.message : "Failed to load traits";
    throw new Error(message);
  }

  if (Array.isArray(body.traits)) {
    throw new Error("Expected grouped trait response");
  }

  return body.traits;
}
```

Fetch autocomplete suggestions for one field:

```ts
async function suggestTraits(
  type: TraitType,
  query: string,
  limit = 20,
): Promise<string[]> {
  const params = new URLSearchParams({
    type,
    q: query,
    limit: String(limit),
  });

  const res = await fetch(`${BASE_URL}/get-traits?${params}`);
  const body = (await res.json()) as GetTraitsResponse;

  if (!res.ok || body.status === "error") {
    const message =
      body.status === "error" ? body.message : "Failed to load trait suggestions";
    throw new Error(message);
  }

  if (!Array.isArray(body.traits)) {
    throw new Error("Expected single trait list response");
  }

  return body.traits;
}
```

## `POST /create-trait`

Adds a new `(type, value)` row to the `manuscript_traits` dictionary.

### Payload

```json
{
  "type": "subgenre",
  "value": "cottagecore-romance"
}
```

Both fields are required. The server trims whitespace from `type` and `value`,
lowercases `type`, rejects unknown trait types, and rejects empty values.

### Success Response

**201 created:**

```json
{
  "status": "success",
  "trait": {
    "id": "8b3f4",
    "trait_type": "subgenre",
    "trait_value": "cottagecore-romance",
    "created_at": "2026-06-25T19:00:00Z",
    "updated_at": "2026-06-25T19:00:00Z"
  }
}
```

### Error Responses

| Status | Meaning | Shape |
|---:|---|---|
| `400` | Body is not JSON, `type` is invalid, or `value` is empty/missing | `{ "status": "error", "message": string }` |
| `409` | Exact `(type, value)` already exists | `{ "status": "error", "message": string }` |
| `500` | Server/database failure | `{ "status": "error", "message": string }` |

### UI Example

```ts
async function createTrait(
  payload: CreateTraitPayload,
): Promise<
  | { created: true; trait: ManuscriptTrait }
  | { created: false; reason: "already_exists" }
> {
  const res = await fetch(`${BASE_URL}/create-trait`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const body = (await res.json()) as CreateTraitResponse;

  if (res.status === 201 && body.status === "success") {
    return { created: true, trait: body.trait };
  }

  if (res.status === 409) {
    return { created: false, reason: "already_exists" };
  }

  const message = body.status === "error" ? body.message : "Failed to create trait";
  throw new Error(message);
}
```

## AI Agent UI Integration Instructions

When integrating these routes into a UI, follow this behavior:

1. On form load, call `GET /get-traits` with no query params and cache the
   grouped response in UI state.
2. Use the cached `genre`, `subgenre`, `theme`, and `format` arrays to populate
   selects, comboboxes, and autocomplete inputs.
3. For large dynamic fields like `theme` and `subgenre`, call
   `GET /get-traits?type=<type>&q=<user input>&limit=20` as the user types.
4. Debounce autocomplete calls in the UI, usually by 200-300 ms.
5. Before calling `POST /create-trait`, normalize the user-entered value:
   trim whitespace, lowercase it, and convert spaces to the convention used by
   that field. Genres, subgenres, and themes generally use lowercase kebab-case;
   formats generally use lowercase snake_case.
6. Send only `{ type, value }` to `POST /create-trait`. Do not send `id`,
   `created_at`, or `updated_at`.
7. Treat `409` as a non-fatal outcome. Show or store the existing value as
   selectable instead of presenting it as a hard failure.
8. After a successful `201`, either append `trait.trait_value` to the matching
   cached option list or refetch `GET /get-traits?type=<type>` to refresh the
   canonical list.
9. If a request returns an `ApiErrorResponse`, surface `message` to the user or
   log it for the agent workflow.

## Status Code Quick Reference

| Route | Success | Client errors | Duplicate | Server error |
|---|---:|---:|---:|---:|
| `GET /get-traits` | `200` | `400` | n/a | `500` |
| `POST /create-trait` | `201` | `400` | `409` | `500` |

## Endpoint Quick Reference

```txt
GET  /get-traits
GET  /get-traits?type=genre
GET  /get-traits?type=theme&q=fantasy&limit=20
POST /create-trait
```
