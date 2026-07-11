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

function loadMessageTypes() {
  const filePath = resolve(repositoryRoot, "app/utils/message-types.ts");
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

const { queryStatusUnlocksWriterReply } = loadMessageTypes();

test("positive agent query statuses unlock writer replies", () => {
  for (const status of [
    "manuscript_requested",
    "manuscript_under_review",
    "offer_of_representation",
  ]) {
    assert.equal(queryStatusUnlocksWriterReply(status), true, status);
  }
});

test("initial and negative query statuses do not unlock writer replies", () => {
  for (const status of [
    "query_sent",
    "query_viewed",
    "rejected",
    "closed_no_response",
    "unknown",
  ]) {
    assert.equal(queryStatusUnlocksWriterReply(status), false, status);
  }
});
