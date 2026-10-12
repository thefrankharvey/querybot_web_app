# Project profile and query dashboard

The existing project destination now has Query dashboard and Project profile
navigation. Home's layout, project summaries, and links are unchanged. Its project
buttons and My Projects continue to open `/projects/<dashboard-uuid>/dashboard`.
The profile is at `/projects/<dashboard-uuid>/profile`; the bare project route
redirects to its dashboard. Navigation uses links and preserves browser history.

The dashboard's table/board controls, rename/delete actions, saved agents, notes,
and query tracking remain in place. Project creation still happens when the first
agent is saved. This change adds no Home recommendations or manual project flow.

## Profile behavior

Project profile shows fiction/nonfiction, genre, subgenres, format, audience,
themes, and comparable books. It uses the linked Smart Match's original traits.
Edit traits opens a page editor with explicit Save changes and Cancel actions.
Incomplete profiles can be saved. The existing trait catalogue, normalization,
and custom-trait API are reused, with historical custom values preserved.

Failed saves retain the draft. Revision conflicts offer Load saved traits, with
confirmation before discarding changes. Link navigation, Back, reload, and closing
the tab warn about unsaved edits. Field validation focuses the first invalid book
title; labels and error associations support keyboard and screen-reader use.

Opening Smart Match for an existing project loads its current profile through the
new API. Selection requests cannot overwrite each other, and the form waits for
saved traits before accepting input. An optional profile revision protects newer
edits from an older search form. Search ranking and filtering are unchanged.

## Design

Frontend Design, shadcn, and Web Design Guidelines informed the implementation.
The project title remains the primary heading, with navigation directly beneath.
A shared project layout keeps the editable dashboard title and a single view
navigation mounted across both routes. Its selection pill moves between the two
links, while only the page content fades in over 180ms. Reduced motion disables
both animations. Native links, browser history, and unsaved-trait guards remain.
The title, view navigation, dashboard table, and profile panel share the full
available project column and the same left edge. Table/board selection is retained
when switching views. Both project views reserve 200px on mobile and 240px on
desktop before the footer, including the profile editor and dashboard table/board.
The page keeps the existing app sidebar on desktop and the existing menu on mobile.
The profile uses one reading panel with sections and comparable-book typography,
rather than repeating dashboard widgets. The editor reuses existing components.
Custom genre, format, subgenre, and theme actions are inline plus buttons at the
end of their dropdowns, matching the Smart Match interaction. Each button has an
accessible name and toggles the custom input. The editor omits the incomplete
profile hint, repeated themes label, and saved-agent reassurance sentence.

Existing tokens are retained: accent teal (approximately `#1c4a4e`), background
(`#f0f1eb`), manuscript panel (`#ffffff`), muted body text (`#737373`), and borders
(`#e5e5e5`). The implementation uses semantic tokens, rather than new fixed
palette values. Poppins remains the body font and the existing serif stack is
used for project and book titles. Content is left aligned, with two detail columns
on larger screens and one column on phones.

## Backend and database prerequisite

Requires the matching backend branch `codex/project-profile-backend` and its new
authenticated `GET/PATCH /writer-projects/<uuid>` endpoints. The browser calls only
Next.js `GET/PATCH /api/dashboard-projects/<uuid>/profile`. Next.js derives Clerk
identity and resolves the owned dashboard's backend ID. Browser identity overrides
are ignored. The existing server-only history credential authenticates Flask calls.

The user approved the `profile_only` column and confirmed the production target:
Write Query Hook (`gjlsblvieeabdloajcbm`), main Production, `public.writer_projects`.
**Production application remains deferred until local testing is complete.** The
column distinguishes legacy metadata from actual search history. Apply the
migration before deploying the backend, then release this UI. No shared or
Supabase database changes were applied during implementation or this UI refinement.

For legacy dashboards without a writer-project link, the metadata save uses the
dashboard's UUID and subsequently attaches it through the existing
`dashboard_projects.writer_project_id` field. A failed link operation reports the
partial save and supports recovery by reloading and saving again. It only updates
the owned dashboard whose link is empty; it does not change saved-agent rows.

## Verification

- `node --test tests/*.test.mjs` covers the API contract, account isolation,
  upstream authentication, profile normalization, legacy linking and recovery,
  and existing Home/dashboard behavior. These tests use mocks or local PGlite.
- ESLint passes for new profile components, hooks, routes, and Smart Match changes.
- An app-scoped TypeScript check passes. The full repository check still reports
  pre-existing errors in generated blog pages; the blog is outside this change.
- An isolated headless browser harness renders the actual profile components with
  synthetic session and in-memory API fixtures. It checks read/edit, failed-save
  retention, saving, canceling, link/Back guards, validation focus, and mobile
  overflow. The production authentication/context implementations are unchanged.
- The shared-layout refinement was checked in the real running Next.js app with
  normal Clerk development sign-in and isolated local PostgreSQL/PostgREST. The
  backend runs from the independent profile branch; all dashboard and trait
  records used here are synthetic. No hosted project data was copied.
- All 101 frontend tests pass. The account-scoped route tests now exercise the
  shared layout, which owns project resolution for both child views. App-scoped
  TypeScript, changed-file ESLint, and `git diff --check` pass.
- At 1280px, the profile, editor, and dashboard table measure 1010px wide. The
  profile and editor each have 240px before the footer. At 390px, the profile and
  table measure 358px, with 200px before the profile footer and no horizontal
  document overflow. Existing sidebar/mobile navigation remains in place.
- The matching dashboard spacing was verified in the running app: table and board
  each leave 240px before the footer at 1280px and 200px at 390px. Both remain
  within the viewport width; the profile retains the same mobile spacing.
- An unsaved title edit survived view navigation, confirming that the header
  stays mounted. Renaming from the profile persisted on the dashboard; the sample
  title was restored afterward. Table/Board selection survived a round trip to
  the profile. Navigation from a dirty trait editor retained its draft.
- The links retain native navigation and `aria-current`. The selection pill uses
  a 200ms translate transition; the incoming content uses a 180ms opacity fade.
  Both disable motion for `prefers-reduced-motion`, following the
  [Web Interface Guidelines](https://github.com/vercel-labs/web-interface-guidelines).
  Shared chrome uses a persistent
  [Next.js layout](https://nextjs.org/docs/app/api-reference/file-conventions/layout),
  with the route content in a template.
- Current previews use the running app and local sample records:
  [desktop profile](../previews/project-profile/shared-project-profile-desktop.jpg),
  [desktop editor](../previews/project-profile/shared-project-editor-desktop.jpg),
  [mobile profile](../previews/project-profile/shared-project-profile-mobile.jpg),
  [mobile editor](../previews/project-profile/shared-project-editor-mobile.jpg),
  [query dashboard](../previews/project-profile/shared-query-dashboard-desktop.jpg),
  and [footer spacing](../previews/project-profile/shared-project-footer-desktop.jpg).
