import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import test from "node:test";
import vm from "node:vm";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const plain = (value) => JSON.parse(JSON.stringify(value));
const dashboardId = "11111111-1111-4111-8111-111111111111";
const writerId = "22222222-2222-4222-8222-222222222222";
const project = {
  id: dashboardId,
  project_name: "Canonical title",
  writer_project_id: writerId,
};

function compile(path, modules = {}, globals = {}) {
  const filename = resolve(path);
  const output = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
    },
    fileName: filename,
  }).outputText;
  const compiled = { exports: {} };
  vm.runInNewContext(
    output,
    {
      module: compiled,
      exports: compiled.exports,
      URL,
      Request,
      Response,
      AbortSignal,
      console,
      require: (key) =>
        Object.hasOwn(modules, key) ? modules[key] : require(key),
      ...globals,
    },
    { filename },
  );
  return compiled.exports;
}

const profiles = compile("app/utils/project-profile.ts", {
  "./smart-match-restore": compile("app/utils/smart-match-restore.ts"),
});

test("profiles preserve custom traits and the positions of incomplete comparable books", () => {
  const profile = profiles.toProjectProfile(
    {
      id: writerId,
      project_name: "Old title",
      revision: "a".repeat(64),
      genre: "custom-genre",
      subgenres: ["custom-subgenre"],
      comps: ["First book", "", "Second book", "Second author"],
    },
    "Canonical title",
  );
  assert.equal(profile.form.project_name, "Canonical title");
  assert.equal(profile.form.genre, "custom-genre");
  assert.deepEqual(plain(profile.form.comps), [
    { title: "First book", author: "" },
    { title: "Second book", author: "Second author" },
  ]);
  assert.deepEqual(plain(profiles.profileTraits(profile.form).comps), [
    "First book",
    "",
    "Second book",
    "Second author",
  ]);
  assert.equal(profiles.toProjectProfile(null, "Legacy").revision, null);
});

function service(
  fetcher,
  headers = { Authorization: "Bearer server-only-test-key" },
) {
  return compile(
    "app/utils/project-profile.server.ts",
    {
      "server-only": {},
      "@/lib/config": { getWqhApiUrl: () => "https://backend.example.test" },
      "@/lib/wqh-history-auth": { getWqhHistoryHeaders: () => headers },
      "./project-profile": profiles,
    },
    { fetch: fetcher },
  );
}

test("profile transport uses the server credential and stable backend ID", async () => {
  const calls = [];
  const api = service(async (url, options) => {
    calls.push([String(url), options]);
    return Response.json({
      status: "success",
      writer_project: {
        id: writerId,
        revision: "a".repeat(64),
        genre: "fantasy",
      },
    });
  });
  const profile = await api.requestWriterProfile(
    project,
    "signed-in@example.com",
    { expected_revision: "a".repeat(64), traits: { themes: ["hope"] } },
  );
  const [url, options] = calls[0];
  assert.equal(url, `https://backend.example.test/writer-projects/${writerId}`);
  assert.equal(options.headers.Authorization, "Bearer server-only-test-key");
  assert.equal(options.cache, "no-store");
  assert.equal(JSON.parse(options.body).email, "signed-in@example.com");
  assert.equal(JSON.parse(options.body).create_if_missing, false);
  assert.equal(profile.form.project_name, project.project_name);
});

test("only a legacy dashboard can use an empty profile for an upstream 404", async () => {
  const api = service(async () =>
    Response.json({ status: "error" }, { status: 404 }),
  );
  const empty = await api.requestWriterProfile(
    { ...project, writer_project_id: null },
    "writer@example.com",
  );
  assert.equal(empty.revision, null);
  await assert.rejects(
    api.requestWriterProfile(project, "writer@example.com"),
    (error) => error.status === 404,
  );
  const unavailable = service(async () => {
    throw new Error("private upstream details");
  });
  await assert.rejects(
    unavailable.requestWriterProfile(project, "writer@example.com"),
    (error) => error.status === 503 && !error.message.includes("private"),
  );
});

