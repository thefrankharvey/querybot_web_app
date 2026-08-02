# Query Intelligence Delivery Plan

## Document status

- Roadmap position: 3 of 4.
- Deliverable: project timeline, funnel, response-time analytics, and deterministic automatic insights.
- Intended implementers: AI coding agents working in `querybot_web_app` and the Flask messaging backend.
- Contract version: `query-intelligence-v1`.
- Companion index: [`README.md`](./README.md).
- Dependencies: unambiguous saved-agent row/project identity from Query Safety; a bulk project lifecycle read from the Flask backend; frozen metric definitions.

## Objective

Give a writer one accurate, comprehensible view of how a project is progressing across manually tracked queries and live WQH message threads.

The feature must answer:

1. What happened, in what order, and to which queries?
2. How many queries progressed through each stage?
3. How long are responses and outcomes taking?
4. What evidence-backed action should the writer consider next?

The feature is personal project analytics. It must not compare the writer to other writers or expose community behavior; that belongs to Community Benchmarks.

## Product outcomes

- Make the Query Dashboard more than a storage surface.
- Help writers identify stale work, missing data, and project-level patterns.
- Connect manual tracking and WQH live messaging without hiding their different provenance.
- Establish a reusable event and metric engine for later aggregate benchmarks.
- Provide premium value even when community sample sizes are too small.

## Success measures

| Metric | Meaning |
| --- | --- |
| Project intelligence views | Adoption by active querying projects. |
| Timeline filter usage | Whether writers use the timeline to investigate rather than merely glance. |
| Insight action rate | Reminder created, dashboard row opened, status corrected, or target queried after an insight. |
| Manual date completeness | Improvement in usable analytics data after quality prompts. |
| Live/manual provenance comprehension | Qualitative/usability metric; users should understand what is confirmed versus self-entered. |
| Analytics calculation error rate | Must be zero for valid inputs; invalid data is surfaced, not silently coerced. |
| Aggregate endpoint latency | Monitor p50/p95 by project size. |
| N+1 lifecycle request count | Must be eliminated from the project page. |

Do not send project names, agent names, query text, notes, or message content to product analytics.

## Existing repository context

### Manual saved-agent data

- `app/types.ts`
  - `AgentMatch` includes `column_name`, `query_sent_date`, `pages_requested_date`, `rejected_date`, `offer_date`, `created_at`, `updated_date`, project scope, agent identity, and fit rating.
- `supabase/migrations/20260628000000_add_query_dashboard_table_fields.sql`
  - Added the primary milestone date columns.
- `app/(writer-app)/query-dashboard/components/query-dashboard-table.tsx`
  - Displays/edits the lifecycle date columns and already distinguishes manual versus live tracking.
- `app/(writer-app)/query-dashboard/context/query-dash-context.tsx`
  - Hydrates saved rows, merges project scope, and overlays live message thread progress.
- `app/utils/project-dashboard-summary.ts`
  - Already produces project status counts and normalized project links.

### Live lifecycle data

- `app/utils/message-types.ts`
  - Defines `QueryProgress`, immutable `QueryStatusEvent`, `QueryTimelineResponse`, and known lifecycle codes.
- `app/utils/message-thread-data.ts`
  - Authenticates/authorizes writer and agent message reads and normalizes snake_case backend events.
- `app/api/message-threads/[threadId]/timeline/route.ts`
  - Exposes an authorized single-thread timeline.
- `app/hooks/use-message-query-lifecycle.ts`
  - Contains timeline query keys/hooks and project thread reads.
- `app/(writer-app)/messages/[projectId]/threads/[threadId]/timeline/page.tsx`
  - Renders one live query's timeline/activity view.
- `app/components/messages/query-lifecycle.tsx`
  - Provides status metadata and duration display utilities.

### Current constraint

The project dashboard can list message threads but does not have one bulk, canonical project event response. Fetching each thread's timeline separately would create an N+1 request pattern and inconsistent snapshots. Query Intelligence must add a bulk backend read or a server-side aggregate endpoint.

## Product decisions fixed for v1

### Scope and provenance

