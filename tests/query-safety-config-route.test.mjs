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

function loadRoute({ userId = "writer-one", flags = {} } = {}) {
  const filePath = resolve(
    repositoryRoot,
    "app/api/query-safety/config/route.ts",
  );
  const output = ts.transpileModule(readFileSync(filePath, "utf8"), {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: filePath,
  }).outputText;
  const compiledModule = { exports: {} };
  const modules = {
    "@clerk/nextjs/server": { auth: async () => ({ userId }) },
    "next/server": {
      NextResponse: { json: (body, init) => Response.json(body, init) },
    },
    "@/app/utils/query-safety/feature-flags.server": {
      getQuerySafetyFeatureFlags: () => ({
        agencyHistory: true,
        queryRounds: true,
        manualReminders: true,
        researchRevisitSuggestion: true,
        queryCheckInSuggestion: true,
        noResponseReviewSuggestion: true,
        materialCheckInSuggestion: true,
        ...flags,
      }),
    },
  };
  const context = vm.createContext({
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

test("query-safety config authenticates and always returns no-store", async () => {
  const response = await loadRoute({ userId: null }).GET();
  assert.equal(response.status, 401);
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  assert.equal((await response.json()).code, "UNAUTHORIZED");
});

test("query-safety config exposes only UI rollout controls", async () => {
  const response = await loadRoute({
    flags: {
      queryRounds: false,
      noResponseReviewSuggestion: false,
    },
  }).GET();
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  assert.deepEqual(body, {
    features: {
      agencyHistory: true,
      queryRounds: false,
      manualReminders: true,
      suggestionRules: {
        "research-revisit-v1": true,
        "query-check-in-30-v1": true,
        "no-response-review-90-v1": false,
        "material-check-in-30-v1": true,
      },
    },
  });
  assert.equal("dueReminderProcessor" in body.features, false);
  assert.equal("composerGuard" in body.features, false);
});
