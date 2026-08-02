-- Personalized Radar R1: private per-writer watches, preferences, delivery
-- bookkeeping, and processor state. All browser access goes through authenticated
-- Next.js Route Handlers using the service role; Clerk user IDs are server supplied.

create table if not exists public.agent_watches (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  agent_profile_id text,
  index_id text,
  origin_agent_match_id uuid references public.agent_matches(id) on delete set null,
  origin_surface text not null default 'unknown',
  event_types text[] not null default array['submission_reopened']::text[],
  status text not null default 'active',
  in_app_enabled boolean not null default true,
  email_digest_enabled boolean not null default false,
  muted_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint agent_watches_owner_id_unique unique (id, user_id),
  constraint agent_watches_identity_check check (
    nullif(btrim(agent_profile_id), '') is not null
    or nullif(btrim(index_id), '') is not null
  ),
  constraint agent_watches_origin_surface_check check (
    origin_surface in (
      'agent_card',
      'agent_profile',
      'query_dashboard',
      'kanban_dialog',
      'dispatch',
      'message_thread',
      'unknown'
    )
  ),
  constraint agent_watches_event_types_check check (
    cardinality(event_types) between 1 and 5
    and event_types <@ array[
      'submission_reopened',
      'submission_closed',
      'official_profile_update',
      'mswl_or_interest_update',
      'agency_change'
    ]::text[]
  ),
  constraint agent_watches_status_check check (
    status in ('active', 'muted', 'deleted')
  ),
  constraint agent_watches_muted_shape_check check (
    (status = 'muted' and muted_at is not null)
    or (status <> 'muted' and muted_at is null)
  ),
  constraint agent_watches_deleted_shape_check check (
    (status = 'deleted' and deleted_at is not null)
    or (status <> 'deleted' and deleted_at is null)
  )
);

create unique index if not exists agent_watches_active_profile_unique
  on public.agent_watches (user_id, agent_profile_id)
  where status <> 'deleted' and agent_profile_id is not null;

create unique index if not exists agent_watches_active_index_unique
  on public.agent_watches (user_id, index_id)
  where status <> 'deleted' and index_id is not null;

create index if not exists agent_watches_user_status_idx
  on public.agent_watches (user_id, status, updated_at desc);

create index if not exists agent_watches_profile_fanout_idx
  on public.agent_watches (agent_profile_id, status)
  where agent_profile_id is not null and status = 'active' and in_app_enabled;

create index if not exists agent_watches_index_fanout_idx
  on public.agent_watches (index_id, status)
  where index_id is not null and status = 'active' and in_app_enabled;

create table if not exists public.user_notification_preferences (
  user_id text primary key,
  timezone text not null default 'America/New_York',
  digest_frequency text not null default 'off',
  digest_hour_local smallint not null default 8,
  email_enabled boolean not null default false,
  watch_in_app_enabled boolean not null default true,
  reminder_in_app_enabled boolean not null default true,
  email_unsubscribed_at timestamptz,
  email_unsubscribe_source text,
  updated_at timestamptz not null default now(),
  constraint user_notification_preferences_frequency_check check (
    digest_frequency in ('off', 'daily')
  ),
  constraint user_notification_preferences_hour_check check (
    digest_hour_local in (7, 8, 9, 10)
  ),
  constraint user_notification_preferences_unsubscribe_check check (
    (email_unsubscribed_at is null and email_unsubscribe_source is null)
    or (email_unsubscribed_at is not null and email_unsubscribe_source is not null)
  )
);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.user_notifications'::regclass
      and conname = 'user_notifications_watch_fk'
  ) then
    alter table public.user_notifications
      add constraint user_notifications_watch_fk
      foreign key (watch_id, user_id)
      references public.agent_watches(id, user_id) on delete set null (watch_id);
  end if;
end $$;

create index if not exists user_notifications_watch_idx
  on public.user_notifications (watch_id, created_at desc)
  where watch_id is not null;

create table if not exists public.notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  channel text not null,
  delivery_key text not null unique,
  status text not null,
  attempt_count integer not null default 0,
  provider_message_id text,
  scheduled_for timestamptz not null,
  cutoff_at timestamptz not null,
  sent_at timestamptz,
  last_error_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint notification_deliveries_channel_check check (
    channel = 'email_digest'
  ),
  constraint notification_deliveries_status_check check (
    status in ('scheduled', 'sending', 'sent', 'failed', 'suppressed')
  ),
  constraint notification_deliveries_attempt_check check (attempt_count >= 0)
);