1. Analytics are scoped to one writer project by canonical `writer_project_id`, with a documented legacy project-name fallback.
2. V1 combines manual saved-agent milestones and live WQH lifecycle events.
3. Every event and metric retains a `manual`, `live`, or `mixed` provenance label.
4. Live canonical events override conflicting manual projections for the same query/thread and milestone.
5. Manual records remain editable; corrections change the personal analytics projection and create/update a manual audit event.
6. Missing or invalid dates are excluded from affected duration metrics and counted in a data-quality summary.
7. Analytics never infer an event merely from card creation. Saving an agent is a research event, not a query sent event.
8. `offer_of_representation` is a terminal positive outcome; `rejected` and `closed_no_response` are terminal negative/neutral outcomes.
9. A manuscript request is a response and progression milestone, not a terminal outcome.
10. Active queries are right-censored: they appear in outstanding-aging metrics but are excluded from completed-outcome duration medians.

### Automatic insights

1. V1 insights are deterministic rules with visible evidence, not generative AI.
2. An insight may recommend reviewing or organizing; it must not claim why an agent acted or predict representation.
3. Every insight has a stable rule ID/version, severity, evidence values, action link, and dismissal state.
4. Insights requiring rates or patterns enforce minimum personal sample sizes.
5. Project analytics and insights do not compare to community data in v1.
6. Dismissal is local to the user/project/rule version and may expire when evidence materially changes.

### UI

1. Add an `Insights` view alongside the existing Table and Board views.
2. Timeline, Funnel, Response, and Insights are sections/tabs within the project intelligence view, not separate disconnected products.
3. Charts always have textual equivalents and exact accessible summaries.
4. Empty/small projects receive useful data-quality and next-step states rather than blank charts.

## Unified query event model

Create normalized UI/domain types independent of the snake_case backend wire.

```ts
type QueryEventSource = "manual" | "live" | "backfill";

type UnifiedQueryEventType =
  | "saved_for_research"
  | "query_sent"
  | "query_viewed"
  | "manuscript_requested"
  | "manuscript_under_review"
  | "rejected"
  | "closed_no_response"
  | "offer_of_representation";

type UnifiedQueryEvent = {
  eventId: string;
  queryId: string;
  agentMatchId: string | null;
  threadId: string | null;
  writerProjectId: string | null;
  projectScopeKey: string;
  agentProfileId: string | null;
  indexId: string | null;
  agencyId: string | null;
  type: UnifiedQueryEventType;
  occurredAt: string;
  recordedAt: string | null;
  source: QueryEventSource;
  sourceVersion: string;
  actorRole: "writer" | "agent" | "system" | "unknown";
  isTerminal: boolean;
  confidence: "canonical" | "user_entered" | "derived";
};
```

### Query identity

Preferred:

- Live query: `live:{threadId}`.
- Manual query: `manual:{agentMatchId}`.

When a saved agent maps to a live thread, merge into the live query identity and treat the saved row as the dashboard projection. Use existing `savedAgentId`, `indexId`, and message-thread mapping helpers; do not merge unrelated rows solely by agent name.

### Manual synthetic event IDs

For backfill/projection stability:

```text
manual:{agent_match_id}:{event_type}:{YYYY-MM-DD}
```

If a user corrects a date, the durable manual-event model described below records the correction rather than silently rewriting history. During a projection-only compatibility phase, the synthetic ID changes with the date and cache invalidation must handle it.

### Event ordering

Order by:

1. `occurredAt` ascending;
2. lifecycle status version for live events when timestamps match;
3. a documented event-type order for manual date-only ties;
4. `eventId` as deterministic final tie-breaker.

Do not manufacture distinct times for date-only manual events. Preserve that their resolution is one day.

## Durable manual event persistence

The existing date columns are convenient projections but overwrite history and cannot represent every transition. Deliver in two steps.

### Step 1: compatibility projection

- Read existing columns and derive manual events.
- Clearly mark them user-entered.
- Do not block initial analytics on a full backfill.

### Step 2: `manual_query_events`

Create an append/audit table:

