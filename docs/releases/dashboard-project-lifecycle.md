# Persistent project lifecycle

A search does not create a dashboard. Saving the first agent creates its durable
`dashboard_projects` record. Clearing rows, including the last agent, keeps that
record. Explicit project deletion removes the dashboard and its associated saved
agents in one transaction. The pencil beside the dashboard title renames both
empty and populated projects without changing the project URL.

Home, desktop/mobile navigation, and Smart Match choices share the projects
returned by the signed-in user's saved-agent API. Search history is excluded from
these lists. Restore previous search still restores search fields, but does not
add an unsaved/deleted project to the dropdown. No manual project-creation API or
UI is added.

## Database prerequisite

Apply `supabase/migrations/20260925010000_dashboard_project_lifecycle.sql` before
using the new rename/delete endpoints. It requires the existing dashboard-ID
migration. It adds account-scoped rename/delete functions, callable only by the
server role, and makes the assignment trigger preserve the dashboard's canonical
name when old search results are saved. It does not rename or delete existing
records during installation. Existing empty dashboard records remain available.

Rename validation rejects blank names, names longer than 120 characters, and
names already used by another dashboard in the account. Existing duplicate
names are not merged. Saves explicitly targeting a deleted dashboard fail instead
of recreating it. New searches can still create a project on a subsequent save.

The current local worktree uses the shared production Supabase database
`wqh-user-api` (`octakuamyrqlkllxoffj`), so this migration is a production database
change even when the web app runs on localhost. The migration was applied to this
database on September 25, 2026. Both functions are available through the Data API.
The installation preserved all 55 dashboard projects and 776 saved-agent records.

## Verification

`node --test tests/*.test.mjs` includes PostgreSQL-backed lifecycle tests for
empty-project retention, save reuse, rename stability, stale saves, deletion,
account isolation, invalid/conflicting names, and transaction rollback. All 76
tests passed before merging. UI checks cover the local empty-project card, inline
name editor, delete confirmation, and input selection styling. The live database
also passed a rename/delete smoke check using a temporary project inside a
rolled-back transaction. No temporary project or user-data changes were retained.
Server-role Data API calls to both functions returned HTTP 200 for a missing
project, confirming that the app can reach the installed functions.
