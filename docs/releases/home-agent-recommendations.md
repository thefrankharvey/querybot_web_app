# Home agent recommendations

Branch: `codex/home-agent-recommendations` in both `querybot_web_app` and `query_bot_flask_app`, rebased onto freshly fetched `origin/main` (`d1edeb7` frontend, `0f39f319` backend).

Home displays a separate recommendation section below My Projects/Welcome. Only projects still present in the signed-in account's My Projects are eligible, using their exact writer-project relation or an unlinked dashboard's own UUID. Historical titles alone never establish identity. Removed dashboards and orphaned search history cannot drive recommendations, even if the historical search is newer. Dashboard renames use the current title.

The authenticated history read opts into `include_profiles=true` to include current manual profiles and saved edits, ordered by the later persisted profile-update/search timestamp. Ordinary previous-search restore retains its existing search-only ordering and excludes profile-only drafts. Unsaved edits and title-only profiles do not trigger matching. The existing `updated_at` timestamp can also be touched by search archival; no new activity-tracking schema is introduced.

The section requests the appropriate paid/free matching endpoint with `status=open`. Agents saved anywhere in that account's Query Dashboard are excluded before taking up to three results. Paid results preserve the matching endpoint's ranking; free results preserve the existing free sample and six-agent preview boundary. Exclusions do not unlock paid results. Empty history, no available matches, loading, and retryable errors each have a separate UI state.

Cards reuse `AgentMatchCard` and link by catalog agent ID plus owned search-project ID. Direct navigation and refresh resolve that agent from the same project. Saves retain the recommendation project's dashboard identity, including legacy projects with a null writer-project ID. Recommendations use their own account-scoped query and do not replace the active Smart Match search.

## Country detection

The server reads `cf-ipcountry`, falling back to `x-vercel-ip-country` when the Cloudflare header is absent. Only `US` and `GB` restrict the agent search. Every other value, including missing or invalid headers, means all countries. Saved filters, request query parameters, browser language, and browser timezone do not affect this country choice.

There is no country label above the recommendation cards. Country information remains inside the existing agent cards.

There is no browser geolocation call, permission prompt, new location cookie, stored location field, or external geolocation request. IP country is approximate and may reflect a VPN. Public production response headers show Render behind Cloudflare, but they do not prove that the country request header reaches the application. Verify the new API's `country` response after deployment. When the header is absent, all-country recommendations are the intended fallback.

Cloudflare documents a country-only [IP Geolocation setting](https://developers.cloudflare.com/network/ip-geolocation/). If the domain's edge configuration is controlled separately, enable that setting for country detection; additional city or coordinate headers are unnecessary. No hosting settings were changed as part of this implementation.

## Deployment order

1. Deploy the matching backend changes first: `app/helpers/home_recommendations.py`, the `recommendations_only` branches in the two existing matching endpoints, and the optional profile-inclusive history read.
2. Deploy the frontend branch. Its server sends `recommendations_only: true`, saved catalog IDs, and optionally a specific profile agent ID to the existing matching endpoints using the existing server credential.
3. While signed in, verify that recommendations name an existing My Projects dashboard, use its latest saved traits, exclude saved agents, and retain card/profile navigation and project-correct saves. Repeat with free and paid accounts.

The read-only backend mode returns `recommendations_only: true` and never writes search history, saves match snapshots, queues persistence, or creates spreadsheet exports. Ordinary searches keep their existing behavior. Deploying the frontend against the old backend would still trigger an ordinary search before the frontend rejects the missing response marker, so the backend must be deployed first.

No database migrations or new dependencies are needed. Neither branch has been merged or deployed by this task. Notifications and following work is preserved separately on frontend branch `codex/notifications-and-following-ui` (`7498e51`). The homepage diff contains no notification/following routes, providers, navigation, or styles. Full mixed-file snapshots and unrelated backend search changes remain recoverable in named safety stashes.

## Verification

- Frontend: `node --test tests/*.test.mjs` passes 166 tests; targeted ESLint and TypeScript checks for changed application files pass.
- Backend: Python 3.11, `pytest tests/test_home_recommendations.py tests/matching/test_endpoint_contracts.py tests/project_history -q -p no:cacheprovider` passes 164 tests, including isolated PostgreSQL checks for profile recency, manual profiles, deletion, and ownership.
- Rendered fixture data checked using the actual recommendation component and Smart Match cards at desktop, 375px, and 320px widths. No horizontal overflow at either phone width. This is a fixture UI check, not a live production account test.
- The original preview combined hosted dashboards with the older `127.0.0.1/wqh_ui_db_optimization` database. That caused missing-profile and missing-column errors. Main's existing `2026_10_12_project_profiles.sql` migration was applied to that verified local database without changing project row counts. Testing now uses the pre-existing isolated `profile_dashboard` and `profile_backend` databases together on loopback port 55432, with local PostgREST on 55431 and its REST path proxy on 55421. Existing local test data is separate from the hosted Crime in the Streets dashboard. No hosted manuscript or dashboard records were copied, and the external development API was not queried.
- A clean, freshly verified `main` backend (`0f39f319`) runs on port 10002, with the frontend's `main` baseline (`d1edeb7`) on port 3002. The homepage feature runs on port 3000 against its main-based backend branch on port 10001. Both use the same isolated local data. Authenticated UI checks confirm that the local Money Time profile loads on both versions; direct local API checks return identical profile traits and revisions. The homepage displays three open-agent recommendations for that existing local dashboard, with no separate country label or notification/following navigation.
- The project-profile client, Next.js profile route, profile API helper, backend profile helper, and existing migration have no differences from `main`. Only process-level preview settings select the local services; `.env.local` retains its original values. Clerk development sign-in remains hosted.
- Full-repository TypeScript checking remains affected by the existing generated-blog errors; the changed application files pass their scoped check.