| Column | Required | Purpose |
| --- | --- | --- |
| `id` UUID primary key | yes | Event identity. |
| `user_id` text | yes | Clerk owner. |
| `agent_match_id` UUID FK | yes | Manual query/saved row. |
| `writer_project_id` text nullable | no | Canonical project when available. |
| `project_scope_key` text | yes | Frozen normalized scope. |
| `event_type` text | yes | Allowed manual lifecycle type. |
| `occurred_on` date | yes | User-entered calendar day. |
| `recorded_at` timestamptz | yes | Audit time. |
| `status` text | yes | `active`, `corrected`, or `deleted`. |
| `supersedes_event_id` UUID nullable | no | Correction chain. |
| `source` text | yes | `user`, `dashboard_migration`, or allowed import. |
| `created_at` / `updated_at` | yes | Standard timestamps. |

Rules:

- Corrections append a replacement and mark/supersede the prior event transactionally.
- Current dashboard date columns remain synchronized projections during v1.
- A partial unique constraint prevents two active manual events of the same type for the same saved row unless the product later supports repeated material requests.
- Backfill uses idempotent source keys and never overwrites user-created events.
- Deleting a saved row follows the approved data-retention policy and cannot leave analytics visible to another user.

Do not dual-write from the browser. One authenticated server mutation updates the audit event and projection in a transaction or a backend operation with clear recovery behavior.

## Bulk live lifecycle contract

Add a canonical Flask messaging endpoint scoped by writer identity and project:

```http
GET /writer-projects/{writer_project_id}/query-events?from=...&to=...&cursor=...
X-WQH-Messaging-Key: ...
```

The trusted BFF supplies the canonical backend writer identity using existing message helpers. The browser does not call Flask directly.

Recommended response:

```json
{
  "status": "success",
  "as_of": "2026-07-31T15:00:00Z",
  "writer_project_id": "project-id",
  "queries": [
    {
      "thread_id": "thread-id",
      "saved_agent_id": "agent-match-id",
      "agent_profile_id": "agent-profile-id",
      "index_id": "legacy-index-id",
      "agency_id": "agency-id",
      "query_progress": {},
      "events": []
    }
  ],
  "next_cursor": null
}
```

Rules:

- Authorization reuses writer-project/thread participant checks.
- The endpoint returns lifecycle metadata only, not message bodies or attachments.
- Results are a consistent snapshot with `as_of`.
- Pagination is deterministic and tested on large projects.
- The endpoint preserves event versions, occurrence/recorded times, source, actor role, terminal state, and due dates already available in existing timeline events.
- Legacy projects without canonical IDs use a separately defined compatibility path; do not place arbitrary project names into a canonical-ID endpoint.

## Project intelligence BFF contract

Create a Next.js route such as:

```http
GET /api/projects/{projectId}/query-intelligence?from=2026-01-01&to=2026-12-31
```

The Route Handler:

1. Resolves the Clerk writer and canonical/legacy project using existing project helpers.
2. Reads the user's saved-agent/manual event rows from Next.js Supabase.
3. Reads the bulk live lifecycle snapshot from Flask.
4. Merges/deduplicates unified events with provenance.
5. Runs pure metric and insight functions.
6. Returns normalized camelCase JSON with `Cache-Control: no-store` or a deliberately short private cache policy.

Recommended response:

```ts
type ProjectQueryIntelligenceResponse = {
  status: "success";
  asOf: string;
  project: {
    projectId: string | null;
    projectName: string;
    scopeKey: string;
  };
  filters: {
    from: string | null;
    to: string | null;
  };
  dataQuality: ProjectDataQuality;
  summary: ProjectQuerySummary;
  funnel: ProjectQueryFunnel;
  durations: ProjectDurationMetrics;
  events: UnifiedQueryEvent[];
  queries: ProjectQueryAnalyticsRow[];
  insights: ProjectInsight[];
};
```

For large projects, events/queries may use cursor pagination while summary metrics cover the full filtered set. The contract must make that distinction explicit.

## Metric definitions

Freeze these definitions before implementation and surface them in UI help text.

### Query cohorts

