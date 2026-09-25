# Dashboard project route replacement

Home, sidebar, and saved search-result links use `/projects/<dashboard-project-uuid>/dashboard`. The page looks up that UUID within the signed-in Clerk account. Project names and Smart Match history IDs are no longer accepted as dashboard route identifiers. The old profile redirect page and name-route handlers are removed.

`dashboard_projects` persists the identity of a saved project. Its optional `writer_project_id` retains the existing relation to Smart Match. Projects saved before search-history persistence receive a dashboard ID without inventing a backend search or changing saved notes, statuses, dates, or row IDs. The database assigns the same ID on subsequent saves; renaming or removing all saved agents does not discard it.

## Rollout order

1. Apply `supabase/migrations/20260925000000_dashboard_project_ids.sql` to the Supabase database used by the web service. It requires the earlier writer-project-scope migration. The migration runs in a transaction and aborts if any existing saved-record value changes beyond the added relation.
2. Verify every saved row has a project ID, including Cool Finance and NEW STUFF. Check the project owner matches the saved row owner.
3. Deploy the web branch, then open both cards from Home and the sidebar while signed in. Verify notes and statuses in the resulting dashboards.

Apply the database migration before deploying this code. The existing web release ignores the additional fields and continues using its current links until the new web release is deployed. After deployment, old name-based bookmarks are intentionally unsupported; use the replacement links on Home.

## Verification

`node --test tests/*.test.mjs` runs PostgreSQL migration/trigger tests plus account isolation, canonical links, CRUD, Smart Match restore, and trait tests. PGlite is a development-only dependency used to run PostgreSQL locally. The migration test verifies existing data is unchanged and separately tests future saves, duplicate titles, rename stability, ownership, and deleting/re-saving.
