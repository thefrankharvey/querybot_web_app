# Community Benchmarks Delivery Plan

## Document status

- Roadmap position: 4 of 4.
- Deliverable: privacy-preserving, agent-level aggregate response analytics based on sufficient real WQH query-event volume.
- Intended implementers: AI coding agents working primarily in the canonical Flask messaging/data backend, with Next.js adapter and UI agents in `querybot_web_app` and an explicit privacy/QA owner.
- Contract version: `community-benchmarks-v1`.
- Companion index: [`README.md`](./README.md).
- Release posture: gated. Existing UI/contracts are a prototype/foundation, not evidence that production benchmarks are ready.

## Objective

Help a writer understand an eligible agent's recorded WQH query activity without exposing another writer's identity, project, exact query history, or low-volume behavior.

The feature should answer cautious aggregate questions such as:

- How many qualifying WQH queries are represented in this reporting window?
- What share have a recorded response, manuscript request, terminal outcome, or remain active?
- What is the median and middle 50% of recorded time to first view, first response, request, or terminal outcome when enough completed samples exist?
- How fresh is the aggregate, what data is included, and why might a metric be unavailable?

It must not answer:

- who submitted a query;
- what they wrote or which project/genre they queried unless a separately eligible aggregate cohort exists;
- an individual's exact send/reply dates;
- a queue position;
- whether or why an agent will respond;
- a ranking or quality judgment about the agent.

## Product outcomes

- Build a defensible data advantage from WQH's canonical live query lifecycle.
- Give writers better expectations without pretending historical behavior predicts an outcome.
- Demonstrate trust through visible methodology, freshness, and privacy suppression.
- Reuse the event/metric definitions established by Query Intelligence.
- Give agents a neutral aggregate operational view without exposing writer identities.

## Existing implementation foundation

This repository already contains a substantial prototype:

- `app/utils/message-api-contract.ts`
  - Defines `WireAgentActivityResponse`, summary counts, duration benchmarks, privacy fields, and anonymized activity lanes.
- `app/utils/message-types.ts`
  - Defines normalized `AgentActivityResponse`, `AgentActivityBenchmark`, summary, privacy, and lane types.
- `app/utils/message-thread-data.ts`
  - Calls `/message-threads/{threadId}/agent-activity`, authorizes the current writer/agent, and normalizes the response.
- `app/api/message-threads/[threadId]/agent-activity/route.ts`
  - Exposes the writer-facing BFF route.
- `app/api/agent-message-threads/[threadId]/agent-activity/route.ts`
  - Exposes the agent-facing BFF route.
- `app/components/messages/agent-activity.tsx`
  - Renders summary metrics, duration percentiles, activity lanes, reporting windows, and a privacy fallback when the server suppresses details.
- `app/(writer-app)/messages/[projectId]/threads/[threadId]/timeline/page.tsx`
  - Places the comparison beside the writer's exact live-query timeline.

### Current production blockers

1. `app/utils/writer-agent-activity-test-data.ts` creates five deterministic lanes and sets `detailsAvailable: true` with a minimum sample size of 2.
2. `getWriterAgentActivityData()` currently always passes the normalized backend response through `withWriterAgentActivityTestData()`.
3. The writer-facing UI can therefore display fixture lanes rather than the real server privacy decision. This behavior must be removed or explicitly development-gated before any production benchmark launch.
4. The existing response exposes anonymous individual lanes. Anonymous dates/status sequences can still be linkable or re-identifiable, especially for agents with low query volume or public social posts. V1 Community Benchmarks should be aggregate-only for writers.
5. The current endpoint is thread-scoped, which limits discovery surfaces and couples aggregate access to an existing query. The roadmap needs a canonical agent-scoped aggregate contract with explicit authorization/entitlement.
6. The actual backend minimum-cohort logic, data deletion behavior, metric definitions, and query plans are not present in this repository and must be audited.

## Non-negotiable release gates

Community Benchmarks remains disabled in production until all gates pass:

