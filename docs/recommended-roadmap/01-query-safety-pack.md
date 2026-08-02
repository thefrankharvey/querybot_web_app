# Query Safety Pack Delivery Plan

## Document status

- Roadmap position: 1 of 4.
- Deliverable: Agency Query Guard, Query Rounds, and Smart Reminders.
- Intended implementers: AI coding agents working in `querybot_web_app`, plus a Flask/API agent if canonical agency identity must be added upstream.
- Contract version: `query-safety-v1`.
- Primary persistence: Next.js Supabase saved-agent domain, except canonical agent/agency profile identity owned by the Flask/API service.
- Companion index: [`README.md`](./README.md).

## Objective

Help writers avoid preventable querying mistakes, decide whom to query next, and remember time-sensitive follow-up work without turning WQH into an intrusive task manager.

The feature must answer three questions from any saved-agent or project surface:

1. **Is there a same-agency query history I should know about?**
2. **Where does this agent belong in my planned query sequence?**
3. **What should I revisit, and when?**

## Product outcomes

- Reduce simultaneous-query mistakes at agencies with restrictive policies.
- Give writers a simple, visible querying sequence that is distinct from fit rating.
- Make outstanding queries and research follow-ups actionable without requiring a separate calendar.
- Establish canonical saved-agent, project, agent, and agency identity needed by later roadmap stages.
- Create a reusable in-app notification source that Personalized Radar can later deliver by email.

## Success measures

Instrument without recording agent names, agency names, project names, or reminder text.

| Metric | Initial target or interpretation |
| --- | --- |
| Agency warnings viewed | Confirms the feature is encountering real query histories. |
| Warning detail opens | Measures whether writers need context, not whether warnings are merely noisy. |
| Query attempts canceled or delayed after a warning | Strong evidence of prevented mistakes; do not interpret every proceed action as failure. |
| Saved agents assigned a round | Adoption of planning workflow. |
| Projects with at least two populated rounds | Evidence that rounds change sequencing rather than act as decoration. |
| Reminder completion rate | Completed or intentionally dismissed reminders divided by due reminders. |
| Reminder notification duplicate rate | Must remain effectively zero. |
| Warning false-positive reports | A primary agency-identity quality signal. |

## Existing repository context

Relevant code:

- `app/types.ts`
  - `AgentMatch` already contains `id`, `user_id`, `index_id`, `agency`, `agency_url`, `column_name`, project scope, lifecycle dates, notes, fit rating, and query readiness.
- `app/api/agent-matches/route.ts`
  - Authenticated collection reads and creates use Clerk `userId` and Next.js Supabase.
- `app/api/agent-matches/[id]/route.ts`
  - Existing GET/PATCH/DELETE target `index_id`, not the saved row ID. This becomes ambiguous when the same agent exists in multiple projects and is a prerequisite defect for new per-project fields.
- `supabase/migrations/20260709000000_project_scoped_agent_matches_unique.sql`
  - Already formalizes the writer-project-ID/legacy-project-name scope rule.
- `app/(writer-app)/query-dashboard/context/query-dash-context.tsx`
  - Owns dashboard mutation behavior and merges manual saved-agent state with live message-thread state.
- `app/(writer-app)/query-dashboard/components/query-dashboard-table.tsx`
  - Editable table surface suitable for query round and reminder summaries.
- `app/(writer-app)/query-dashboard/components/kanban-dialog.tsx`
  - Saved-agent detail/edit surface suitable for the complete Safety Pack controls.
- `app/(writer-app)/agent-matches/components/agent-match-card.tsx`
  - Smart Match result surface where a pre-save agency warning and round assignment can appear.
- `app/(writer-app)/messages/[projectId]/new-message-composer.tsx`
  - Final WQH-controlled checkpoint before an initial live query is sent.
- `app/utils/message-types.ts`
  - Live `QueryProgress.nextAction.dueAt` is already a canonical backend-owned due date and must not be duplicated as an unrelated local reminder.

## Product decisions fixed for v1

### Agency Query Guard

