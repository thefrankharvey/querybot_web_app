import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import test from "node:test";
import { PGlite } from "@electric-sql/pglite";
const require = createRequire(import.meta.url);
const ts = require("typescript");
const read = (path) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
function load(path, mocks = {}) {
  const compiledModule = { exports: {} };
  vm.runInNewContext(
    ts.transpileModule(read(path), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        esModuleInterop: true,
      },
    }).outputText,
    {
      module: compiledModule,
      exports: compiledModule.exports,
      Request,
      Response,
      require: (name) =>
        Object.hasOwn(mocks, name) ? mocks[name] : require(name),
    },
  );
  return compiledModule.exports;
}
const routes = load("app/utils/project-dashboard-route.ts");
const summaries = load("app/utils/project-dashboard-summary.ts", {
  "@/app/(app)/query-dashboard/components/kanban-config": load(
    "app/(app)/query-dashboard/components/kanban-config.ts",
  ),
  "@/app/utils/project-dashboard-route": routes,
  "@/app/utils/project-scope": load("app/utils/project-scope.ts", {
    "@/app/constants": { DEFAULT_PROJECT_NAME: "Untitled Project" },
  }),
});
async function setup() {
  const db = new PGlite();
  await db.exec(`create role anon; create role authenticated; create role service_role;
    create table agent_matches(id text primary key, user_id text not null, index_id text,
      project_name text, writer_project_id uuid, notes text, column_name text);
    insert into agent_matches values
      ('a1','u1','agent1','Finance',null,'Preserve my notes','pages-requested'),
      ('a2','u1','agent2','Finance',null,'More notes','submitted-query'),
      ('b1','u2','agent1','Finance',null,'Private','offer-made'),
      ('c1','u1','agent3','Other','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Other notes','rejected');`);
  await db.exec(
    read("supabase/migrations/20260925000000_dashboard_project_ids.sql"),
  );
  const before = (await db.query("select * from agent_matches order by id"))
    .rows;
  await db.exec(
    read("supabase/migrations/20260925010000_dashboard_project_lifecycle.sql"),
  );
  assert.deepEqual(
    (await db.query("select * from agent_matches order by id")).rows,
    before,
  );
  const project = (
    await db.query(
      "select * from dashboard_projects where user_id='u1' and project_name='Finance'",
    )
  ).rows[0];
  let userId = "u1";
  const api = load("app/api/dashboard-projects/[projectId]/route.ts", {
    "@clerk/nextjs/server": { auth: async () => ({ userId }) },
    "next/server": {
      NextResponse: { json: (body, init) => Response.json(body, init) },
    },
    "@/app/utils/project-dashboard-route": routes,
    "@/app/api/supabase/server": {
      createServerSupabase: () => ({
        rpc: async (name, args) => {
          try {
            if (name === "rename_dashboard_project") {
              const result = await db.query(
                "select * from rename_dashboard_project($1,$2,$3)",
                [args.p_user_id, args.p_project_id, args.p_name],
              );
              return { data: result.rows[0] };
            }
            assert.equal(name, "delete_dashboard_project");
            const result = await db.query(
              "select delete_dashboard_project($1,$2) deleted",
              [args.p_user_id, args.p_project_id],
            );
            return { data: result.rows[0].deleted };
          } catch (error) {
            return { error };
          }
        },
      }),
    },
  });
  return {
    db,
    project,
    api,
    signIn: (id) => {
      userId = id;
    },
  };
}
const req = (method, body) =>
  new Request("https://example.test/api/dashboard-projects/test", {
    method,
    ...(body
      ? {
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        }
      : {}),
  });
const ctx = (id) => ({ params: Promise.resolve({ projectId: id }) });

test("removing every row keeps the project in summaries and future saves reuse its ID", async () => {
  const { db, project } = await setup();
  try {
    await db.query("delete from agent_matches where dashboard_project_id=$1", [
      project.id,
    ]);
    const projects = (
      await db.query("select * from dashboard_projects where user_id='u1'")
    ).rows;
    const rows = (
      await db.query("select * from agent_matches where user_id='u1'")
    ).rows;
    const summary = summaries
      .buildProjectDashboardSummaries(rows, projects)
      .find((item) => item.dashboardProjectId === project.id);
    assert.equal(summary.savedAgentCount, 0);
    assert.equal(summary.projectName, "Finance");
    assert.equal(summary.href, `/projects/${project.id}/dashboard`);
    await db.exec(
      "insert into agent_matches(id,user_id,index_id,project_name) values('new','u1','agent-new','Finance')",
    );
    assert.equal(
      (
        await db.query(
          "select dashboard_project_id from agent_matches where id='new'",
        )
      ).rows[0].dashboard_project_id,
      project.id,
    );
  } finally {
    await db.close();
  }
});

