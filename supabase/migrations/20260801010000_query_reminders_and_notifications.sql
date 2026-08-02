create extension if not exists pgcrypto;

-- Query Safety v1 freezes the saved-row contract as UUID. This foreign key is
-- intentionally explicit so deployment fails before partial rollout if an
-- environment's legacy agent_matches.id has not yet been migrated to UUID.
create unique index if not exists agent_matches_id_user_id_idx
  on public.agent_matches (id, user_id);

create table if not exists public.query_reminders (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  agent_match_id uuid not null,
  kind text not null,
  due_on date not null,
  timezone text not null,
  note text,
  status text not null default 'scheduled',
  source text not null default 'manual',
  suggestion_rule text,
  completed_at timestamptz,
  dismissed_at timestamptz,
  canceled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint query_reminders_agent_owner_fk foreign key (agent_match_id, user_id)
    references public.agent_matches(id, user_id) on delete cascade,
  constraint query_reminders_kind_check check (
    kind in (
      'manual',
      'research_revisit',
      'query_check_in',
      'no_response_review',
      'requested_material_check_in'
    )
  ),
  constraint query_reminders_status_check check (
    status in ('scheduled', 'completed', 'dismissed', 'canceled')
  ),
  constraint query_reminders_source_check check (
    source in ('manual', 'accepted_suggestion')
  ),
  constraint query_reminders_timezone_check check (
    char_length(btrim(timezone)) between 1 and 100
  ),
  constraint query_reminders_note_length_check check (
    note is null or char_length(note) <= 500
  ),
  constraint query_reminders_suggestion_source_check check (
    (source = 'manual' and suggestion_rule is null)
    or (
      source = 'accepted_suggestion'
      and nullif(btrim(suggestion_rule), '') is not null
    )
  ),
  constraint query_reminders_suggestion_rule_check check (
    suggestion_rule is null
    or suggestion_rule in (
      'research-revisit-v1',
      'query-check-in-30-v1',
      'no-response-review-90-v1',
      'material-check-in-30-v1'
    )
  ),
  constraint query_reminders_suggestion_kind_check check (
    suggestion_rule is null
    or (suggestion_rule = 'research-revisit-v1' and kind = 'research_revisit')
    or (suggestion_rule = 'query-check-in-30-v1' and kind = 'query_check_in')
    or (suggestion_rule = 'no-response-review-90-v1' and kind = 'no_response_review')
    or (
      suggestion_rule = 'material-check-in-30-v1'
      and kind = 'requested_material_check_in'
    )
  ),
  constraint query_reminders_status_timestamps_check check (
    (
      status = 'scheduled'
      and completed_at is null
      and dismissed_at is null
      and canceled_at is null
    )
    or (
      status = 'completed'
      and completed_at is not null
      and dismissed_at is null
      and canceled_at is null
    )
    or (
      status = 'dismissed'
      and completed_at is null
      and dismissed_at is not null
      and canceled_at is null
    )
    or (
      status = 'canceled'
      and completed_at is null
      and dismissed_at is null
      and canceled_at is not null
    )
  )
);

create index if not exists query_reminders_user_status_due_idx
  on public.query_reminders (user_id, status, due_on);

create index if not exists query_reminders_agent_match_status_idx
  on public.query_reminders (agent_match_id, status);

create unique index if not exists query_reminders_one_scheduled_kind_idx
  on public.query_reminders (agent_match_id, kind)
  where status = 'scheduled';

create table if not exists public.query_reminder_suggestion_dismissals (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  agent_match_id uuid not null,
  rule_id text not null,
  dismissed_at timestamptz not null default now(),
  cooldown_until timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint query_reminder_dismissals_agent_owner_fk
    foreign key (agent_match_id, user_id)
    references public.agent_matches(id, user_id) on delete cascade,
  constraint query_reminder_dismissals_rule_check check (
    rule_id in (
      'research-revisit-v1',
      'query-check-in-30-v1',
      'no-response-review-90-v1',
      'material-check-in-30-v1'
    )
  ),
  constraint query_reminder_dismissals_cooldown_check check (
    cooldown_until >= dismissed_at
  ),
  constraint query_reminder_dismissals_owner_rule_unique unique (
    user_id,
    agent_match_id,
    rule_id
  )
);

create index if not exists query_reminder_dismissals_agent_idx
  on public.query_reminder_suggestion_dismissals (
    user_id,
    agent_match_id,
    cooldown_until
  );

-- Shared, Radar-compatible in-app notification ledger. Safety owns only
-- `query_reminder_due` writes; future Radar work may add watch foreign keys and
-- additional allowlisted kinds without replacing this table.
create table if not exists public.user_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  kind text not null,
  source_event_id text not null,
  watch_id uuid,
  query_reminder_id uuid references public.query_reminders(id) on delete set null,
  agent_profile_id text,
  index_id text,
  event_type text,
  occurred_at timestamptz not null,
  title text not null,
  summary text not null,
  target_href text not null,
  read_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  constraint user_notifications_kind_check check (
    kind in ('agent_watch_event', 'query_reminder_due')
  ),
  constraint user_notifications_source_event_id_check check (
    char_length(btrim(source_event_id)) between 1 and 500
  ),
  constraint user_notifications_title_check check (
    char_length(btrim(title)) between 1 and 200
  ),
  constraint user_notifications_summary_check check (
    char_length(btrim(summary)) between 1 and 500
  ),
  constraint user_notifications_internal_target_check check (
    target_href like '/%'
    and target_href not like '//%'
    and char_length(target_href) <= 1000
  ),
  constraint user_notifications_reminder_shape_check check (
    kind <> 'query_reminder_due'
    or event_type is null
  ),
  constraint user_notifications_watch_shape_check check (
    kind <> 'agent_watch_event'
    or event_type is not null
  ),
  constraint user_notifications_owner_source_unique unique (
    user_id,
    kind,
    source_event_id
  )
);

create index if not exists user_notifications_user_created_idx
  on public.user_notifications (user_id, created_at desc);

create index if not exists user_notifications_user_unread_idx
  on public.user_notifications (user_id, created_at desc)
  where read_at is null and archived_at is null;

create index if not exists user_notifications_reminder_idx
  on public.user_notifications (query_reminder_id)
  where query_reminder_id is not null;

create or replace function public.set_query_safety_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'query_reminders_set_updated_at'
      and tgrelid = 'public.query_reminders'::regclass
      and not tgisinternal
  ) then
    create trigger query_reminders_set_updated_at
      before update on public.query_reminders
      for each row execute function public.set_query_safety_updated_at();
  end if;

  if not exists (
    select 1
    from pg_trigger
    where tgname = 'query_reminder_dismissals_set_updated_at'
      and tgrelid = 'public.query_reminder_suggestion_dismissals'::regclass
      and not tgisinternal
  ) then
    create trigger query_reminder_dismissals_set_updated_at
      before update on public.query_reminder_suggestion_dismissals
      for each row execute function public.set_query_safety_updated_at();
  end if;
end $$;

notify pgrst, 'reload schema';