1. The guard is a warning and history tool, not a submission block.
2. Same-project history is the default scope because agency rules generally apply per manuscript/query project.
3. The writer can expand the history to all projects.
4. A query counts as “sent” when WQH has a live `query_sent` event or a manual saved-agent record has a valid `query_sent_date`/submitted-or-later stage.
5. Terminal queries remain part of history but use lower-severity informational styling.
6. An active same-project query produces the strongest warning.
7. An active query for another project produces secondary informational copy; it must not imply that the agency prohibits it.
8. Agency policy text is shown only when it comes from a current, attributable source. WQH must not invent a policy from the existence of another query.
9. Low-confidence agency identity matches never create a hard error. They may show “Possible agency match” with an explanation.
10. The guard must run at both discovery time and the WQH-controlled send checkpoint. A writer should not learn about a conflict only after composing a query.

### Query Rounds

1. Query Round is sequencing, not fit. Keep existing fit rating unchanged.
2. V1 exposes Round 1, Round 2, Round 3, and Hold.
3. The persistence model should permit rounds 1–9 so the feature can expand without another migration.
4. Unassigned is a valid state.
5. Round assignment is per saved-agent row and therefore per project.
6. Reordering within a round is not part of v1. Existing dashboard ordering may remain independent.
7. A writer can filter and sort the table/board by round.
8. Changing a round never changes query status or sends a message.

### Smart Reminders

1. V1 supports one scheduled reminder per saved agent per reminder kind. The data model permits multiple kinds.
2. Reminder kinds are `manual`, `research_revisit`, `query_check_in`, `no_response_review`, and `requested_material_check_in`.
3. A user-selected reminder is a local calendar date interpreted in the user's timezone.
4. V1 in-app reminders never contact an agent or automatically transition a query.
5. Smart suggestions must be framed as review prompts, not claims about agent policy.
6. A 30-day query check-in and a 90-day no-response review may be offered as defaults, but the user chooses whether to schedule them. Do not automatically schedule these for existing users.
7. When a live query has `nextAction.dueAt`, that canonical due date is displayed as a live next action. Do not copy it into `query_reminders` unless the user explicitly creates a separate personal reminder.
8. Email delivery is not part of the Safety Pack's first release. Personalized Radar later consumes due-reminder notification records and adds digest delivery.
9. Reminder notes are private user content. Never include them in analytics events or logs.

## Entitlement recommendation

Keep safety and monetization separate in domain code so the product owner can change packaging without a migration.

- Show a basic same-project agency warning to every authenticated writer when WQH has reliable data. Hiding a known safety issue behind a paywall undermines trust.
- Premium can unlock all-project history, custom reminder schedules, more than one reminder kind per agent, project reminder summaries, and future email delivery.
- Query Rounds can be premium, while existing fit rating remains available according to current packaging.
- Enforce entitlements server-side in mutation/read routes and return a stable `403` error code. The UI should render an upgrade action without discarding local edits.

## Identity foundation

### Saved-agent row identity

Before adding roadmap fields, introduce an unambiguous mutation path that targets `agent_matches.id`.

Recommended route:

```text
/api/agent-match-records/[recordId]
```

Rules:

- Authenticate with Clerk.
- Query by `id = recordId` and `user_id = auth.userId`.
- Never accept or trust `user_id` in the browser payload.
- Return `404` for a missing or unauthorized row to avoid existence disclosure.
- Restrict updates to an explicit allowlist.
- Keep the legacy index-ID route temporarily for compatibility, but migrate dashboard callers and add a deprecation note.

### Project scope utility

Create one shared, pure helper used by API and UI code:

```ts
type ProjectScope = {
  key: string;
  writerProjectId: string | null;
  projectName: string;
};

function getProjectScope(input: {
  writerProjectId?: string | null;
  projectName?: string | null;
}): ProjectScope;
```

Match the existing unique-index semantics exactly. Add tests for whitespace, case, missing IDs, and the default project name.

### Agency identity model

Preferred upstream addition:

```ts
type AgentAgencyIdentity = {
  agencyId: string;
  agencyName: string;
  agencyUrl: string | null;
};
```

Persist `agency_id` on `agent_matches` when saving an agent. Backfill from canonical agent profiles where possible.

