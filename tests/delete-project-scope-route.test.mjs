import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function compileModule(relativePath, modules) {
  const filePath = resolve(repositoryRoot, relativePath);
  const output = ts.transpileModule(readFileSync(filePath, "utf8"), {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: filePath,
  }).outputText;
  const compiledModule = { exports: {} };
  const context = vm.createContext({
    Headers,
    Request,
    Response,
    console,
    exports: compiledModule.exports,
    module: compiledModule,
    require(specifier) {
      if (Object.hasOwn(modules, specifier)) return modules[specifier];
      return require(specifier);
    },
  });

  vm.runInContext(output, context, { filename: filePath });
  return compiledModule.exports;
}

function loadProjectScope() {
  return compileModule("app/utils/project-scope.ts", {
    "@/app/constants": { DEFAULT_PROJECT_NAME: "Untitled Project" },
  });
}

function createStore(rows) {
  const state = { rows: structuredClone(rows) };

  class Query {
    constructor() {
      this.action = "select";
      this.filters = [];
      this.inFilters = [];
    }

    select() {
      return this;
    }

    delete() {
      this.action = "delete";
      return this;
    }

    eq(field, value) {
      this.filters.push([field, value]);
      return this;
    }

    in(field, values) {
      this.inFilters.push([field, values]);
      return this;
    }

    matches(row) {
      return (
        this.filters.every(([field, value]) => row[field] === value) &&
        this.inFilters.every(([field, values]) => values.includes(row[field]))
      );
    }

    async execute() {
      const matching = state.rows.filter((row) => this.matches(row));
      if (this.action === "delete") {
        state.rows = state.rows.filter((row) => !this.matches(row));
      }
      return { data: structuredClone(matching), error: null };
    }

    then(resolvePromise, rejectPromise) {
      return this.execute().then(resolvePromise, rejectPromise);
    }
  }

  return {
    client: {
      from(table) {
        assert.equal(table, "agent_matches");
        return new Query();
      },
    },
    state,
  };
}

function loadRoute(rows) {
  const store = createStore(rows);
  const route = compileModule("app/api/agent-matches/delete-project/route.ts", {
    "@clerk/nextjs/server": { auth: async () => ({ userId: "writer-a" }) },
    "next/server": {
      NextResponse: { json: (body, init) => Response.json(body, init) },
    },
    "../../supabase/server": { createServerSupabase: () => store.client },
    "@/app/constants": { AGENT_MATCHES_TABLE: "agent_matches" },
    "@/app/utils/project-scope": loadProjectScope(),
  });
  return { route, state: store.state };
}

function deleteRequest(body) {
  return new Request("https://app.example.test/api/agent-matches/delete-project", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

test("canonical project deletion does not delete same-named or legacy scopes", async () => {
  const { route, state } = loadRoute([
    {
      id: "record-a",
      user_id: "writer-a",
      index_id: "agent-1",
      project_name: "Same Name",
      writer_project_id: "project-one",
    },
    {
      id: "record-b",
      user_id: "writer-a",
      index_id: "agent-2",
      project_name: "Same Name",
      writer_project_id: "project-two",
    },
    {
      id: "record-legacy",
      user_id: "writer-a",
      index_id: "agent-3",
      project_name: "Same Name",
      writer_project_id: null,
    },
  ]);

  const response = await route.DELETE(
    deleteRequest({
      projectName: "Same Name",
      writerProjectId: "project-one",
    }),
  );

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  assert.equal((await response.json()).deleted, 1);
  assert.deepEqual(
    state.rows.map((row) => row.id),
    ["record-b", "record-legacy"],
  );
});

test("legacy project deletion uses the normalized name key and leaves canonical rows", async () => {
  const { route, state } = loadRoute([
    {
      id: "record-a",
      user_id: "writer-a",
      index_id: "agent-1",
      project_name: " My Novel ",
      writer_project_id: null,
    },
    {
      id: "record-b",
      user_id: "writer-a",
      index_id: "agent-2",
      project_name: "my novel",
      writer_project_id: "canonical-project",
    },
  ]);

  const response = await route.DELETE(
    deleteRequest({ projectName: "MY NOVEL", writerProjectId: null }),
  );

  assert.equal(response.status, 200);
  assert.equal((await response.json()).deleted, 1);
  assert.deepEqual(
    state.rows.map((row) => row.id),
    ["record-b"],
  );
});
