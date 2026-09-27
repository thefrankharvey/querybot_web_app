# Manual agency query guard

Branch: `codex/manual-agency-guard`.
Base: `77f46e5d2aed26d5afc3364211cb0fa933b29250` (`main` and fetched `origin/main`, September 27, 2026).
Implementation commit: use `git log -1` on this branch. No merge or deployment authorized.

## Scope

Adds advisory manual agency history to Smart Match cards/profile, board cards/dialog,
and a new Agency history table column. Cards use loaded persisted rows for possible-match
indicators. Opening history requests owned, authoritative details. Nothing blocks saving,
editing, changing stages, or following submission links.

Default history is the selected dashboard. Subscribed users may expand across projects;
the server checks Clerk `publicMetadata.isSubscribed`. Default responses omit other-project
records and use null for their counts. Other-project history never establishes an agency policy.

Canonical agency IDs take precedence; unequal known IDs cannot match via names or domains.
Names and official domains are disclosed fallback evidence. Shared submission/social hosts,
including subdomains, do not establish agency identity. Rejected and offer-made records are
informational. Research without a valid query date is excluded. Undated submitted rows stay
undated. Query dates never use `updated_date` as evidence.

No literary-agent workspace, messaging, composer, sending, live query events, notifications,
rounds, scheduled reminders, email, benchmarks, manuscript handling, or project profiles.
No changes to `feat/roadmap-01`, its uncommitted edits, or `feat/wqh-v2`.

## Provenance and decisions

Reviewed the donor guard at `5e79a2e6eea8eb923a4ce830e1c5e374955883f6`, including
normalization/classification, endpoint, entitlements, and catalog lookup. Reviewed the local
indicator mapping at `0e99abe698f7ca9c00d0f52238d6c32c4abdf55e`. Reimplemented the limited
manual contract rather than copying donor contexts/routes. Removed live evidence and
name-based project scope. Corrected the donor's contradictory-canonical-ID fallback.

The response is `manual-agency-guard-v1`; records add `matchMethod` so mixed canonical and
fallback results can each disclose their evidence. Terminal fallback matches receive
informational history styling, with possible-match basis shown in the details.

Identities are transient. No migration, new stored columns, backfill, dependency, database
schema deployment, or persisted identity provenance is needed. Browser payloads cannot set
canonical identity. Existing row PATCH allowlists remain intact.

Reviewed the catalog's local Flask implementation and performed a read-only endpoint smoke
check against the configured service: POST `/get-agent-agency-identities` with one unknown
UUID returned 200, `status: success`, and an identities array. The reviewed contract is
public catalog metadata, UUID agent IDs, at most 100 per request, nullable identity, 400 for
invalid input, 503 for lookup failure. The adapter uses two workers and one three-second
deadline. Opaque/manual IDs stay on the fallback path. No messaging authentication is used.
Actual non-null production canonical coverage was not measured.

Read-only Supabase OpenAPI confirmed `agent_matches.id` is UUID. The original environment
points to production project `octakuamyrqlkllxoffj`; no schema or fixture writes were made
there. Existing September 25 dashboard-ID/lifecycle migration prerequisites remain unchanged.

## Retrieval and privacy

History queries filter by caller and, by default, dashboard ID. Candidate rows must belong
to both. Missing, foreign, and mismatched identifiers return the same 404. Strict validation
rejects unknown fields, spoofed identity, bad UUID row/dashboard IDs, invalid types, and
non-http(s) URLs. Client URLs are never fetched.

History pages are exhausted, including when a database cap is smaller than the requested
500-row page. A 10,000-row protective bound discloses incomplete coverage and suppresses a
clear result. Read errors return `HISTORY_UNAVAILABLE` 503. All feature responses, including
errors, are private/no-store. Rate limiting is a bounded per-process 60 requests/minute guard,
not a distributed quota.

Feature request keys include account, dashboard, candidate, expansion, and contract. Saved
rows now have account-specific cache keys. Successful persisted cache changes cancel stale
history requests and invalidate details; failed writes do not update authoritative history.
Private history is discarded on account switch/unmount. Saved history links use dashboard
UUID plus a validated row UUID and fetch the owned row directly, beyond loaded-list caps.

## Local review

Use the running disposable preview at http://localhost:3001/home. The review launcher uses
real Clerk sign-in and server subscription metadata, but replaces Supabase and catalog data
with loopback-only, per-account REST fixtures. It cannot write the production database.
Other app features requiring real source endpoints are not supported by this fixture.
This is browser/UI evidence, not PostgreSQL integration or production acceptance evidence.

Restart from this worktree to reset the sample data:

```sh
node scripts/review-manual-agency-guard.mjs /Users/matthewgarrett/Development/querybot_web_app
```