Temporary fallback resolver, in descending confidence:

1. Exact canonical agency ID.
2. Exact normalized agency website host after stripping `www`, protocol, path, and tracking parameters.
3. Exact normalized agency name after Unicode normalization, punctuation folding, whitespace compression, and a small reviewed suffix list.
4. No match.

Do not use fuzzy edit distance in v1. “Writers House” and similarly named organizations can create dangerous false positives. Store the resolver method and confidence in the response, not as authoritative database truth.

## Persistence model

### Extend `agent_matches`

Create a migration that adds:

| Column | Type | Purpose |
| --- | --- | --- |
| `agency_id` | text nullable | Canonical agency identity from the upstream agent service. |
| `query_round` | smallint nullable | Planned sequence, allowed 1–9. |
| `query_on_hold` | boolean not null default false | Distinguishes Hold from Unassigned. |
| `safety_updated_at` | timestamptz nullable | Last mutation to Safety Pack fields; do not overload lifecycle `updated_date`. |

Constraints:

- `query_round is null or query_round between 1 and 9`.
- `not query_on_hold or query_round is null`; Hold and a numeric round cannot coexist.
- Index `(user_id, writer_project_id, agency_id)` where `agency_id is not null`.
- Add a fallback index only if query plans prove normalized-name lookups need it. Prefer resolving and persisting canonical IDs.

### Create `query_reminders`

Recommended columns:

| Column | Required | Purpose |
| --- | --- | --- |
| `id` UUID primary key | yes | Public opaque reminder ID. |
| `user_id` text | yes | Clerk owner; server supplied. |
| `agent_match_id` UUID FK | yes | Saved-agent row and project scope. |
| `kind` text | yes | Allowed reminder kind. |
| `due_on` date | yes | User-local calendar date. |
| `timezone` text | yes | IANA timezone used for due-day interpretation. |
| `note` text nullable | no | Private user message, trimmed and length-limited. |
| `status` text | yes | `scheduled`, `completed`, `dismissed`, or `canceled`. |
| `source` text | yes | `manual` or `accepted_suggestion`. |
| `suggestion_rule` text nullable | no | Versioned rule ID when source is a suggestion. |
| `completed_at` timestamptz nullable | no | Completion audit time. |
| `dismissed_at` timestamptz nullable | no | Dismissal audit time. |
| `created_at` / `updated_at` | yes | Standard timestamps. |

Constraints and indexes:

- Check allowed `kind`, `status`, and `source` values.
- Check note length; recommend 500 characters.
- Index `(user_id, status, due_on)` for home/reminder queries.
- Index `(agent_match_id, status)`.
- Partial unique index on `(agent_match_id, kind)` where `status = 'scheduled'`.
- Foreign-key deletion should delete or cancel reminders when the saved-agent row is deleted. Choose one behavior and test it; cascading hard deletion is acceptable for private reminders if account/deletion audit requirements do not require retention.

All Route Handlers still scope by `user_id` even if RLS is configured, because the current server client uses a service-role credential.

## Agency Query Guard computation

### Candidate query

Input:

```ts
type AgencyGuardInput = {
  candidateAgentProfileId?: string | null;
  candidateIndexId?: string | null;
  candidateAgencyId?: string | null;
  candidateAgencyName?: string | null;
  candidateAgencyUrl?: string | null;
  projectName?: string | null;
  writerProjectId?: string | null;
  includeAllProjects?: boolean;
};
```

Output:

```ts
type AgencyGuardResponse = {
  status: "clear" | "history" | "warning" | "possible_match";
  scope: ProjectScope;
  agency: {
    agencyId: string | null;
    name: string;
    matchMethod: "canonical_id" | "domain" | "normalized_name" | "none";
    confidence: "high" | "medium" | "none";
  };
  counts: {
    sameProjectActive: number;
    sameProjectTerminal: number;
    otherProjectActive: number;
    otherProjectTerminal: number;
  };
  records: AgencyQueryHistoryRecord[];
};
```

Each history record includes only data owned by the authenticated user: saved row ID, agent identity/display name, project display name, current normalized stage, sent date, terminal date/status, and link to the relevant WQH surface.

