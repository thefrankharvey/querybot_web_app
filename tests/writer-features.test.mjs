import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import test from "node:test";
const require = createRequire(import.meta.url);
const ts = require("typescript");
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const plain = (value) => JSON.parse(JSON.stringify(value));
function load(path, mocks = {}, globals = {}) {
  const module = { exports: {} };
  const output = ts.transpileModule(readFileSync(resolve(root, path), "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText;
  vm.runInNewContext(output, {
    module,
    exports: module.exports,
    console,
    URL,
    URLSearchParams,
    Response,
    Request,
    Headers,
    AbortSignal,
    AbortController,
    setTimeout,
    clearTimeout,
    require: (spec) =>
      Object.hasOwn(mocks, spec) ? mocks[spec] : require(spec),
    ...globals,
  });
  return module.exports;
}
const constants = {
  DEFAULT_PROJECT_NAME: "Untitled Project",
  AGENT_MATCHES_TABLE: "agent_matches",
};
const scope = load("app/utils/project-scope.ts", {
  "@/app/constants": constants,
});
const profile = load("app/utils/project-profile.ts", {
  "@/app/constants": constants,
});
const restore = load("app/utils/smart-match-restore.ts");
function renderHome({ isSubscribed = false, agentsList = fixtureRows(), isLoading = false } = {}) {
  const React = require("react");
  const { renderToStaticMarkup } = require("react-dom/server");
  const columns = load("app/(app)/query-dashboard/components/kanban-config.ts");
  const summaries = load("app/utils/project-dashboard-summary.ts", {
    "@/app/(app)/query-dashboard/components/kanban-config": columns,
    "@/app/utils/project-profile": profile,
    "@/app/utils/project-scope": scope,
  });
  const overview = load("app/(app)/home/components/project-dashboard-overview.tsx", {
    "next/link": ({ children, ...props }) => React.createElement("a", props, children),
    "@/app/(app)/query-dashboard/components/kanban-config": columns,
    "@/app/utils/project-dashboard-summary": summaries,
    "./animated-count": ({ value }) => value,
  }).default;
  const Home = load("app/(app)/home/page.tsx", {
    // Render the settled Home state without running browser or payment effects.
    react: { ...React, useState: () => [false, () => {}], useEffect: () => {} },
    "next/dynamic": () => () => null,
    "@clerk/nextjs": { useUser: () => ({ user: null }) },
    "@/app/hooks/use-clerk-user": { useClerkUser: () => ({ isSubscribed, isLoading: false }) },
    "../context/profile-context": { useProfileContext: () => ({ agentsList, isLoading, refetch: () => {} }) },
    "@/app/ui-primitives/spinner": { Spinner: () => React.createElement("div", { role: "status" }, "Loading") },
    "./components/button-bar": () => null,
    "./components/free-user": () => React.createElement("div", null, "Free account getting started"),
    "./components/subscriber-empty": load("app/(app)/home/components/subscriber-empty.tsx").default,
    "./components/project-dashboard-overview": overview,
  }).default;
  return renderToStaticMarkup(React.createElement(Home));
}

for (const isSubscribed of [false, true]) {
  test(`Home shows saved project cards for ${isSubscribed ? "subscribed" : "free"} accounts`, () => {
    const html = renderHome({ isSubscribed });
    assert.match(html, /My Projects/);
    assert.match(html, /href="\/projects\/project-a\/dashboard"/);
    assert.match(html, /href="\/projects\/project-b\/dashboard"/);
    assert.match(html, /Saved Agents/);
  });
}

test("Home keeps free onboarding and subscribed guidance when no agents are saved", () => {
  const free = renderHome({ agentsList: [] });
  assert.match(free, /Free account getting started/);
  assert.doesNotMatch(free, /My Projects/);
  const paid = renderHome({ isSubscribed: true, agentsList: [] });
  assert.match(paid, /Try Smart Match/);
  assert.doesNotMatch(paid, /My Projects/);
});

test("Home waits for saved agents to load before showing project cards", () => {
  const html = renderHome({ isLoading: true });
  assert.match(html, /role="status"/);
  assert.doesNotMatch(html, /My Projects|Free account getting started/);
});

const traits = load("lib/traits.ts");
const next = {
  NextResponse: { json: (body, init) => Response.json(body, init) },
};
function store(rows) {
  const state = { rows: structuredClone(rows), writes: 0 };
  class Query {
    predicates = [];
    action = "read";
    one = false;
    cap = Infinity;
    select() {
      return this;
    }
    order() {
      return this;
    }
    eq(key, value) {
      this.predicates.push((row) => row[key] === value);
      return this;
    }
    is(key, value) {
      return this.eq(key, value);
    }
    not(key, _op, value) {
      this.predicates.push((row) => row[key] !== value);
      return this;
    }
    in(key, values) {
      this.predicates.push((row) => values.includes(row[key]));
      return this;
    }
    limit(value) {
      this.cap = value;
      return this;
    }
    maybeSingle() {
      this.one = true;
      return this;
    }
    update(patch) {
      this.action = "update";
      this.patch = patch;
      return this;
    }
    delete() {
      this.action = "delete";
      return this;
    }
    then(resolvePromise, reject) {
      const found = state.rows
        .filter((row) => this.predicates.every((p) => p(row)))
        .slice(0, this.cap);
      if (this.action !== "read") state.writes++;
      if (this.action === "delete")
        state.rows = state.rows.filter((row) => !found.includes(row));
      if (this.action === "update")
        found.forEach((row) => Object.assign(row, this.patch));
      return Promise.resolve({
        data: this.one ? (found[0] ?? null) : found,
        error: null,
      }).then(resolvePromise, reject);
    }
  }
  return { state, client: { from: () => new Query() } };
}
const fixtureRows = () => [
  {
    id: "row-a",
    user_id: "writer-a",
    index_id: "same-agent",
    writer_project_id: "project-a",
    project_name: "Same title",
    notes: "A",
  },
  {
    id: "row-b",
    user_id: "writer-a",
    index_id: "same-agent",
    writer_project_id: "project-b",
    project_name: "Same title",
    notes: "B",
  },
  {
    id: "row-legacy",
    user_id: "writer-a",
    index_id: "same-agent",
    writer_project_id: null,
    project_name: "Same title",
    notes: "Legacy",
  },
  {
    id: "row-other",
    user_id: "writer-b",
    index_id: "same-agent",
    writer_project_id: "project-a",
    project_name: "Same title",
    notes: "Private",
  },
];
const request = (body, method = "PATCH") =>
  new Request("http://localhost/api/test", {
    method,
    body: JSON.stringify(body),
  });
function baseMocks(db, userId = "writer-a") {
  return {
    "server-only": {},
    "next/server": next,
    "@/app/constants": constants,
    "@clerk/nextjs/server": {
      auth: async () => ({ userId }),
      currentUser: async () => ({
        id: userId,
        primaryEmailAddress: { emailAddress: "writer@example.test" },
        publicMetadata: { isSubscribed: true },
      }),
    },
    "@/app/api/supabase/server": { createServerSupabase: () => db.client },
    "@/app/utils/project-scope": scope,
    "@/app/utils/project-profile": profile,
    "@/lib/config": {
      getWqhApiUrl: () => "https://api.example.test",
      getWqhTraitsApiUrl: () => "https://traits.example.test",
    },
  };
}

test("row update and deletion leave the same agent in other projects and accounts untouched", async () => {
  const db = store(fixtureRows());
  const route = load(
    "app/api/agent-match-records/[id]/route.ts",
    baseMocks(db),
  );
  assert.equal(
    (
      await route.PATCH(request({ notes: "Edited" }), {
        params: Promise.resolve({ id: "row-a" }),
      })
    ).status,
    200,
  );
  assert.deepEqual(
    db.state.rows.map((r) => r.notes),
    ["Edited", "B", "Legacy", "Private"],
  );
  assert.equal(
    (
      await route.DELETE(new Request("http://localhost"), {
        params: Promise.resolve({ id: "row-a" }),
      })
    ).status,
    200,
  );
  assert.deepEqual(
    db.state.rows.map((r) => r.id),
    ["row-b", "row-legacy", "row-other"],
  );
});
test("record routes reject cross-account access, missing auth, and protected identity fields", async () => {
  const db = store(fixtureRows());
  const route = load(
    "app/api/agent-match-records/[id]/route.ts",
    baseMocks(db),
  );
  for (const method of ["GET", "PATCH", "DELETE"]) {
    assert.equal(
      (
        await route[method](request({ notes: "x" }), {
          params: Promise.resolve({ id: "row-other" }),
        })
      ).status,
      404,
    );
    const unauth = load(
      "app/api/agent-match-records/[id]/route.ts",
      baseMocks(db, null),
    );
    assert.equal(
      (
        await unauth[method](request({ notes: "x" }), {
          params: Promise.resolve({ id: "row-a" }),
        })
      ).status,
      401,
    );
  }
  for (const body of [
    { writer_project_id: "project-b" },
    { user_id: "writer-b" },
    { project_name: "Other" },
    { notes: 42 },
    null,
    [],
  ]) {
    assert.equal(
      (
        await route.PATCH(request(body), {
          params: Promise.resolve({ id: "row-a" }),
        })
      ).status,
      400,
    );
  }
});
test("legacy agent-ID mutation refuses an ambiguous multi-project match", async () => {
  const db = store(fixtureRows());
  const mocks = baseMocks(db);
  const records = load("app/api/agent-match-records/[id]/route.ts", mocks);
  const route = load("app/api/agent-matches/[id]/route.ts", {
    ...mocks,
    "@/app/api/agent-match-records/[id]/route": records,
  });
  const result = await route.DELETE(new Request("http://localhost"), {
    params: Promise.resolve({ id: "same-agent" }),
  });
  assert.equal(result.status, 409);
  assert.equal(db.state.writes, 0);
});
function projectData(db, projects) {
  const mocks = baseMocks(db);
  return load("app/utils/project-profile-data.ts", mocks, {
    fetch: async () =>
      Response.json({ status: "success", writer_projects: projects }),
  });
}
test("dashboard reads isolate canonical, legacy, and duplicate-name project scopes", async () => {
  const db = store(fixtureRows());
  const projects = ["a", "b"].map((id) => ({
    id: `project-${id}`,
    user_id: "writer-a",
    project_name: "Same title",
    genre: "fantasy",
  }));
  const data = projectData(db, projects);
  const canonical = await data.getProjectProfileRouteData("project-a");
  assert.equal(canonical.profile.writerProjectId, "project-a");
  assert.equal(canonical.profile.matchCount, 1);
  const legacy = await data.getProjectProfileRouteData("name:Same title");
  assert.equal(legacy.profile.writerProjectId, null);
  assert.equal(legacy.profile.matchCount, 1);
  const rows = data.getSavedAgentRowsForRoute({
    project: projects[0],
    routeProjectId: "project-a",
    rows: fixtureRows().filter((r) => r.user_id === "writer-a"),
  });
  assert.deepEqual(
    plain(rows).map((r) => r.id),
    ["row-a"],
  );
});
test("legacy route encoding round-trips literal percent signs and slash-containing names", () => {
  assert.equal(
    profile.getProjectProfileHref("100% / progress"),
    "/projects/name%3A100%25%20%2F%20progress",
  );
  assert.equal(profile.normalizeRouteProjectId("100%20"), "100%20");
});
test("restore selects most recent project and normalizes persisted traits and comps", () => {
  const projects = [
    { id: "old", updated_at: "2026-01-01" },
    {
      id: "new",
      updated_at: "2026-02-01",
      project_name: "Novel",
      genre: ["fantasy"],
      subgenres: '["epic"]',
      themes: "hope, family",
      comps: '[{"title":"Book","author":"Writer"}]',
      enable_ai: "true",
      non_fiction: "false",
    },
  ];
  const selected = restore.selectMostRecentWriterProject(projects);
  assert.equal(selected.id, "new");
  const result = plain(restore.normalizeWriterProjectForSmartMatch(selected));
  assert.deepEqual(result.subgenres, ["epic"]);
  assert.deepEqual(result.themes, ["hope", "family"]);
  assert.deepEqual(result.comps, [{ title: "Book", author: "Writer" }]);
  assert.equal(result.non_fiction, false);
});
test("restore never borrows the identity or title of a different project", async () => {
  const db = store(fixtureRows());
  const route = load(
    "app/api/smart-match/previous-search/route.ts",
    { ...baseMocks(db), "@/app/utils/smart-match-restore": restore },
    {
      fetch: async () =>
        Response.json({
          status: "success",
          writer_projects: [
            { id: "unnamed", updated_at: "2026-03-01", genre: "fantasy" },
            {
              id: "project-a",
              project_name: "Same title",
              updated_at: "2026-01-01",
            },
          ],
        }),
    },
  );
  const result = await route.GET();
  const body = await result.json();
  assert.equal(result.status, 200);
  assert.equal(body.writer_project_id, "unnamed");
  assert.equal(body.form.project_name, "");
  assert.equal(result.headers.get("cache-control"), "private, no-store");
});
for (const metadata of [{ isSubscribed: false }, {}, { isSubscribed: true }]) {
  test(`restore allows signed-in users with metadata ${JSON.stringify(metadata)}`, async () => {
    const mocks = baseMocks(store([]));
    mocks["@clerk/nextjs/server"].currentUser = async () => ({
      id: "writer-a",
      publicMetadata: metadata,
      primaryEmailAddress: { emailAddress: "writer@example.test" },
    });
    const route = load(
      "app/api/smart-match/previous-search/route.ts",
      {
        ...mocks,
        "@/app/utils/smart-match-restore": restore,
      },
      {
        fetch: async (url) => {
          assert.equal(
            new URL(url).searchParams.get("email"),
            "writer@example.test",
          );
          return Response.json({
            status: "success",
            writer_projects: [
              {
                id: "project-a",
                project_name: "Novel",
                genre: "fantasy",
                updated_at: "2026-03-01",
              },
            ],
          });
        },
      },
    );
    const result = await route.GET();
    assert.equal(result.status, 200);
    assert.equal((await result.json()).form.project_name, "Novel");
    assert.equal(result.headers.get("cache-control"), "private, no-store");
  });
}

test("restore rejects signed-out and mismatched accounts before fetching history", async () => {
  for (const [userId, user] of [
    [null, null],
    ["writer-a", null],
    ["writer-a", { id: "writer-b" }],
  ]) {
    const mocks = baseMocks(store([]));
    const route = load(
      "app/api/smart-match/previous-search/route.ts",
      {
        ...mocks,
        "@/app/utils/smart-match-restore": restore,
        "@clerk/nextjs/server": {
          auth: async () => ({ userId }),
          currentUser: async () => user,
        },
      },
      { fetch: () => assert.fail("must not request history") },
    );
    assert.equal((await route.GET()).status, 401);
  }
});

test("restore handles empty history and upstream failure", async () => {
  const mocks = {
    ...baseMocks(store([])),
    "@/app/utils/smart-match-restore": restore,
  };
  assert.equal(
    (
      await load("app/api/smart-match/previous-search/route.ts", mocks, {
        fetch: async () =>
          Response.json({ status: "success", writer_projects: [] }),
      }).GET()
    ).status,
    404,
  );
  assert.equal(
    (
      await load("app/api/smart-match/previous-search/route.ts", mocks, {
        fetch: async () => new Response("down", { status: 503 }),
      }).GET()
    ).status,
    502,
  );
});
test("trait selection preserves known values and normalizes custom values", () => {
  assert.equal(
    traits.sanitizeTraitValue("genre", "Women’s Fiction"),
    "womens-fiction",
  );
  assert.equal(
    traits.sanitizeTraitValue("format", "Graphic Novel"),
    "graphic_novel",
  );
  assert.equal(
    traits.findExistingTraitValue("genre", "Literary Fiction", [
      "literary-fiction",
    ]),
    "literary-fiction",
  );
  assert.equal(traits.isTraitType("user_id"), false);
});
test("traits route requires auth for creation and forwards a sanitized, allowlisted payload", async () => {
  const db = store([]);
  const mocks = { ...baseMocks(db), "@/lib/traits": traits };
  const calls = [];
  const route = load("app/api/traits/route.ts", mocks, {
    fetch: async (url, init) => {
      calls.push([url, JSON.parse(init.body)]);
      return Response.json(
        {
          status: "success",
          trait: { trait_type: "format", trait_value: "graphic_novel" },
        },
        { status: 201 },
      );
    },
  });
  assert.equal(
    (
      await route.POST(
        request(
          { type: "format", value: "Graphic Novel", user_id: "injected" },
          "POST",
        ),
      )
    ).status,
    201,
  );
  assert.deepEqual(calls[0][1], { type: "format", value: "graphic_novel" });
  assert.equal(
    (await route.POST(request({ type: "not-a-trait", value: "x" }, "POST")))
      .status,
    400,
  );
  const denied = load("app/api/traits/route.ts", {
    ...mocks,
    "@clerk/nextjs/server": { auth: async () => ({ userId: null }) },
  });
  assert.equal(
    (await denied.POST(request({ type: "format", value: "x" }, "POST"))).status,
    401,
  );
});

test("project navigation opens separate dashboards directly", () => {
  const columns = load("app/(app)/query-dashboard/components/kanban-config.ts");
  const summaries = load("app/utils/project-dashboard-summary.ts", {
    "@/app/(app)/query-dashboard/components/kanban-config": columns,
    "@/app/utils/project-profile": profile,
    "@/app/utils/project-scope": scope,
  });
  const items = plain(
    summaries.getProjectNavigationItemsFromAgentMatches(
      fixtureRows().filter((row) => row.user_id === "writer-a"),
    ),
  );
  assert.deepEqual(items.map((item) => item.href).sort(), [
    "/projects/name%3ASame%20title/dashboard",
    "/projects/project-a/dashboard",
    "/projects/project-b/dashboard",
  ]);
});

test("old project links redirect to the dashboard instead of an editor", async () => {
  const page = load("app/(app)/projects/[projectId]/page.tsx", {
    "@/app/utils/project-profile": profile,
    "next/navigation": {
      redirect: (url) => {
        throw new Error(url);
      },
    },
  });
  for (const id of ["project-a", "name:100% / progress"]) {
    await assert.rejects(
      page.default({ params: Promise.resolve({ projectId: id }) }),
      { message: profile.getProjectDashboardHrefById(id) },
    );
  }
});
