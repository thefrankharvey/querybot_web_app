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
The title, project navigation, and profile panel share one width-constrained
column and the same left edge in both viewing and editing states. The page keeps
the existing app sidebar on desktop and the existing menu on mobile.
The profile uses one reading panel with sections and comparable-book typography,
rather than repeating dashboard widgets. The editor reuses existing components.

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

**The backend migration remains pending user approval.** It adds a `profile_only`
flag to distinguish legacy metadata from actual search history. Apply the approved
migration before deploying the backend, then release this UI. No shared or
Supabase database changes were applied during implementation.

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
- Desktop and mobile screenshots include the existing app navigation. Both
  viewing and editing states were checked at 390, 768, 1440, and 1920 pixels for
  heading/navigation/panel alignment and horizontal overflow. The isolated
  preview imports the actual sidebar and mobile-menu components, with synthetic
  session fixtures confined to its separate test bundle.
- [Desktop profile](../previews/project-profile/desktop.png),
  [desktop editor](../previews/project-profile/editor-desktop.png),
  [mobile profile](../previews/project-profile/mobile.png), and
  [mobile editor](../previews/project-profile/editor-mobile.png) were inspected.
  Shared database writes and production deployment were not used for verification.