The final argument is an existing environment directory used for Clerk configuration; the
script does not copy or print secrets. Optional `REVIEW_PORT` and `REVIEW_DATA_PORT` change
ports 3001 and 54331. Stop any earlier copy before restarting. All review state is in memory.

For normal app operation, configure this worktree's environment for the intended database,
then run `QUERY_SAFETY_AGENCY_HISTORY_ENABLED=true npm run dev -- -p 3001`. Do not assume
that a normal localhost app uses an isolated database. The default release flag is false.
Disabling it hides entry points and makes the guard API return `FEATURE_DISABLED` 404.
Deploy with the flag off, then enable deliberately. Rollback requires only disabling the flag.

## UI walkthrough

1. Open **Agency Guard Review A**, then the **Agency history** cell for **Blair Oak
   (candidate)**. Expect a same-project active-query advisory based on **Alex Oak
   (submitted)**, with the entered September 1 date. The sample catalog supplies verified
   fixture identities for these two agents.
2. Open **Devon Oak (possible match)**. Expect “Possible agency match,” an official-domain
   explanation, and fallback confidence. Open **Ellis (unknown agency)**. Expect “Unable to
   determine agency history.” **Harper (shared host candidate)** must not match Gale solely
   because they share QueryManager. **Finley (different identity)** must not match Alex
   despite identical agency names/domains.
3. Switch to **Board**. Open Alex's card and move it from Submitted Query to Rejected using
   the existing stage control. Reopen Blair's History. Expect informational history, zero
   active same-project queries, and one closed query. Move Alex back to Submitted Query.
4. With a subscribed account, select **Include my other projects**. Expect **Casey Oak
   (other project)**, separate other-project counts, and the different-manuscript explanation.
   With a free account, expect same-project history plus subscription explanatory text.
   The API independently rejects forbidden expansion with 403.
5. Follow Alex's history link. Expect the correct saved-row dialog in project A. Close it with
   Escape; verify the underlying dashboard remains usable. Test keyboard Tab/Enter and the
   History button focus return. Repeat at a narrow mobile viewport.
6. In Table, change Alex's Query Sent date. Open Blair's history and verify the persisted date.
   To test undated evidence, use Casey in project B: its Submitted stage has no query date.
   A research-only row must never acquire an invented sent date.
7. Delete Alex through the existing row/card controls. Blair's same-project advisory should
   disappear after successful persistence; Casey remains visible only with expansion.
8. Rename A. Verify its URL/UUID remains unchanged, history uses its new name, and links work.
   Remove all A rows; the empty project must remain. Explicitly delete B; it should disappear
   without deleting A. Restart the launcher to restore the samples.
9. Check loading/error/refresh behavior. The new guard's errors must not disable existing save,
   stage, or submission-link controls. Export from Table should retain existing spreadsheet
   columns; the new UI history column is not exported.
10. On a separately configured isolated real database, complete Smart Match restore/search/save
    and verify possible-match indicators and the profile history disclosure. Unsaved searches
    must not create dashboards merely to show agency history. Test two actual accounts, including
    free and subscribed access, and confirm account switching clears private history.

## Verification record

- Main baseline: all 76 existing tests passed.
- Branch: all 109 tests passed, including 33 new behavior tests for identity, stages, validation,
  ownership, capabilities, pagination, bounded coverage, catalog batching/timeouts, UI states,
  query keys, successful-only invalidation, and account cleanup.
- Changed TS/TSX ESLint passed with zero warnings/errors; exact-main baseline was also clean
  for the modified existing files.
- Separate TypeScript check: 3,087 diagnostics, identical to the exact-main baseline; all are
  existing generated-blog diagnostics. No new diagnostics. Next's build suppresses type/lint
  checks, so these were run independently.
- Production build passed. No excluded routes or imports were introduced.
- Existing PostgreSQL-compatible migration/lifecycle tests run in the full regression suite.
  No new migration exists in this batch.
- Authenticated browser review and remaining acceptance evidence are recorded below before handoff.

Release readiness remains pending Matthew's acceptance and real isolated-environment checks
that cannot be established by REST fixtures or mocks. Do not merge until Matthew tests and
explicitly confirms.

### Browser evidence on September 27

Authenticated desktop and 390×844 mobile checks passed in the disposable preview: table
history entry points, board history entry points, active canonical advisory, subscribed
all-project expansion with separately labeled counts, undated other-project evidence,
correct saved-row deep link, Escape dismissal/focus return, and stage persistence changing
an active advisory to informational rejected history. Conflicting canonical identities
returned no matching history despite equal names/domains. The original shared database
was used only for read-only schema/empty-project inspection; mutations used local fixtures.

Still pending before release approval: full Smart Match restoration/save/browser acceptance
against an isolated real database and catalog; a second actual free account; end-to-end
real-database date/delete/rename/export checks. Their ownership, persistence/lifecycle,
capability, and guard semantics have automated coverage but are not claimed as live acceptance.
