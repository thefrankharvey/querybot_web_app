# Personalized Radar Delivery Plan

## Document status

- Roadmap position: 2 of 4.
- Deliverable: saved-agent watches, a targeted Dispatch view, in-app reopening alerts, and opt-in email digests.
- Intended implementers: AI coding agents working in `querybot_web_app` and the Flask/API service that owns agent changes and `/recent-activity`.
- Contract version: `personalized-radar-v1`.
- Companion index: [`README.md`](./README.md).
- Dependency: stable agent identity from the Query Safety Pack foundation. Stable activity event identity is required before notification delivery.

## Objective

Turn Dispatch from a broad industry feed into a personalized opportunity radar that tells each writer when a saved or watched agent materially changes.

The feature must let a writer:

1. Watch or unwatch a saved agent from the places where they already research that agent.
2. See only relevant watched-agent events in Dispatch.
3. Receive a deduplicated in-app notification when an agent reopens or has another selected official change.
4. Opt into a compliant email digest after in-app delivery is proven reliable.

## Product outcomes

- Increase repeat engagement between Smart Match searches.
- Help writers act on short or unpredictable submission windows.
- Make the existing Dispatch ingestion more valuable without duplicating source collection.
- Create a general notification ledger that later supports reminders and product notifications.
- Differentiate WQH through the connection between agent discovery, saved projects, live industry changes, and action.

## Success measures

| Metric | Meaning |
| --- | --- |
| Saved agents watched | Core adoption. Segment by origin surface, not agent identity. |
| Writers with at least one watch | Reach of the feature. |
| Watched event precision | Percentage of delivered events that still resolve to the intended agent and selected category. |
| In-app notification open rate | Whether notifications are relevant and actionable. |
| Watch-to-action rate | Profile opened, round changed, reminder set, or query started after an alert. |
| Duplicate delivery rate | Must be effectively zero. |
| Digest opt-in, open, and unsubscribe rates | Email value and fatigue signal. |
| Alert disable/mute rate | Measures noise and category quality. |
| Event-to-notification latency | Reopening alerts should be timely and monitored at p50/p95. |

Never include agent names, project names, email addresses, or source post text in client analytics properties.

## Existing repository context

- `app/api/dispatch-feed/route.ts`
  - Authenticates the writer and proxies `${getWqhApiUrl()}/recent-activity` with pagination.
- `app/hooks/use-dispatch-feed.ts`
  - Uses an infinite query keyed only as `dispatchFeed`; future query keys must include scope/filter values.
- `app/(writer-app)/dispatch/components/feed.tsx`
  - Provides broad Agent Info, Reddit, and Bluesky filters and a subscriber paywall.
- `app/types.ts`
  - `Blips` contains agent/profile fields and an `id`, but the current contract does not explicitly guarantee stable agent identity, stable event identity, event category, or changed fields.
- `app/utils/dispatch-utils.ts`
  - Flattens `new_openings`, `agent_activity`, Reddit, and Bluesky into a common feed.
- `app/components/blips-card.tsx`
  - Renders official agent activity/opening cards but currently links by website and does not expose a watch action.
- `app/(writer-app)/agent-matches/components/agent-match-card.tsx`
  - Primary Smart Match result action surface.
- `app/(writer-app)/query-dashboard/`
  - Saved-agent table/board surfaces where watch state should be visible.
- `app/hooks/use-clerk-user.ts`
  - Existing subscription/UI entitlement source.
- `app/components/client-nav.tsx`
  - Candidate notification-center entry point. This file may contain unrelated user changes; any implementation agent must inspect and preserve them.
- `package.json`
  - No transactional email provider or job scheduler dependency is present. Kit integration is marketing/subscriber tagging, not a proven transactional notification channel.

## Product decisions fixed for v1

### Watch model

1. A watch follows an agent globally for the authenticated writer, not only within one project.
2. The originating saved-agent/project link is retained so an alert can offer relevant actions, but deleting one project does not automatically remove a global watch if the agent is saved elsewhere.
3. V1 watch categories are:
   - `submission_reopened`;
   - `submission_closed`;
   - `official_profile_update`;
   - `mswl_or_interest_update`;
   - `agency_change`.
