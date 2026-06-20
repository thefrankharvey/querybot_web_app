# Agent Profile API — Frontend Guide

How to call the three new agent-profile routes from the front end. Every example
is copy-pasteable. Examples show both `fetch` (vanilla JS / React) and `curl`
so you can debug from a terminal too.

**Base URL**

- Local dev: `http://127.0.0.1:5000`
- Production: whatever your deployed Flask app URL is

All examples below assume `const BASE = "http://127.0.0.1:5000"` for `fetch`.

**Authentication**

These routes do not currently enforce auth (matching the existing `/get-agent`
pattern). When auth is wired up, this section will need to be updated.

**Content type**

POST requests must send `Content-Type: application/json`. GET requests use
query-string params.

---

## Route 1 — `GET /get-agent-profile`

Fetch a single agent profile by **id**, **name**, or **email**.

### Params

| Param              | Type                            | Required             | Notes                                                                             |
| ------------------ | ------------------------------- | -------------------- | --------------------------------------------------------------------------------- |
| `lookup_by`        | `"id"` \| `"name"` \| `"email"` | yes                  | `"id"` looks up by `legacy_agent_id` (the FK to the enriched table)               |
| `value`            | string                          | yes                  | The id / name / email to search for                                               |
| `with_legacy_data` | `"true"` \| `"false"`           | no — default `false` | When `true`, any `null` profile field is filled in from the matching enriched row |

Name and email lookups are **case-insensitive**.

### Response shapes

**200 — single match:**

```json
{
  "status": "success",
  "agent": {
    "profile_id": "a185acc4-5949-4134-9f74-e6aba880fc77",
    "legacy_agent_id": "b19a5415-fc0b-4588-963f-a7a374f20a16",
    "is_active": true,
    "name": "Abigail Koons",
    "title": "Senior Literary Agent",
    "bio": "…",
    "agency": null,
    "email": null,
    "instagram_handle": "@abigailkoons",
    "bluesky_handle": "abigailkoons.bsky.social",
    "linkedin_url": "https://linkedin.com/in/abigail-koons-test",
    "created_at": "2026-06-13T17:53:18.584Z",
    "updated_at": "2026-06-13T17:53:18.584Z"
  }
}
```

**400 — bad params** (e.g. missing `value`, unknown `lookup_by`)
**404 — no match**
**409 — multiple matches** (only possible for name/email; payload includes `candidates: [<legacy_agent_id>, …]` so the UI can ask the user to disambiguate)

### Examples

**A. Get a profile by ID — profile data only**

```js
const res = await fetch(
  `${BASE}/get-agent-profile?lookup_by=id&value=b19a5415-fc0b-4588-963f-a7a374f20a16`,
);
const { agent } = await res.json();
```

```bash
curl -s "$BASE/get-agent-profile?lookup_by=id&value=b19a5415-fc0b-4588-963f-a7a374f20a16" | jq
```

**B. Get a profile by ID, with legacy data filling the gaps**

Use this when rendering an agent's full public profile and you want any
missing self-submitted fields to fall back to what you scraped.

```js
const params = new URLSearchParams({
  lookup_by: "id",
  value: "b19a5415-fc0b-4588-963f-a7a374f20a16",
  with_legacy_data: "true",
});
const res = await fetch(`${BASE}/get-agent-profile?${params}`);
const { agent } = await res.json();
// agent.agency, agent.email, agent.website etc. now populated from the
// enriched table where the profile left them null.
```

```bash
curl -s "$BASE/get-agent-profile?lookup_by=id&value=b19a5415-fc0b-4588-963f-a7a374f20a16&with_legacy_data=true" | jq
```

**C. Look up by name (URL-encode spaces and punctuation)**

```js
const name = "Abigail Koons";
const res = await fetch(
  `${BASE}/get-agent-profile?lookup_by=name&value=${encodeURIComponent(name)}`,
);

if (res.status === 409) {
  const { candidates } = await res.json(); // candidates: ["uuid-1", "uuid-2"] — render a "did you mean?" picker,
  // then re-request by lookup_by=id&value=<chosen_uuid>.
}
```

```bash
curl -s "$BASE/get-agent-profile?lookup_by=name&value=Abigail%20Koons" | jq
```

**D. Look up by email**

```js
const email = "agent@example.com";
const res = await fetch(
  `${BASE}/get-agent-profile?lookup_by=email&value=${encodeURIComponent(email)}`,
);
```

**E. Handling 404 (no profile yet)**

```js
const res = await fetch(`${BASE}/get-agent-profile?lookup_by=id&value=${id}`);
if (res.status === 404) {
  // No profile yet — show the signup form.
  showSignupForm();
} else {
  const { agent } = await res.json();
  showProfile(agent);
}
```

---

## Route 2 — `GET /get-all-agent-data`

Return every agent row from one table, the other, or both. No pagination.
The legacy table has ~3,285 rows — payload is sizable; use this for admin
dashboards, exports, and analytics, not for end-user list views.

### Params