1. No deterministic or fixture activity data can activate in production.
2. Server-side cohort and metric thresholds are enforced independently of the client.
3. Writer responses contain aggregate metrics only; no other writer's per-query lane or exact event sequence.
4. At least 10 distinct writers and 20 qualifying queries are present for an agent/reporting window before agent-level aggregate details can appear.
5. Each duration/rate metric has at least 10 qualifying samples in its denominator before it appears.
6. Cohort size is bucketed or otherwise disclosed according to the approved privacy policy; small exact counts are not returned.
7. Raw query events remain access-controlled and are not available through benchmark endpoints.
8. Account/project/query deletion semantics are implemented and tested through aggregate recomputation.
9. Privacy/legal review approves data use, user notice, retention, and opt-out/deletion behavior.
10. A data-readiness report demonstrates enough eligible agents to avoid a mostly empty product. Recommended general-release gate: at least 25 eligible agents; otherwise run a private/limited beta.
11. Adversarial tests confirm filters, date windows, repeated requests, and differencing cannot reduce a cohort below thresholds or isolate one writer.
12. Product copy and methodology make clear that WQH records only WQH activity and that historical aggregates do not predict a particular query outcome.

Thresholds above are conservative v1 product decisions. Changing them requires privacy review, contract versioning, and updated adversarial tests—not a client-side constant change.

## Data-source policy

### Included in v1

- Canonical WQH live message threads.
- Immutable lifecycle events recorded by the Flask messaging backend.
- Queries whose writer, project, thread, agent profile, and initial send event are valid and not deleted/disqualified.
- Known lifecycle statuses with documented semantics.

### Excluded in v1

- Manual `agent_matches` dates and statuses. They are user-entered and not currently part of the canonical backend event log.
- Imported QueryTracker or spreadsheet data.
- Reddit, Bluesky, email scraping, or other inferred response behavior.
- Message body content, subject, manuscript metadata, notes, writer/project attributes, and attachments.
- Test/staff/seed queries unless a production data-governance process explicitly marks them as eligible real activity.
- Duplicate/test threads, administrative corrections not representing a real lifecycle event, and queries from deleted accounts according to policy.

Manual data may be considered later only through explicit provenance, consent, quality controls, and separate cohort reporting. It must never be silently mixed with live canonical events.

## Product decisions fixed for v1

1. Writer-facing benchmarks are aggregate-only.
2. The writer's own exact query timeline remains visible separately, even when the community aggregate is suppressed.
3. Agents may see aggregate metrics for their own profile, subject to the same writer privacy thresholds. Agent authentication does not authorize access to writer identities or raw peer lanes.
4. Reporting windows are `90`, `180`, `365`, and `all`. Windows shorter than 90 days are not offered in v1 because they increase differencing/linkability risk and often lack stable samples.
5. No custom date range in v1.
6. No genre, format, project, country, or other cohort filters in v1. Each added dimension creates smaller cells and a differencing surface.
7. Metrics are descriptive and neutrally worded. Do not create “fastest agents,” “best response rate,” or similar rankings.
8. Agents cannot hide unfavorable valid aggregate metrics individually. Any opt-out policy applies consistently and is decided during legal/product review.
9. Data is refreshed on a documented schedule; recommended daily rollups.
10. The endpoint returns methodology/eligibility metadata and a stable reason when metrics are suppressed.
11. Entitlement controls whether a user may access eligible benchmarks; privacy thresholds apply regardless of entitlement.

## Privacy model

### K-anonymity-style cohort gate

For one agent and reporting window:

```text
distinct eligible writers >= 10
AND qualifying query threads >= 20
```

The server evaluates this before returning any community metric details.

Do not return the exact distinct-writer count. Return an eligibility flag and, if approved, a coarse query-count band:

```text
20–49 queries
50–99 queries
100+ queries
```

### Metric-level gate

Even when the overall cohort is eligible, a metric is present only when its own eligible sample size is at least 10.

Examples:

- Time to first view requires 10 queries with both sent and viewed events.
- Time to first response requires 10 queries with a qualifying response event.
- Time to terminal outcome requires 10 terminal queries.
- Request rate denominator may use all eligible sent queries, but numerator/count disclosure must not create a small-cell leak. Return the rate only under approved small-n rules; consider suppressing when numerator is 1–2 even if denominator is large.

