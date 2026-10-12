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
