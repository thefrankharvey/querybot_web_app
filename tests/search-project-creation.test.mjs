import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import test from "node:test";
import { PGlite } from "@electric-sql/pglite";
const require = createRequire(import.meta.url);
const ts = require("typescript");
const read = (file) =>
  readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
function load(file, mocks = {}, globals = {}) {
  const module = { exports: {} };
  vm.runInNewContext(
    ts.transpileModule(read(file), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        esModuleInterop: true,
      },
    }).outputText,
    {
      module,
      exports: module.exports,
      Request,
      Response,
      URL,
      AbortController,
      setTimeout,
      clearTimeout,
      console,
      ...globals,
      require: (name) =>
        Object.hasOwn(mocks, name) ? mocks[name] : require(name),
    },
  );
  return module.exports;
}
class SmartMatchProjectError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}
const writerId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const secondId = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const manualId = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
async function setup() {
  const db = new PGlite();
  await db.exec(`create role anon; create role authenticated; create role service_role;
    create table agent_matches(id text primary key, user_id text not null, index_id text,
      project_name text, writer_project_id uuid, notes text, column_name text);`);
  await db.exec(
    read("supabase/migrations/20260925000000_dashboard_project_ids.sql"),
  );
  await db.exec(
    read("supabase/migrations/20260925010000_dashboard_project_lifecycle.sql"),
  );
  let failInsert = false;
  const store = {
    from(table) {
      assert.equal(table, "dashboard_projects");
      const filters = [];
      let limit = 100;
      let update;
      const query = {
        select() {
          return this;
        },
        eq(key, value) {
          assert.ok(["id", "user_id", "writer_project_id"].includes(key));
          filters.push([key, value, "="]);
          return this;
        },
        neq(key, value) {
          filters.push([key, value, "<>"]);
          return this;
        },
        is(key, value) {
          assert.equal(value, null);
          filters.push([key, value, "is"]);
          return this;
        },
        update(value) {
          update = value;
          return this;
        },
        limit(value) {
          limit = value;
          return this;
        },
        async run() {
          const params = [];
          const where = filters
            .map(([key, value, op]) => {
              if (op === "is") return `${key} is null`;
              params.push(value);
              return `${key}${op}$${params.length}`;
            })
            .join(" and ");
          try {
            let sql = `select id,project_name,writer_project_id from dashboard_projects where ${where} limit ${limit}`;
            if (update) {
              params.push(update.writer_project_id);
              sql = `update dashboard_projects set writer_project_id=$${params.length} where ${where} returning id,project_name,writer_project_id`;
            }
            return { data: (await db.query(sql, params)).rows, error: null };
          } catch (error) {
            return { data: null, error };
          }
        },
        then(resolve, reject) {
          return this.run().then(resolve, reject);
        },
        async maybeSingle() {
          const result = await this.run();
          return { ...result, data: result.data?.[0] ?? null };
        },
        async upsert(row, options) {
          assert.deepEqual(JSON.parse(JSON.stringify(options)), {
            onConflict: "user_id,scope_key",
            ignoreDuplicates: true,
          });
          if (failInsert) return { error: new Error("Simulated failure") };
          try {
            await db.query(
              `insert into dashboard_projects(id,user_id,scope_key,project_name,writer_project_id)
            values($1,$2,$3,$4,$5) on conflict(user_id,scope_key) do nothing`,
              [
                row.id,
                row.user_id,
                row.scope_key,
                row.project_name,
                row.writer_project_id,
              ],
            );
            return { error: null };
          } catch (error) {
            return { error };
          }
        },
      };
      return query;
    },
  };
  const profileLink = load("app/utils/smart-match-profile-link.server.ts", {
    "server-only": {},
    "@/app/api/supabase/server": { createServerSupabase: () => store },
    "./project-dashboard-route": load("app/utils/project-dashboard-route.ts"),
    "./smart-match-projects.server": { SmartMatchProjectError },
  });
  const ensure = load("app/utils/smart-match-dashboard.server.ts", {
    "server-only": {},
    "@/app/api/supabase/server": { createServerSupabase: () => store },
    "./project-dashboard-route": load("app/utils/project-dashboard-route.ts"),
    "./smart-match-projects.server": { SmartMatchProjectError },
    "./smart-match-profile-link.server": profileLink,
  }).ensureSmartMatchDashboardProject;
  const input = {
    userId: "owner",
    writerProjectId: writerId,
    projectName: "  My new book  ",
  };
  const route = (
    tier,
    {
      searchStatus = 200,
      selectedId,
      matches = [{ id: "matched-agent" }],
      createError = false,
    } = {},
  ) =>
    load(
      `app/api/get-agents-${tier}/route.ts`,
      {
        "next/server": {
          NextResponse: { json: (body, init) => Response.json(body, init) },
        },
        "@clerk/nextjs/server": {
          auth: async () => ({ userId: "owner" }),
          currentUser: async () => ({
            id: "owner",
            primaryEmailAddress: { emailAddress: "owner@example.test" },
          }),
        },
        "@/lib/wqh-history-auth": {
          getWriterEmail: (user) => user.primaryEmailAddress.emailAddress,
          getWqhHistoryHeaders: () => ({ Authorization: "Bearer test-secret" }),
        },
        "@/lib/config": {
          getWqhApiEndpoint: (path) => `https://matcher.example.test/${path}`,
        },
        "@/app/utils/smart-match-projects.server": {
          SmartMatchProjectError,
          resolveSmartMatchWriterProjectId: async () =>
            selectedId ? writerId : null,
        },
        "@/app/utils/smart-match-profile-link.server": {
          getLegacySearchProject: async () => null,
          linkLegacySearchProfile: async () =>
            assert.fail("not a legacy search"),
        },
        "@/app/utils/smart-match-dashboard.server": {
          ensureSmartMatchDashboardProject: async (input) => {
            failInsert = createError;
            return ensure(input);
          },
        },
      },
      {
        fetch: async (_url, options) => {
          const body = JSON.parse(options.body);
          assert.equal(body.email, "owner@example.test");
          assert.equal(body.genre, "fantasy");
          return Response.json(
            { matches, writer_project_id: writerId },
            { status: searchStatus },
          );
        },
      },
    );
  return {
    db,
    ensure,
    input,
    route,
    setFailInsert: (value) => {
      failInsert = value;
    },
  };
}
const request = (selectedId) =>
  new Request("https://ui.example.test/api/search?last_index=0", {
    method: "POST",
    body: JSON.stringify({
      project_name: "My new book",
      genre: "fantasy",
      email: "forged@example.test",
      ...(selectedId
        ? {
            writer_project_id: writerId,
            save_project: {
              dashboardProjectId: selectedId,
              writerProjectId: writerId,
            },
          }
        : {}),
    }),
  });