### Status classification

Normalize manual and live state into:

- `research`: no sent event/date.
- `active_query`: sent/viewed, not terminal.
- `active_material`: requested/under review, not terminal.
- `terminal_rejected`.
- `terminal_no_response`.
- `terminal_offer`.
- `unknown_sent`: has a sent date but an unrecognized stage.

History matching excludes `research`. `unknown_sent` counts as active for conservative warning copy but must be labeled as manually tracked/uncertain.

### Severity rules

| Condition | Status | Recommended copy behavior |
| --- | --- | --- |
| High-confidence, same project, active query/material | `warning` | Prominent warning with the other agent, stage, and sent date. |
| High-confidence, same project, terminal history only | `history` | Informational history; no alarm language. |
| High-confidence, other project only | `history` | “You have queried this agency for another project.” |
| Medium-confidence fallback match | `possible_match` | Ask the writer to verify; identify why WQH thinks the agency may match. |
| No relevant sent history | `clear` | Usually render nothing; optionally show a quiet “No same-agency history” in detail views. |

### Server enforcement point

The WQH new-message composer should request an authoritative guard result immediately before creating a new message thread. If a warning exists:

- show a confirmation dialog with history;
- require a deliberate “Continue anyway” action;
- do not require typed confirmation;
- do not record agency names in telemetry;
- avoid a race by rechecking if the dialog remains open for an unusually long period or the send request returns a guard-related conflict version.

This is not a hard backend ban. The backend may accept a `safetyAcknowledgement` object with result version/event IDs for audit and idempotency, but it must not accept the browser's assertion as proof that no conflict exists.

## Smart reminder engine

### Suggestion rules

Implement pure, versioned rules so behavior is testable and explainable.

| Rule ID | Eligibility | Suggested due date | Copy constraint |
| --- | --- | --- | --- |
| `research-revisit-v1` | Saved in research, no reminder | User-selected; offer 7/14/30 days | “Revisit this agent,” not “Agent will reopen.” |
| `query-check-in-30-v1` | Query sent, active, 30 days elapsed | Today or user-selected | Ask user to review guidelines before following up. |
| `no-response-review-90-v1` | Query sent, no terminal event, 90 days elapsed | Today | Suggest review/close decision; never close automatically. |
| `material-check-in-30-v1` | Requested material sent/under review for 30 days | Today or user-selected | Avoid suggesting contact unless guidelines permit it. |

Rules must suppress themselves when:

- an equivalent scheduled reminder exists;
- the query became terminal;
- a live canonical next action is already due sooner and would make the suggestion redundant;
- a user dismissed the same rule version within a defined cooldown;
- required dates are missing or invalid.

### Due reminder creation

Create a `user_notifications` record only once when a scheduled reminder becomes due. Personalized Radar owns the final shared notification ledger; if Safety ships first, define a minimal compatible table/contract rather than a disposable reminder-only notification implementation.

Recommended deduplication key:

```text
reminder:{reminder_id}:due:{due_on}
```

The scheduler must be idempotent and safe to run more than once per day.

### Completion behavior

- `Complete`: marks the reminder complete and retains audit timestamps.
- `Dismiss`: removes it from the active list without claiming the work happened.
- `Snooze`: creates a new due date on the same reminder, increments `updated_at`, and causes a new versioned notification key.
- `Cancel`: available before due date from agent details.
- Terminal lifecycle changes may offer to complete related reminders, but must not silently erase them without a documented product decision.

## Next.js API surface

All responses use normalized camelCase and `Cache-Control: no-store`.

### Saved-agent safety fields

```http
PATCH /api/agent-match-records/{recordId}
Content-Type: application/json

{
  "queryRound": 1,
  "queryOnHold": false
}
```

Return the updated normalized saved-agent record. Reject unknown keys and impossible Hold/round combinations.

### Agency guard

```http
POST /api/query-safety/agency-guard
Content-Type: application/json

{
  "candidateIndexId": "legacy-agent-id",
  "candidateAgencyId": "canonical-agency-id",
  "candidateAgencyName": "Example Literary",
  "candidateAgencyUrl": "https://example.com",
  "writerProjectId": "project-id",
  "projectName": "My Novel",
  "includeAllProjects": false
}
```