- A query enters the cohort at its earliest valid `query_sent` event/date.
- Filter by sent date, not current status date, unless a metric explicitly states otherwise.
- One query/thread contributes at most once to each funnel milestone.
- Corrections/superseded manual events are excluded.
- Saved-for-research rows do not enter query outcome denominators.

### Funnel

```text
Queries sent
  -> Queries viewed (live WQH only; optional stage)
  -> Manuscript requested
  -> Offer received
```

Also display terminal outcomes adjacent to the progression funnel:

- rejected;
- closed/no response;
- still active.

Definitions:

| Metric | Definition |
| --- | --- |
| Sent | Distinct query IDs with a valid sent event. |
| Viewed | Distinct live query IDs with `query_viewed`; do not treat missing manual view data as “not viewed.” |
| Requested | Distinct queries reaching manuscript requested or under review. |
| Offers | Distinct queries reaching offer. |
| Rejected | Distinct queries with rejection terminal state. |
| Closed/no response | Distinct queries explicitly closed with no response. |
| Active | Sent queries without a terminal event as of `asOf`. |
| Response rate | Distinct queries with request, rejection, or offer divided by sent queries old enough to be evaluated; show denominator and cohort rule. |
| Request rate | Requested divided by sent. |
| Offer rate | Offers divided by sent. Use neutral copy for tiny denominators. |

Do not include `query_viewed` in response rate; a view is an interaction, not an outcome.

### Durations

Use elapsed 24-hour periods from canonical timestamps for live events. Manual date-only durations use UTC-safe calendar-day differences and are labeled day-level estimates.

| Duration | Start | End | Eligible data |
| --- | --- | --- | --- |
| Time to first view | query sent | first viewed | live only |
| Time to first response | query sent | first request, rejection, or offer | live + manual when dates exist |
| Time to request | query sent | first manuscript request | live + manual |
| Time to terminal outcome | query sent | rejection, closed-no-response, or offer | live + manual completed queries |
| Days outstanding | query sent | `asOf` | active queries, shown as aging not completed duration |

For each duration return:

- sample size;
- median;
- p25/p75 when sample size supports it;
- minimum/maximum only if product approves and outliers will not mislead;
- provenance breakdown;
- excluded count and reason summary.

Do not average active queries into completed duration metrics.

### Data quality

Return explicit counts:

- saved research rows with no sent date;
- sent-stage rows missing sent date;
- terminal-stage rows missing outcome date;
- impossible order (request/rejection before sent);
- conflicting manual/live milestones;
- records missing stable agent identity;
- legacy project-scope rows;
- manual versus live query count.

Invalid rows remain visible in a fix-data list but are excluded from affected metrics.

## Deterministic insight rules

Define a stable response type:

```ts
type ProjectInsight = {
  insightId: string;
  ruleId: string;
  ruleVersion: string;
  severity: "info" | "attention" | "positive";
  title: string;
  body: string;
  evidence: Array<{ label: string; value: string }>;
  action: { label: string; href: string } | null;
  generatedAt: string;
  fingerprint: string;
};
```

Recommended v1 rules:

| Rule ID | Trigger | Minimum evidence | Action |
| --- | --- | --- | --- |
| `outstanding-review-v1` | Active query exceeds user's review threshold | 1 valid query | Open filtered dashboard; offer reminder. |
| `missing-milestone-dates-v1` | Status implies event but date missing | 1 invalid row | Open data-quality editor. |
| `round-one-ready-v1` | Round 1 agents remain in research with query letter ready | 1 agent | Open Round 1 filter. |
| `request-conversion-v1` | Project has requests and enough sent queries | At least 5 sent | Show personal request conversion neutrally. |
| `no-response-cluster-v1` | Multiple old active queries exceed threshold | At least 3 | Review/close or set reminders. |
| `recent-momentum-v1` | At least one request/offer in recent window | 1 milestone | Positive summary and link to timeline. |
| `manual-data-health-v1` | Large manual share and missing dates reduce metrics | At least 3 manual rows | Explain how to improve tracking. |

Rules must not say:

- an agent is slow, interested, or likely to respond;
- a writer should query more/less based on tiny samples;
- one genre/round is objectively better without sufficient personal evidence;
- community norms unless Community Benchmarks supplies an eligible aggregate.

### Insight dismissal persistence

Create `project_insight_preferences` only if dismissal must survive devices:

- `user_id`;
- project scope;
- `rule_id` and `rule_version`;
- evidence fingerprint;
- `dismissed_at`;
- optional `snoozed_until`.

A new evidence fingerprint can legitimately resurface an insight. Do not store rendered copy as the sole identity.

## UI delivery

### Dashboard view selector

Extend the existing view type from `table | board` to include `insights`. Migrate the local-storage preference safely: older values remain valid; unknown values fall back to Table.

Recommended top-level layout:

1. Project health/summary strip.
2. Attention insights.
3. Funnel.
4. Response-time metrics.
5. Timeline with filters.
6. Data quality and methodology.

On mobile, prioritize insights and summary; render charts as compact cards/lists rather than horizontally compressed desktop visuals.

### Timeline

Filters:

- date range;
- status/event type;
- manual/live source;
- query round;
- agent/agency search within the user's project;
- active/terminal.

Each event shows:

- date/time at available resolution;
- milestone label and icon;
- agent/agency display;
- source badge (`WQH live` or `Manual`);
- elapsed time from prior milestone when valid;
- link to saved-agent dashboard detail or live thread.

Group by query or chronological day according to the selected view. V1 can ship one grouping first, but the response contract should not assume visual grouping.

### Funnel

- Use distinct query counts, not raw event counts.
- Show numerator and denominator with every rate.
- Mark `Viewed` as live-query-only.
- Show active/terminal outcomes alongside progression.
- Include a text summary for screen readers and users who prefer exact numbers.

### Response analytics

- Metric card contains definition, sample size, provenance, and excluded count.
- Do not render a median when sample size is zero.
- For very small personal samples, display exact personal data but use modest copy such as “Based on 2 completed queries.” This is the user's own data, not a privacy issue, but statistical uncertainty remains.
- Outstanding aging is separate from completed response-time distributions.

### Automatic insights

- Render at most three high-priority insights initially, with “View all.”
- Every insight has an evidence disclosure and direct action.
- Dismiss/snooze is available without deleting underlying data.
- Never use a magical/AI label for deterministic rules.

### Data-quality panel

Provide fix links for missing or impossible dates. Correcting a row should update analytics after successful server persistence and invalidate the project intelligence query.

## Visualization approach

No general charting library is currently listed in `package.json`. Prefer:

- semantic HTML and CSS bars for funnel/summary;
- the existing activity-lane CSS approach for simple timelines;
- a small accessible SVG only when it materially improves the timeline;
- no new chart dependency until bundle size, accessibility, server/client boundary, and maintenance are reviewed.

If a chart library is added, load it only in the Insights view and verify it does not inflate unrelated app routes.

## Caching and performance

- Project intelligence is personalized and must never use a public/shared cache.
- Use one project-level query key including project ID, date filters, and contract version.
- Avoid client fetches per thread or per agent.
- Pure metric calculations may be cached server-side by `(user, project, source versions, filters)` for a short interval if invalidation is reliable.
- Include `asOf`, manual data version, and live event snapshot version/ETag in the response.
- Invalidate after saved-agent lifecycle/date mutation, query round/reminder actions that affect insights, live lifecycle transitions, and project deletion/rename.
- Paginate detailed events for large projects while calculating summaries server-side over the full filtered cohort.
- Add performance fixtures for 10, 100, 1,000, and 10,000 events even if normal projects are smaller.

## Telemetry

Approved events:

```text
query_intelligence_viewed
query_timeline_filtered
query_funnel_help_opened
response_metric_help_opened
project_insight_viewed
project_insight_actioned
project_insight_dismissed
data_quality_fix_opened
```

Allowed properties:

- project-size bucket;
- manual/live/mixed provenance;
- filter type, not filter value when value is an identity;
- insight rule/version;
- sample-size bucket;
- data-quality issue category;
- subscribed entitlement state.

