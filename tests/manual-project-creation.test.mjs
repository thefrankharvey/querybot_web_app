import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import test from "node:test";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const projectId = "11111111-1111-4111-8111-111111111111";
const secondId = "22222222-2222-4222-8222-222222222222";
const plain = (value) => JSON.parse(JSON.stringify(value));
function compile(file, mocks = {}, globals = {}) {
  const compiled = { exports: {} };
  const source = readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
  const output = ts.transpileModule(source, {
    fileName: file,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText;
  vm.runInNewContext(output, {
    module: compiled,
    exports: compiled.exports,
    Request,
    Response,
    console,
    require: (name) =>
      Object.hasOwn(mocks, name) ? mocks[name] : require(name),
    ...globals,
  });
  return compiled.exports;
}
const profiles = compile("app/utils/project-profile.ts", {
  "./smart-match-restore": compile("app/utils/smart-match-restore.ts"),
});
class ProjectProfileError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}
function fixture({
  signedIn = true,
  matchingUser = true,
  email = "writer@example.test",
  rows = [],
  failSave = false,
} = {}) {
  const writes = [];
  const profileCalls = [];
  const saved = new Map();
  const store = {
    from(table) {
      assert.equal(table, "dashboard_projects");
      const filters = [];
      let update;
      return {
        async upsert(value, options) {
          writes.push([plain(value), plain(options)]);
          if (!rows.some((row) => row.id === value.id)) rows.push(plain(value));
          return { error: null };
        },
        update(value) {
          update = value;
          return this;
        },
        select() {
          return this;
        },
        eq(key, value) {
          filters.push([key, value]);
          return this;
        },
        is(key, value) {
          filters.push([key, value]);
          return this;
        },
        neq(key, value) { filters.push([key, value, false]); return this; },
        limit() { return this; },
        async maybeSingle() {
          const row = rows.find((row) =>
            filters.every(
              ([key, value, equals = true]) => (row[key] === value) === equals,
            ),
          );
          if (row && update) Object.assign(row, update);
          return { data: row ? plain(row) : null, error: null };
        },
      };
    },
  };
  const linking = compile("app/utils/smart-match-profile-link.server.ts", {
    "server-only": {},
    "@/app/api/supabase/server": { createServerSupabase: () => store },
    "./project-dashboard-route": compile(
      "app/utils/project-dashboard-route.ts",
    ),
    "./smart-match-projects.server": {
      SmartMatchProjectError: ProjectProfileError,
    },
  });
  const api = compile("app/api/dashboard-projects/route.ts", {
    "@/app/utils/smart-match-profile-link.server": linking,
    "@/app/utils/smart-match-projects.server": {
      SmartMatchProjectError: ProjectProfileError,
    },
    "@clerk/nextjs/server": {
      auth: async () => ({ userId: signedIn ? "owner" : null }),
      currentUser: async () => ({ id: matchingUser ? "owner" : "other" }),
    },
    "next/server": {
      NextResponse: { json: (body, init) => Response.json(body, init) },
    },
    "@/app/api/supabase/server": { createServerSupabase: () => store },
    "@/app/utils/project-dashboard-route": compile(
      "app/utils/project-dashboard-route.ts",
    ),
    "@/app/utils/project-profile": profiles,
    "@/app/utils/project-profile.server": {
      ProjectProfileError,
      async requestWriterProfile(project, email, patch) {
        profileCalls.push(plain({ project, email, patch: patch ?? null }));
        if (!patch)
          return (
            saved.get(project.id) ??
            profiles.toProjectProfile(null, project.project_name)
          );
        if (failSave)
          throw new ProjectProfileError("Profiles unavailable", 503);
        const profile = profiles.toProjectProfile(
          { id: project.id, revision: "a".repeat(64), ...patch.traits },
          project.project_name,
        );
        saved.set(project.id, profile);
        return profile;
      },
    },
    "@/lib/wqh-history-auth": { getWriterEmail: () => email },
  });
  return {
    api,
    rows,
    writes,
    profileCalls,
    saved,
    recover: () => {
      failSave = false;
    },
  };
}
const request = (body) =>
  new Request("https://example.test/api/dashboard-projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

test("creation persists a title-only owned project and profile with no saved agent requirement", async () => {
  const { api, writes, profileCalls } = fixture();
  const response = await api.POST(
    request({
      projectId,
      user_id: "victim",
      project_name: "Override",
      writer_project_id: secondId,
    }),
  );
  assert.equal(response.status, 201);
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  const body = await response.json();
  assert.deepEqual(body.project, {
    id: projectId,
    project_name: "My Project",
    writer_project_id: projectId,
  });
  assert.equal(body.profile.form.project_name, "My Project");
  assert.equal(body.profile.form.genre, "");
  assert.equal(profiles.hasProjectProfileTraits(body.profile.form), false);
  assert.deepEqual(writes[0][1], { onConflict: "id", ignoreDuplicates: true });
  assert.equal(profileCalls[1].email, "writer@example.test");
  assert.equal(profileCalls[1].patch.expected_revision, null);
  assert.equal(profileCalls[1].patch.traits.genre, null);
});

test("retries preserve the same project, title, and profile without creating or overwriting another", async () => {
  const { api, rows, profileCalls, saved } = fixture();
  assert.equal((await api.POST(request({ projectId }))).status, 201);
  rows[0].project_name = "Renamed project";
  saved.set(projectId, {
    ...saved.get(projectId),
    form: { ...saved.get(projectId).form, genre: "fantasy" },
  });
  const response = await api.POST(request({ projectId }));
  assert.equal(response.status, 201);
  const body = await response.json();
  assert.equal(rows.length, 1);
  assert.equal(body.project.project_name, "Renamed project");
  assert.equal(body.profile.form.genre, "fantasy");
  assert.equal(profileCalls.filter((call) => call.patch).length, 1);
  assert.equal((await api.POST(request({ projectId: secondId }))).status, 201);
  assert.equal(rows.length, 2);
  assert.notEqual(rows[0].writer_project_id, rows[1].writer_project_id);
});

test("a partial backend failure can recover the existing dashboard on retry", async () => {
  const { api, rows, recover } = fixture({ failSave: true });
  assert.equal((await api.POST(request({ projectId }))).status, 503);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].writer_project_id, null);
  recover();
  assert.equal((await api.POST(request({ projectId }))).status, 201);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].writer_project_id, projectId);
});

