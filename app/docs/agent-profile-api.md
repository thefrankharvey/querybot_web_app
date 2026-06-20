# Agent Profile API

Literary agents can create and manage self-submitted profile rows in the `agent_profile_data` table. Each profile links 1:1 to a row in `agents_metadata_enriched` via `legacy_agent_id`.

Shipped in PR #36 (`141fbd3`) with name-normalization fix in PR #38 (`c6281b5`).

| Endpoint                     | Method | Purpose                                         |
| ---------------------------- | ------ | ----------------------------------------------- |
| `POST /create-agent-profile` | POST   | Agent signup — create a profile row             |
| `GET /get-agent-profile`     | GET    | Fetch one profile by id, name, or email         |
| `GET /get-all-agent-data`    | GET    | Bulk export from profile and/or legacy tables   |
| `GET /get-agent`             | GET    | Fetch one legacy enriched row (extended lookup) |

Send `Content-Type: application/json` on POST requests. These routes do not currently enforce auth.

**Related docs**

- [`docs/agent_profile_routes_frontend_guide.md`](../../docs/agent_profile_routes_frontend_guide.md) — copy-paste `fetch` / `curl` examples
- [`app/docs/get-agents-api.md`](get-agents-api.md) — author-facing matching APIs (`/get-agents-free`, `/get-agents-paid`)

---

## Database: `agent_profile_data`

Reflected in [`app/db.py`](../db.py):

```python
agent_profile_data = metadata.tables.get("agent_profile_data")
```

**Schema design**

- **1:1 link** to `agents_metadata_enriched` via `legacy_agent_id` (UNIQUE FK, `ON DELETE RESTRICT`)
- **Profile-only columns** (never overwritten by legacy backfill): `profile_id`, `legacy_agent_id`, `is_active`, `title`, `subgenres`, `instagram_handle`, `bluesky_handle`, `linkedin_url`, `created_at`, `updated_at`
- **Shared columns** with enriched table: `name`, `bio`, `agency`, `genres`, `email`, `website`, social handles, location fields, acceptance flags, etc.
- **`is_active` soft-delete** — bidirectionally synced with `agents_metadata_enriched` via DB triggers
- **RLS enabled** — no policies yet; service-role access only
- Server-managed: `profile_id`, `created_at`, `updated_at` (auto-bumped on UPDATE)

**Canonical ID:** use `legacy_agent_id` (not `profile_id`) as the public agent identifier and join key.

---

## `POST /create-agent-profile`

Create one row in `agent_profile_data`. Used by the agent signup flow.

Implementation: [`flask_app.py`](../../flask_app.py) — `create_agent_profile()`

### Request body

JSON object. **At least one of `legacy_agent_id` or `name` is required.**

| Field                  | Required         | Type        | Description                                                                               |
| ---------------------- | ---------------- | ----------- | ----------------------------------------------------------------------------------------- |
| `legacy_agent_id`      | One of these two | UUID string | FK to `agents_metadata_enriched.agent_id`. Recommended — resolve this before signup.      |
| `name`                 | One of these two | string      | If `legacy_agent_id` is omitted, the server looks up the enriched row by normalized name. |
| `title`                | No               | string      | Job title, e.g. `"Senior Literary Agent"`                                                 |
| `agency`               | No               | string      | Agency name                                                                               |
| `bio`                  | No               | string      | Agent bio                                                                                 |
| `genres`               | No               | string      | Pipe-separated, e.g. `"romance\|literary fiction"`                                        |
| `subgenres`            | No               | string      | Pipe-separated                                                                            |
| `extra_interest`       | No               | string      | Additional interests                                                                      |
| `email`                | No               | string      | Contact email                                                                             |
| `website`              | No               | string      | Website URL                                                                               |
| `twitter_handle`       | No               | string      | e.g. `"@abigailkoons"`                                                                    |
| `instagram_handle`     | No               | string      |                                                                                           |
| `bluesky_handle`       | No               | string      |                                                                                           |
| `linkedin_url`         | No               | string      |                                                                                           |
| `city`                 | No               | string      |                                                                                           |
| `state_province`       | No               | string      | State, province, or region                                                                |
| `country`              | No               | string      |                                                                                           |
| `country_code`         | No               | string      | ISO-2, e.g. `"US"`                                                                        |
| `location`             | No               | string      | Free-text location                                                                        |
| `open_to_queries`      | No               | string      | e.g. `"yes"`                                                                              |
| `accepts_middle_grade` | No               | boolean     |                                                                                           |
| `accepts_young_adult`  | No               | boolean     |                                                                                           |
| `accepts_screenplay`   | No               | boolean     |                                                                                           |
| `accepts_comics`       | No               | boolean     |                                                                                           |
| `accepts_children`     | No               | boolean     |                                                                                           |
| `accepts_poetry`       | No               | boolean     |                                                                                           |
| `accepts_nonfiction`   | No               | boolean     |                                                                                           |
| `is_active`            | No               | boolean     | Soft-delete flag; defaults to `true`                                                      |

