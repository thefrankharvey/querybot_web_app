do $$
declare
  constraint_record record;
  index_record record;
begin
  for constraint_record in
    select con.conname
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_namespace nsp on nsp.oid = rel.relnamespace
    where nsp.nspname = 'public'
      and rel.relname = 'agent_matches'
      and con.contype = 'u'
      and (
        select array_agg(att.attname order by keys.ordinality)
        from unnest(con.conkey) with ordinality as keys(attnum, ordinality)
        join pg_attribute att
          on att.attrelid = con.conrelid
         and att.attnum = keys.attnum
      ) = array['user_id', 'index_id']
  loop
    execute format(
      'alter table public.agent_matches drop constraint %I',
      constraint_record.conname
    );
  end loop;

  for index_record in
    select idx.relname
    from pg_index ind
    join pg_class idx on idx.oid = ind.indexrelid
    where ind.indrelid = 'public.agent_matches'::regclass
      and ind.indisunique
      and not exists (
        select 1
        from pg_constraint con
        where con.conindid = ind.indexrelid
      )
      and (
        select array_agg(att.attname order by keys.ordinality)
        from unnest(ind.indkey) with ordinality as keys(attnum, ordinality)
        join pg_attribute att
          on att.attrelid = ind.indrelid
         and att.attnum = keys.attnum
      ) = array['user_id', 'index_id']
  loop
    execute format('drop index if exists public.%I', index_record.relname);
  end loop;
end $$;

create unique index if not exists agent_matches_user_agent_project_scope_idx
on public.agent_matches (
  user_id,
  index_id,
  (
    case
      when nullif(btrim(writer_project_id::text), '') is not null
        then 'writer:' || btrim(writer_project_id::text)
      else 'name:' || lower(coalesce(nullif(btrim(project_name), ''), 'Untitled Project'))
    end
  )
)
where index_id is not null;
