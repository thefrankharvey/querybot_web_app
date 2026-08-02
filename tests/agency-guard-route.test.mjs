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

function clearGuard() {
  return {
    contractVersion: "query-safety-v1",
    resultVersion: "query-safety-v1:clear",
    status: "clear",
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
      sameProjectActive: 0,
      sameProjectTerminal: 0,
      otherProjectActive: 0,
      otherProjectTerminal: 0,
    },
    records: [],
    liveDataStatus: "available",
  };
}

function loadRoute({
  enabled = true,
  rateLimit = { allowed: true, retryAfterSeconds: 0 },
  service = async () => clearGuard(),
  userId = "writer-one",
} = {}) {
  let capturedCall = null;
  const route = compileTypeScriptModule(
    "app/api/query-safety/agency-guard/route.ts",
    {
      "@clerk/nextjs/server": {
        auth: async () => ({ userId }),
      },
      "next/server": {
        NextResponse: { json: (body, init) => Response.json(body, init) },
      },
      "@/app/utils/query-safety/agency-guard.server": {
        AgencyGuardServiceError: MockAgencyGuardServiceError,
        getAgencyGuardForUser: async (call) => {
          capturedCall = call;
          return service(call);
        },
      },
      "@/app/utils/query-safety/feature-flags.server": {
        getQuerySafetyFeatureFlags: () => ({ agencyHistory: enabled }),
      },
      "@/app/utils/query-safety/rate-limit.server": {
        checkQuerySafetyRateLimit: () => rateLimit,
      },
    },
  );

  return { getCapturedCall: () => capturedCall, route };
}

function request(body) {
  return new Request("https://app.example.test/api/query-safety/agency-guard", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

test("feature rollback and authentication fail closed with no-store", async () => {
  const disabled = loadRoute({ enabled: false });
  const disabledResponse = await disabled.route.POST(request({}));
  assert.equal(disabledResponse.status, 404);
  assert.equal((await disabledResponse.json()).code, "FEATURE_DISABLED");
  assert.equal(disabledResponse.headers.get("cache-control"), "private, no-store");

  const unauthorized = loadRoute({ userId: null });
  const unauthorizedResponse = await unauthorized.route.POST(request({}));
  assert.equal(unauthorizedResponse.status, 401);
  assert.equal((await unauthorizedResponse.json()).code, "UNAUTHORIZED");
  assert.equal(unauthorized.getCapturedCall(), null);
});

test("strict input validation rejects unknown keys and invalid field types", async () => {
  const { route } = loadRoute();

  for (const body of [
    { candidateRecordId: "record-one", user_id: "spoofed" },
    { candidateRecordId: 123 },
    { includeAllProjects: "true" },
  ]) {
    const response = await route.POST(request(body));
    assert.equal(response.status, 400);
    assert.equal((await response.json()).code, "INVALID_PAYLOAD");
  }
});

test("authenticated request bursts are rate limited with retry guidance", async () => {
  const { getCapturedCall, route } = loadRoute({
    rateLimit: { allowed: false, retryAfterSeconds: 17 },
  });
  const response = await route.POST(request({ candidateRecordId: "record-one" }));

  assert.equal(response.status, 429);
  assert.equal(response.headers.get("retry-after"), "17");
  assert.equal((await response.json()).code, "RATE_LIMITED");
  assert.equal(getCapturedCall(), null);
});

test("owned guard input is bound to the authenticated user and returns no-store", async () => {
  const { getCapturedCall, route } = loadRoute();
  const response = await route.POST(
    request({
      candidateRecordId: "record-one",
      candidateIndexId: "agent-one",
      writerProjectId: "project-one",
      includeAllProjects: false,
    }),
  );
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  assert.equal(body.status, "clear");
  assert.deepEqual(JSON.parse(JSON.stringify(getCapturedCall())), {
    input: {
      candidateRecordId: "record-one",
      candidateIndexId: "agent-one",
      writerProjectId: "project-one",
      includeAllProjects: false,
    },
    userId: "writer-one",
  });
});

test("stable service errors preserve status/code without leaking internals", async () => {
  const { route } = loadRoute({
    service: async () => {
      throw new MockAgencyGuardServiceError(
        "Saved agent not found.",
        404,
        "NOT_FOUND",
      );
    },
  });
  const response = await route.POST(request({ candidateRecordId: "other-row" }));

  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), {
    code: "NOT_FOUND",
    error: "Saved agent not found.",
  });
});
