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

function compileTypeScriptModule(relativePath, modules, globals = {}) {
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
    Date,
    Headers,
    Request,
    Response,
    URL,
    console,
    exports: compiledModule.exports,
    module: compiledModule,
    ...globals,
    require(specifier) {
      if (Object.hasOwn(modules, specifier)) return modules[specifier];
      return require(specifier);
    },
  });

  vm.runInContext(output, context, { filename: filePath });
  return compiledModule.exports;
}

function loadProjectScope() {
  return compileTypeScriptModule("app/utils/project-scope.ts", {
    "@/app/constants": { DEFAULT_PROJECT_NAME: "Untitled Project" },
  });
}

function createSupabaseStore(initialRows) {
  const state = {
    operations: [],
    rows: structuredClone(initialRows),
  };

  class Query {
    constructor() {
      this.action = "select";
      this.filters = [];
      this.patch = null;
      this.returning = "*";
    }

    select(columns) {
      this.returning = columns;
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

    eq(field, value) {
      this.filters.push([field, value]);
      return this;
    }

    matches(row) {
      return this.filters.every(([field, value]) => row[field] === value);
    }

    async maybeSingle() {
      const matchingIndexes = state.rows
        .map((row, index) => (this.matches(row) ? index : -1))
        .filter((index) => index >= 0);
      state.operations.push({
        action: this.action,
        filters: structuredClone(this.filters),
        patch: structuredClone(this.patch),
      });

      if (matchingIndexes.length === 0) {
        return { data: null, error: null };
      }

      if (matchingIndexes.length > 1) {
        return { data: null, error: { code: "PGRST116" } };
      }

      const index = matchingIndexes[0];
      if (this.action === "update") {
        state.rows[index] = { ...state.rows[index], ...this.patch };
        return { data: structuredClone(state.rows[index]), error: null };
      }

      if (this.action === "delete") {
        const [deleted] = state.rows.splice(index, 1);
        return { data: structuredClone(deleted), error: null };
      }

      return { data: structuredClone(state.rows[index]), error: null };
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

function savedRow(overrides = {}) {
  return {
    id: "record-a",
    user_id: "writer-a",
    name: "Agent A",
    email: "agent@example.test",
    agency: "Example Literary",
    agency_id: null,
    agency_url: "https://example.test",
    index_id: "shared-agent",
    query_tracker: null,
    pub_marketplace: null,
    match_score: 91,
    fit_rating: "great",
    genres_themes: "Fantasy",
    column_name: "agents-to-research",
    updated_date: "2026-08-01",
    query_sent_date: null,
    pages_requested_date: null,
    rejected_date: null,
    offer_date: null,
    notes: null,
    query_letter_ready: false,
    project_name: "Novel One",
    writer_project_id: "project-one",
    query_round: null,
    query_on_hold: false,
    safety_updated_at: null,
    created_at: "2026-08-01T12:00:00.000Z",
    ...overrides,
  };
}

function loadRoute({ rows, userId = "writer-a", roundsEnabled = true }) {
  const store = createSupabaseStore(rows);
  let authenticatedUserId = userId;
  const route = compileTypeScriptModule(
    "app/api/agent-match-records/[recordId]/route.ts",
    {
      "@clerk/nextjs/server": {
        auth: async () => ({ userId: authenticatedUserId }),
      },
      "next/server": {
        NextResponse: { json: (body, init) => Response.json(body, init) },
      },
      "@/app/api/supabase/server": {
        createServerSupabase: () => store.client,
      },
      "@/app/constants": { AGENT_MATCHES_TABLE: "agent_matches" },
      "@/app/utils/project-scope": loadProjectScope(),
      "@/app/utils/query-safety/feature-flags.server": {
        getQuerySafetyFeatureFlags: () => ({ queryRounds: roundsEnabled }),
      },
    },
  );

  return {
    route,
    setUserId(nextUserId) {
      authenticatedUserId = nextUserId;
    },
    state: store.state,
  };
}

function context(recordId) {
  return { params: Promise.resolve({ recordId }) };
}

function patchRequest(body) {
  return new Request("https://app.example.test/api/agent-match-records/record-a", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

test("all record methods authenticate before querying and return no-store", async () => {
  const { route, state, setUserId } = loadRoute({ rows: [savedRow()] });
  setUserId(null);

  for (const [method, request] of [
    ["GET", new Request("https://app.example.test")],
    ["PATCH", patchRequest({ notes: "Private" })],
    ["DELETE", new Request("https://app.example.test", { method: "DELETE" })],
  ]) {
    const response = await route[method](request, context("record-a"));
    assert.equal(response.status, 401);
    assert.equal(response.headers.get("cache-control"), "private, no-store");
    assert.equal((await response.json()).code, "UNAUTHORIZED");
  }

  assert.equal(state.operations.length, 0);
});

test("GET returns a camelCase owned-record DTO without user identity", async () => {
  const { route } = loadRoute({ rows: [savedRow()] });
  const response = await route.GET(
    new Request("https://app.example.test"),
    context("record-a"),
  );
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  assert.equal(body.record.recordId, "record-a");
  assert.equal(body.record.legacyAgentId, "shared-agent");
  assert.deepEqual(body.record.projectScope, {
    key: "writer:project-one",
    projectName: "Novel One",
    writerProjectId: "project-one",
  });
  assert.equal("userId" in body.record, false);
  assert.equal("user_id" in body.record, false);
});

test("missing and cross-user record IDs are indistinguishable 404 responses", async () => {
  const { route, state } = loadRoute({
    rows: [savedRow(), savedRow({ id: "record-b", user_id: "writer-b" })],
  });

  for (const recordId of ["missing-record", "record-b"]) {
    const response = await route.GET(
      new Request("https://app.example.test"),
      context(recordId),
    );
    assert.equal(response.status, 404);
    assert.deepEqual(await response.json(), {
      code: "NOT_FOUND",
      error: "Saved agent record not found",
    });
  }

  const patchResponse = await route.PATCH(
    patchRequest({ notes: "Unauthorized change" }),
    context("record-b"),
  );
  const deleteResponse = await route.DELETE(
    new Request("https://app.example.test", { method: "DELETE" }),
    context("record-b"),
  );

  assert.equal(patchResponse.status, 404);
  assert.equal(deleteResponse.status, 404);
  assert.equal(
    state.rows.find((row) => row.id === "record-b").notes,
    null,
  );
});

test("PATCH rejects unknown, protected, empty, malformed, and invalid round payloads", async () => {
  const { route, state } = loadRoute({ rows: [savedRow()] });
  const cases = [
    [{ userId: "attacker" }, "INVALID_PAYLOAD"],
    [{ agencyId: "untrusted" }, "INVALID_PAYLOAD"],
    [{}, "INVALID_PAYLOAD"],
    [{ queryRound: 0 }, "INVALID_QUERY_ROUND"],
    [{ queryRound: 1.5 }, "INVALID_QUERY_ROUND"],
    [{ queryOnHold: "yes" }, "INVALID_PAYLOAD"],
  ];

  for (const [body, code] of cases) {
    const response = await route.PATCH(patchRequest(body), context("record-a"));
    assert.equal(response.status, 400);
    assert.equal((await response.json()).code, code);
  }

  const malformedResponse = await route.PATCH(
    new Request("https://app.example.test", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: "{",
    }),
    context("record-a"),
  );
  assert.equal(malformedResponse.status, 400);
  assert.equal((await malformedResponse.json()).code, "INVALID_PAYLOAD");
  assert.equal(state.rows[0].user_id, "writer-a");
  assert.equal(state.rows[0].agency_id, null);
});

test("round and Hold validation uses the merged persisted state", async () => {
  const { route, state } = loadRoute({
    rows: [savedRow({ query_on_hold: true })],
  });

  const invalid = await route.PATCH(
    patchRequest({ queryRound: 2 }),
    context("record-a"),
  );
  assert.equal(invalid.status, 400);
  assert.equal((await invalid.json()).code, "INVALID_ROUND_HOLD_STATE");

  const valid = await route.PATCH(
    patchRequest({ queryRound: 2, queryOnHold: false }),
    context("record-a"),
  );
  const body = await valid.json();
  assert.equal(valid.status, 200);
  assert.equal(body.record.queryRound, 2);
  assert.equal(body.record.queryOnHold, false);
  assert.equal(state.rows[0].query_round, 2);
  assert.equal(state.rows[0].query_on_hold, false);
  assert.match(state.rows[0].safety_updated_at, /^\d{4}-\d{2}-\d{2}T/);
});

test("round feature rollback rejects round writes without affecting other fields", async () => {
  const { route, state } = loadRoute({
    rows: [savedRow()],
    roundsEnabled: false,
  });
  const roundResponse = await route.PATCH(
    patchRequest({ queryRound: 1, queryOnHold: false }),
    context("record-a"),
  );

  assert.equal(roundResponse.status, 404);
  assert.equal((await roundResponse.json()).code, "FEATURE_DISABLED");
  assert.equal(state.rows[0].query_round, null);

  const notesResponse = await route.PATCH(
    patchRequest({ notes: "Still editable" }),
    context("record-a"),
  );
  assert.equal(notesResponse.status, 200);
  assert.equal(state.rows[0].notes, "Still editable");
});

test("PATCH isolates two project rows that share one legacy agent ID", async () => {
  const rowA = savedRow();
  const rowB = savedRow({
    id: "record-b",
    notes: "Do not change",
    project_name: "Novel Two",
    writer_project_id: "project-two",
  });
  const { route, state } = loadRoute({ rows: [rowA, rowB] });

  const response = await route.PATCH(
    patchRequest({ notes: "Only project one", queryRound: 1 }),
    context("record-a"),
  );

  assert.equal(response.status, 200);
  assert.equal(state.rows[0].notes, "Only project one");
  assert.equal(state.rows[0].query_round, 1);
  assert.equal(state.rows[1].notes, "Do not change");
  assert.equal(state.rows[1].query_round, null);
  const updateOperation = state.operations.find(
    (operation) => operation.action === "update",
  );
  assert.deepEqual(updateOperation.filters, [
    ["id", "record-a"],
    ["user_id", "writer-a"],
  ]);
  assert.equal(
    updateOperation.filters.some(([field]) => field === "index_id"),
    false,
  );
});

test("DELETE isolates two project rows and returns the deleted saved row ID", async () => {
  const { route, state } = loadRoute({
    rows: [
      savedRow(),
      savedRow({
        id: "record-b",
        project_name: "Novel Two",
        writer_project_id: "project-two",
      }),
    ],
  });

  const response = await route.DELETE(
    new Request("https://app.example.test", { method: "DELETE" }),
    context("record-a"),
  );

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { deletedRecordId: "record-a" });
  assert.deepEqual(
    state.rows.map((row) => row.id),
    ["record-b"],
  );
  const deleteOperation = state.operations.find(
    (operation) => operation.action === "delete",
  );
  assert.deepEqual(deleteOperation.filters, [
    ["id", "record-a"],
    ["user_id", "writer-a"],
  ]);
});

test("collection create replaces a browser agency hint with server-resolved identity", async () => {
  const agentId = "11111111-1111-4111-8111-111111111111";
  let insertedPayloads = null;
  let resolvedAgentIds = null;
  const collectionRoute = compileTypeScriptModule(
    "app/api/agent-matches/route.ts",
    {
      "@clerk/nextjs/server": {
        auth: async () => ({ userId: "writer-a" }),
      },
      "next/server": {
        NextResponse: { json: (body, init) => Response.json(body, init) },
      },
      "../supabase/server": {
        createServerSupabase: () => ({
          from(table) {
            assert.equal(table, "agent_matches");
            return {
              insert(payloads) {
                insertedPayloads = structuredClone(payloads);
                return {
                  async select() {
                    return { data: structuredClone(payloads), error: null };
                  },
                };
              },
            };
          },
        }),
      },
      "@/app/constants": { AGENT_MATCHES_TABLE: "agent_matches" },
      "@/app/utils/agency-identity.server": {
        fetchCanonicalAgencyIdentities: async (agentIds) => {
          resolvedAgentIds = [...agentIds];
          return new Map([
            [
              agentId,
              {
                agency_id: "server-reviewed-agency",
                agency_name: "Reviewed Agency",
                agency_url: null,
              },
            ],
          ]);
        },
      },
    },
  );
  const response = await collectionRoute.POST(
    new Request("https://app.example.test/api/agent-matches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        agencyId: "browser-asserted-agency",
        index_id: agentId,
        name: "Agent A",
      }),
    }),
  );

  assert.equal(response.status, 201);
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  assert.deepEqual(resolvedAgentIds, [agentId]);
  assert.equal(insertedPayloads[0].agency_id, "server-reviewed-agency");
  assert.equal(insertedPayloads[0].agencyId, undefined);
  assert.equal(insertedPayloads[0].user_id, "writer-a");
});

test("collection reads enrich existing rows with reviewed canonical agency IDs", async () => {
  const agentId = "11111111-1111-4111-8111-111111111111";
  const collectionRoute = compileTypeScriptModule(
    "app/api/agent-matches/route.ts",
    {
      "@clerk/nextjs/server": {
        auth: async () => ({ userId: "writer-a" }),
      },
      "next/server": {
        NextResponse: { json: (body, init) => Response.json(body, init) },
      },
      "../supabase/server": {
        createServerSupabase: () => ({
          from() {
            return {
              select() {
                return this;
              },
              eq() {
                return this;
              },
              async order() {
                return {
                  data: [
                    savedRow({
                      agency_id: null,
                      index_id: agentId.toUpperCase(),
                    }),
                  ],
                  error: null,
                };
              },
            };
          },
        }),
      },
      "@/app/constants": { AGENT_MATCHES_TABLE: "agent_matches" },
      "@/app/utils/agency-identity.server": {
        fetchCanonicalAgencyIdentities: async () =>
          new Map([
            [
              agentId,
              {
                agency_id: "reviewed-agency",
                agency_name: "Reviewed Agency",
                agency_url: null,
              },
            ],
          ]),
      },
    },
  );

  const response = await collectionRoute.GET();
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  assert.equal(body.agent_matches[0].agency_id, "reviewed-agency");
});

test("canonical agency lookup fails open without persisting a browser hint", async () => {
  const agencyIdentity = compileTypeScriptModule(
    "app/utils/agency-identity.server.ts",
    {
      "server-only": {},
      "@/lib/config": { getWqhApiUrl: () => "https://catalogue.example.test" },
    },
    {
      fetch: async () => {
        throw new Error("catalogue unavailable");
      },
    },
  );

  const identities = await agencyIdentity.fetchCanonicalAgencyIdentities([
    "11111111-1111-4111-8111-111111111111",
  ]);
  assert.equal(identities.size, 0);
});

test("legacy index route declares deprecation on compatibility responses", async () => {
  const legacyRoute = compileTypeScriptModule(
    "app/api/agent-matches/[id]/route.ts",
    {
      "@clerk/nextjs/server": { auth: async () => ({ userId: null }) },
      "next/server": {
        NextResponse: { json: (body, init) => Response.json(body, init) },
      },
      "../../supabase/server": {
        createServerSupabase: () => {
          throw new Error("database should not be called");
        },
      },
      "@/app/constants": { AGENT_MATCHES_TABLE: "agent_matches" },
    },
  );
  const response = await legacyRoute.GET(
    new Request("https://app.example.test"),
    { params: Promise.resolve({ id: "legacy-agent" }) },
  );

  assert.equal(response.status, 401);
  assert.equal(response.headers.get("deprecation"), "true");
  assert.match(response.headers.get("warning"), /Deprecated agent index route/);
  assert.equal(response.headers.get("cache-control"), "private, no-store");
});