The server should prefer canonical candidate data fetched by agent identity over caller-supplied display fields. Browser fields are hints, not authority.

### Reminder collection

```http
GET /api/query-reminders?status=scheduled&due=overdue&projectId=...
POST /api/query-reminders
```

Create request:

```json
{
  "agentMatchId": "saved-row-uuid",
  "kind": "manual",
  "dueOn": "2026-09-15",
  "timezone": "America/New_York",
  "note": "Review the agency guidelines before deciding whether to follow up.",
  "source": "manual"
}
```

### Reminder item

```http
PATCH /api/query-reminders/{reminderId}
DELETE /api/query-reminders/{reminderId}
```

Use explicit actions instead of inferring state from arbitrary fields:

```json
{ "action": "complete" }
```

```json
{ "action": "snooze", "dueOn": "2026-09-22", "timezone": "America/New_York" }
```

## UI delivery

### Agent discovery and profile

Add a compact safety indicator near save/message actions:

- Do not issue one guard request per card in a large result list.
- Fetch one project-scoped agency-history index with saved-agent data, or batch candidate agency IDs.
- Render high-confidence active conflicts immediately.
- Open a detail popover/dialog for complete history.
- Provide “Round” assignment after save; unsaved agents do not have durable rounds.

### Query Dashboard table

Add:

- sortable/filterable `Round` column;
- optional `Reminder` column showing the next scheduled date or overdue state;
- agency-warning icon beside agent/agency when applicable;
- batch filter chips for Round 1/2/3/Hold and Due/Overdue reminders.

Avoid expanding the default table so far that existing core columns become unusable on laptop widths. Let users hide the new columns if the grid supports a column picker; otherwise prioritize Round and move reminder detail to the row/dialog.

### Board and dialog

Kanban card:

- show a compact round badge;
- show one overdue/due reminder indicator;
- show an agency warning icon with non-color labeling.

Kanban dialog:

- full round control;
- agency history section;
- scheduled reminder editor;
- smart reminder suggestions with explanation;
- live next action shown separately from personal reminders.

### Home

Add a small `Needs attention` section above project cards when there are due/overdue reminders or high-confidence safety issues on a draft query. Do not turn home into an infinite task feed.

### New live-query composer

Run the authoritative guard before thread creation. Preserve the composed subject/body if the warning dialog opens or the request fails. Continuing after a warning should require one extra deliberate action but no data re-entry.

## Accessibility and copy requirements

- Warning meaning cannot rely on red color or icon count alone.
- Dialog focus returns to the initiating control.
- The history list has semantic headings and status text.
- Round controls are labeled “Query Round,” not a bare number.
- Reminder date input exposes the user's timezone in supporting copy.
- Use neutral language: “WQH found another query at this agency,” not “You violated the agency's rules.”
- Low-confidence copy explicitly says “possible match.”
- Smart reminders say “review” or “consider,” never “you should follow up” without a sourced policy.

## Telemetry

Approved event examples:

```text
agency_guard_rendered
agency_guard_history_opened
agency_guard_continue_selected
agency_guard_cancel_selected
query_round_changed
reminder_created
reminder_completed
reminder_dismissed
reminder_snoozed
smart_reminder_suggestion_accepted
smart_reminder_suggestion_dismissed
```

Allowed properties:

- warning status and match method;
- count buckets, not identities;
- same-project versus all-project scope;
- round number;
- reminder kind/source;
- days-before/days-overdue bucket;
- subscribed entitlement state.

Prohibited properties:

- agent/agency/project names;
- reminder note;
- email address;
- query/message/manuscript text;
- raw user IDs in client analytics.

## Security and privacy

