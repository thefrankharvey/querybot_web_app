alter table public.agent_matches
  add column if not exists agency_id text,
  add column if not exists query_round smallint,
  add column if not exists query_on_hold boolean not null default false,
  add column if not exists safety_updated_at timestamptz;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.agent_matches'::regclass
      and conname = 'agent_matches_query_round_range_check'
  ) then
    alter table public.agent_matches
      add constraint agent_matches_query_round_range_check
      check (query_round is null or query_round between 1 and 9);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.agent_matches'::regclass
      and conname = 'agent_matches_query_round_hold_check'
  ) then
    alter table public.agent_matches
      add constraint agent_matches_query_round_hold_check
      check (not query_on_hold or query_round is null);
  end if;
end $$;

create index if not exists agent_matches_user_project_agency_idx
on public.agent_matches (user_id, writer_project_id, agency_id)
where agency_id is not null;

notify pgrst, 'reload schema';