function route({
  ownProject = project,
  signedIn = true,
  matchingUser = true,
  linkFails = false,
  profile = { writerProjectId: writerId },
} = {}) {
  const calls = [];
  const updates = [];
  const query = {
    update(value) {
      updates.push(["update", value]);
      return this;
    },
    eq(...args) {
      updates.push(["eq", ...args]);
      return this;
    },
    is(...args) {
      updates.push(["is", ...args]);
      return this;
    },
    select() {
      return this;
    },
    async maybeSingle() {
      return {
        data: linkFails ? null : { id: dashboardId },
        error: linkFails ? {} : null,
      };
    },
  };
  const api = compile(
    "app/api/dashboard-projects/[projectId]/profile/route.ts",
    {
      "@clerk/nextjs/server": {
        auth: async () => ({ userId: signedIn ? "own-user" : null }),
        currentUser: async () => ({
          id: matchingUser ? "own-user" : "other-user",
          primaryEmailAddress: { emailAddress: "signed-in@example.com" },
        }),
      },
      "next/server": {
        NextResponse: { json: (body, options) => Response.json(body, options) },
      },
      "@/app/api/supabase/server": {
        createServerSupabase: () => ({ from: () => query }),
      },
      "@/app/utils/project-dashboard-data": {
        getDashboardProject: async () => ownProject,
      },
      "@/app/utils/project-profile.server": {
        ProjectProfileError: class extends Error {},
        requestWriterProfile: async (...args) => {
          calls.push(args);
          return profile;
        },
      },
      "@/lib/wqh-history-auth": {
        getWriterEmail: (user) => user.primaryEmailAddress.emailAddress,
      },
    },
  );
  return { api, calls, updates };
}

const context = { params: Promise.resolve({ projectId: dashboardId }) };
const request = (body) =>
  new Request(
    `https://app.example.test/api/dashboard-projects/${dashboardId}/profile`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );

test("profile routes reject unauthenticated, mismatched, and unowned projects before reaching the backend", async () => {
  for (const [options, status] of [
    [{ signedIn: false }, 401],
    [{ matchingUser: false }, 401],
    [{ ownProject: null }, 404],
  ]) {
    const { api, calls, updates } = route(options);
    const response = await api.GET(
      new Request("https://app.example.test"),
      context,
    );
    assert.equal(response.status, status);
    assert.equal(calls.length, 0);
    assert.equal(updates.length, 0);
  }
});

test("browser identity and project overrides are discarded when saving", async () => {
  const { api, calls, updates } = route();
  const response = await api.PATCH(
    request({
      expected_revision: "a".repeat(64),
      traits: { themes: ["hope"] },
      email: "victim@example.com",
      writer_project_id: "other-id",
      create_if_missing: true,
    }),
    context,
  );
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  assert.deepEqual(plain(calls[0]), [
    project,
    "signed-in@example.com",
    { expected_revision: "a".repeat(64), traits: { themes: ["hope"] } },
  ]);
  assert.equal(updates.length, 0);
});

test("legacy linking updates only the owned dashboard with an empty link", async () => {
  const { api, updates } = route({
    ownProject: { ...project, writer_project_id: null },
    profile: { writerProjectId: dashboardId },
  });
  const response = await api.PATCH(
    request({ expected_revision: null, traits: { genre: "fantasy" } }),
    context,
  );
  assert.equal(response.status, 200);
  assert.deepEqual(plain(updates), [
    ["update", { writer_project_id: dashboardId }],
    ["eq", "id", dashboardId],
    ["eq", "user_id", "own-user"],
    ["is", "writer_project_id", null],
  ]);
});

test("a partial legacy-link failure is reported without claiming a complete save", async () => {
  const { api } = route({
    ownProject: { ...project, writer_project_id: null },
    profile: { writerProjectId: dashboardId },
    linkFails: true,
  });
  const response = await api.PATCH(
    request({ expected_revision: null, traits: { genre: "fantasy" } }),
    context,
  );
  assert.equal(response.status, 503);
  assert.match((await response.json()).error, /Traits were saved/);
});

