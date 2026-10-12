# Manual project creation

Home now has a white project card with a green Create project button. It creates
an owned dashboard and a linked, title-only writer profile named My Project,
then opens the existing Project profile view. Existing project cards still open
Query dashboard. Creation is available to free and subscribed accounts.

An empty profile offers Create Profile in the existing edit-action position.
The shared trait editor accepts blank or partial profiles, including incomplete
comparable books. Cancel returns to the saved prompt or profile. Titles retain the
existing rename component. A saved title alone still displays the empty prompt.

Creation adds the project to the shared project cache immediately. Smart Match
selects it by dashboard ID, loads the latest saved title/traits, and keeps missing
fields empty. Successful searches retain the selected writer profile ID and update
that profile through the existing search persistence flow.

The creation request reuses its UUID on retry, never overwrites an existing row,
and filters reads/links by Clerk ownership. The existing attachment guard prevents
two dashboards sharing a writer profile. No saved-agent placeholder is created.

## Backend and rollout

Both repositories use codex/manual-project-creation, branched from main.
Deploy the backend branch before the UI branch. The backend gives profile-only
records an identity-specific content hash so multiple My Project drafts can save
identical blank or partial traits. Existing searched-project deduplication stays
in place. A search without an ID promotes a matching manual draft only when it is
unambiguous. Explicit project selection keeps the existing identity.

No migration, table, column, policy, or database function changes are included.
The previously approved writer_projects.profile_only column is already deployed.
No production data changes or deployments were performed for this feature.

## Verification

- UI: 121 tests pass, including creation, owner isolation, retry recovery,
  conflicting profile links, blank saves, and incomplete comparable books.
- Backend: 125 PostgreSQL history/profile tests pass across legacy and production
  table layouts, including duplicate-title drafts and selected-project searches.
- Changed-file ESLint and application-scoped TypeScript pass.
- Browser: actual local Home creation, empty Query dashboard, blank save, genre-only
  save, Cancel, and title-only/partial Smart Match restoration pass. Distinct
  My Project entries restore the selected profile. Mobile checked at 390 x 844,
  with no horizontal overflow in the profile or editor.
- Isolated production build of UI commit d606e70 passes. Backend implementation
  is committed as 3ea3c4c6. The final verification commit changes documentation only.

The local test UI runs at http://localhost:3002/home with the matching backend at
http://127.0.0.1:10001. Application data stays in isolated local PostgreSQL;
Clerk uses the existing development account. Screenshots use synthetic projects.
Actual hosted matching was not submitted. Search persistence is covered by the
backend PostgreSQL tests; matching-route tests use deterministic matcher fixtures.

Previews: [Home](../previews/manual-project/home.jpg),
[empty profile](../previews/manual-project/empty-profile.jpg),
[mobile profile](../previews/manual-project/empty-profile-mobile.jpg),
[mobile editor](../previews/manual-project/editor-mobile.jpg).


## Project deletion

Project profile now has a Delete project button beside Edit traits or Create
Profile. It reuses the same accessible confirmation dialog as the title's delete
icon. The dialog names the project and explains removal of saved agents, traits,
Smart Match history, notes, and query progress. Cancel receives initial focus;
both actions are disabled while deletion runs, and a failure leaves the dialog
open for retry. The layout was checked on desktop and at 390 x 844.

The Next.js DELETE route verifies the signed-in Clerk user and owned dashboard,
then calls the authenticated backend DELETE /writer-projects/<id> with the
server-derived account email. The backend erases manuscript traits, title, and
archived matches in one transaction. It retains a deleted ID and account link
with no title or traits to prevent stale saves from recreating the project.
Repeated deletes are safe, including legacy dashboards with no writer profile.

After upstream deletion, the existing delete_dashboard_project RPC removes the
owned dashboard and all of its saved-agent rows, including notes and query
statuses. If the upstream call fails, saved-agent deletion does not start. If the
RPC fails after upstream deletion, the dashboard remains available and the UI
asks the user to retry to finish. These are separate databases, so deletion across
both services is recoverable rather than one shared database transaction.

Match archival locks the active writer project before inserting history. Deletion
uses the same row lock, so a worker either finishes before deletion removes its
matches or skips the deleted project. The deleted content hash is replaced so a
new search with the same inputs creates a new project instead of reviving it.
The UI removes the project/profile caches and clears a matching cached Smart
Match form/results before returning to Home.

No database schema, migration, RPC, or policy changes are required. Deploy the
backend before the UI so the new DELETE endpoint is available. No production
records were deleted during verification.

Verification: 125 UI tests and 137 real PostgreSQL backend tests pass. Tests cover
ownership isolation, complete trait/history erasure, rollback, repeated deletion,
late profile saves/searches, and concurrent match archival. Changed-file ESLint,
application-scoped TypeScript, and diff checks pass. Browser checks cover the
profile action, confirmation copy, initial Cancel focus, cancellation, and mobile
layout; destructive confirmation is exercised through isolated integration tests.

The isolated production build of UI implementation commit de114c2 passes. The
backend deletion implementation is committed as 0f39f319. The verification
follow-up contains documentation and synthetic screenshots only.

Deletion previews: [desktop confirmation](../previews/manual-project/delete-confirmation.jpg)
and [mobile confirmation](../previews/manual-project/delete-mobile.jpg).


## Projects from Smart Match results

A first-page free or paid Smart Match search creates a dashboard project only
when it succeeds and returns at least one match. The user does not need to save
an agent. Zero-match and failed searches do not create dashboard projects.
Manual creation from Home remains available without running a search.

The search backend already saves the title and submitted manuscript traits before
returning its writer project ID. The UI server now attaches a dashboard to that
saved profile, then updates My Projects and the cached search's dashboard scope.
The first saved agent therefore goes into the same project. Refreshing previous
results follows the same rule when it returns matches.

Selected projects retain their existing dashboard ID and current title. A saved
writer ID identifies an existing project even when its title has changed.
Retries and concurrent successful searches use the same stable writer UUID and
the existing user/scope unique constraint, so they do not create duplicate
projects. An interrupted manual profile link can recover by its exact shared
UUID. Deleted, foreign, or mismatched selected dashboards cannot create a
replacement. If dashboard persistence fails, the request reports a retryable
error instead of pretending that project creation succeeded.

Existing projects survive zero-match searches. The existing backend search
history flow and selected legacy-profile linking remain in place. Historical
searches without a dashboard do not appear in the project picker until a new
search returns matches. This change requires no new backend code, migration,
column, RPC, or policy.

Verification: 147 UI tests pass, including free/paid positive-match creation,
zero-match exclusion, unchanged existing projects, cache updates, first-agent
scope, ownership isolation, retry recovery, and concurrent creation using the
existing migrations in real PostgreSQL through PGlite. The backend's 137
PostgreSQL history/profile tests pass. Application-scoped TypeScript,
changed-file ESLint, and diff checks pass. Matching HTTP responses in these tests
are deterministic fixtures; no hosted Smart Match search was submitted.
