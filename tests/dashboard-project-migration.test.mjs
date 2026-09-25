import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { PGlite } from '@electric-sql/pglite';

// Execute the migration and real PostgreSQL triggers, including old records.
test('project identity migration preserves records, separates scopes and accounts, and supports future saves', async () => {
  const db = new PGlite();
  try {
    await db.exec(`
      create role anon; create role authenticated; create role service_role;
      create table agent_matches (
        id text primary key, user_id text not null, index_id text,
        project_name text, writer_project_id text,
        notes text, column_name text, created_at timestamptz, updated_date text
      );
      insert into agent_matches values
        ('old-1', 'u1', 'agent1', 'Cool Finance', null, 'Keep my notes', 'submitted-query', '2026-09-24', '2026-09-25'),
        ('old-2', 'u1', 'agent2', 'Cool Finance', null, 'Keep these too', 'pages-requested', '2026-09-24', null),
        ('other-title', 'u1', 'agent1', 'NEW STUFF', null, 'Another project', 'rejected', '2026-07-28', null),
        ('other-user', 'u2', 'agent1', 'Cool Finance', null, 'Private', 'offer-made', '2026-09-24', null),
        ('search-a', 'u1', 'agent1', 'Cool Finance', 'writer-a', 'Canonical A', 'rejected', '2026-09-24', null),
        ('search-b', 'u1', 'agent1', 'Cool Finance', 'writer-b', 'Canonical B', 'rejected', '2026-09-24', null),
        ('untitled', 'u1', 'agent1', null, null, 'Blank title', 'rejected', '2026-09-24', null);
    `);
    const before = (await db.query('select * from agent_matches order by id')).rows;
    await db.exec(readFileSync(new URL('../supabase/migrations/20260925000000_dashboard_project_ids.sql', import.meta.url), 'utf8'));
    const after = (await db.query('select * from agent_matches order by id')).rows;
    assert.deepEqual(after.map(({ dashboard_project_id, ...row }) => row), before);
    const ids = Object.fromEntries(after.map(row => [row.id, row.dashboard_project_id]));
    assert.equal(ids['old-1'], ids['old-2']);
    assert.equal(new Set(Object.values(ids)).size, 6);
    assert.ok(Object.values(ids).every(id => /^[0-9a-f-]{36}$/.test(id)));
    assert.equal((await db.query('select count(*)::int n from dashboard_projects')).rows[0].n, 6);

    // Concurrent callers share the database's unique scope constraint.
    await Promise.all(['new-1', 'new-2'].map(id => db.query(
      "insert into agent_matches (id,user_id,project_name) values ($1,'u1','Cool Finance')", [id])));
    const saved = (await db.query("select dashboard_project_id from agent_matches where id like 'new-%'")).rows;
    assert.ok(saved.every(row => row.dashboard_project_id === ids['old-1']));

    await db.exec("update agent_matches set project_name = 'Finance renamed' where user_id='u1' and project_name='Cool Finance' and writer_project_id is null");
    assert.equal((await db.query("select dashboard_project_id from agent_matches where id='old-1'")).rows[0].dashboard_project_id, ids['old-1']);
    assert.equal((await db.query('select project_name from dashboard_projects where id=$1', [ids['old-1']])).rows[0].project_name, 'Finance renamed');

    // Supplying someone else's ID cannot associate a record with their project.
    await db.query("insert into agent_matches(id,user_id,project_name,dashboard_project_id) values ('forged','u1','Finance renamed',$1)", [ids['other-user']]);
    assert.equal((await db.query("select dashboard_project_id from agent_matches where id='forged'")).rows[0].dashboard_project_id, ids['old-1']);

    // Deleting and saving again retains the project URL.
    await db.query('delete from agent_matches where dashboard_project_id=$1', [ids['other-title']]);
    await db.exec("insert into agent_matches(id,user_id,project_name) values ('again','u1','NEW STUFF')");
    assert.equal((await db.query("select dashboard_project_id from agent_matches where id='again'")).rows[0].dashboard_project_id, ids['other-title']);
    assert.equal((await db.query("select notes from agent_matches where id='search-a'")).rows[0].notes, 'Canonical A');
    await db.exec('set role authenticated');
    await assert.rejects(db.query('select * from dashboard_projects'), /permission denied/);
  } finally {
    await db.close();
  }
});

test('migration rolls back if an existing trigger changes saved-record data', async () => {
  const db = new PGlite();
  try {
    await db.exec(`
      create role anon; create role authenticated; create role service_role;
      create table agent_matches(id text primary key, user_id text, project_name text, writer_project_id text, notes text);
      insert into agent_matches values ('row1','user1','Cool Finance',null,'Original notes');
      create function change_notes() returns trigger language plpgsql as $$
        begin new.notes := 'Changed by another trigger'; return new; end;
      $$;
      create trigger existing_update before update on agent_matches for each row execute function change_notes();
    `);
    await assert.rejects(db.exec(readFileSync(new URL('../supabase/migrations/20260925000000_dashboard_project_ids.sql', import.meta.url), 'utf8')), /changed existing saved-record data/);
    await db.exec('rollback');
    assert.equal((await db.query('select notes from agent_matches')).rows[0].notes, 'Original notes');
    assert.equal((await db.query("select to_regclass('public.dashboard_projects') relation")).rows[0].relation, null);
  } finally {
    await db.close();
  }
});
