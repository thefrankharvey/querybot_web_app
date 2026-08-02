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

function compileTypeScriptModule(relativePath, modules) {
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
    URL,
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

class MockAgencyGuardServiceError extends Error {
  constructor(message, status, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function guard(overrides = {}) {
  return {
    contractVersion: "query-safety-v1",
    resultVersion: "query-safety-v1:current",
    status: "warning",
    scopeKey: "writer:project-one",
    scope: {
      key: "writer:project-one",
      projectName: "Novel One",
      writerProjectId: "project-one",
    },
    agency: {
      agencyId: "agency-one",
      name: "Example Literary",
      matchMethod: "canonical_id",
      confidence: "high",
    },
    counts: {
      sameProjectActive: 1,
      sameProjectTerminal: 0,
      otherProjectActive: 0,
      otherProjectTerminal: 0,
    },
    records: [],
    liveDataStatus: "available",
    ...overrides,
  };
}

function loadRoute({ composerGuard = true, guardResult = guard() } = {}) {
  const calls = { create: [], guard: [] };
  const route = compileTypeScriptModule("app/api/message-threads/route.ts", {
    "@clerk/nextjs/server": { auth: async () => ({ userId: "writer-one" }) },
    "next/server": {
      NextResponse: { json: (body, init) => Response.json(body, init) },
    },
    "@/app/utils/message-thread-data": {
      createWriterMessageThread: async (input) => {
        calls.create.push(input);
        return { status: "success", threadId: "thread-one" };
      },
      getWriterMessageThreadsData: async () => null,
    },
    "@/app/api/message-threads/_route-utils": {
      messageRouteErrorResponse: (error, fallback) =>
        Response.json(
          { status: "error", message: error?.message || fallback },
          { status: error?.status || 500 },
        ),
      parseMessageThreadFilters: () => ({}),
      readMessageJsonBody: async (request) => request.json(),
    },
    "@/app/utils/query-safety/agency-guard.server": {
      AgencyGuardServiceError: MockAgencyGuardServiceError,
      getAgencyGuardForUser: async (input) => {
        calls.guard.push(input);
        if (guardResult instanceof Error) throw guardResult;
        return guardResult;
      },
    },
    "@/app/utils/query-safety/feature-flags.server": {
      getQuerySafetyFeatureFlags: () => ({ composerGuard }),
    },
  });
  return { calls, route };
}

function request(safetyAcknowledgement) {
  return new Request("https://app.example.test/api/message-threads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      projectId: "project-one",
      agentId: "saved-row-one",
      subject: "Query: Novel One",
      body: "Dear Agent,",
      safetyAcknowledgement,
    }),
  });
}

test("warning and possible-match results require the current guard version", async () => {
  for (const status of ["warning", "possible_match"]) {
    const { calls, route } = loadRoute({ guardResult: guard({ status }) });

    for (const acknowledgement of [undefined, { resultVersion: "stale" }]) {
      const response = await route.POST(request(acknowledgement));
      const body = await response.json();
      assert.equal(response.status, 409);
      assert.equal(body.code, "AGENCY_GUARD_CONFIRMATION_REQUIRED");
      assert.equal(body.agencyGuard.resultVersion, "query-safety-v1:current");
    }

    assert.equal(calls.create.length, 0);
  }
});

test("current deliberate acknowledgement creates the thread without draft mutation", async () => {
  const { calls, route } = loadRoute();
  const response = await route.POST(
    request({ resultVersion: "query-safety-v1:current" }),
  );

  assert.equal(response.status, 201);
  assert.equal((await response.json()).threadId, "thread-one");
  assert.deepEqual(JSON.parse(JSON.stringify(calls.create)), [
    {
      agentId: "saved-row-one",
      body: "Dear Agent,",
      routeProjectId: "project-one",
      subject: "Query: Novel One",
    },
  ]);
  assert.equal(calls.guard[0].userId, "writer-one");
  assert.equal(calls.guard[0].input.candidateRecordId, "saved-row-one");
});

test("unavailable guard requires a deliberate unavailable acknowledgement", async () => {
  const unavailable = new MockAgencyGuardServiceError(
    "Agency history unavailable.",
    503,
    "AGENCY_GUARD_UNAVAILABLE",
  );
  const blocked = loadRoute({ guardResult: unavailable });
  const blockedResponse = await blocked.route.POST(request());
  assert.equal(blockedResponse.status, 503);
  assert.equal(blocked.calls.create.length, 0);

  const accepted = loadRoute({ guardResult: unavailable });
  const acceptedResponse = await accepted.route.POST(
    request({ unavailableAccepted: true }),
  );
  assert.equal(acceptedResponse.status, 201);
  assert.equal(accepted.calls.create.length, 1);
});

test("clear/history results and a disabled composer guard do not add friction", async () => {
  for (const options of [
    { guardResult: guard({ status: "clear" }) },
    { guardResult: guard({ status: "history" }) },
    { composerGuard: false },
  ]) {
    const { calls, route } = loadRoute(options);
    const response = await route.POST(request());
    assert.equal(response.status, 201);
    assert.equal(calls.create.length, 1);
  }
});