create table if not exists public.notification_delivery_items (
  delivery_id uuid not null references public.notification_deliveries(id) on delete cascade,
  notification_id uuid not null references public.user_notifications(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (delivery_id, notification_id),
  constraint notification_delivery_items_notification_unique unique (notification_id)
);

create table if not exists public.radar_processor_state (
  processor_name text primary key,
  source_cursor text,
  last_recorded_at timestamptz,
  last_started_at timestamptz,
  last_succeeded_at timestamptz,
  last_error_code text,
  lease_token uuid,
  lease_expires_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.radar_event_quarantine (
  id uuid primary key default gen_random_uuid(),
  source_event_id text,
  schema_version text,
  error_code text not null,
  payload_fingerprint text not null,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  occurrence_count integer not null default 1,
  constraint radar_event_quarantine_fingerprint_unique unique (payload_fingerprint),
  constraint radar_event_quarantine_occurrence_check check (occurrence_count >= 1)
);

create or replace function public.set_radar_updated_at()
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
    select 1 from pg_trigger
    where tgname = 'agent_watches_set_updated_at'
      and tgrelid = 'public.agent_watches'::regclass
      and not tgisinternal
  ) then
    create trigger agent_watches_set_updated_at
      before update on public.agent_watches
      for each row execute function public.set_radar_updated_at();
  end if;

  if not exists (
    select 1 from pg_trigger
    where tgname = 'notification_preferences_set_updated_at'
      and tgrelid = 'public.user_notification_preferences'::regclass
      and not tgisinternal
  ) then
    create trigger notification_preferences_set_updated_at
      before update on public.user_notification_preferences
      for each row execute function public.set_radar_updated_at();
  end if;

  if not exists (
    select 1 from pg_trigger
    where tgname = 'notification_deliveries_set_updated_at'
      and tgrelid = 'public.notification_deliveries'::regclass
      and not tgisinternal
  ) then
    create trigger notification_deliveries_set_updated_at
      before update on public.notification_deliveries
      for each row execute function public.set_radar_updated_at();
  end if;
end $$;

-- Serializes watch-count enforcement per Clerk user so concurrent creates cannot
-- exceed the server-selected entitlement limit. An existing global watch wins
-- regardless of which saved project supplied the new request.
create or replace function public.create_agent_watch(
  p_user_id text,
  p_agent_profile_id text,
  p_index_id text,
  p_origin_agent_match_id uuid,
  p_origin_surface text,
  p_event_types text[],
  p_in_app_enabled boolean,
  p_email_digest_enabled boolean,
  p_max_active_watches integer
)
returns public.agent_watches
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_watch public.agent_watches;
  v_origin_index_id text;
  v_active_count integer;
begin
  if nullif(btrim(p_user_id), '') is null then
    raise exception using errcode = '22023', message = 'RADAR_INVALID_USER';
  end if;
  if p_max_active_watches < 1 then
    raise exception using errcode = '22023', message = 'RADAR_INVALID_LIMIT';
  end if;

  perform pg_advisory_xact_lock(hashtextextended('radar-watch:' || p_user_id, 0));

  if p_origin_agent_match_id is not null then
    select index_id into v_origin_index_id
    from public.agent_matches
    where id = p_origin_agent_match_id and user_id = p_user_id;

    if not found then
      raise exception using errcode = 'P0002', message = 'RADAR_ORIGIN_NOT_FOUND';
    end if;
    if p_index_id is null or v_origin_index_id is distinct from p_index_id then
      raise exception using errcode = '22023', message = 'RADAR_ORIGIN_IDENTITY_MISMATCH';
    end if;
  end if;

  select * into v_watch
  from public.agent_watches
  where user_id = p_user_id
    and status <> 'deleted'
    and (
      (p_agent_profile_id is not null and agent_profile_id = p_agent_profile_id)
      or (p_index_id is not null and index_id = p_index_id)
    )
  order by created_at asc
  limit 1;

  if found then
    return v_watch;
  end if;

  select count(*) into v_active_count
  from public.agent_watches
  where user_id = p_user_id and status <> 'deleted';

  if v_active_count >= p_max_active_watches then
    raise exception using errcode = 'P0001', message = 'RADAR_WATCH_LIMIT_REACHED';
  end if;

  insert into public.agent_watches (
    user_id,
    agent_profile_id,
    index_id,
    origin_agent_match_id,
    origin_surface,
    event_types,
    in_app_enabled,
    email_digest_enabled
  ) values (
    p_user_id,
    nullif(btrim(p_agent_profile_id), ''),
    nullif(btrim(p_index_id), ''),
    p_origin_agent_match_id,
    p_origin_surface,
    p_event_types,
    p_in_app_enabled,
    p_email_digest_enabled
  ) returning * into v_watch;

  return v_watch;
end;
$$;

create or replace function public.claim_radar_processor_lease(
  p_processor_name text,
  p_lease_token uuid,
  p_lease_seconds integer
)
returns public.radar_processor_state
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_state public.radar_processor_state;
begin
  if p_lease_seconds < 30 or p_lease_seconds > 900 then
    raise exception using errcode = '22023', message = 'RADAR_INVALID_LEASE';
  end if;

  insert into public.radar_processor_state (processor_name)
  values (p_processor_name)
  on conflict (processor_name) do nothing;

  update public.radar_processor_state
  set lease_token = p_lease_token,
      lease_expires_at = now() + make_interval(secs => p_lease_seconds),
      last_started_at = now(),
      last_error_code = null,
      updated_at = now()
  where processor_name = p_processor_name
    and (lease_expires_at is null or lease_expires_at <= now())
  returning * into v_state;

  return v_state;
end;
$$;

create or replace function public.complete_radar_processor_run(
  p_processor_name text,
  p_lease_token uuid,
  p_source_cursor text,
  p_last_recorded_at timestamptz
)
returns boolean
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_updated integer;
begin
  update public.radar_processor_state
  set source_cursor = p_source_cursor,
      last_recorded_at = greatest(last_recorded_at, p_last_recorded_at),
      last_succeeded_at = now(),
      last_error_code = null,
      lease_token = null,
      lease_expires_at = null,
      updated_at = now()
  where processor_name = p_processor_name and lease_token = p_lease_token;
  get diagnostics v_updated = row_count;
  return v_updated = 1;
end;
$$;

create or replace function public.fail_radar_processor_run(
  p_processor_name text,
  p_lease_token uuid,
  p_error_code text
)
returns boolean
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_updated integer;
begin
  update public.radar_processor_state
  set last_error_code = left(p_error_code, 100),
      lease_token = null,
      lease_expires_at = null,
      updated_at = now()
  where processor_name = p_processor_name and lease_token = p_lease_token;
  get diagnostics v_updated = row_count;
  return v_updated = 1;
end;
$$;

create or replace function public.quarantine_radar_event(
  p_source_event_id text,
  p_schema_version text,
  p_error_code text,
  p_payload_fingerprint text
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  insert into public.radar_event_quarantine (
    source_event_id,
    schema_version,
    error_code,
    payload_fingerprint
  ) values (
    p_source_event_id,
    p_schema_version,
    left(p_error_code, 100),
    p_payload_fingerprint
  )
  on conflict (payload_fingerprint) do update
    set last_seen_at = now(),
        occurrence_count = public.radar_event_quarantine.occurrence_count + 1,
        error_code = excluded.error_code;
end;
$$;

revoke all on table public.agent_watches from anon, authenticated;
revoke all on table public.user_notification_preferences from anon, authenticated;
revoke all on table public.notification_deliveries from anon, authenticated;
revoke all on table public.notification_delivery_items from anon, authenticated;
revoke all on table public.radar_processor_state from anon, authenticated;
revoke all on table public.radar_event_quarantine from anon, authenticated;
revoke execute on function public.create_agent_watch(
  text, text, text, uuid, text, text[], boolean, boolean, integer
) from public, anon, authenticated;
grant execute on function public.create_agent_watch(
  text, text, text, uuid, text, text[], boolean, boolean, integer
) to service_role;
revoke execute on function public.claim_radar_processor_lease(text, uuid, integer)
  from public, anon, authenticated;
revoke execute on function public.complete_radar_processor_run(text, uuid, text, timestamptz)
  from public, anon, authenticated;
revoke execute on function public.fail_radar_processor_run(text, uuid, text)
  from public, anon, authenticated;
revoke execute on function public.quarantine_radar_event(text, text, text, text)
  from public, anon, authenticated;
grant execute on function public.claim_radar_processor_lease(text, uuid, integer)
  to service_role;
grant execute on function public.complete_radar_processor_run(text, uuid, text, timestamptz)
  to service_role;
grant execute on function public.fail_radar_processor_run(text, uuid, text)
  to service_role;
grant execute on function public.quarantine_radar_event(text, text, text, text)
  to service_role;

notify pgrst, 'reload schema';