4. `submission_reopened` is selected by default.
5. Reddit and Bluesky posts are not watch-notification sources in v1. They remain visible in broad Dispatch but are too noisy and identity-ambiguous for automatic alerts.
6. Only canonical, official agent-profile/activity events can create notifications.
7. A watch can be muted without being deleted.
8. A writer can manage all watches and delivery preferences from one page.

### Delivery channels

1. In-app notifications ship first.
2. Email is opt-in and premium. In-app watch state should remain useful even if email is disabled.
3. V1 email is a daily digest. Instant email is deferred until event quality and user demand are proven.
4. Digest time defaults to 8:00 AM in the user's chosen timezone and is configurable within a small supported set of hours.
5. A digest contains only unread, undelivered eligible notifications created since the prior successful digest cutoff.
6. A failed digest does not mark notifications delivered.
7. Email unsubscribe or preference changes take effect before the next send attempt.
8. In-app notifications remain available after email delivery and have independent read state.

### Event handling

1. Every canonical activity event has a stable `eventId` and schema version.
2. Re-fetching, reordering, or reprocessing an event never creates a duplicate user notification.
3. Corrections are new versioned events referencing the superseded event when necessary; do not silently mutate a delivered event's meaning.
4. Event occurrence time and ingestion/recorded time are distinct.
5. Reopening means a verified transition from a closed/not-open state to an open state. An isolated “open” snapshot without a prior state may appear in Dispatch but must not be labeled “reopened” unless the source contract guarantees the transition.
6. Notification copy is server-selected from typed event fields, not generated from arbitrary third-party HTML.

## Entitlement recommendation

- Allow every authenticated writer to watch a small number of agents and receive in-app reopening notifications. This makes the behavior demonstrable.
- Premium unlocks unlimited or substantially higher watch limits, all official event categories, targeted history beyond a short window, and daily email digests.
- Enforce watch count, event category, history window, and email eligibility server-side.
- Preserve watches when a subscription lapses. Disable premium delivery/categories rather than deleting preferences; explain which watches remain active.
- Do not make unsubscribe from email contingent on an active subscription or sign-in.

## Required upstream activity-event contract

The current `Blips` payload is suitable for display but not reliable notification delivery. Freeze a new event contract in the Flask/API service before building the processor.

Recommended wire shape:

```json
{
  "event_id": "evt_01J...",
  "schema_version": "agent-change-v1",
  "event_type": "submission_reopened",
  "occurred_at": "2026-07-31T13:20:00Z",
  "recorded_at": "2026-07-31T13:23:12Z",
  "agent": {
    "profile_id": "agent-profile-uuid",
    "index_id": "legacy-index-id",
    "name": "Display Name",
    "agency_id": "agency-id",
    "agency_name": "Agency Name"
  },
  "headline": "Open to submissions",
  "summary": "The agent is currently open to submissions.",
  "source_url": "https://validated-source.example/...",
  "changed_fields": ["open_to_queries"],
  "previous": { "open_to_queries": "closed" },
  "current": { "open_to_queries": "open" },
  "supersedes_event_id": null
}
```

Contract rules:

- `event_id` is immutable and globally unique within the source service.
- `agent.profile_id` is preferred; `index_id` supports legacy saved agents.
- The API validates `source_url` and returns safe plain text for headline/summary.
- Event types come from a closed allowlist.
- `previous` and `current` contain only documented non-sensitive fields.
- Events paginate by stable cursor, not offset alone, for processor consumption.
- A processor endpoint can request `recorded_after`/cursor without missing late-recorded events.
- Existing broad Dispatch clients may receive an adapter shape during migration, but the notification processor consumes only the versioned contract.

## Persistence boundaries

### Canonical source service

The Flask/API service should own the append-only `agent_change_events` ledger because it detects/records agent profile changes and already serves recent activity.

Minimum fields:

| Field | Purpose |
| --- | --- |
| `event_id` | Stable idempotency key. |
| `schema_version` | Contract evolution. |
| `agent_profile_id` / `index_id` | Stable agent identity. |
| `agency_id` | Optional agency identity. |
| `event_type` | Closed typed category. |
| `occurred_at` / `recorded_at` | Source time and ingestion time. |
| `safe_payload` | Validated display fields; no arbitrary secrets/HTML. |
| `source_url` | Validated attribution. |
| `supersedes_event_id` | Correction chain. |

