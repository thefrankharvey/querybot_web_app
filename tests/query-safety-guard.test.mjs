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

function loadAgencyGuard() {
  const filePath = resolve(
    repositoryRoot,
    "app/utils/query-safety/agency-guard.ts",
  );
  const output = ts.transpileModule(readFileSync(filePath, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: filePath,
  }).outputText;
  const compiledModule = { exports: {} };
  const context = vm.createContext({
    URL,
    exports: compiledModule.exports,
    module: compiledModule,
    require,
  });

  vm.runInContext(output, context, { filename: filePath });
  return compiledModule.exports;
}

const {
  classifyAgencyQueryStage,
  createAgencyGuardResult,
  normalizeAgencyDomain,
  normalizeAgencyName,
  resolveAgencyMatch,
} = loadAgencyGuard();

function history(overrides = {}) {
  return {
    recordId: "row-history",
    indexId: "agent-history",
    agentName: "Agent History",
    agencyId: "agency-1",
    agencyName: "Example Literary Agency, LLC",
    agencyUrl: "https://www.exampleliterary.com/agents/history?utm=ignored",
    projectName: "My Book",
    projectScopeKey: "writer:project-1",
    columnName: "submitted-query",
    querySentDate: "2026-07-01",
    href: "/projects/project-1/dashboard",
    ...overrides,
  };
}

test("normalizes agency names, Unicode, suffixes, and reviewed domains", () => {
  assert.equal(
    normalizeAgencyName("  Éxample & Co. Literary Agency, LLC "),
    "example and co",
  );
  assert.equal(
    normalizeAgencyDomain(
      "HTTPS://WWW.ExampleLiterary.com/agents/a?utm_source=test",
    ),
    "exampleliterary.com",
  );
  assert.equal(
    normalizeAgencyDomain("https://querymanager.com/query/Example"),
    null,
  );
});

test("never promotes name or domain fallback to canonical confidence", () => {
  assert.deepEqual(
    JSON.parse(JSON.stringify(resolveAgencyMatch(
      { agencyName: "Example Literary", agencyUrl: "example.com/a" },
      { agencyName: "Example Agency", agencyUrl: "https://www.example.com/b" },
    ))),
    {
      agencyId: null,
      name: "Example Literary",
      matchMethod: "domain",
      confidence: "medium",
    },
  );

  assert.equal(
    resolveAgencyMatch(
      { agencyName: "Writers House" },
      { agencyName: "Writer House" },
    ).confidence,
    "none",
  );
});

test("classifies manual and live query lifecycle conservatively", () => {
  assert.equal(
    classifyAgencyQueryStage({ columnName: "agents-to-research" }),
    "research",
  );
  assert.equal(
    classifyAgencyQueryStage({ columnName: "submitted-query" }),
    "active_query",
  );
  assert.equal(
    classifyAgencyQueryStage({ columnName: "pages-requested" }),
    "active_material",
  );
  assert.equal(
    classifyAgencyQueryStage({
      columnName: "agents-to-research",
      querySentDate: "2026-07-01",
    }),
    "unknown_sent",
  );
  assert.equal(
    classifyAgencyQueryStage({
      columnName: "submitted-query",
      liveStatus: "offer_of_representation",
    }),
    "terminal_offer",
  );
});

test("canonical same-project active history produces a warning", () => {
  const result = createAgencyGuardResult({
    candidate: {
      agencyId: "agency-1",
      agencyName: "Example Literary",
    },
    candidateRecordId: "candidate-row",
    history: [history()],
    scopeKey: "writer:project-1",
  });

  assert.equal(result.status, "warning");
  assert.equal(result.agency.confidence, "high");
  assert.equal(result.counts.sameProjectActive, 1);
  assert.equal(result.records[0].stage, "active_query");
  assert.match(result.resultVersion, /^query-safety-v1:/);
});

test("terminal and other-project canonical history is informational", () => {
  const result = createAgencyGuardResult({
    candidate: { agencyId: "agency-1", agencyName: "Example Literary" },
    history: [
      history({
        columnName: "rejected",
        rejectedDate: "2026-07-15",
      }),
      history({
        recordId: "other-project-row",
        projectScopeKey: "writer:project-2",
      }),
    ],
    scopeKey: "writer:project-1",
  });

  assert.equal(result.status, "history");
  assert.deepEqual(JSON.parse(JSON.stringify(result.counts)), {
    sameProjectActive: 0,
    sameProjectTerminal: 1,
    otherProjectActive: 1,
    otherProjectTerminal: 0,
  });
});

test("fallback matches disclose uncertainty and canonical matches exclude fallback collisions", () => {
  const possible = createAgencyGuardResult({
    candidate: { agencyName: "Example Literary" },
    history: [history({ agencyId: null })],
    scopeKey: "writer:project-1",
  });
  assert.equal(possible.status, "possible_match");
  assert.equal(possible.agency.confidence, "medium");

  const canonical = createAgencyGuardResult({
    candidate: { agencyId: "agency-1", agencyName: "Example Literary" },
    history: [
      history(),
      history({
        recordId: "fallback-collision",
        agencyId: null,
        agencyName: "Example Literary",
      }),
    ],
    scopeKey: "writer:project-1",
  });
  assert.equal(canonical.status, "warning");
  assert.deepEqual(
    Array.from(canonical.records, (record) => record.recordId),
    ["row-history"],
  );
});

test("research rows and the candidate saved row are excluded", () => {
  const result = createAgencyGuardResult({
    candidate: { agencyId: "agency-1", agencyName: "Example Literary" },
    candidateRecordId: "candidate-row",
    history: [
      history({ recordId: "candidate-row" }),
      history({
        recordId: "research-row",
        columnName: "agents-to-research",
        querySentDate: null,
      }),
    ],
    scopeKey: "writer:project-1",
  });

  assert.equal(result.status, "clear");
  assert.equal(result.records.length, 0);
});
