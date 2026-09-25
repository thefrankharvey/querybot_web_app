# Writer-only features for review

Branch: `codex/writer-only-features`. Base: `origin/main` at `e72760d`.

This branch includes three features from `feat/roadmap-01`: separate saved-agent
tracking per project, API-backed Smart Match traits, and previous-search form
restoration. It keeps main's writer app layout, table/board dashboard, spreadsheet
exports, and blog changes.

Editable project profiles are deferred. They are kept on `codex/writer-project-profiles`
in a separate restoration commit for later review. This branch removes the
profile editor and its save API. Project links open dashboards, and
old profile links redirect there. Shared read-only project lookup remains because
the dashboard needs project identity and ownership checks.

Neither branch adds the literary-agent workspace, reverse search, messaging,
attachments, Agency Query Guard, reminders, or Radar. No push or merge is authorized.

## Setup before a live review

Apply `supabase/migrations/20260923000000_writer_project_scope.sql` to the intended
review database before running this app against it. This adds `writer_project_id`
and changes saved-agent uniqueness to writer + agent + project. The migration
has not been applied to a remote database as part of this change.

The configured writer API must support:

- `GET /get-writer-projects?email=...`
- `project_name` and `writer_project_id` on existing agent-search requests
- `GET /get-traits` with grouped genre/subgenre/theme/format values
- `POST /create-trait`

Traits use `WQH_TRAITS_API_URL` when configured, otherwise the existing writer API
URL. No messaging API is needed. Sign in with a review account. Previous-form restoration is available to both
free and subscribed accounts. Use disposable review projects.

## 1. Independent saved agents per project

1. Run a search for project A and save an agent. Run a search for project B and
   save the same agent. Both should succeed.
2. In A, change notes, fit rating, query readiness, dates, and board column.
   Reload A and B. Only A should change.
3. Remove the agent from A, then test bulk-row deletion. B must remain intact.
4. Use two projects with the same display name. Delete one project's saved
   dashboard rows and confirm the other remains unchanged.
5. Test Save All twice in each project. It should skip already-saved agents only
   within that project.
6. Open a saved-agent profile after running another search. The link must still
   identify the original saved row. Manual rows do not get agent-profile links.

Existing agent-ID API URLs reject ambiguous multi-project mutations with 409.
The new UI uses row-ID APIs. Private reads and writes remain user-scoped.

## 2. API-backed Smart Match traits

1. Open Smart Match and verify all four lists load from the traits API.
2. Add a custom genre, subgenre, theme, and format. Confirm each is selected and
   available again after reloading.
3. Try an existing value with different capitalization/spacing. It should select
   the existing normalized value rather than create a duplicate.
4. Temporarily fail the traits API. Existing selections must remain visible and
   the page must disclose the load failure. Failed creation must report an error.
5. Check selection, deselection, keyboard navigation, and mobile layout.

## 3. Restore previous Smart Match form

1. Save/run a search with a named project, all trait categories, and comps.
2. In a fresh session, use “Restore previous search.” Confirm every restored field
   and the project identity, then run the search and save one result.
3. Use “Previous Agent Matches” to refresh results. Confirm saves still belong
   to the same project and the existing Excel download continues to work.
4. Confirm restoration works for both free and subscribed accounts. Check empty
   history and an unavailable writer API; signed-out requests must return 401.
5. Restore an unnamed historical search. It must not borrow another project's
   name or ID. Enter a name before submitting.

## Automated verification

`node --test tests/*.test.mjs` covers row isolation, access checks, ambiguous
legacy requests, dashboard lookup/navigation, restoration, and trait contracts.

Run lint on changed TypeScript files and `npm run build`. The repository's existing
Next.js configuration skips type/lint enforcement during builds, so they are
checked separately. A clean `main` type check produces 3,087 existing errors in generated blog pages,
plus one existing blog-template route error when generated Next.js types are
included. Compare branch diagnostics against the same baseline.

Browser acceptance remains separate from mocked route tests. Database and upstream
service compatibility must be confirmed in the review environment before release.

Verification performed on this branch:

- All 37 focused tests passed, including free-account restoration, Home project
  cards, server authentication, and protection against browser-supplied account
  identities.
- Lint passed for all changed TypeScript files.
- The production build passed.
- Type checking reports the same 3,088 inherited blog errors as `main` with
  generated route types included; there are no new error locations or codes.
- Local development preview reached the sign-in page. Authenticated visual and
  end-to-end checks remain pending; no shared database was changed.

Everything remains local. No push, merge, or deployment was performed.

## Verify profile editing is deferred

1. Open a project from Home or the navigation menu. It should open its dashboard.
2. Confirm the dashboard has no Project profile button or profile editor.
3. Open an old `/projects/:id` link. It should redirect to the same project's
   dashboard, including legacy name-based links.
4. Confirm the built app has no `/api/projects/[projectId]` save route.

Previous-search restoration has no subscription gate in the UI or the Next.js
server route. The existing Flask dev handler has no subscription check, but
backend main needs the focused history endpoint and persistence changes from
`codex/free-project-history-api`. Paid agent result limits and spreadsheet access
are unchanged by this web change.

Home project cards are available to free and subscribed accounts. Projects appear
after at least one agent is saved, with links to their individual dashboards.
Free accounts with no saved agents still see the existing getting-started screen.
Dashboard styling and loading spinners have no subscription gate.

## Backend authentication rollout

The web app now sends `Authorization: Bearer <WQH_HISTORY_API_KEY>` to the Flask
`GET /get-writer-projects`, `POST /get-agents-free`, and `POST /get-agents-paid`
routes. The project dashboard's server loader also authenticates its history
request. All callers derive the email from the signed-in Clerk user and check
that the user matches the session. Browser-supplied search emails are ignored.
Traits requests are unchanged.

Configure the same private `WQH_HISTORY_API_KEY` value in the web app and Flask
environments before deployment. Never use a `NEXT_PUBLIC_` variable. The key
is read only in a `server-only` module, is never returned to the browser, and
has not been configured by this change. Without it, the three web API routes
return 503 without calling Flask. The dashboard retains its saved-agent fallback.
This requirement applies to local development environments as well.

Deploy these web caller changes before, or together with, the backend branch
`codex/free-project-history-api`. The old backend ignores the added header;
the new backend rejects callers that omit it. The backend's history migration
and this branch's separate saved-agent migration must be checked and applied
to their intended production databases before releasing the full features.
Verify free and subscribed search, immediate restore, project dashboards,
and traits against the deployed services. Local route tests use mocked Clerk
and upstream services and do not replace that integration check.