### Next.js Supabase

Per-user state belongs with the authenticated app.

#### `agent_watches`

| Column | Required | Purpose |
| --- | --- | --- |
| `id` UUID primary key | yes | Public opaque watch ID. |
| `user_id` text | yes | Clerk owner, server supplied. |
| `agent_profile_id` text nullable | no | Preferred canonical identity. |
| `index_id` text nullable | no | Legacy identity fallback. |
| `origin_agent_match_id` UUID nullable | no | Saved row used to create the watch. |
| `event_types` text[] | yes | Selected allowed categories. |
| `status` text | yes | `active`, `muted`, or `deleted`. |
| `in_app_enabled` boolean | yes | Normally true. |
| `email_digest_enabled` boolean | yes | Server-entitled opt-in. |
| `created_at` / `updated_at` | yes | Standard timestamps. |
| `muted_at` / `deleted_at` | no | State audit. |

Constraints:

- At least one stable agent identity is present.
- Unique active/nondeleted watch per `(user_id, canonical agent key)`.
- Event types are validated by the server; a database check may enforce the known set.
- Index canonical and legacy identity for fan-out matching.

#### `user_notification_preferences`

One row per user:

- `timezone` IANA string;
- `digest_frequency` (`off` or `daily` in v1);
- `digest_hour_local` constrained supported integer;
- `email_enabled`;
- `watch_in_app_enabled`;
- `reminder_in_app_enabled` for Safety Pack compatibility;
- `updated_at`;
- optional `email_unsubscribed_at` and reason/source.

Do not copy the email address into this table. Resolve the current verified delivery address server-side at send time or through a canonical user directory designed for messaging.

#### `user_notifications`

This is a general ledger shared with Smart Reminders.

| Column | Required | Purpose |
| --- | --- | --- |
| `id` UUID primary key | yes | Notification ID. |
| `user_id` text | yes | Owner. |
| `kind` text | yes | `agent_watch_event`, `query_reminder_due`, or future allowlisted kind. |
| `source_event_id` text | yes | Canonical event/reminder dedupe identity. |
| `watch_id` UUID nullable | no | Related watch when applicable. |
| `agent_profile_id` / `index_id` | no | Related agent identity, not user-authored text. |
| `event_type` text | yes for watch | Typed category. |
| `occurred_at` timestamptz | yes | Source occurrence time. |
| `title` / `summary` text | yes | Sanitized snapshot for stable historical display. |
| `target_href` text | yes | Validated internal WQH path. |
| `read_at` / `archived_at` | no | In-app state. |
| `created_at` | yes | Ledger insertion time. |

Unique constraint:

```text
(user_id, kind, source_event_id)
```

If a user unwatches later, existing notifications remain unless the user archives them. New events are no longer added.

#### `notification_deliveries`

| Column | Required | Purpose |
| --- | --- | --- |
| `id` UUID primary key | yes | Delivery attempt ID. |
| `user_id` text | yes | Owner; useful for operations. |
| `channel` text | yes | `email_digest` in v1. |
| `delivery_key` text unique | yes | Idempotency key for a user/digest window. |
| `notification_ids` UUID[] or join rows | yes | Exact included notifications. |
| `status` text | yes | `scheduled`, `sending`, `sent`, `failed`, `suppressed`. |
| `attempt_count` | yes | Retry control. |
| `provider_message_id` text nullable | no | Provider correlation. |
| `scheduled_for` / `sent_at` | yes/no | Timing. |
| `last_error_code` text nullable | no | Sanitized operational error. |
| `created_at` / `updated_at` | yes | Standard timestamps. |

For database portability and queryability, a `notification_delivery_items` join table is preferable to a UUID array if individual membership or resend auditing is required.

## Notification fan-out processor

### Responsibility

Convert canonical agent change events into per-user notification ledger rows.

### Algorithm

1. Read events after a durable cursor with an overlap window for late writes.
2. Validate schema version and event type.
3. Resolve canonical and legacy agent keys.
4. Query active watches that include the event type and have an allowed entitlement.
5. Insert `user_notifications` with `on conflict do nothing` on the dedupe key.
6. Record processor cursor only after the batch commits successfully.
7. Emit operational counts: read, eligible, inserted, duplicate, invalid, unmatched, and failed.