test("creation requires authentication and a valid ID, and cannot reuse another owner's project", async () => {
  for (const options of [{ signedIn: false }, { matchingUser: false }]) {
    const { api, writes } = fixture(options);
    assert.equal((await api.POST(request({ projectId }))).status, 401);
    assert.equal(writes.length, 0);
  }
  const noEmail = fixture({ email: null });
  assert.equal((await noEmail.api.POST(request({ projectId }))).status, 422);
  assert.equal(noEmail.writes.length, 0);
  const invalid = fixture();
  assert.equal(
    (await invalid.api.POST(request({ projectId: "bad" }))).status,
    400,
  );
  assert.equal(invalid.writes.length, 0);
  const other = fixture({
    rows: [
      {
        id: projectId,
        user_id: "other",
        project_name: "Private",
        writer_project_id: secondId,
      },
    ],
  });
  assert.equal((await other.api.POST(request({ projectId }))).status, 404);
  assert.equal(other.profileCalls.length, 0);
  assert.equal(other.rows[0].project_name, "Private");
});

test("the shared editor accepts an entirely blank profile and an author without a book title", async () => {
  const React = require("react");
  const stub = () => null;
  const { ProjectProfileEditor } = compile(
    "app/components/projects/project-profile-editor.tsx",
    {
      react: { ...React, useState: (initial) => [initial, () => {}] },
      "@/app/ui-primitives/button": { Button: stub },
      "@/app/ui-primitives/input": { Input: stub },
      "@/app/ui-primitives/spinner": { Spinner: stub },
      "@/app/ui-primitives/field": new Proxy({}, { get: () => stub }),
      "@/app/ui-primitives/radio-group": new Proxy({}, { get: () => stub }),
      "@/app/ui-primitives/select": new Proxy({}, { get: () => stub }),
      "@/app/hooks/use-manuscript-traits": {
        useManuscriptTraits: () => ({
          traitOptions: { genre: [], format: [], theme: [], subgenre: [] },
        }),
      },
      "@/app/constants": { targetAudienceOptions: [] },
      "./project-trait-field": { ProjectTraitField: stub },
    },
  );
  for (const comps of [
    [{ title: "", author: "" }],
    [{ title: "", author: "An author" }],
  ]) {
    let saved = false;
    const form = {
      ...profiles.toProjectProfile(null, "My Project").form,
      comps,
    };
    const element = ProjectProfileEditor({
      form,
      setForm() {},
      saving: false,
      onSave: async () => {
        saved = true;
      },
      onCancel() {},
    });
    element.props.onSubmit({ preventDefault() {} });
    assert.equal(saved, true);
    assert.deepEqual(
      plain(profiles.profileTraits(form).comps),
      comps[0].author ? ["", "An author"] : [],
    );
  }
});

test("creation cannot attach a profile that already belongs to another dashboard", async () => {
  const original = {
    id: secondId,
    user_id: "owner",
    project_name: "Original",
    writer_project_id: projectId,
  };
  const { api, saved, rows } = fixture({ rows: [original] });
  saved.set(
    projectId,
    profiles.toProjectProfile(
      { id: projectId, revision: "a".repeat(64), genre: "fantasy" },
      "Original",
    ),
  );
  const response = await api.POST(request({ projectId }));
  assert.equal(response.status, 409);
  assert.match(
    (await response.json()).error,
    /already belongs to another project/,
  );
  assert.equal(
    rows.find((row) => row.id === projectId).writer_project_id,
    null,
  );
  assert.equal(original.writer_project_id, projectId);
});