### Small-cell suppression

Use a consistent policy for rare outcomes:

- Do not return exact counts for categories with fewer than 5 queries.
- Do not return a rate if it would reveal a suppressed numerator through the returned denominator/count band and other categories.
- Apply complementary suppression when totals would allow subtraction to recover a hidden cell.
- Offer general copy such as “Not enough recorded outcomes” rather than zero when zero cannot safely be distinguished from suppressed.

The exact policy must be implemented centrally in the backend and reviewed with adversarial tests.

### Differencing resistance

- Fixed reporting windows only.
- Daily rollup snapshots with a stable `asOf`, not real-time per-request calculations.
- Do not expose exact cohort membership changes or exact raw counts at low volumes.
- Rate-limit repeated benchmark reads.
- Do not allow combinations of filters that isolate a writer.
- Version rollups and avoid returning sufficiently precise data that adjacent snapshots reveal a single new outcome.
- Consider delayed inclusion, such as events becoming eligible after 7 days, if public timing makes a query readily identifiable.

### Date and duration precision

- Return duration percentiles in whole days.
- Do not return individual dates or lane event positions for other writers.
- Consider rounding long durations into 5-day increments if privacy review identifies linkability concerns.
- `asOf` may be day precision for writers. Internal operations can retain exact job timestamps.

## Metric definitions

Reuse Query Intelligence lifecycle semantics, but calculate only over eligible canonical live query cohorts.

### Cohort entry

- One canonical thread/query enters the reporting window based on its initial `query_sent.occurred_at`.
- One query counts once.
- Superseded/invalid events are excluded.
- Deleted/disqualified queries follow the approved removal policy.
- A query remains in its sent-date cohort as it progresses; later outcome events do not move it to a different cohort.

### Aggregate counts/rates

Recommended writer-facing metrics:

| Metric | Definition | Privacy notes |
| --- | --- | --- |
| Recorded query volume band | Bucket containing eligible sent-query count | Never exact at low volume. |
| Still active rate | Eligible nonterminal queries / eligible sent queries as of rollup | Label as snapshot, not queue. |
| Recorded response rate | Queries with request, rejection, or offer / mature eligible query denominator | Define maturity window; exclude too-recent queries or display separately. |
| Manuscript request rate | Queries reaching requested/under-review / eligible sent queries | Apply rare-cell suppression. |
| Recorded terminal-outcome rate | Terminal queries / mature eligible query denominator | Not equivalent to agent responsiveness if tracking is incomplete. |
| Closed/no-response rate | Explicit no-response closures / mature denominator | Reflects WQH-recorded closures, not necessarily confirmed agent behavior. |

### Cohort maturity

Recent active queries can depress response rates unfairly. Freeze a maturity rule before launch.

Recommended v1:

- Display all active volume separately.
- Calculate “recorded response rate” only for queries sent at least 30 days before `asOf`, while disclosing the rule.
- Evaluate 60/90-day alternatives in offline data; select one rule globally rather than per agent.
- Do not choose a maturity window that optimizes attractive results.

### Duration metrics

| Metric | Start | End |
| --- | --- | --- |
| Time to first view | initial query sent | first view |
| Time to first recorded response | initial query sent | first request, rejection, or offer |
| Time to manuscript request | initial query sent | first request |
| Time to recorded terminal outcome | initial query sent | rejection, closed/no response, or offer |

For each eligible duration return:

- median whole days;
- p25/p75 whole days;
- a coarse sample-size band or approved sample disclosure;
- metric availability/suppression reason;
- definition/methodology key.

Do not calculate a duration by substituting `asOf` for an active query in a completed-event distribution. Outstanding aging is a separate aggregate and may be deferred.

### No “queue position”

The current prototype includes `priorSentStillActive` and activity lanes. Writers may misread this as queue position. Community Benchmarks v1 must not expose or describe a queue. Remove/omit this metric from writer aggregate contracts. If agents retain an internal operational metric, label it plainly and do not share it with writers.