### Idempotency and retries

- Reprocessing the same event is safe.
- Cursor advancement cannot skip failed events.
- One malformed event is quarantined and reported; it must not poison the whole feed indefinitely.
- Corrections with new event IDs create a new notification only when the correction materially changes user-visible meaning. Otherwise update policy must be explicit and auditable.
- Processor credentials are server-only and narrowly scoped.

### Scheduler ownership

Choose one production job runner before implementation:

- Preferred: a worker/scheduled job beside the Flask/API source, which can record events and publish/fan out with minimal lag.
- Acceptable: an authenticated Next.js/Vercel scheduled route that pulls the canonical event cursor and writes per-user state.

Do not create two active processors. Document leader/ownership, timeout, retry, and alert behavior.

## Next.js API surface

All routes authenticate through Clerk except signed unsubscribe/preferences routes designed for email recipients. All personalized responses use `Cache-Control: no-store`.

### Watches

```http
GET /api/agent-watches?status=active
POST /api/agent-watches
```

Create request:

```json
{
  "agentProfileId": "agent-profile-id",
  "indexId": "legacy-index-id",
  "originAgentMatchId": "saved-row-id",
  "eventTypes": ["submission_reopened"],
  "inAppEnabled": true,
  "emailDigestEnabled": false
}
```

The server verifies that the agent identity exists and that `originAgentMatchId`, when provided, belongs to the caller and resolves to the same agent.

```http
PATCH /api/agent-watches/{watchId}
DELETE /api/agent-watches/{watchId}
```

Supported actions: update categories/channels, mute, unmute, and soft-delete.

### Watch-state batch lookup

Result pages must not make one request per agent.

```http
POST /api/agent-watches/lookup

{ "agentKeys": [{ "agentProfileId": "...", "indexId": "..." }] }
```

Apply a bounded maximum batch size and return only the caller's watch status.

### Targeted Dispatch

```http
GET /api/dispatch-feed?scope=watched&cursor=...&eventType=submission_reopened
```

Options:

- Preferred: upstream `/recent-activity` supports agent-key filters or a watched-agent batch.
- Interim: the BFF fetches canonical event pages and filters against watches, but it must continue paging until it fills the requested watched page or reaches a bounded scan limit. It must not claim “no more results” just because one broad page lacked a match.

Return a cursor, not an offset-only contract, for the versioned feed.

### Notifications

```http
GET /api/notifications?status=unread&cursor=...
PATCH /api/notifications/{notificationId}
POST /api/notifications/mark-all-read
```

Item actions: `read`, `unread`, and `archive`. Mark-all-read accepts a server timestamp/cursor boundary so new notifications arriving concurrently are not accidentally marked.

### Preferences

```http
GET /api/notification-preferences
PATCH /api/notification-preferences
```

Validate timezone, supported digest time, channel entitlement, and event categories.

### Email unsubscribe

Use a signed, expiring or revocable purpose-specific token. The unsubscribe endpoint:

- does not require login;
- changes only the intended email preference;
- never exposes the user's address or other account data;
- renders a confirmation page and optional sign-in link to manage full preferences;
- is idempotent.

## UI delivery

### Watch actions

Add a reusable `AgentWatchButton` with watched, unwatched, loading, unavailable, muted, and entitlement-limit states.

Place it on:

- Smart Match result cards after stable identity is available;
- saved-agent detail pages;
- Query Dashboard table/board/dialog;
- official agent cards in Dispatch;
- live message thread header or agent timeline when useful.

Default quick action toggles reopening watches. A settings popover/dialog edits categories and channels.

Avoid optimistic “watched” state until the create request has a local rollback path. When unwatching, explain that historical notifications remain.

### Targeted Dispatch

Evolve the broad filter model into explicit views:

- `For You` or `Watched Agents`;
- `All Agent Updates`;
- `Community/Industry` for Reddit and Bluesky.

Within Watched Agents, offer typed filters such as Reopened, Closed, Interests, Profile, and Agency. Include a useful empty state with links to Smart Match and saved agents.

