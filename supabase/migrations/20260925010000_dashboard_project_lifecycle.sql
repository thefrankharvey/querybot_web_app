begin;

-- A dashboard is created by the first saved agent and lives until explicitly
-- deleted. Existing empty dashboards are intentionally retained.
create or replace function public.assign_dashboard_project()
returns trigger language plpgsql security definer
set search_path = public, pg_temp as $$
declare
  project_title text := coalesce(nullif(btrim(new.project_name), ''), 'Untitled Project');
  writer_id text := nullif(btrim(new.writer_project_id::text), '');
  project_scope text;
  project public.dashboard_projects;
begin
  if new.dashboard_project_id is not null then
    select * into project from public.dashboard_projects
      where id = new.dashboard_project_id and user_id = new.user_id
      for share;
    if not found then
      raise exception 'Project not found' using errcode = '23503';
    end if;
  else
    project_scope := case when writer_id is not null
      then 'writer:' || writer_id else 'name:' || lower(project_title) end;
    insert into public.dashboard_projects (user_id, scope_key, project_name, writer_project_id)
      values (new.user_id, project_scope, project_title, writer_id)
      on conflict (user_id, scope_key) do update
        set scope_key = excluded.scope_key
      returning * into project;
  end if;

  -- A stale browser or search-history title must never rename a dashboard.
  new.dashboard_project_id := project.id;
  new.project_name := project.project_name;
  new.writer_project_id := project.writer_project_id;
  return new;
end;
$$;

create function public.rename_dashboard_project(p_user_id text, p_project_id uuid, p_name text)
returns public.dashboard_projects language plpgsql
set search_path = public, pg_temp as $$
declare
  project public.dashboard_projects;
  title text := btrim(p_name);
begin
  if title is null or length(title) = 0 or length(title) > 120 then
    raise exception 'Enter a project name between 1 and 120 characters' using errcode = '22023';
  end if;
  select * into project from public.dashboard_projects
    where id = p_project_id and user_id = p_user_id for update;
  if not found then return null; end if;
  if exists (select 1 from public.dashboard_projects
    where user_id = p_user_id and id <> p_project_id and lower(btrim(project_name)) = lower(title)) then
    raise exception 'A project with this name already exists' using errcode = '23505';
  end if;

  update public.dashboard_projects set project_name = title,
    scope_key = case when writer_project_id is null then 'name:' || lower(title) else scope_key end
    where id = p_project_id and user_id = p_user_id returning * into project;
  update public.agent_matches set project_name = title
    where dashboard_project_id = p_project_id and user_id = p_user_id;
  return project;
end;
$$;

create function public.delete_dashboard_project(p_user_id text, p_project_id uuid)
returns boolean language plpgsql
set search_path = public, pg_temp as $$
begin
  perform 1 from public.dashboard_projects
    where id = p_project_id and user_id = p_user_id for update;
  if not found then return false; end if;
  delete from public.agent_matches where dashboard_project_id = p_project_id and user_id = p_user_id;
  delete from public.dashboard_projects where id = p_project_id and user_id = p_user_id;
  return true;
end;
$$;

revoke all on function public.rename_dashboard_project(text, uuid, text) from public, anon, authenticated;
revoke all on function public.delete_dashboard_project(text, uuid) from public, anon, authenticated;
grant execute on function public.rename_dashboard_project(text, uuid, text) to service_role;
grant execute on function public.delete_dashboard_project(text, uuid) to service_role;
notify pgrst, 'reload schema';
commit;