test("retry and simultaneous successes create one project with no saved agents and stable identity", async () => {
  const { db, ensure, input } = await setup();
  try {
    const results = await Promise.all(
      Array.from({ length: 4 }, () => ensure(input)),
    );
    assert.equal(new Set(results.map((project) => project.id)).size, 1);
    assert.equal(results[0].id, writerId);
    assert.equal(results[0].project_name, "My new book");
    assert.equal(
      (await db.query("select count(*)::int count from dashboard_projects"))
        .rows[0].count,
      1,
    );
    assert.equal(
      (await db.query("select count(*)::int count from agent_matches")).rows[0]
        .count,
      0,
    );
    await db.query(
      "insert into agent_matches(id,user_id,index_id,project_name,writer_project_id,dashboard_project_id) values('saved-agent','owner','agent-one','My new book',$1,$2)",
      [writerId, results[0].id],
    );
    assert.equal(
      (await db.query("select dashboard_project_id from agent_matches")).rows[0]
        .dashboard_project_id,
      results[0].id,
    );
    assert.equal(
      (await db.query("select count(*)::int count from dashboard_projects"))
        .rows[0].count,
      1,
    );
  } finally {
    await db.close();
  }
});

test("existing manual and saved-agent dashboards keep their identity and current title", async () => {
  const { db, ensure, input } = await setup();
  try {
    await db.query(
      "insert into dashboard_projects(id,user_id,scope_key,project_name,writer_project_id) values($1,'owner','manual:test','Renamed book',$2)",
      [manualId, writerId],
    );
    for (const dashboardProjectId of [undefined, manualId]) {
      const project = await ensure({ ...input, dashboardProjectId });
      assert.equal(project.id, manualId);
      assert.equal(project.project_name, "Renamed book");
    }
    const other = await ensure({ ...input, writerProjectId: secondId });
    assert.notEqual(other.id, manualId);
    assert.equal(
      (await db.query("select count(*)::int count from dashboard_projects"))
        .rows[0].count,
      2,
    );
  } finally {
    await db.close();
  }
});

test("deleted, foreign, and mismatched selections never create a replacement project", async () => {
  const { db, ensure, input } = await setup();
  try {
    await db.query(
      "insert into dashboard_projects(id,user_id,scope_key,project_name,writer_project_id) values($1,'someone-else','writer:foreign','Private title',$2)",
      [manualId, secondId],
    );
    await assert.rejects(
      ensure({ ...input, dashboardProjectId: manualId }),
      (error) => error.status === 404,
    );
    await assert.rejects(
      ensure({ ...input, dashboardProjectId: secondId }),
      (error) => error.status === 404,
    );
    const own = await ensure(input);
    await assert.rejects(
      ensure({
        ...input,
        dashboardProjectId: own.id,
        writerProjectId: secondId,
      }),
      (error) => error.status === 409,
    );
    await db.query("select delete_dashboard_project('owner',$1)", [own.id]);
    await assert.rejects(
      ensure({ ...input, dashboardProjectId: own.id }),
      (error) => error.status === 404,
    );
    assert.equal(
      (
        await db.query(
          "select count(*)::int count from dashboard_projects where user_id='owner'",
        )
      ).rows[0].count,
      0,
    );
  } finally {
    await db.close();
  }
});

