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

function loadQueryRounds() {
  const filePath = resolve(repositoryRoot, "app/utils/query-rounds.ts");
  const output = ts.transpileModule(readFileSync(filePath, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: filePath,
  }).outputText;
  const compiledModule = { exports: {} };
  const context = vm.createContext({
    exports: compiledModule.exports,
    module: compiledModule,
    require,
  });

  vm.runInContext(output, context, { filename: filePath });
  return compiledModule.exports;
}

const rounds = loadQueryRounds();

test("round selections produce only valid mutually exclusive persisted states", () => {
  assert.deepEqual(
    { ...rounds.getQueryRoundState("round-1") },
    { queryRound: 1, queryOnHold: false },
  );
  assert.deepEqual(
    { ...rounds.getQueryRoundState("round-3") },
    { queryRound: 3, queryOnHold: false },
  );
  assert.deepEqual(
    { ...rounds.getQueryRoundState("hold") },
    { queryRound: null, queryOnHold: true },
  );
  assert.deepEqual(
    { ...rounds.getQueryRoundState("unassigned") },
    { queryRound: null, queryOnHold: false },
  );
  assert.equal(rounds.isQueryRoundSelection("round-4"), false);
  assert.equal(rounds.isQueryRoundSelection(2), false);
});

test("round filtering distinguishes Hold from Unassigned", () => {
  const rows = [
    { id: "round", queryRound: 2, queryOnHold: false },
    { id: "hold", queryRound: null, queryOnHold: true },
    { id: "unassigned", queryRound: null, queryOnHold: false },
  ];

  assert.deepEqual(
    rows.filter((row) => rounds.matchesQueryRoundFilter(row, "hold")).map((row) => row.id),
    ["hold"],
  );
  assert.deepEqual(
    rows
      .filter((row) => rounds.matchesQueryRoundFilter(row, "unassigned"))
      .map((row) => row.id),
    ["unassigned"],
  );
});

test("round sorting is stable and reverses the configured state order", () => {
  const rows = [
    { id: "unassigned", queryRound: null, queryOnHold: false },
    { id: "round-2-a", queryRound: 2, queryOnHold: false },
    { id: "hold", queryRound: null, queryOnHold: true },
    { id: "round-1", queryRound: 1, queryOnHold: false },
    { id: "round-2-b", queryRound: 2, queryOnHold: false },
  ];

  assert.deepEqual(
    rounds.sortByQueryRound(rows, "ASC").map((row) => row.id),
    ["round-1", "round-2-a", "round-2-b", "hold", "unassigned"],
  );
  assert.deepEqual(
    rounds.sortByQueryRound(rows, "DESC").map((row) => row.id),
    ["unassigned", "hold", "round-2-a", "round-2-b", "round-1"],
  );
});

test("rollback restores the prior state only while its optimistic value is current", () => {
  const previous = { queryRound: 1, queryOnHold: false };
  const optimistic = { queryRound: null, queryOnHold: true };
  const original = [{ id: "record-a", ...previous }];
  const updated = rounds.applyQueryRoundState(
    original,
    "record-a",
    optimistic,
  );

  assert.deepEqual(
    { ...rounds.rollbackQueryRoundState(updated, "record-a", optimistic, previous)[0] },
    { id: "record-a", ...previous },
  );

  const superseded = [{ id: "record-a", queryRound: 3, queryOnHold: false }];
  assert.deepEqual(
    { ...rounds.rollbackQueryRoundState(superseded, "record-a", optimistic, previous)[0] },
    superseded[0],
  );
});