- Every query filters by authenticated `user_id` server-side.
- Do not expose another writer's agency history under any circumstances.
- A canonical agency ID is not secret, but the fact that a user queried that agency is private.
- Reminder notes must not appear in server logs, error reporting breadcrumbs, or analytics.
- Validate IANA timezone names server-side or use a reviewed allowlist/library.
- Rate-limit agency-guard requests enough to prevent bulk enumeration while preserving normal result-page batching.
- Sanitize and length-limit all free text.
- If RLS is added, test it separately; never treat service-role bypass as proof policies work.

## Failure and stale-data behavior

- If agency history cannot load, do not show a false “clear.” Show a quiet unavailable state at the send checkpoint and let the writer decide whether to continue.
- If canonical agency identity is missing, attempt the documented fallback and label confidence.
- If round mutation fails, rollback optimistic UI and keep the previous round visible.
- If reminder creation fails, preserve the user's date/note in the dialog until retry or cancellation.
- If live lifecycle data is unavailable, manual reminders remain available but must not infer live status.
- If a saved agent is deleted, remove it from guard history and apply the chosen reminder deletion/cancel behavior transactionally.

## Testing strategy

### Pure unit tests

- Project-scope normalization.
- Agency-domain and normalized-name resolver, including Unicode, punctuation, suffixes, and collision cases.
- Query status classification from manual records and live lifecycle snapshots.
- Guard severity calculation.
- Round validation.
- Reminder suggestion eligibility and suppression.
- Calendar-day/timezone behavior around DST transitions.
- Deduplication keys and snooze versioning.

### Route tests

- Unauthorized requests return `401`.
- Cross-user record IDs behave as not found.
- Unknown payload keys are ignored or rejected consistently.
- Index ID cannot update multiple projects through the new record route.
- Guard never returns another user's records.
- Reminder create/update/delete actions enforce ownership and valid state transitions.
- Entitlement failures are enforced server-side.

### Component tests

- Clear, history, warning, possible-match, unavailable, loading, and error states.
- Keyboard and screen-reader behavior for detail and confirmation dialogs.
- Round filters and optimistic rollback.
- Due, overdue, complete, dismiss, snooze, and live-next-action coexistence.
- Composer content survives safety confirmation and failure.

### Integration tests

- Save an agent in two projects, update only one row's round, and confirm the other is unchanged.
- Create a manual sent query, view a same-agency candidate, and receive the expected warning.
- Create a live query thread and confirm the guard recognizes its active state.
- Transition a live query to terminal and confirm warning severity changes without losing history.
- Schedule a reminder, run the due job twice, and create only one notification.

## Rollout plan

1. **Identity-only release:** deploy row-targeted mutations, scope utility, and `agency_id` storage/backfill with no user-visible feature.
2. **Internal guard audit:** calculate guard results in shadow mode and inspect false positives/negatives without rendering warnings.
3. **Guard beta:** show history on detail surfaces, then enable composer confirmation.
4. **Rounds:** release round assignment and filtering after row-targeted mutations are stable.
5. **Manual reminders:** release create/complete/snooze and home due list.
6. **Smart suggestions:** enable rules one at a time behind server flags and monitor dismissals.
7. **Radar handoff:** publish due-reminder events into the shared in-app notification ledger; enable email only through the Radar plan.

Rollback controls:

- Separate flags for agency history, composer guard, rounds, manual reminders, and each suggestion rule.
- Disabling UI does not drop data.
- Scheduled processors can be paused without changing reminder state.
- Migrations are additive until the legacy index-ID mutation path is formally retired.

## Work packages for AI agents

### S0 — Contract and identity audit

**Owns:** roadmap contract updates, project-scope utility design, canonical agent/agency identity mapping.

**Tasks:**

- Confirm upstream agent profile identifiers and whether a canonical agency ID exists.
- Freeze normalized contracts and fixture examples.
- Inventory every caller of `app/api/agent-matches/[id]/route.ts`.
- Produce a migration/backfill risk report before schema edits.

**Can run in parallel with:** copy and component fixture design.

**Exit criteria:** identity choices are documented and no UI agent needs to guess a join key.

### S1 — Saved-row API and schema foundation

**Likely files:** new migration, `app/types.ts`, new row-targeted Route Handler, profile/dashboard mutation callers, tests.

**Tasks:**