test("existing Home project destinations still point to the query dashboard", () => {
  const routes = compile("app/utils/project-dashboard-route.ts");
  assert.equal(
    routes.getProjectDashboardHrefById(dashboardId),
    `/projects/${dashboardId}/dashboard`,
  );
  const home = readFileSync(
    "app/(app)/home/components/project-dashboard-overview.tsx",
    "utf8",
  );
  assert.match(home, /href=\{summary.href\}/);
});

function renderProfile(query) {
  const React = require("react");
  const { renderToStaticMarkup } = require("react-dom/server");
  const utils = { cn: (...values) => values.filter(Boolean).join(" ") };
  const { ProjectProfileClient } = compile(
    "app/(app)/projects/[projectId]/profile/project-profile-client.tsx",
    {
      "next/link": { __esModule: true, default: ({ children, ...props }) => React.createElement("a", props, children) },
      "@tanstack/react-query": { useQuery: () => query, useQueryClient: () => ({}) },
      "@/app/hooks/use-clerk-user": { useClerkUser: () => ({ user: { id: "own-user" } }) },
      "@/app/(app)/context/profile-context": { useProfileContext: () => ({ refetch() {} }) },
      "@/app/hooks/use-unsaved-project-changes": { useUnsavedProjectChanges() {} },
      "@/app/components/projects/project-profile-details": {
        ProjectProfileDetails: () => React.createElement("div", null, "Saved manuscript traits"),
      },
      "@/app/components/projects/project-profile-editor": { ProjectProfileEditor: () => null },
      "@/app/ui-primitives/button": compile("app/ui-primitives/button.tsx", { "@/app/utils": utils }),
      "@/app/ui-primitives/skeleton": compile("app/ui-primitives/skeleton.tsx", { "../utils": utils }),
      "@/app/ui-primitives/alert": compile("app/ui-primitives/alert.tsx", { "@/app/utils": utils }),
      "@/app/ui-primitives/empty": compile("app/ui-primitives/empty.tsx", { "@/app/utils": utils }),
      "@/app/utils/project-profile": profiles,
    },
  );
  return renderToStaticMarkup(React.createElement(ProjectProfileClient, { project }));
}

test("an empty legacy profile gives a project-scoped Smart Match action instead of default Fiction details", () => {
  const html = renderProfile({ data: profiles.toProjectProfile(null, project.project_name) });
  assert.match(html, /Your project profile is currently empty/);
  assert.match(html, /Run a Smart Match search for this project/);
  assert.match(html, new RegExp(`href="/smart-match\\?project=${dashboardId}"`));
  assert.match(html, /Edit traits/);
  assert.doesNotMatch(html, /Saved manuscript traits|Project traits could not load/);
});

test("saved Smart Match profiles display their traits and genuine load failures remain errors", () => {
  const populated = renderProfile({ data: profiles.toProjectProfile({ id: writerId, revision: "a".repeat(64) }, "Book") });
  assert.match(populated, /Saved manuscript traits/);
  assert.doesNotMatch(populated, /currently empty/);
  const unavailable = renderProfile({ isError: true, error: new Error("Service temporarily unavailable") });
  assert.match(unavailable, /Project traits could not load/);
  assert.match(unavailable, /Service temporarily unavailable/);
  assert.doesNotMatch(unavailable, /currently empty/);
});

function legacyLinkService({ rows = [], failRead = false, failWrite = false, noWrite = false } = {}) {
  const writes = [];
  const server = {
    createServerSupabase: () => ({
      from(table) {
        assert.equal(table, "dashboard_projects");
        const filters = [];
        let update = null;
        return {
          select() { return this; },
          eq(key, value) { filters.push([key, value]); return this; },
          is(key, value) { filters.push([key, value]); return this; },
          neq(key, value) { filters.push([key, value, false]); return this; },
          limit() { return this; },
          update(value) { update = value; return this; },
          async maybeSingle() {
            const row = rows.find((row) => filters.every(([key, value, equals = true]) => (row[key] === value) === equals));
            if (update) {
              writes.push({ filters, update });
              if (failWrite) return { data: null, error: {} };
              if (noWrite) return { data: null, error: null };
              if (row) Object.assign(row, update);
            } else if (failRead) return { data: null, error: {} };
            return { data: row ?? null, error: null };
          },
        };
      },
    }),
  };
  class SmartMatchProjectError extends Error {
    constructor(message, status) { super(message); this.status = status; }
  }
  return {
    writes,
    api: compile("app/utils/smart-match-profile-link.server.ts", {
      "server-only": {},
      "@/app/api/supabase/server": server,
      "./project-dashboard-route": compile("app/utils/project-dashboard-route.ts"),
      "./smart-match-projects.server": { SmartMatchProjectError },
    }),
  };
}
const legacyRow = () => ({ ...project, user_id: "own-user", writer_project_id: null });
const legacySearch = (extra = {}) => ({
  userId: "own-user", selection: { dashboardProjectId: dashboardId, writerProjectId: null },
  writerProjectId: null, projectName: project.project_name, lastIndex: "0", ...extra,
});