Prohibited:

- project/agent/agency names;
- message/query/manuscript text;
- exact private dates unless approved and coarsened;
- reminder/notes content;
- raw IDs in client analytics.

## Security and privacy

- The BFF resolves the authenticated writer and authorizes the project before reading either data source.
- Manual Supabase queries filter by Clerk `user_id` and canonical/legacy project scope.
- Bulk live lifecycle requests use the established server-only messaging credential and backend participant checks.
- Do not return message bodies, attachments, private notes, or agent-only data in analytics responses.
- Personal analytics are never placed in static generation, public caches, or search indexes.
- Export of Query Intelligence, if later added, is a separate authorization and privacy deliverable.
- Log metric failures with sanitized record/event identifiers or correlation IDs, not user-authored content.

## Failure and partial-data behavior

- If manual data loads but live lifecycle data fails, return a `partial` source state and render manual analytics with a clear live-data unavailable notice. Do not silently label the result complete.
- If live data loads but saved-agent data fails, render live-only data with an equivalent notice.
- If project identity is ambiguous, stop and request a canonical route rather than merging similarly named projects.
- If one row has invalid dates, exclude only affected metrics and expose the data-quality issue.
- If calculation fails globally, preserve Table/Board access and show an Insights error state.
- If backend `asOf` values differ materially, display freshness and avoid claims requiring a single precise snapshot.

## Testing strategy

### Metric unit tests

Use table-driven fixtures for:

- one query reaching every status;
- repeated/status-correction events;
- request followed by rejection/offer;
- active right-censored queries;
- manual date-only and live timestamp durations;
- impossible ordering;
- missing dates;
- duplicate saved/live representations merged once;
- same agent in multiple projects;
- project rename legacy fallback;
- timezone boundaries;
- percentile/median behavior for odd/even samples;
- date filters at boundaries.

### Insight rule tests

- Exact trigger and suppression conditions.
- Minimum sample sizes.
- Stable fingerprint and dismissal behavior.
- Evidence changes resurface only when intended.
- Copy never includes untrusted/user-authored values without safe formatting.
- No agent-motive or community claims.

### Contract/normalization tests

- Bulk Flask wire response to camelCase unified events.
- Unknown status maps safely while preserving raw status for diagnostics.
- Live event provenance and status versions survive normalization.
- Manual backfill is idempotent.
- Live canonical milestones override conflicting manual projections without deleting user data.

### Authorization tests

- Another user's project ID, saved row ID, or thread ID does not reveal data.
- Legacy project-name routes cannot cross-match another writer.
- Deleted projects become unavailable.
- Entitlement enforcement is server-side.

### UI and accessibility tests

- Loading, empty, small-sample, partial, stale, invalid-data, and error states.
- Timeline filtering and deep links.
- Funnel textual equivalent.
- Insight action/dismiss/snooze.
- Keyboard focus, screen-reader labels, non-color source/status indicators, and reduced motion.
- Mobile at narrow widths and projects with long agent/agency names.

### Performance tests

- One BFF request per project view, not one per thread.
- Bounded response size/pagination.
- Metric calculation time for large fixtures.
- Query plans/indexes for manual events and project scope.

## Rollout plan

1. **Metric contract and offline verification:** calculate fixtures and compare with manually computed expected values.
2. **Bulk live event endpoint:** deploy and monitor privately; no UI change.
3. **Shadow project aggregates:** calculate for staff/test projects and compare against table/threads.
4. **Timeline beta:** release event timeline and data-quality panel first.
5. **Funnel and durations:** add after provenance/metric definitions pass usability review.
6. **Deterministic insights:** enable one rule at a time behind server flags.
7. **General release:** expand after error, latency, and data-quality behavior are stable.

Flags:

- Insights view;
- manual/live merge;
- bulk endpoint usage;
- each metric group;
- each insight rule;
- manual event audit writes/backfill.

Rollback keeps Table/Board available and never deletes manual-event audit data.

## Work packages for AI agents

### I0 — Metric and event contract owner

**Tasks:**