**Rules**

- Unknown keys are silently ignored.
- `profile_id`, `created_at`, and `updated_at` are server-managed and cannot be set.
- Any other valid `agent_profile_data` column may be included.
- Name-based legacy lookup is case- and whitespace-insensitive (`"John Doe"` == `"johndoe"` == `"John  Doe"`).

**Example — recommended (client already has `legacy_agent_id`)**

```json
{
  "legacy_agent_id": "b19a5415-fc0b-4588-963f-a7a374f20a16",
  "name": "Abigail Koons",
  "title": "Senior Literary Agent",
  "bio": "I represent commercial and literary fiction.",
  "genres": "romance|literary fiction",
  "subgenres": "contemporary romance|book club",
  "email": "abigail@example.com",
  "website": "https://abigailkoons.com",
  "instagram_handle": "@abigailkoons",
  "bluesky_handle": "abigailkoons.bsky.social",
  "linkedin_url": "https://linkedin.com/in/abigail-koons",
  "city": "New York",
  "state_province": "NY",
  "country_code": "US",
  "accepts_young_adult": true,
  "accepts_nonfiction": false
}
```

**Example — server-side name lookup (no `legacy_agent_id`)**

```json
{
  "name": "Abigail Koons",
  "title": "Senior Agent",
  "bio": "I represent commercial and literary fiction."
}
```

### Response

#### Success — `201 Created`

```json
{
  "status": "success",
  "agent": {
    "profile_id": "a185acc4-5949-4134-9f74-e6aba880fc77",
    "legacy_agent_id": "b19a5415-fc0b-4588-963f-a7a374f20a16",
    "is_active": true,
    "name": "Abigail Koons",
    "title": "Senior Literary Agent",
    "bio": "I represent commercial and literary fiction.",
    "agency": null,
    "genres": "romance|literary fiction",
    "subgenres": null,
    "extra_interest": null,
    "email": "abigail@example.com",
    "website": "https://abigailkoons.com",
    "twitter_handle": null,
    "instagram_handle": "@abigailkoons",
    "bluesky_handle": "abigailkoons.bsky.social",
    "linkedin_url": "https://linkedin.com/in/abigail-koons",
    "city": "New York",
    "state_province": "NY",
    "country": null,
    "country_code": "US",
    "location": null,
    "open_to_queries": null,
    "accepts_middle_grade": null,
    "accepts_young_adult": true,
    "accepts_screenplay": null,
    "accepts_comics": null,
    "accepts_children": null,
    "accepts_poetry": null,
    "accepts_nonfiction": false,
    "created_at": "2026-06-13T17:53:18.584Z",
    "updated_at": "2026-06-13T17:53:18.584Z"
  }
}
```

| Field                   | Type        | Description                                                              |
| ----------------------- | ----------- | ------------------------------------------------------------------------ |
| `status`                | `"success"` | Outcome                                                                  |
| `agent`                 | object      | Full created row including server-set `profile_id` and timestamps        |
| `agent.profile_id`      | UUID        | Row primary key (internal; use `legacy_agent_id` as the public agent ID) |
| `agent.legacy_agent_id` | UUID        | Canonical agent identifier — use for URLs and subsequent lookups         |
| `agent.is_active`       | boolean     | Defaults to `true`                                                       |

Omitted or unset columns return `null` unless the database applies a default.

#### Errors

All errors use `"status": "error"` and a `"message"` string.

| HTTP  | When                                                                               |
| ----- | ---------------------------------------------------------------------------------- |
| `400` | Body is not JSON, or both `legacy_agent_id` and `name` are missing                 |
| `404` | `legacy_agent_id` not found in enriched table, or name lookup found 0 matches      |
| `409` | Profile already exists for that `legacy_agent_id`, or name lookup found 2+ matches |
| `500` | Unexpected server error                                                            |

**409 with name disambiguation** — retry with a chosen `legacy_agent_id`:

```json
{
  "status": "error",
  "message": "Multiple legacy agents match name 'Abigail Koons'; pass legacy_agent_id directly",
  "candidates": ["uuid-1", "uuid-2"]
}
```