test("only an explicitly selected owned legacy dashboard can attach a newly submitted search", async () => {
  const row = legacyRow();
  const { api, writes } = legacyLinkService({ rows: [row] });
  assert.equal(await api.getLegacySearchProject(legacySearch()), dashboardId);
  assert.equal(writes.length, 0);
  await api.linkLegacySearchProfile("own-user", dashboardId, writerId);
  assert.equal(row.writer_project_id, writerId);
  assert.deepEqual(plain(writes[0].filters), [["id", dashboardId], ["user_id", "own-user"], ["writer_project_id", null]]);
  await assert.rejects(api.getLegacySearchProject(legacySearch()), (error) => error.status === 409);
});

test("a title alone, pagination, an explicit backend ID, or an invalid dashboard ID cannot create a legacy link", async () => {
  const { api, writes } = legacyLinkService({ failRead: true });
  for (const extra of [
    { selection: undefined }, { lastIndex: "21" }, { writerProjectId: writerId },
    { selection: { dashboardProjectId: "bad-id", writerProjectId: null } },
    { selection: { dashboardProjectId: dashboardId, writerProjectId: writerId } },
  ]) assert.equal(await api.getLegacySearchProject(legacySearch(extra)), null);
  assert.equal(writes.length, 0);
});

test("legacy search selection rejects another account and a stale project title", async () => {
  const { api } = legacyLinkService({ rows: [legacyRow()] });
  await assert.rejects(api.getLegacySearchProject(legacySearch({ userId: "other-user" })), (error) => error.status === 404);
  await assert.rejects(api.getLegacySearchProject(legacySearch({ projectName: "Changed title" })), (error) => error.status === 409);
});

test("legacy links preserve a newer profile and accept only an idempotent same-search retry", async () => {
  for (const [linkedId, succeeds] of [[writerId, true], [dashboardId, false]]) {
    const { api } = legacyLinkService({ rows: [{ ...legacyRow(), writer_project_id: linkedId }] });
    if (succeeds) await api.linkLegacySearchProfile("own-user", dashboardId, writerId);
    else await assert.rejects(api.linkLegacySearchProfile("own-user", dashboardId, writerId), (error) => error.status === 409);
  }
});

test("failed project reads, failed links, and missing search IDs remain actionable failures", async () => {
  const badRead = legacyLinkService({ failRead: true }).api;
  await assert.rejects(badRead.getLegacySearchProject(legacySearch()), (error) => error.status === 503);
  const badWrite = legacyLinkService({ failWrite: true }).api;
  await assert.rejects(badWrite.linkLegacySearchProfile("own-user", dashboardId, writerId), (error) => error.status === 503);
  const { api, writes } = legacyLinkService();
  await assert.rejects(api.linkLegacySearchProfile("own-user", dashboardId, undefined), (error) => error.status === 502);
  assert.equal(writes.length, 0);
});


test("a deduplicated saved search cannot link two separate dashboards", async () => {
  const old = legacyRow();
  const { api, writes } = legacyLinkService({ rows: [old, { ...legacyRow(), id: "another-dashboard", writer_project_id: writerId }] });
  await assert.rejects(api.linkLegacySearchProfile("own-user", dashboardId, writerId), (error) => error.status === 409);
  assert.equal(old.writer_project_id, null);
  assert.equal(writes.length, 0);
});