- Add Safety Pack fields and constraints.
- Implement authenticated row-targeted GET/PATCH as required.
- Migrate affected dashboard mutations away from ambiguous index-only updates.
- Add authorization and two-project regression tests.

**Depends on:** S0.

**Exit criteria:** the same agent saved to two projects can be updated independently.

### S2 — Agency resolver and guard service

**Likely files:** new pure utility, server query/helper, `/api/query-safety/agency-guard`, unit/route tests.

**Tasks:**

- Implement canonical/fallback agency resolution.
- Normalize manual/live query status into guard categories.
- Implement project/all-project counts and record output.
- Add batch/index strategy for result pages.

**Depends on:** S0 and S1.

**Exit criteria:** deterministic fixtures cover clear, terminal history, active warning, other-project history, and possible-match states.

### S3 — Agency Guard UI and composer checkpoint

**Likely files:** Smart Match cards, agent profile, dashboard card/dialog/table, new-message composer, shared warning components.

**Tasks:**

- Build compact and expanded guard views.
- Add the pre-send confirmation flow without losing composed content.
- Add loading/unavailable behavior and accessibility tests.
- Record privacy-safe telemetry.

**Depends on:** frozen S2 response. Can use fixtures while S2 is implemented.

### S4 — Query Rounds

**Likely files:** types, record mutation hook/context, table column/filter, kanban badge/dialog, tests.

**Tasks:**

- Add round/Hold controls and server validation.
- Add sort/filter behavior.
- Preserve fit rating as a separate concept.
- Confirm mobile layout.

**Depends on:** S1. Can run in parallel with S2/S3 after schema freeze.

### S5 — Reminder persistence and engine

**Likely files:** migration, reminder Route Handlers, pure suggestion rules, due processor, tests.

**Tasks:**

- Implement the reminder state machine and ownership.
- Implement suggestion eligibility/suppression.
- Implement idempotent due-notification creation.
- Integrate live next-action display without duplicate persistence.

**Depends on:** S1 and shared notification-ledger contract from Radar, or an explicitly compatible interim contract.

### S6 — Reminder UI

**Likely files:** kanban dialog/card, table, writer home, shared reminder components/hooks.

**Tasks:**

- Create/edit/complete/dismiss/snooze flows.
- Add due/overdue summaries and smart suggestion explanations.
- Preserve notes after recoverable errors.
- Add accessibility, timezone, and mobile tests.

**Depends on:** frozen S5 API; may use fixtures concurrently.

### S7 — Integration, telemetry, and rollout

**Owns:** cross-feature verification, server flags, monitoring, documentation.

**Tasks:**

- Run end-to-end two-project, live/manual, guard/send, and due-job tests.
- Verify entitlement boundaries.
- Add dashboards for false-positive reports, job errors, and duplicate notifications.
- Document rollback and operations.

**Depends on:** S2–S6.

## Acceptance criteria

### Agency Query Guard

- A same-project active query to the same canonical agency produces a prominent warning on applicable WQH surfaces.
- Terminal same-agency history remains visible but is not styled as an active conflict.
- Other-project history is distinguishable from same-project history.
- Possible fallback matches disclose uncertainty.
- The live-query composer rechecks before sending and preserves the draft across confirmation.
- No request can expose another user's query history.

### Query Rounds

- A writer can assign Round 1, 2, 3, Hold, or Unassigned to a saved agent.
- Assignment is project-specific even when the same agent is saved elsewhere.
- Table/board filtering and sorting work on desktop and mobile.
- Fit rating remains unchanged.

### Smart Reminders

- A writer can schedule, edit, complete, dismiss, cancel, and snooze a private reminder.
- Due reminders appear once in-app and use the correct user-local date.
- Smart suggestions are explainable, suppress duplicates, and never contact an agent or change status.
- Live backend next actions appear separately and retain canonical provenance.
- Reminder text never enters analytics or logs.

## Definition of done

The Query Safety Pack is done when all acceptance criteria pass; record-level mutations are unambiguous; agency matching has measured quality; reminder delivery is idempotent; authorization and entitlement tests pass; the composer guard is fail-safe without being blocking; and the feature can be disabled without deleting user data.