**409 duplicate signup:**

```json
{
  "status": "error",
  "message": "An agent profile already exists for legacy_agent_id 'b19a5415-fc0b-4588-963f-a7a374f20a16'"
}
```

---

## `GET /get-agent-profile`

Fetch one `agent_profile_data` row by id, name, or email.

Implementation: [`flask_app.py`](../../flask_app.py) — `get_agent_profile()`

### Query parameters

| Param              | Required | Values                    | Description                                                                                                       |
| ------------------ | -------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `lookup_by`        | Yes      | `id` \| `name` \| `email` | `id` = `legacy_agent_id`                                                                                          |
| `value`            | Yes      | string                    | Lookup value                                                                                                      |
| `with_legacy_data` | No       | `true` / `false`          | Default `false`. When `true`, NULL profile fields are backfilled from the enriched row at read time (no DB write) |

Name lookups are normalized (lowercase + all whitespace stripped). Email lookups are case-insensitive.

### Response

**200 — success**

```json
{
  "status": "success",
  "agent": { "...full profile row..." }
}
```

**400** — missing params or unknown `lookup_by`  
**404** — no profile found  
**409** — multiple matches; includes `candidates: [<legacy_agent_id>, ...]`

**Recommended for public profile pages:** `with_legacy_data=true` — agent-submitted data wins; legacy fills gaps.

---

## `GET /get-all-agent-data`

Return every agent row from one or both tables. **No pagination** (~3,300 legacy rows). Use for admin dashboards and exports, not end-user list views.

Implementation: [`flask_app.py`](../../flask_app.py) — `get_all_agent_data()`

### Query parameters

| Param         | Required | Default | Description              |
| ------------- | -------- | ------- | ------------------------ |
| `which_table` | No       | `both`  | Which table(s) to return |

**`which_table` accepted values** (case-insensitive):

| Value                                                        | Response shape                                |
| ------------------------------------------------------------ | --------------------------------------------- |
| `both` (default)                                             | `{ profile_data: [...], legacy_data: [...] }` |
| `profile`, `profile_data`, `agent_profile_data`              | `{ agents: [...] }` from profile table        |
| `legacy`, `enriched`, `metadata`, `agents_metadata_enriched` | `{ agents: [...] }` from enriched table       |

### Response

**200 — `which_table=both`**

```json
{
  "status": "success",
  "profile_data": ["...agent_profile_data rows..."],
  "legacy_data": ["...agents_metadata_enriched rows..."]
}
```

**200 — single table**

```json
{
  "status": "success",
  "agents": ["...rows..."]
}
```

**400** — unknown `which_table` value

---

## `GET /get-agent`

Fetch one row from `agents_metadata_enriched` (legacy scraped data). Existing route, extended with new lookup style.

Implementation: [`flask_app.py`](../../flask_app.py) — `get_agent()`

### Query parameters

Two styles, both supported:

| Param                 | Notes                                                                        |
| --------------------- | ---------------------------------------------------------------------------- |
| `agent_id=<uuid>`     | **Legacy / backward-compatible.** Equivalent to `lookup_by=id&value=<uuid>`. |
| `lookup_by` + `value` | `id` \| `name` \| `email`                                                    |

Name lookups use the same normalization as profile routes.

### Response

**200**

```json
{
  "status": "success",
  "agent": { "...enriched row; agent_id is the legacy_agent_id..." }
}
```

**400** — missing params  
**404** — no match  
**409** — multiple matches; `candidates: [<agent_id>, ...]`

### When to use `/get-agent` vs `/get-agent-profile`

| Route                                      | Data source                                     |
| ------------------------------------------ | ----------------------------------------------- |
| `/get-agent`                               | Legacy scraped data (~3,285 rows)               |
| `/get-agent-profile`                       | Agent self-submitted profile (signup rows only) |
| `/get-agent-profile?with_legacy_data=true` | Self-submitted with legacy filling NULL fields  |

---

## Name normalization

Name lookups on `/get-agent`, `/get-agent-profile`, and the name-based legacy lookup inside `/create-agent-profile` normalize both the input and stored name before comparison:

- Python: `_normalize_name_for_lookup()` — lowercase + strip all whitespace
- SQL: `_normalized_name_expr()` — `LOWER(REGEXP_REPLACE(name, '\s+', '', 'g'))`

So `"JOHn Doe"`, `"john doe"`, `"JohnDoe"`, and `"  John Doe  "` all match the same agent.

**Not yet handled:** typos, punctuation differences, unicode normalization.

---

## Quick comparison: which route when?

