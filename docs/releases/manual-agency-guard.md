# Saved agency warning

Branch: `codex/manual-agency-guard`, based on main at `77f46e5d2aed26d5afc3364211cb0fa933b29250`.
No merge or deployment has been authorized. The September 27 UI revision supersedes the original manual query-history scope.

## Behavior

An orange warning icon follows the agent's name when another saved agent matches the agency. It appears in the dashboard table, board cards, card dialog, and accessible Smart Match cards/profile. Hover or keyboard focus shows a compact tooltip. Click or tap pins the same information in a nonmodal popover; Escape or an outside click closes it.

The tooltip groups matching agent names by project. All saved stages count, including research, rejected and offer-made. All signed-in accounts can see matches across their own projects, with no subscription check or scope checkbox. The current agent is excluded across projects using its catalog ID, or the current saved row ID for manual records. Duplicate saves of an agent within a project appear once. Project IDs keep identically named projects separate.

The Agency history column, History buttons, status badges, refresh control, detailed query-history modal, query-stage counts, sent-date classification and linked history-record dialog have been removed. The explanatory suffixes in the disposable fixture names have also been removed; actual user names are never rewritten.

Matching still gives canonical agency IDs precedence. Two different verified IDs never match through a shared name or domain. Fallback matching uses normalized agency names or official domains; shared submission/social hosts do not identify agencies. If any listed match uses fallback evidence, the first sentence says that the saved agency name or website matches, rather than claiming verified agency identity. Missing identity, no matches, and failed checks do not produce an orange warning. Absence of the icon is not a guarantee about an agency's submission policy.

## Save confirmation

Clicking a Smart Match card heart or the profile's Save Agent button checks the same shared agency index. When another agent matches, the standard alert dialog says: "You currently have another agent from this agency saved. Do you want to continue?" Cancel is solid white and Save Anyway uses the existing green primary button. The buttons remain side by side on narrow screens. The accessible title is hidden; the visible message uses standard modal description typography.

Cancel and Escape close without saving and restore focus to the initiating control. Save Anyway runs the original save action once. Without another matching agent, saving proceeds directly. Initial lookup loading disables the save controls to prevent skipping a pending check. A failed or disabled agency lookup remains advisory and does not block saving. Existing save entitlements and the bulk Save All Agents action are unchanged.

## Shared lookup and freshness

One page-level query calls `POST /api/query-safety/agency-guard` with a batch of discovery catalog IDs, or an empty list for saved dashboards. There is no per-card or hover request. The server derives account ownership from Clerk, scans all owned saved records using paginated reads, and batches catalog lookups. Stage and date fields are no longer fetched for this feature.

The response contract is `saved-agency-matches-v2`, with minimal saved records and resolved identities. The provider builds an agency index once per successful response and groups candidate matches by project. The obsolete per-candidate hook, config endpoint, subscription helper and unused alert/badge primitives were removed.

Each full page load and route navigation checks current server records. Successful additions, removals, project removals and renames update the shared saved-record cache and trigger a new batch. Bulk removals update the cache together. Failed writes do not alter the match snapshot. Successful save/delete responses are applied even if a subsequent full saved-list read fails. Stage-only changes do not change agency membership. Browser focus also rechecks stale data; this is not a live cross-device subscription.

Private query keys include the account, route, contract, discovery IDs and saved-record revision. Obsolete reads consume an abort signal, and account cleanup cancels and removes private match data. API responses and fetches are no-store. The account-scoped endpoint validates input, limits candidate batches to 1,000 catalog UUIDs, reads at most 10,000 saved records, and fails instead of treating an incomplete scan as complete. A per-process request limit remains in place. Catalog lookups use batches of 100, two workers and a shared three-second deadline.

## Local review

The feature remains controlled by `QUERY_SAFETY_AGENCY_HISTORY_ENABLED=true`; the flag defaults off. It is enabled automatically in the disposable review launcher:

```sh
cd /Users/matthewgarrett/.codex/worktrees/manual-agency-guard/querybot_web_app
node scripts/review-manual-agency-guard.mjs /Users/matthewgarrett/Development/querybot_web_app
```

Open `http://localhost:3001/home`, sign in, and open Agency Guard Review A. Supabase and catalog requests are redirected to local in-memory fixtures. Clerk authentication remains real. Restarting the launcher restores the fixture. Never use production data for the removal exercises.

1. In Table, confirm there is no Agency history column or parenthetical suffix in the names. Orange icons appear after matching agent names.
2. Open Blair Oak's icon. Project A lists Alex Oak and Devon Oak; Project B lists Casey Oak. There is no refresh button, stage count or subscription control.
3. Move Alex to Rejected using the board's card tools. Alex should remain listed because all saved stages count.
4. Remove Devon using the table selection and Remove Rows. Blair's tooltip updates without a reload. Finley's warning disappears because the remaining agents have different verified agency identities.
5. Remove Alex from A and Casey from B. Blair's warning disappears when no other matching agent remains. Reload to confirm the server reflects the removals.
6. Repeat with keyboard focus and Escape. On a narrow screen, tap the icon and tap outside to close it. The board icon must not trigger dragging or open the card editor.
7. Open Smart Match, choose Restore previous search, then Search for Agents. The fixture returns Jordan Oak, who matches saved Oak agents, and Morgan Pine, who has no other saved agency match.
8. Click Jordan's heart. Cancel should close without filling the heart or navigating to the profile. Repeat and use Escape. Click the card to open Jordan's profile and test Save Agent there.
9. Choose Save Anyway. The profile changes to Remove Agent and displays the destination project; the results heart fills. Matching indicators update automatically.
10. Save Morgan Pine. No warning should appear. Restart the review launcher to reset saved rows and repeat the confirmed save from Jordan's card heart. The existing search results remain in browser storage.
11. At a 390px viewport, verify Cancel and Save Anyway stay side by side and the text wraps within the modal.

## Verification and limits

The revised automated suite passes 93 tests, including all-stage matching, project grouping, canonical conflicts, fallback evidence, shared hosts, ownership isolation, free access, pagination, input bounds, account/navigation/saved-revision query keys, successful save/removal cache updates, failed writes, catalog batching/timeouts, rate limiting, account hydration, cancellation without writes, one-time confirmation, focus restoration, pending lookup handling, and no-conflict/advisory save paths.

Browser checks use a free signed-in account and local fixture records. Verified table/board placement, keyboard tooltip, pinned popover, automatic update after deletion, removal of the last match, and fresh page loads. The screenshot walkthrough documents the new UI, including the outline-free icon focus treatment. Save-confirmation checks cover the card heart and profile button, Cancel/Escape, confirmed persistence, no-conflict saving and mobile button alignment using disposable search fixtures.

The repository has existing generated-blog TypeScript errors. These are separate from this feature; production build configuration already skips repository-wide type/lint failures. The production build and targeted lint pass. Type checking reports 3,087 existing generated-blog errors and no errors elsewhere.

No migrations, database schema changes, new dependencies, production fixture writes, query sending, messaging or notifications. Production canonical-ID coverage and live-service Smart Match save/restore still need environment-specific acceptance testing. The original checkout's unrelated edits remain untouched.
