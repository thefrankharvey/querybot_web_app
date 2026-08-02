# Personalized Radar operations

Personalized Radar is implemented through the in-app private-beta stage (R0–R4).
The canonical source ledger belongs to the Flask/API service. The Next.js app owns
private watch state, fan-out, notification history, and the user interface. Only
the Next.js processor route may fan events into `user_notifications`; do not run a
second processor beside it.

## Deployment order

1. Apply `scripts/migrations/2026_08_02_add_agent_change_events.sql` in the
   Flask/API database.
2. Deploy the Flask/API service and verify `agent-change-v1` in shadow mode.
3. Apply `supabase/migrations/20260802000000_personalized_radar_foundation.sql`
   after the Query Safety migrations.
4. Deploy Next.js with fan-out disabled.
5. Exercise watch CRUD and watched Dispatch with staff accounts.
6. Configure one scheduler to call `POST /api/internal/radar/process-events`
   with `Authorization: Bearer $RADAR_PROCESSOR_SECRET`.
7. Enable fan-out for the private-beta cohort only after source-event precision
   and identity matching have been reviewed.

## Flags and secrets

| Setting | Default | Purpose |
| --- | --- | --- |
| `RADAR_WATCH_CREATION_ENABLED` | `true` | Stops creation while preserving existing watches. |
| `RADAR_TARGETED_DISPATCH_ENABLED` | `true` | Stops the watched feed. |
| `RADAR_FANOUT_PROCESSOR_ENABLED` | `false` | Global fan-out kill switch. |
| `RADAR_NOTIFICATION_CENTER_ENABLED` | `true` | Stops notification APIs and page. |
| `RADAR_EMAIL_PREFERENCES_ENABLED` | `false` | Reserved for reviewed email rollout. |
| `RADAR_EMAIL_SCHEDULER_ENABLED` | `false` | Reserved for reviewed email rollout. |
| `RADAR_PROVIDER_SEND_ENABLED` | `false` | Final email-send kill switch. |
| `RADAR_PROCESSOR_SECRET` | none | Required bearer secret for the internal processor. |

Keep the processor secret server-only and rotate it if an authenticated request
appears outside the scheduler. Email flags must stay false until provider,
domain-authentication, unsubscribe, webhook, suppression, and compliance reviews
are complete.

## Processor behavior and monitoring

The processor obtains a five-minute database lease, starts with a 24-hour first-run
lookback, and replays a five-minute overlap thereafter. It reads at most eight
100-event pages per invocation. User-notification uniqueness makes replay safe.
The durable state row records start/success timestamps, the latest recorded time,
and a sanitized failure code. Invalid event payloads are fingerprinted in
`radar_event_quarantine`; raw payloads are not copied there.

Alert on:

- `last_succeeded_at` older than two scheduler intervals;
- non-null `last_error_code` after the next scheduled retry;
- increasing quarantine occurrences;
- unexpected changes in inserted/duplicate/unmatched ratios;
- a full eight-page run, which indicates backlog;
- abnormal per-user or global notification volume.

## Incident runbook

1. Set `RADAR_FANOUT_PROCESSOR_ENABLED=false`; notification history remains intact.
2. Inspect `radar_processor_state` and `radar_event_quarantine` without copying user
   watch lists into logs.
3. Correct a bad source event with a new canonical event ID and
   `supersedes_event_id`; never mutate delivered meaning silently.
   The v1 policy treats a selected-category correction as a new notification,
   so the source must emit correction events only for material user-visible changes.
4. To replay, move `last_recorded_at` back to a reviewed UTC boundary while the
   processor is disabled, clear only an expired lease, then re-enable one worker.
   The notification unique key prevents duplicate ledger rows.
5. If volume is unexpectedly high, keep fan-out off, leave notification records
   auditable, and archive or correct them only through a separately reviewed
   recovery migration.

Email remains outside this runbook because R5–R6 require an approved transactional
provider and compliance decisions. Do not substitute Kit or an unreviewed sender.