## Rollup architecture

### Canonical raw data

The Flask messaging backend owns raw threads and immutable lifecycle events. Benchmark queries never expose raw rows to Next.js.

### Daily aggregate job

Recommended pipeline:

1. Select eligible canonical query threads/events up to a watermark.
2. Exclude test/deleted/disqualified records.
3. Group by agent profile and fixed reporting window.
4. Calculate writer/query cohort sizes and metric-specific samples.
5. Apply privacy eligibility and small-cell/complementary suppression.
6. Persist an immutable/versioned rollup snapshot.
7. Atomically mark the latest successful snapshot for serving.
8. Emit data-quality, eligibility, suppression, and job metrics.

### `agent_benchmark_rollups`

Recommended fields:

| Field | Purpose |
| --- | --- |
| `id` | Rollup snapshot ID. |
| `contract_version` | `community-benchmarks-v1`. |
| `methodology_version` | Metric/privacy rule version. |
| `agent_profile_id` | Canonical agent identity. |
| `window` | `90`, `180`, `365`, or `all`. |
| `window_start` / `window_end` | Fixed cohort bounds. |
| `source_watermark` | Last raw event included. |
| `as_of` | Snapshot date/time. |
| `eligible` | Overall privacy gate. |
| `suppression_reason` | Closed allowlist. |
| `query_count_band` | Approved coarse volume. |
| `metrics_json` or normalized metric rows | Only already-suppressed public aggregate values. |
| `data_quality_json` | Internal-safe quality counts; do not automatically expose. |
| `created_at` | Audit. |

Prefer normalized metric rows if operations need per-metric querying/versioning. If JSON is used, validate against a versioned schema before publishing.

### Recalculation and deletion

- Rollups are derived and can be rebuilt.
- Account/project/query deletion marks raw data ineligible or removes it according to canonical policy, then queues affected agent/window rollups for recomputation.
- Until recomputation succeeds, serve the prior snapshot only if policy permits and it does not retain data that must be removed immediately. For strict erasure requirements, mark affected rollups unavailable first.
- Never edit raw history to make aggregates attractive.
- Corrections create a new snapshot/methodology result; retain internal audit versions according to policy.

### Job idempotency

- A rollup key includes agent, window, source watermark, contract, and methodology version.
- Re-running the same watermark produces the same values.
- Partial jobs do not become latest.
- One agent failure does not publish a mixed incomplete global snapshot without explicit status.
- Monitor lag and last successful watermark.

## Agent benchmark API contract

Create a canonical agent-scoped endpoint in the Flask/messaging backend:

```http
GET /agents/{agent_profile_id}/benchmarks?window=180
X-WQH-Messaging-Key: ...
```

The Next.js BFF supplies the authenticated viewer identity/role and enforces product access. The backend independently enforces agent visibility and privacy suppression.

Recommended wire response:

```json
{
  "status": "success",
  "contract_version": "community-benchmarks-v1",
  "methodology_version": "2026-07-v1",
  "agent_profile_id": "agent-profile-id",
  "window": "180",
  "as_of": "2026-07-31",
  "scope": {
    "source": "wqh_live_queries_only",
    "window_days": 180
  },
  "privacy": {
    "details_available": true,
    "minimum_distinct_writers": 10,
    "minimum_queries": 20,
    "query_count_band": "20-49",
    "suppression_reason": null
  },
  "metrics": {
    "recorded_response_rate": {
      "available": true,
      "value": 0.42,
      "sample_band": "20-49",
      "suppression_reason": null,
      "methodology_key": "response_rate_mature_30d_v1"
    },
    "time_to_first_response_days": {
      "available": true,
      "median": 21,
      "p25": 12,
      "p75": 37,
      "sample_band": "10-19",
      "suppression_reason": null,
      "methodology_key": "first_response_duration_v1"
    }
  }
}
```

Suppressed response still returns the writer's own exact query elsewhere, but this aggregate endpoint returns no community metrics:

```json
{
  "status": "success",
  "contract_version": "community-benchmarks-v1",
  "methodology_version": "2026-07-v1",
  "agent_profile_id": "agent-profile-id",
  "window": "180",
  "as_of": "2026-07-31",
  "scope": {
    "source": "wqh_live_queries_only",
    "window_days": 180
  },
  "privacy": {
    "details_available": false,
    "minimum_distinct_writers": 10,
    "minimum_queries": 20,
    "query_count_band": null,
    "suppression_reason": "minimum_cohort"
  },
  "metrics": {}
}
```

### Suppression reasons

Use a closed allowlist:

- `minimum_cohort`;
- `minimum_metric_sample`;
- `small_cell`;
- `data_quality`;
- `stale_rollup`;
- `feature_unavailable`.

Do not reveal whether one specific writer/event caused suppression.

### Next.js BFF

Recommended route:

```http
GET /api/agent-benchmarks/{agentProfileId}?window=180
```

Responsibilities:

- Clerk authentication and server-side entitlement.
- Resolve/validate agent profile identity; no name-based lookup.
- Call Flask with the shared messaging/service credential.
- Normalize snake_case to versioned camelCase types.
- Preserve all privacy/suppression decisions; never reconstruct missing metrics client-side.
- Use `Cache-Control: private` with a reviewed short TTL or `no-store`. Because rollups are shared but entitlement/viewer context is personalized, do not use a public browser-facing cache without careful keying.
- Return stable error codes and an unavailable state that does not look like “zero responses.”

## Relationship to the existing agent-activity prototype

Do not silently mutate the existing `AgentActivityResponse` into the new public contract. Choose one explicit migration:

### Recommended

- Keep exact viewer timeline endpoints for the viewer's own live query.
- Create separate `AgentBenchmarkResponse` types and agent-scoped endpoints for aggregate metrics.
- Remove community lanes from writer-facing benchmark UI.
- Reuse visual primitives and methodology copy where appropriate.
- Keep agent-facing operational activity separate if product still needs it, with the same privacy rules.

### Fixture behavior

Replace unconditional fixture injection with one of:

1. Story/test fixtures passed directly to components; preferred.
2. A server-only explicit environment flag that is rejected when `APP_ENV=prod` and visibly labels the page as test data.

Do not use a `NEXT_PUBLIC_` flag for server benchmark fixtures. Add a test proving production configuration cannot call `withWriterAgentActivityTestData()`.

## UI delivery

### Primary surfaces

1. Agent profile/detail page: canonical location for benchmark cards.
2. Live query timeline: show the writer's exact query first, followed by eligible aggregate context or privacy fallback.
3. Smart Match result/card: later compact indicator only after full profile benchmarks are stable; avoid displaying nuanced metrics without methodology.

### Writer aggregate panel

Recommended sections:

- “WQH recorded activity” heading.
- Source/freshness: WQH live queries only, reporting window, as-of date.
- Volume band.
- Recorded response/request/active rates when eligible.
- Median and middle-50% duration cards when metric-level eligible.
- Methodology link/dialog.
- Neutral privacy fallback when suppressed.

Do not show individual anonymous lanes, exact other-query dates, or “queries ahead of yours.”

### Privacy fallback

Build on existing copy but avoid revealing an exact current cohort size:

> More WQH activity is needed before private aggregate statistics are available. WQH requires at least 10 distinct writers and 20 qualifying queries in this reporting window.

The writer's own timeline remains visible in the thread page. On an agent profile without an existing query, show only the fallback and general methodology.

### Methodology and interpretation

Explain:

- WQH activity only;
- fixed reporting window and as-of date;
- what counts as a response/request/outcome;
- maturity rule for response rate;
- active queries excluded from completed duration percentiles;
- manual/external queries excluded;
- privacy thresholds and suppression;
- historical activity cannot predict a particular result.

### Agent-facing view

Agents may see eligible aggregate counts/rates for their own profile to understand WQH workflow. Do not show writer identities, project metadata, raw messages, or lane-level histories through the benchmark endpoint. Clearly distinguish operational WQH data from contractual response obligations.