for (const tier of ["free", "paid"]) {
  test(`${tier}: a first search with matches creates a project without saving any agents`, async () => {
    const { db, route } = await setup();
    try {
      const response = await route(tier).POST(request());
      assert.equal(response.status, 200);
      const body = await response.json();
      assert.deepEqual(body.dashboard_project, {
        id: writerId,
        project_name: "My new book",
        writer_project_id: writerId,
      });
      assert.deepEqual(body.matches, [{ id: "matched-agent" }]);
      assert.equal(
        (await db.query("select count(*)::int count from agent_matches"))
          .rows[0].count,
        0,
      );
      const retried = await route(tier).POST(request());
      assert.equal((await retried.json()).dashboard_project.id, writerId);
      assert.equal(
        (await db.query("select count(*)::int count from dashboard_projects"))
          .rows[0].count,
        1,
      );
    } finally {
      await db.close();
    }
  });
  test(`${tier}: selected manual projects are reused and creation failures can be retried`, async () => {
    const { db, route } = await setup();
    try {
      assert.equal(
        (await route(tier, { createError: true }).POST(request())).status,
        503,
      );
      assert.equal(
        (await db.query("select count(*)::int count from dashboard_projects"))
          .rows[0].count,
        0,
      );
      assert.equal((await route(tier).POST(request())).status, 200);
      await db.query(
        "update dashboard_projects set project_name='Keep my renamed title' where id=$1",
        [writerId],
      );
      const selected = await route(tier, { selectedId: writerId }).POST(
        request(writerId),
      );
      assert.equal(selected.status, 200);
      assert.equal(
        (await selected.json()).dashboard_project.project_name,
        "Keep my renamed title",
      );
      assert.equal(
        (await db.query("select count(*)::int count from dashboard_projects"))
          .rows[0].count,
        1,
      );
    } finally {
      await db.close();
    }
  });
  test(`${tier}: zero-match searches create no project and preserve existing projects`, async () => {
    const { db, ensure, input, route } = await setup();
    try {
      const empty = await route(tier, { matches: [] }).POST(request());
      assert.equal(empty.status, 200);
      const body = await empty.json();
      assert.deepEqual(body.matches, []);
      assert.equal(body.dashboard_project, undefined);
      assert.equal(
        (await db.query("select count(*)::int count from dashboard_projects"))
          .rows[0].count,
        0,
      );
      const existing = await ensure(input);
      const selected = await route(tier, {
        selectedId: existing.id,
        matches: [],
      }).POST(request(existing.id));
      assert.equal(selected.status, 200);
      assert.equal((await selected.json()).dashboard_project, undefined);
      assert.deepEqual(
        (
          await db.query(
            "select id,project_name,writer_project_id from dashboard_projects",
          )
        ).rows,
        [existing],
      );
      assert.equal(
        (await db.query("select count(*)::int count from agent_matches"))
          .rows[0].count,
        0,
      );
    } finally {
      await db.close();
    }
  });
  test(`${tier}: failed searches never create dashboard projects`, async () => {
    const { db, route } = await setup();
    try {
      assert.equal(
        (await route(tier, { searchStatus: 503 }).POST(request())).status,
        503,
      );
      assert.equal(
        (await db.query("select count(*)::int count from dashboard_projects"))
          .rows[0].count,
        0,
      );
    } finally {
      await db.close();
    }
  });
}

for (const selected of [true, false]) {
  test(`a search recovers an interrupted manual profile link (selected: ${selected})`, async () => {
    const { db, ensure, input } = await setup();
    try {
      await db.query(
        "insert into dashboard_projects(id,user_id,scope_key,project_name) values($1,'owner','manual:pending','Pending manual book')",
        [writerId],
      );
      const project = await ensure({
        ...input,
        ...(selected ? { dashboardProjectId: writerId } : {}),
      });
      assert.equal(project.id, writerId);
      assert.equal(project.writer_project_id, writerId);
      assert.equal(project.project_name, "Pending manual book");
      assert.equal(
        (await db.query("select count(*)::int count from dashboard_projects"))
          .rows[0].count,
        1,
      );
    } finally {
      await db.close();
    }
  });
}