Update React Query keys to include scope and filter values. Do not reuse cached broad pages as authoritative watched pages unless the cache contains the complete event range.

### Notification center

Add:

- unread badge in writer navigation;
- a dedicated page or accessible popover with paginated history;
- grouped date sections;
- typed icon/label, event occurrence time, safe summary, agent/agency display, and action link;
- mark read/unread, archive, and manage watch;
- distinct reminder notifications compatible with the Safety Pack.

Do not rely solely on a transient toast. Notifications must survive refresh and device changes.

### Email digest

Recommended sections:

1. Reopened to submissions.
2. Other watched-agent changes.
3. Due WQH reminders, if the user opted into reminder email.

Each item includes agent display name, agency, concise typed change, occurrence date, and one WQH deep link. Do not include project/manuscript names by default; users may forward email or view it on a shared screen.

Footer requirements:

- why the recipient received the email;
- manage preferences;
- one-click unsubscribe from Radar email;
- company identity and required physical/contact details based on applicable law/provider rules;
- no marketing consent conflation.

## Email provider and sending requirements

There is no established transactional provider in this repository. Before coding email:

1. Select a provider that supports transactional templates, idempotency/custom headers, webhook events, suppression lists, and domain authentication.
2. Verify SPF, DKIM, and DMARC alignment for the sending domain.
3. Keep provider API keys server-only.
4. Implement send through a narrow server adapter so provider replacement does not affect business logic.
5. Persist provider message ID and sanitized status.
6. Process delivered, bounced, complained, and suppressed webhooks idempotently.
7. Immediately disable email after a hard bounce or complaint according to provider/compliance policy.
8. Separate transactional Radar preferences from marketing/Kit subscription tags.

Do not use the existing Kit subscriber tagging as the email delivery mechanism unless a deliberate review confirms it meets transactional, preference, webhook, and idempotency requirements.

## Digest scheduling

### Eligibility

A user is eligible when:

- subscription entitlement permits email;
- preferences enable a daily digest;
- email is not unsubscribed, bounced, complained, or suppressed;
- at least one eligible notification has not been included in a successful digest;
- current time is within the user's configured local send window.

### Delivery key

Recommended:

```text
radar-digest:{user_id}:{local_digest_date}:{template_version}
```

The job creates the delivery record before calling the provider. Retries reuse the same logical delivery key and provider idempotency mechanism.

### Cutoffs and late events

- Record an explicit UTC cutoff in each delivery.
- Include notifications created after the prior successful cutoff and at/before the new cutoff.
- Late-recorded source events appear in the next digest; do not backdate them into an already sent digest.
- If a send fails, retain eligibility and retry with bounded exponential backoff.
- Do not send multiple catch-up digests in one day without a product decision. Combine backlog into the next eligible digest with a maximum item count and “view more” link.

## Accessibility and content requirements

- Watch buttons expose current state with `aria-pressed` or equivalent semantics.
- Unread state has text/screen-reader meaning, not just a dot.
- Event category is visible in words.
- Notification times use the viewer's locale and include full dates in accessible text.
- Targeted Dispatch remains usable by keyboard and does not reset scroll unexpectedly when filters change.
- Email uses semantic headings, meaningful link text, high contrast, alt-free decorative icons, and a plain-text alternative.
- Reopening copy uses “WQH recorded this agent as open” unless a precise transition is verified.

## Telemetry

Approved events:

```text
agent_watch_created
agent_watch_updated
agent_watch_muted
agent_watch_deleted
watched_dispatch_viewed
watched_event_opened
notification_center_opened
notification_marked_read
notification_archived
radar_digest_enabled
radar_digest_disabled
radar_digest_item_opened
```

Allowed properties:

- event category;
- origin surface;
- watch-count bucket;
- in-app/email channel;
- entitlement state;
- notification age bucket;
- delivery/template version.

Do not place names, URLs, user-authored notes, source text, project identifiers, or provider errors containing recipient data in client analytics.

## Security and privacy