## Entitlement recommendation

- Writers can always see their own exact live query timeline.
- Eligible community aggregate metrics are premium.
- A nonpremium user may see that benchmarks exist and the general methodology, but the server must not return protected metric values.
- Privacy suppression occurs before/independently of entitlement. A premium user cannot buy access to a suppressed cohort.
- Agents may receive their own aggregate view according to the agent product policy; writer premium entitlement does not govern agent access.

## Copy and ethical constraints

Approved language:

- “WQH-recorded response rate.”
- “Median time to a recorded response.”
- “Based on eligible WQH live queries in this reporting window.”
- “Not enough activity for a private aggregate.”

Avoid:

- “Agent response rate” without the recorded/source qualifier.
- “Average wait time” when the metric is a median.
- “Your position in the queue.”
- “This agent is fast/slow.”
- “You should hear back in X days.”
- “Chance of success/representation.”
- comparisons or rankings that encourage harassment or misrepresent incomplete data.

## Security and privacy requirements

- Raw event/threads tables are never queried directly by the browser.
- Benchmark API authorization uses canonical server identity and agent IDs.
- Aggregate eligibility and suppression execute in the backend even if Next.js or the UI is compromised.
- No writer IDs, project IDs, thread IDs, message IDs, exact query dates, subjects, bodies, notes, attachments, or manuscript traits appear in community responses.
- Logs use rollup/correlation IDs, not raw content.
- Rate-limit by authenticated user and agent target.
- Prevent bulk scraping/enumeration through pagination limits, entitlement, rate limits, and monitoring.
- Define staff/admin access separately; do not create an undocumented bypass.
- Account deletion and consent changes trigger documented recomputation/removal.
- Security review includes cache-key isolation so premium/private responses cannot leak through shared caches.

## Telemetry

Approved events:

```text
agent_benchmarks_viewed
agent_benchmarks_suppressed_viewed
agent_benchmark_methodology_opened
agent_benchmark_window_changed
agent_benchmark_metric_help_opened
```

Allowed properties:

- reporting window;
- metric key;
- availability/suppression reason;
- query/sample band;
- surface;
- entitlement state;
- methodology version.

Prohibited:

- agent/writer/project identity;
- raw rates/durations tied to an agent in client analytics unless a separate data-governance review approves it;
- exact dates/cohort counts;
- message/manuscript content;
- raw API responses.

## Data-readiness audit

Before UI implementation, run an offline/backend report that answers:

- number of valid live query threads;
- number of distinct writers contributing valid queries;
- distribution of valid queries per agent;
- eligible agent counts by 90/180/365/all window under proposed thresholds;
- metric-specific sample distribution;
- missing/invalid/superseded event rates;
- test/staff data volume;
- deletion/disqualification volume;
- timestamp ordering anomalies;
- potential agent-identity fragmentation;
- effect of 30/60/90-day maturity rules;
- privacy suppression frequency and complementary-suppression impact.

The report contains sensitive aggregate/operational data and should remain internal. Store only sanitized summaries in planning artifacts.

If fewer than 25 agents are eligible for useful metrics, do not general-release a product-wide benchmark feature. Use private beta, wait for more data, or focus on personal Query Intelligence.

## Adversarial privacy testing

Test attempts to infer an individual's event using:

- adjacent reporting windows;
- repeated daily snapshots;
- one new query or terminal event;
- agents with public social posts about reading/responding;
- rare offer/request outcomes;
- subtraction across returned status/rate totals;
- user querying multiple agents and correlating their own events;
- deleting/adding a query and observing aggregate change;
- agent self-access combined with other product data;
- cache confusion between users/entitlements;
- legacy/canonical agent aliases splitting or recombining cohorts.

A privacy/QA owner must sign off on the results. “No names are shown” is not sufficient anonymization.

## Testing strategy

### Metric correctness

- Hand-calculated fixtures for every rate and duration.
- Active/right-censored queries excluded correctly.
- Sent-date cohort window behavior.
- Maturity window behavior.
- Superseded/corrected events.
- Duplicate threads/events.
- Unknown statuses excluded safely.
- Percentile rounding and sample bands.