| Need                                        | Route                                          |
| ------------------------------------------- | ---------------------------------------------- |
| Agent signup / create profile               | `POST /create-agent-profile`                   |
| Show agent's self-submitted profile         | `GET /get-agent-profile`                       |
| Show profile with scraped data filling gaps | `GET /get-agent-profile?with_legacy_data=true` |
| Look up scraped/legacy data only            | `GET /get-agent`                               |
| Admin export of all agents                  | `GET /get-all-agent-data`                      |
| Match authors to agents (query form)        | `POST /get-agents-free` or `/get-agents-paid`  |

---

## UI integration (for AI agents)

Use this flow when building a conversational agent signup experience.

### 1. Check for an existing profile

When the user says they are a literary agent and gives their name or email:

```
GET /get-agent-profile?lookup_by=name&value=<encoded name>
```

- **404** — no profile yet; continue to step 2.
- **200** — profile exists; show their profile or an "already signed up" message. Use `legacy_agent_id` from the response as the canonical ID.
- **409** — multiple matches; show a disambiguation picker using `candidates`, then re-fetch by id.

### 2. Resolve the legacy agent ID

If you do not already have `legacy_agent_id`:

```
GET /get-agent?lookup_by=name&value=<encoded name>
```

- **200** — use `agent.agent_id` as `legacy_agent_id` in the create payload.
- **404** — agent not in the enriched database; they cannot sign up through this flow.
- **409** — show disambiguation picker; user picks one; use that `agent_id`.

Alternatively, omit `legacy_agent_id` from the create body and pass only `name` — the server performs this lookup, but the client loses control over disambiguation UX unless you handle 409.

### 3. Collect profile fields in chat

Gather fields conversationally. Minimum for create: `legacy_agent_id` or `name`. Recommended fields to ask for:

- `name`, `title`, `agency`, `bio`
- `genres`, `subgenres` (join multi-select answers with `|`)
- `email`, `website`, social handles
- `city`, `state_province`, `country_code`
- acceptance booleans (`accepts_young_adult`, etc.)

Do not ask for `profile_id`, `created_at`, or `updated_at`.

### 4. Submit the profile

```
POST /create-agent-profile
Content-Type: application/json

{ ...collected fields... }
```

Handle responses:

| Status               | UI action                                                                         |
| -------------------- | --------------------------------------------------------------------------------- |
| `201`                | Confirm success. Store `agent.legacy_agent_id`. Show a summary card from `agent`. |
| `400`                | Ask for missing identity (`legacy_agent_id` or `name`).                           |
| `404`                | Explain the agent was not found in the legacy database.                           |
| `409` + `candidates` | Show "Did you mean…?" picker; retry with chosen `legacy_agent_id`.                |
| `409` (duplicate)    | Redirect to existing profile view or offer edit flow.                             |
| `500`                | Generic error; suggest retry.                                                     |

### 5. Render the created profile

After `201`, display key fields from `agent`:

- Name, title, agency, bio
- Genres/subgenres — split on `|` for chips
- Contact: email, website, social links
- Location: city, state_province, country_code

For a richer public page after signup, fetch again with legacy backfill:

```
GET /get-agent-profile?lookup_by=id&value=<legacy_agent_id>&with_legacy_data=true
```

Profile values always win; legacy data only fills `null` fields.

### 6. Field conventions

- **`legacy_agent_id`** — canonical public agent ID (not `profile_id`).
- **`genres` / `subgenres`** — pipe-separated strings, not JSON arrays.
- **`is_active`** — treat `false` as deactivated; hide from public listings.
- **Name matching** — `"John Doe"`, `"johndoe"`, and `"  John Doe  "` all match; URL-encode query params.

### Example conversation → API sequence

1. User: "I'm Abigail Koons, a literary agent. I'd like to claim my profile."
2. AI: `GET /get-agent-profile?lookup_by=name&value=Abigail%20Koons` → 404
3. AI: `GET /get-agent?lookup_by=name&value=Abigail%20Koons` → 200, `agent_id = b19a5415-…`
4. AI collects title, bio, genres, social links in chat
5. AI: `POST /create-agent-profile` with `legacy_agent_id`, collected fields → 201
6. AI renders confirmation card from `response.agent`

---

## Tests

Integration tests: [`tests/matching/test_agent_profile_routes.py`](../../tests/matching/test_agent_profile_routes.py)

- 30 tests marked `@pytest.mark.db` (require live Supabase)
- Each test self-cleans profile rows via fixture
- Covers create, get, get-all, name normalization, legacy backfill, and error cases