- Watch lists reveal writer intent and are private.
- All reads and writes filter by Clerk `user_id` server-side.
- Batch lookup returns watch state only for the current user.
- Validate internal target paths; do not store arbitrary redirect URLs from source events.
- Sanitize source text at ingestion and again at output boundaries as appropriate.
- Scheduled processors and provider webhooks use server-only secrets and replay protection.
- Unsubscribe tokens are purpose-limited and do not encode plaintext user data.
- Email content excludes private notes and message bodies.
- Apply per-user and global send caps to contain bugs.
- A kill switch must stop all email immediately without deleting queued notification records.

## Failure behavior

- If watch state cannot load, render an unavailable/retry state rather than an unchecked button that could mislead the user.
- If a watch mutation fails, rollback optimistic state and preserve selected categories in the open dialog.
- If canonical agent identity is missing, allow broad Dispatch viewing but disable watch creation with an explanation; do not join by name.
- If the event processor falls behind, show the last successful ingestion time in internal operations, not alarming user copy unless freshness materially degrades.
- If email fails, keep in-app notifications intact.
- If the email provider is unavailable, pause/retry; do not send through an unreviewed fallback provider.
- If a canonical event is corrected, preserve audit history and avoid silently changing already-sent email content.

## Testing strategy

### Contract tests

- Stable event IDs survive pagination and refetch.
- Agent profile/index identity maps correctly to saved agents.
- Every allowed event type has safe display copy.
- Unknown schema versions fail closed into quarantine, not notifications.
- Reopening requires a verified transition.

### Persistence and route tests

- Watch uniqueness and ownership.
- Same agent watched from multiple projects creates one global watch.
- Deleting one saved row does not remove a still-relevant global watch.
- Cross-user IDs do not disclose existence.
- Notification dedupe under concurrent processor runs.
- Mark-all-read boundary excludes notifications created afterward.
- Entitlement limits apply server-side.
- Unsubscribe is idempotent and narrowly scoped.

### Processor tests

- Reprocess the same page/cursor twice with zero duplicate notifications.
- Handle overlapping cursor windows.
- Quarantine malformed events and continue the batch.
- Do not notify muted/unsubscribed watches or unselected categories.
- Apply a correction event according to the frozen policy.
- Crash before/after cursor persistence and recover without gaps.

### Digest tests

- Timezone/DST send windows.
- Unique delivery per user/local day/template version.
- Retry after provider timeout without duplicate send.
- Successful send marks only included notification items delivered.
- Hard bounce/complaint suppression.
- Preference change immediately before send.
- Backlog capping and view-more behavior.
- HTML and plain-text snapshots contain no private project/reminder content unless explicitly allowed.

### UI tests

- Watch state on all origin surfaces.
- Batch lookup avoids N+1 requests.
- Targeted feed pagination through sparse matches.
- Empty, loading, error, offline, muted, and entitlement-limit states.
- Notification read/archive behavior across refresh.
- Keyboard and screen-reader semantics.

## Rollout plan

1. **Event-contract shadowing:** upstream emits stable events; compare against current Dispatch output without creating notifications.
2. **Internal watch state:** enable watches for staff/test users with no processor fan-out.
3. **In-app private beta:** run fan-out, notification center, and targeted Dispatch for a small cohort.
4. **In-app general release:** expand after precision, duplicate, and latency targets are met.
5. **Email dry run:** generate digest previews to an internal sink; do not contact users.
6. **Email beta:** explicit opt-in for a small premium cohort with send caps.
7. **Daily digest general release:** expand gradually; instant email remains separate future work.

Feature flags/kill switches:

- watch creation;
- targeted Dispatch;
- fan-out processor;
- notification center;
- email preference UI;
- email scheduler;
- provider send;
- each event category independently.

## Operations and observability

Create internal dashboards/alerts for:

- source event freshness and cursor lag;
- invalid/quarantined event count;
- watches matched per event distribution;
- notification insert/duplicate/error count;
- per-user/global delivery volume;
- delivery success, retry, bounce, complaint, and suppression rates;
- digest job duration and backlog;
- deep-link failure rate;
- watch identity resolution failures.

Runbooks must cover:

- pausing processors;
- pausing email only;
- replaying an event range safely;
- correcting a bad source event;
- responding to an accidental high-volume fan-out;
- rotating provider/webhook credentials;
- honoring deletion and email preference requests.

## Work packages for AI agents

### R0 — Canonical event contract and source ledger

**Repository:** Flask/API service.

**Tasks:**