| Param         | Type   | Required              | Notes             |
| ------------- | ------ | --------------------- | ----------------- |
| `which_table` | string | no — default `"both"` | see aliases below |

**`which_table` accepted values** (case-insensitive):

| Value                                                        | Returns                                                            |
| ------------------------------------------------------------ | ------------------------------------------------------------------ |
| `both` (default)                                             | both tables, separated under `profile_data` and `legacy_data` keys |
| `profile`, `profile_data`, `agent_profile_data`              | only profile rows, under `agents`                                  |
| `legacy`, `enriched`, `metadata`, `agents_metadata_enriched` | only enriched rows, under `agents`                                 |

### Response shapes

**For `which_table=both`:**

```json
{
  "status": "success",
  "profile_data": [ { …agent_profile_data rows… } ],
  "legacy_data":  [ { …agents_metadata_enriched rows… } ]
}
```

**For a single table (profile or legacy):**

```json
{
  "status": "success",
  "agents": [ { …rows… } ]
}
```

**400 — unknown `which_table` value**

### Examples

**A. Get both tables (default), separated**

```js
const res = await fetch(`${BASE}/get-all-agent-data?which_table=both`);
const { profile_data, legacy_data } = await res.json();
console.log(
  `${profile_data.length} profiles, ${legacy_data.length} legacy agents`,
);
```

```bash
curl -s "$BASE/get-all-agent-data?which_table=both" \
  | jq '{profiles: (.profile_data | length), legacy: (.legacy_data | length)}'
```

**B. Just the profile table (the agents who have signed up)**

```js
const res = await fetch(`${BASE}/get-all-agent-data?which_table=profile`);
const { agents } = await res.json();
```

```bash
curl -s "$BASE/get-all-agent-data?which_table=profile" | jq '.agents'
```

**C. Just the legacy enriched table**

```js
const res = await fetch(`${BASE}/get-all-agent-data?which_table=legacy`);
const { agents } = await res.json();
```

`?which_table=enriched` and `?which_table=agents_metadata_enriched` work
identically. Use whichever reads clearer in your code.

**D. Default (omit `which_table`) — same as `both`**

```js
const res = await fetch(`${BASE}/get-all-agent-data`);
const { profile_data, legacy_data } = await res.json();
```

---

## Route 3 — `POST /create-agent-profile`

Create one row in `agent_profile_data`. Used by the agent-signup form.

### Body

JSON object. Any column on the profile table is accepted; unknown keys are
silently ignored. Server-managed columns (`profile_id`, `created_at`,
`updated_at`) are not settable.

**The FK to the legacy enriched row is required.** Two ways to supply it:

1. **Pass `legacy_agent_id` directly** (recommended — front end resolves it
      first via `/get-agent-profile?lookup_by=name` or a separate lookup, then
      POSTs the chosen UUID).
2. **Pass only `name`** — the server looks up the matching agent in
      `agents_metadata_enriched` by name. If exactly one matches, that's used.
      If 0 → 404. If 2+ → 409 with candidates.

### Common fields you'll typically send

| Field                                                                                                                                             | Type                  | Example                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------ | ------------------ |
| `legacy_agent_id`                                                                                                                                 | UUID string           | `"b19a5415-…"`                                                                 |
| `name`                                                                                                                                            | text                  | `"Abigail Koons"`                                                              |
| `title`                                                                                                                                           | text                  | `"Senior Literary Agent"`                                                      |
| `agency`                                                                                                                                          | text                  | `"Park, Fine & Brower"`                                                        |
| `bio`                                                                                                                                             | text                  | `"I represent…"`                                                               |
| `genres`                                                                                                                                          | text (pipe-separated) | `"romance                                                                      | literary fiction"` |
| `subgenres`                                                                                                                                       | text (pipe-separated) | `"contemporary romance                                                         | book club"`        |
| `extra_interest`                                                                                                                                  | text                  | `"diverse voices"`                                                             |
| `email`                                                                                                                                           | text                  | `"abigail@example.com"`                                                        |
| `website`                                                                                                                                         | text                  | `"https://abigailkoons.com"`                                                   |
| `twitter_handle`                                                                                                                                  | text                  | `"@abigailkoons"`                                                              |
| `instagram_handle`                                                                                                                                | text                  | `"@abigailkoons"`                                                              |
| `bluesky_handle`                                                                                                                                  | text                  | `"abigailkoons.bsky.social"`                                                   |
| `linkedin_url`                                                                                                                                    | text                  | `"https://linkedin.com/in/…"`                                                  |
| `city`                                                                                                                                            | text                  | `"New York"`                                                                   |
| `state_province`                                                                                                                                  | text                  | `"NY"` (use for states OR provinces OR regions — single field for any country) |
| `country`                                                                                                                                         | text                  | `"United States"`                                                              |
| `country_code`                                                                                                                                    | text (ISO-2)          | `"US"`                                                                         |
| `accepts_middle_grade`, `accepts_young_adult`, `accepts_screenplay`, `accepts_comics`, `accepts_children`, `accepts_poetry`, `accepts_nonfiction` | boolean               | `true` / `false`                                                               |
| `open_to_queries`                                                                                                                                 | text                  | `"yes"`                                                                        |