### Suppression

- 9 writers/100 queries: suppressed.
- 10 writers/19 queries: suppressed.
- 10 writers/20 queries: overall eligible, subject to metric cells.
- Eligible overall cohort with 9 completed responses: duration suppressed.
- Rare numerator/complementary suppression.
- Exact counts cannot be reconstructed from returned metrics.
- Client cannot override thresholds/window/methodology.

### Authorization and isolation

- Anonymous/nonentitled/cross-role requests.
- Invalid or aliased agent IDs.
- Writer sees only aggregate plus their own timeline through separate authorized route.
- Agent sees only their own eligible aggregate.
- Cache responses cannot cross user/entitlement boundaries.
- Raw lane/thread/event IDs never appear in wire or logs.

### Rollup operations

- Idempotent rerun at same watermark.
- Partial job failure does not publish.
- Late event/correction creates next snapshot.
- Account/query deletion invalidates/recomputes affected rollups.
- Stale rollup suppression.
- Methodology-version migration.
- Large-agent query performance and job bounds.

### Fixture safety

- `APP_ENV=prod` cannot inject deterministic activity data.
- Production build/test fails if fixture helper is imported by a production data path.
- Component stories/tests label fixture content.

### UI/accessibility

- Eligible, overall-suppressed, metric-suppressed, stale, unavailable, and entitlement states.
- Methodology and sample/source copy.
- Screen-reader summaries for every metric.
- Window controls and focus behavior.
- Mobile layout.
- No queue/ranking/prediction language.

## Rollout plan

1. **Fixture isolation:** remove/gate deterministic writer activity immediately; retain component fixtures only in tests/stories.
2. **Backend audit:** document raw lifecycle schema, current agent-activity calculation, thresholds, deletions, and indexes.
3. **Data-readiness report:** evaluate proposed thresholds and maturity rules on production data privately.
4. **Aggregate-only contract:** implement versioned rollups and benchmark endpoint with suppression.
5. **Internal privacy testing:** correctness, differencing, cache, deletion, and enumeration tests.
6. **Staff/internal UI:** render only aggregate cards and privacy fallback.
7. **Limited premium beta:** only if enough eligible agents exist; monitor comprehension and support reports.
8. **General release:** only after all non-negotiable gates and signoffs.

Feature flags/kill switches:

- rollup job;
- benchmark endpoint;
- writer profile panel;
- writer timeline aggregate panel;
- agent-facing aggregate panel;
- individual metric groups;
- entitlement exposure.

Disabling benchmarks must not disable a writer's own exact query timeline.

## Operations and observability

Monitor:

- rollup job success/duration/watermark lag;
- eligible/suppressed agent counts by window;
- metric-level suppression rates;
- data-quality exclusion counts;
- stale rollup count;
- endpoint latency/error/rate-limit volume;
- alias/identity fragmentation;
- deletion recomputation queue age;
- cache hit behavior without identity leakage;
- user reports about misleading metrics.

Runbooks:

- pause benchmark serving;
- pause/rebuild rollups;
- invalidate an agent/methodology snapshot;
- respond to a suspected privacy leak;
- process deletion/recalculation failure;
- rotate service credentials;
- roll back a methodology version;
- remove an incorrectly eligible test/staff cohort.

## Work packages for AI agents

### B0 — Privacy and methodology owner

**Tasks:**

- Freeze inclusion, cohort, maturity, metric, threshold, small-cell, rounding, and disclosure rules.
- Conduct privacy/legal requirements review and maintain threat model.
- Build adversarial test matrix and signoff checklist.
- Own contract/methodology version changes.

**Exit criteria:** every returned field has a privacy and interpretation rationale.

### B1 — Fixture isolation and current-state audit

**Repository:** `querybot_web_app` plus backend inspection.

**Tasks:**

- Remove unconditional `withWriterAgentActivityTestData()` from production path or add fail-closed server-only development gating.
- Add production fixture-safety tests.
- Audit current `/agent-activity` backend calculations, thresholds, raw lane exposure, and deletion behavior.
- Document compatibility/deprecation plan.