- Freeze unified event/query identity and every metric definition.
- Build canonical JSON/TypeScript fixtures with hand-calculated expected results.
- Decide date filtering, duration, percentile, and right-censor rules.
- Maintain this document when contracts change.

**Exit criteria:** backend and UI agents can implement without inventing math.

### I1 — Saved-row and manual event foundation

**Repository:** `querybot_web_app`.

**Tasks:**

- Reuse/finalize row-targeted mutations from Query Safety.
- Create `manual_query_events` migration and server transaction behavior.
- Implement idempotent date-column backfill/projection.
- Add correction/audit tests.

**Depends on:** Safety identity foundation and I0.

### I2 — Bulk live lifecycle endpoint

**Repository:** Flask messaging backend.

**Tasks:**

- Implement authorized project-level lifecycle read.
- Preserve existing event semantics and consistent `as_of` snapshot.
- Add pagination, indexes, and authorization/performance tests.
- Publish versioned wire fixtures.

**Depends on:** I0. Can run in parallel with I1.

### I3 — Next.js aggregation and metric engine

**Repository:** `querybot_web_app`.

**Likely files:** new normalized types/utilities, `message-api-contract.ts`, `message-thread-data.ts`, BFF Route Handler, tests.

**Tasks:**

- Normalize bulk live events.
- Derive/backfill manual events and merge identities.
- Implement pure funnel/duration/data-quality calculations.
- Return partial-source and freshness metadata.

**Depends on:** frozen I0/I2 contracts; can use fixtures before I2 deploys.

### I4 — Project timeline UI

**Likely files:** dashboard shell/view components, new timeline/filter components, route/query hooks, tests.

**Tasks:**

- Add Insights view and preference migration.
- Build accessible timeline, source indicators, filters, deep links, and partial/error states.
- Avoid a new chart dependency unless reviewed.

**Depends on:** I3 response fixture. Can run concurrently with I3.

### I5 — Funnel and response analytics UI

**Tasks:**

- Build funnel, outcome cards, duration metrics, help definitions, and textual equivalents.
- Expose sample/provenance/exclusion counts.
- Verify desktop/mobile and small/large sample states.

**Depends on:** I0 definitions and I3 fixture.

### I6 — Deterministic insights

**Tasks:**

- Implement pure rule engine, versioning, fingerprinting, and preferences.
- Build insight cards/actions/dismissal.
- Add copy/safety/sample-size tests and privacy-safe telemetry.

**Depends on:** I3 metrics and Query Safety reminder/round actions for some deep links.

### I7 — Integration, performance, and rollout

**Tasks:**

- Verify manual/live merge against real authorized projects.
- Eliminate N+1 calls and benchmark query/calc performance.
- Complete feature flags, monitoring, partial-data handling, and rollback docs.
- Run accessibility and regression verification for Table/Board.

## Acceptance criteria

### Timeline

- One project view displays all eligible manual and live milestones in deterministic order.
- Every event visibly identifies its provenance and appropriate time resolution.
- Filters work without changing metric definitions unexpectedly.
- No project view fetches each thread timeline separately.

### Funnel and response analytics

- Distinct queries, not events, populate funnel counts.
- Rates display numerator, denominator, definition, and source limitations.
- Active queries are excluded from completed-duration medians and included in outstanding aging.
- Invalid/missing dates are counted and fixable rather than silently coerced.
- Hand-calculated fixtures match the implementation exactly.

### Automatic insights

- Every insight is deterministic, versioned, evidence-backed, actionable, and dismissible.
- Minimum samples and suppression rules are tested.
- No insight claims agent motive, predicts an outcome, or implies community norms.

### Security and resilience

- Cross-user/project/thread access is impossible through the aggregate endpoint.
- Partial manual/live failures are disclosed.
- Table and Board remain usable if Insights fails or is disabled.

## Definition of done

Query Intelligence is done when the unified event contract and metric definitions are frozen; manual and live events merge without duplication; project analytics use a bulk authorized backend read; funnel and durations pass hand-calculated tests; deterministic insights meet evidence and copy rules; partial-data and accessibility states work; and the entire view can be disabled without affecting core query tracking.