Address note: there is no single `address` column. Use the structured fields
(`city`, `state_province`, `country`, `country_code`) and/or the free-text
`location` field — agents can fill in whichever feels natural.

### Response shapes

**201 — created**

```json
{
  "status": "success",
  "agent": { …the full new row, including server-set profile_id and timestamps… }
}
```

**400 — bad body** (not JSON, or missing both `legacy_agent_id` and `name`)
**404 — `legacy_agent_id` doesn't exist** in the enriched table; or name lookup found nothing
**409 — duplicate** (a profile already exists for that `legacy_agent_id`); or name lookup found 2+ matches (payload has `candidates`)

### Examples

**A. The recommended pattern — front end already has the legacy_agent_id**

```js
async function createProfile(formValues) {
  const res = await fetch(`${BASE}/create-agent-profile`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      legacy_agent_id: formValues.legacyAgentId, // resolved earlier
      name: formValues.name,
      title: formValues.title,
      agency: formValues.agency,
      bio: formValues.bio,
      genres: formValues.genres.join("|"),
      subgenres: formValues.subgenres.join("|"),
      extra_interest: formValues.extraInterest,
      email: formValues.email,
      website: formValues.website,
      twitter_handle: formValues.twitter,
      instagram_handle: formValues.instagram,
      bluesky_handle: formValues.bluesky,
      linkedin_url: formValues.linkedin,
      city: formValues.city,
      state_province: formValues.stateProvince,
      country: formValues.country,
      country_code: formValues.countryCode,
      accepts_young_adult: formValues.acceptsYA,
      accepts_nonfiction: formValues.acceptsNF,
    }),
  });

  if (res.status === 201) {
    const { agent } = await res.json();
    return agent;
  }

  const { message, candidates } = await res.json();
  throw { status: res.status, message, candidates };
}
```

```bash
curl -s -X POST "$BASE/create-agent-profile" \
  -H "Content-Type: application/json" \
  -d '{
    "legacy_agent_id": "b19a5415-fc0b-4588-963f-a7a374f20a16",
    "name": "Abigail Koons",
    "title": "Senior Literary Agent",
    "bio": "I represent commercial and literary fiction.",
    "genres": "romance|literary fiction",
    "instagram_handle": "@abigailkoons",
    "accepts_young_adult": true
  }' | jq
```

**B. Server-side name lookup (no `legacy_agent_id` supplied)**

Simpler signup UX, but you have to handle the disambiguation case.

```js
const res = await fetch(`${BASE}/create-agent-profile`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "Abigail Koons",
    title: "Senior Agent",
    bio: "…",
  }),
});

if (res.status === 409) {
  // 2+ legacy agents share this name. Show the candidates list and
  // let the user pick the right one, then retry with legacy_agent_id.
  const { candidates } = await res.json();
  showDisambiguationModal(candidates);
} else if (res.status === 404) {
  // No legacy agent with that name exists.
  showNotFoundError();
}
```

**C. Handling duplicate-signup (409)**

```js
const res = await fetch(`${BASE}/create-agent-profile`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ legacy_agent_id: id, name: "…" }),
});

if (res.status === 409) {
  // A profile already exists for this agent. Either redirect to edit
  // or block the duplicate.
  showAlreadySignedUpMessage();
}
```

**D. Address fields — agent fills only what they have**

You don't have to send every location field. Send what the agent provided:

```js
{
  legacy_agent_id: "…",
  name: "…",
  city: "Brooklyn",
  state_province: "NY",
  country_code: "US"
  // country and free-text location can be left out
}
```

---

## Error handling pattern (applies to all three routes)

```js
async function call(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, opts);
  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw {
      status: res.status,
      message: body.message || "Request failed",
      candidates: body.candidates, // only present on 409s for name lookups
    };
  }

  return body;
}
```

**Standard error response shape:**

```json
{ "status": "error", "message": "…human readable…" }
```

409 responses for name-based lookups additionally include:

```json
{ "status": "error", "message": "…", "candidates": ["uuid", "uuid", …] }
```

## Data semantics quick-reference

- **`is_active`** — soft-delete flag, bidirectionally synced between the two
    tables. Flipping it on the profile changes it on the legacy row in the same
    transaction, and vice-versa. The front end should treat `is_active=false`
    rows as "deactivated" and hide them from public listings.
- **`updated_at`** — auto-bumped on every UPDATE via a trigger; don't try to
    set it client-side.
- **`profile_id` vs `legacy_agent_id`** — `profile_id` is the row's own UUID
    (basically irrelevant outside debug logs). `legacy_agent_id` is the
    canonical "agent ID" — use that as the URL identifier and join key, not
    `profile_id`.
- **Genres and subgenres are pipe-separated text**, matching the existing
    enriched-table convention. Split on `|` in the front end if you need to
    render chips.
- **`with_legacy_data=true`** does NOT modify the database — it's a
    read-time merge. Profile fields with values always win; legacy only fills
    the `null`s.