**Can start immediately.**

### B2 — Data-readiness report

**Repository:** canonical backend/analytics environment.

**Tasks:**

- Implement read-only audit queries/scripts.
- Measure eligibility and data-quality distributions under frozen B0 rules.
- Compare maturity-window options without optimizing for marketing.
- Produce a sanitized go/no-go report.

**Depends on:** B0 definitions and B1 backend audit.

### B3 — Rollup pipeline and suppression engine

**Repository:** Flask messaging backend.

**Tasks:**

- Create versioned rollup persistence and indexes.
- Implement canonical cohort calculation, metric engine, and centralized suppression.
- Implement idempotent daily job, watermark, deletion invalidation, and observability.
- Add correctness/performance/suppression tests.

**Depends on:** B0; continue only if B2 supports a useful beta or the work is explicitly foundational.

### B4 — Agent benchmark endpoint

**Repository:** Flask messaging backend.

**Tasks:**

- Implement agent-scoped aggregate-only wire contract.
- Enforce privacy, role, agent identity, stale snapshot, and rate-limit rules.
- Ensure no raw lane/query identifiers escape.
- Publish versioned fixtures.

**Depends on:** B3.

### B5 — Next.js BFF and normalized types

**Repository:** `querybot_web_app`.

**Likely files:** new `AgentBenchmarkResponse` types, message/data adapter or adjacent benchmark module, BFF Route Handler, hooks, tests.

**Tasks:**

- Normalize aggregate-only response.
- Preserve suppression and methodology metadata.
- Add entitlement, cache, authorization, and failure behavior.
- Do not reconstruct suppressed metrics.

**Depends on:** frozen B4 fixtures; can implement against fixtures.

### B6 — Writer/agent benchmark UI

**Repository:** `querybot_web_app`.

**Tasks:**

- Replace writer community lanes with aggregate cards/privacy fallback.
- Add methodology/freshness/source/sample-band UI.
- Integrate agent profile and exact-query timeline surfaces.
- Add agent-facing view only if approved.
- Complete accessibility and copy tests.

**Depends on:** B0 copy rules and B5 response fixture. Can run concurrently with B5.

### B7 — Adversarial QA, deletion, and rollout

**Tasks:**

- Execute differencing, small-cell, cache, enumeration, and role tests.
- Verify deletion and recomputation end-to-end.
- Drill rollup/endpoint kill switches and suspected-leak response.
- Confirm data-readiness/general-release gates.
- Produce final privacy/engineering/product signoff artifact.

**Depends on:** B2–B6. Has release veto.

## Acceptance criteria

### Privacy and data

- Writer-facing community responses contain no individual peer lanes, exact peer dates, raw event/thread IDs, or personal/project content.
- Overall and metric-level thresholds are enforced server-side and pass adversarial tests.
- Manual/imported/test data is excluded from v1 production aggregates.
- Deleted/ineligible data is removed from future aggregates according to documented policy.
- Fixture injection is impossible in production.

### Metrics and UI

- Eligible metrics match hand-calculated canonical fixtures.
- Rates and durations show source, reporting window, freshness, method, and sample band.
- Suppressed metrics render “not enough private aggregate data,” never a misleading zero.
- The writer's own exact timeline remains available independently.
- No queue, ranking, prediction, or agent-motive claims appear.

### Reliability

- Rollups are idempotent, versioned, monitored, and not published partially.
- Endpoint/cache isolation and entitlement tests pass.
- Benchmark serving has independent kill switches and runbooks.
- General release occurs only after the documented volume and privacy gates.

## Definition of done

Community Benchmarks is done only when fixture behavior is isolated; canonical live-event volume meets the approved readiness threshold; aggregate-only rollups and APIs enforce cohort, metric, and small-cell privacy rules server-side; deletion and recomputation work; metrics pass correctness and adversarial tests; methodology and copy are transparent; privacy/product/engineering owners sign off; and benchmarks can be disabled without affecting a writer's personal query timeline or core messaging.
