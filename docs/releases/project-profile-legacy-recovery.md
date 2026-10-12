# Legacy project profile recovery

## Production incident

The deployed profile backend queried `writer_projects.profile_only` before the
approved migration had been applied. Render logs reported an undefined column;
search history returned 500 and profile reads returned 503.

On October 12, 2026, the running backend database was verified as production
Write Query Hook (`gjlsblvieeabdloajcbm`). The approved migration added only
`public.writer_projects.profile_only boolean NOT NULL DEFAULT false`. `forms`
was unchanged. Production history requests recovered, and the affected COOL
PROJECT profile visibly loaded its saved Smart Match traits. No project traits
or searches were changed during that browser check.

## Follow-up behavior

An unlinked older project with no saved profile now displays a neutral empty
state, instead of default Fiction details and empty trait sections:

> Your project profile is currently empty

Run Smart Match opens `/smart-match?project=<dashboard UUID>`. Edit traits remains
available for manual entry. Linked profiles continue to load their current saved
search traits by their stable backend ID. Historical search names alone are not
used to guess a missing relationship. Genuine service failures retain the error
and retry action.

A successful first-page Smart Match request for an explicitly selected, owned,
unlinked dashboard attaches the returned search through the existing
`dashboard_projects.writer_project_id` field. Both free and paid routes support
this, including a successful search with zero matches. Failed searches and
pagination do not attach anything. The conditional update cannot replace another
request's profile link. A deduplicated search already linked to another dashboard is rejected.
Same-search link retries are idempotent; other concurrent
links require reloading. Saved-agent rows and query progress are not rewritten.

Direct Smart Match project links wait for authentication and project choices.
A freshly loaded profile ID takes precedence over a stale picker entry for the
same dashboard. Revisiting a profile refetches its current traits.

No further schema migration or Flask code change is needed. Deploy the follow-up
UI branch against the already deployed profile backend and approved migration.
Home's implementation and project destinations remain unchanged.

## Verification

- 114 UI tests passed, including actual component rendering for empty, populated,
  and failed profile loads, ownership checks, legacy-link races, free/paid search
  wiring, and preservation of the latest profile ID with a cached picker.
- Changed-file ESLint, app-scoped TypeScript, and `git diff --check` passed.
- The actual Next.js app showed the empty state at desktop and 390px mobile
  widths. Edit traits opened normally; its Smart Match link selected the correct
  older project and enabled the form after a direct page load.
- An isolated synthetic project exercised real local search persistence, the
  production link helper against local PostgREST, and the real Flask profile GET.
  The profile returned the saved genre, comparable book, and revision. Matching
  response handling itself is covered by route fixtures; no hosted search was
  submitted and no hosted project data was copied.
- Production build: pending final isolated build.
