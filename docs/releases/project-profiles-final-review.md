# Project profiles final review

October 12, 2026. Ready for merge and a coordinated release. No blocking feature
findings remain. Production migration and deployment are pending.

## Reviewed branches

- UI: `codex/project-profile-ui`, implementation through `7047325`.
- Backend: `codex/project-profile-backend`, including migration correction
  `6706edbc`.
- Latest fetched main commits: UI `e89693d`, backend `cf743b03`. Both are ancestors
  of their feature branches. No search-improvements branch changes were included.
- Home has no source diff. Its existing project links still open the query dashboard.

## Verification

- `npm run build`: passed in an isolated copy of the committed UI source. Next.js
  compiled successfully and completed generation of 659 static pages.
- `node --test tests/*.test.mjs`: 101 passed, zero failed or skipped.
- ESLint: passed for all 27 changed TypeScript files.
- App-scoped `tsc --noEmit`: passed. The existing repository configuration skips
  lint and type validation during production builds, so these ran separately.
  The repository-wide generated-blog type errors remain outside this feature.
- Backend profile/history and matching endpoint suite: 137 passed, one existing
  warning about an unregistered pytest mark.
- `git diff --check`: passed in both repositories.

The build and browser smoke test used `NODE_ENV=production` with local service
URLs, isolated PostgreSQL/PostgREST, and real Clerk development authentication.
The artifact ran on port 3003 without disturbing the development app on port 3002.
The smoke test verified the saved dashboard table, Board view, profile read/editor,
Find agents prefill with the saved traits, and Home project dashboard destinations.
No Smart Match search was submitted. Earlier local verification covered profile
save/reload, stale revisions, account isolation, mobile widths, and footer spacing.

Review covered profile endpoint ownership and validation, transaction conflicts,
legacy recovery, navigation guards, persistent header/view state, keyboard labels
and focus, and reduced-motion handling. The UI review used the current
[Web Interface Guidelines](https://github.com/vercel-labs/web-interface-guidelines/blob/main/command.md).
The smoke-test console reported the local environment's missing PostHog token;
no feature runtime error was observed. Hosted environment values were not verified.

## Migration and release order

The backend SQL now alters only `public.writer_projects`, adding
`profile_only boolean NOT NULL DEFAULT false`. It has no `forms` fallback and
fails if the canonical table is absent. Three real PostgreSQL migration tests
verify defaults/constraints and idempotency, an untouched `forms` table, and
failure on a forms-only schema. A five-second lock timeout bounds lock acquisition.

1. Confirm the deployed backend points to Write Query Hook production,
   `gjlsblvieeabdloajcbm`, main Production, and that the UI/backend share the
   server-only `WQH_HISTORY_API_KEY`.
2. Apply `scripts/migrations/2026_10_12_project_profiles.sql` to that database.
3. Merge/deploy the backend, then merge/deploy the UI. Coordinate any automatic
   deployment settings so this order is preserved.
4. Smoke-test an owned profile save/reload, dashboard Table/Board, Home project
   links, and Find agents prefill. Retain the additive column on a code rollback.

No production database changes, pushes, PR creation, merges, or deployments were
performed for this review. Both feature branches are local.