test("rename works with and without agents, keeps URL, and stale saves use the current title", async () => {
  const { db, project, api } = await setup();
  try {
    const response = await api.PATCH(
      req("PATCH", { projectName: "  Cool Finance  " }),
      ctx(project.id),
    );
    assert.equal(response.status, 200);
    assert.equal((await response.json()).project.project_name, "Cool Finance");
    const rows = (
      await db.query(
        "select * from agent_matches where dashboard_project_id=$1 order by id",
        [project.id],
      )
    ).rows;
    assert.deepEqual(
      rows.map((row) => row.project_name),
      ["Cool Finance", "Cool Finance"],
    );
    assert.equal(rows[0].notes, "Preserve my notes");
    assert.equal(rows[0].column_name, "pages-requested");
    await db.query(
      "insert into agent_matches(id,user_id,index_id,project_name,dashboard_project_id) values('stale','u1','agent-new','Finance',$1)",
      [project.id],
    );
    assert.equal(
      (
        await db.query(
          "select project_name from agent_matches where id='stale'",
        )
      ).rows[0].project_name,
      "Cool Finance",
    );
    await db.query("delete from agent_matches where dashboard_project_id=$1", [
      project.id,
    ]);
    assert.equal(
      (
        await api.PATCH(
          req("PATCH", { projectName: "Empty renamed" }),
          ctx(project.id),
        )
      ).status,
      200,
    );
    assert.equal(
      (
        await db.query(
          "select project_name from dashboard_projects where id=$1",
          [project.id],
        )
      ).rows[0].project_name,
      "Empty renamed",
    );
  } finally {
    await db.close();
  }
});

test("explicit deletion removes the project and its agents, with account and ID isolation", async () => {
  const { db, project, api, signIn } = await setup();
  try {
    signIn(null);
    assert.equal(
      (await api.DELETE(req("DELETE"), ctx(project.id))).status,
      401,
    );
    assert.equal(
      (
        await api.PATCH(
          req("PATCH", { projectName: "Unauthorized" }),
          ctx(project.id),
        )
      ).status,
      401,
    );
    signIn("u2");
    assert.equal(
      (await api.DELETE(req("DELETE"), ctx(project.id))).status,
      404,
    );
    assert.equal(
      (
        await api.PATCH(
          req("PATCH", { projectName: "Unauthorized" }),
          ctx(project.id),
        )
      ).status,
      404,
    );
    await assert.rejects(
      db.query(
        "insert into agent_matches(id,user_id,project_name,dashboard_project_id) values('forged','u2','Finance',$1)",
        [project.id],
      ),
      /Project not found/,
    );
    signIn("u1");
    assert.equal(
      (await api.DELETE(req("DELETE"), ctx(project.id))).status,
      200,
    );
    assert.equal(
      (
        await db.query("select * from dashboard_projects where id=$1", [
          project.id,
        ])
      ).rows.length,
      0,
    );
    assert.deepEqual(
      (await db.query("select id from agent_matches order by id")).rows.map(
        (r) => r.id,
      ),
      ["b1", "c1"],
    );
    await assert.rejects(
      db.query(
        "insert into agent_matches(id,user_id,project_name,dashboard_project_id) values('stale','u1','Finance',$1)",
        [project.id],
      ),
      /Project not found/,
    );
  } finally {
    await db.close();
  }
});

test("invalid and conflicting renames are rejected; partial rename failures roll back", async () => {
  const { db, project, api } = await setup();
  try {
    for (const projectName of ["", "  ", "x".repeat(121)])
      assert.equal(
        (await api.PATCH(req("PATCH", { projectName }), ctx(project.id)))
          .status,
        400,
      );
    assert.equal(
      (await api.PATCH(req("PATCH", { projectName: "Other" }), ctx(project.id)))
        .status,
      409,
    );
    assert.equal(
      (await api.DELETE(req("DELETE"), ctx("not-a-uuid"))).status,
      404,
    );
    await db.exec(`create function fail_rename() returns trigger language plpgsql as $$ begin raise exception 'Simulated failure'; end; $$;
      create trigger fail_rename before update on agent_matches for each row execute function fail_rename();`);
    assert.equal(
      (
        await api.PATCH(
          req("PATCH", { projectName: "Attempt" }),
          ctx(project.id),
        )
      ).status,
      500,
    );
    assert.equal(
      (
        await db.query(
          "select project_name from dashboard_projects where id=$1",
          [project.id],
        )
      ).rows[0].project_name,
      "Finance",
    );
    await db.exec("set role authenticated");
    await assert.rejects(
      db.query("select delete_dashboard_project($1,$2)", ["u1", project.id]),
      /permission denied/,
    );
  } finally {
    await db.close();
  }
});

test("project deletion rolls back both row and project deletion when a saved row fails", async () => {
  const { db, project, api } = await setup();
  try {
    await db.exec(`create function fail_delete() returns trigger language plpgsql as $$
      begin if old.id = 'a2' then raise exception 'Simulated failure'; end if; return old; end; $$;
      create trigger fail_delete before delete on agent_matches for each row execute function fail_delete();`);
    assert.equal(
      (await api.DELETE(req("DELETE"), ctx(project.id))).status,
      500,
    );
    assert.equal(
      (
        await db.query("select * from dashboard_projects where id=$1", [
          project.id,
        ])
      ).rows.length,
      1,
    );
    assert.equal(
      (
        await db.query(
          "select * from agent_matches where dashboard_project_id=$1",
          [project.id],
        )
      ).rows.length,
      2,
    );
  } finally {
    await db.close();
  }
});