- Define/version `agent-change-v1`.
- Add stable agent/event identity and cursor pagination.
- Record typed transitions and corrections.
- Provide fixtures and a compatibility plan for current `/recent-activity` clients.

**Exit criteria:** the same source event can be fetched repeatedly with an identical event ID and agent identity.

### R1 — Watch and notification schema/API

**Repository:** `querybot_web_app`.

**Likely files:** Supabase migrations, new Route Handlers, types, tests.

**Tasks:**

- Create watch, preferences, notifications, and delivery tables.
- Implement authenticated CRUD and batch lookup.
- Add entitlement and authorization tests.

**Depends on:** agent identity contract from Safety and event category contract from R0.

### R2 — Watch UI

**Repository:** `querybot_web_app`.

**Likely files:** shared watch component/hook, agent cards/profile, dashboard table/board/dialog, tests.

**Tasks:**

- Build watch toggle/settings states.
- Add bounded batch lookup.
- Preserve existing save/message actions and mobile layouts.
- Add privacy-safe telemetry.

**Can run against fixtures after R1 request/response shapes freeze.**

### R3 — Targeted Dispatch

**Repository:** both, depending on upstream filtering.

**Likely files:** dispatch API/hook/feed/utils/types, upstream recent-activity query.

**Tasks:**

- Add watched scope and typed filters.
- Replace offset-only assumptions with cursor contract for versioned events.
- Fix React Query keys and sparse-page pagination.
- Build empty/error/freshness states.

**Depends on:** R0 and R1.

### R4 — Fan-out processor and notification center

**Repository:** processor owner plus `querybot_web_app` UI.

**Tasks:**

- Implement durable cursor/idempotent fan-out.
- Add notification APIs and navigation/page UI.
- Integrate Safety Pack reminder notifications.
- Add lag, error, and duplicate monitoring.

**Depends on:** R0 and R1. Notification UI can use fixtures concurrently.

### R5 — Transactional email foundation

**Repository:** service selected to send email plus Next.js preferences/unsubscribe UI.

**Tasks:**

- Select/provider-review and authenticate domain.
- Implement provider adapter and webhook processing.
- Implement preference/unsubscribe contracts.
- Add send caps and global kill switch.

**Depends on:** product/compliance approval. Can run after R1 while in-app delivery is tested.

### R6 — Daily digest scheduler and templates

**Tasks:**

- Implement timezone-aware eligibility and delivery records.
- Build HTML/plain-text templates and preview fixtures.
- Add retry, cutoff, backlog, and provider idempotency behavior.
- Complete bounce/complaint/unsubscribe testing.

**Depends on:** R4 and R5; do not activate until in-app event quality passes release gates.

### R7 — Integration, privacy, and staged rollout

**Tasks:**

- Run end-to-end event-to-watch-to-notification-to-digest tests.
- Confirm entitlement transitions and deletion behavior.
- Execute email dry run and operational failure drills.
- Document flags, runbooks, and rollback.

## Acceptance criteria

### Watches and Dispatch

- A writer can watch/unwatch a saved agent with stable agent identity from every designated surface.
- Watch categories and mute state persist across devices.
- Watched Dispatch contains only matching official events and paginates correctly even when matches are sparse.
- Reddit/Bluesky posts never create watch notifications in v1.

### In-app notifications

- A verified reopening event creates at most one notification per eligible user.
- Notifications survive refresh, support read/archive actions, and deep-link to a relevant WQH surface.
- Muted, unselected, and unauthorized watches do not receive events.
- Processor retries and cursor overlap do not create duplicates or gaps.

### Email digest

- Email is explicit opt-in, premium-entitled, timezone-aware, and sent at most once per configured day.
- Retry does not duplicate a successful send.
- Unsubscribe works without sign-in and before the next send.
- Bounces/complaints suppress further email according to policy.
- Email contains no manuscript content, query text, reminder notes, or private project names by default.

## Definition of done

Personalized Radar is done when canonical source events are stable; watch and notification authorization is proven; targeted Dispatch is accurate; in-app fan-out is idempotent and monitored; email has a reviewed provider, preference and compliance controls, bounce/complaint processing, and duplicate prevention; and every delivery stage has a kill switch and runbook.
