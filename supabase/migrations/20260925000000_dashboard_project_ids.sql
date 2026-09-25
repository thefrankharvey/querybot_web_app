begin;

-- Dashboard projects exist independently of Smart Match search history. Some
-- saved projects predate that history and have no writer_project_id to reuse.
create table public.dashboard_projects (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  scope_key text not null,
  project_name text not null,
  writer_project_id text,
  unique (user_id, scope_key),
  unique (id, user_id)
);

alter table public.dashboard_projects enable row level security;
revoke all on public.dashboard_projects from anon, authenticated;
grant select, insert, update, delete on public.dashboard_projects to service_role;

alter table public.agent_matches add column dashboard_project_id uuid;

create function public.assign_dashboard_project()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  project_title text := coalesce(nullif(btrim(new.project_name), ''), 'Untitled Project');
  writer_id text := nullif(btrim(new.writer_project_id), '');
  project_scope text;
begin
  project_scope := case when writer_id is not null
    then 'writer:' || writer_id else 'name:' || lower(project_title) end;

  -- Keep a project's URL stable when its title changes. A conflicting existing
  -- scope fails the transaction rather than combining two projects' records.
  if tg_op = 'UPDATE' then
    if old.dashboard_project_id is not null
       and old.user_id = new.user_id
       and nullif(btrim(old.writer_project_id), '') is not distinct from writer_id
       and old.project_name is distinct from new.project_name then
      update public.dashboard_projects
        set scope_key = project_scope, project_name = project_title
        where id = old.dashboard_project_id and user_id = new.user_id;
    end if;
  end if;

  -- The unique constraint makes simultaneous saves use the same project ID.
  insert into public.dashboard_projects (user_id, scope_key, project_name, writer_project_id)
    values (new.user_id, project_scope, project_title, writer_id)
    on conflict (user_id, scope_key) do update
      set project_name = excluded.project_name
    returning id into new.dashboard_project_id;
  return new;
end;
$$;
revoke all on function public.assign_dashboard_project() from public;

create trigger agent_matches_assign_dashboard_project
before insert or update of user_id, project_name, writer_project_id, dashboard_project_id
on public.agent_matches
for each row execute function public.assign_dashboard_project();

-- Only add the relation. Row IDs, names, notes, statuses, dates, and existing
-- Smart Match IDs are preserved, including distinct projects sharing a title.
create temp table dashboard_migration_before on commit drop as
  select id, to_jsonb(agent_matches) - 'dashboard_project_id' as record
  from public.agent_matches;
update public.agent_matches set dashboard_project_id = dashboard_project_id;

do $$
begin
  if exists (
    select 1 from public.agent_matches a
    full join dashboard_migration_before b on a.id = b.id
    where b.record is distinct from (to_jsonb(a) - 'dashboard_project_id')
  ) then
    raise exception 'Project migration changed existing saved-record data';
  end if;
end;
$$;

alter table public.agent_matches alter column dashboard_project_id set not null;
alter table public.agent_matches add constraint agent_matches_dashboard_project_owner_fk
  foreign key (dashboard_project_id, user_id)
  references public.dashboard_projects (id, user_id);
create index agent_matches_dashboard_project_idx
  on public.agent_matches (user_id, dashboard_project_id);

notify pgrst, 'reload schema';
commit;
