import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

function setup() {
  const listeners = new Map();
  const workers = [];
  class Worker {
    terminated = false;
    messages = [];
    constructor() { workers.push(this); }
    terminate() { this.terminated = true; }
    postMessage(message) {
      if (this.terminated) return;
      this.messages.push(message);
      if (message.type === "START_POLLING") {
        this.onmessage({ data: {
          type: "SPREADSHEET_READY",
          downloadUrl: `https://example.test/${message.taskId}.xlsx`,
        } });
      }
    }
  }
  const source = readFileSync(new URL("../app/(app)/workers/sheet-worker-manager.ts", import.meta.url), "utf8")
    .replaceAll("import.meta.url", '"https://example.test/manager.js"');
  const output = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
  } }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(output, {
    module, exports: module.exports, URL, Worker, console,
    window: { addEventListener(event, handler) { listeners.set(event, handler); } },
  });
  return { manager: module.exports, workers, dispatch: (event) => listeners.get(event)?.() };
}

test("download beforeunload does not prevent subsequent filtered exports", () => {
  const { manager, dispatch, workers } = setup();
  const urls = [];
  manager.startSheetPolling("all", url => urls.push(url));
  // A download can fire beforeunload while leaving this document alive.
  dispatch("beforeunload");
  manager.stopSheetPolling();
  manager.startSheetPolling("filtered", url => urls.push(url));
  assert.deepEqual(urls, ["https://example.test/all.xlsx", "https://example.test/filtered.xlsx"]);
  assert.equal(workers[0].terminated, false);
});

test("stopping polling sends cancellation and clears its callback", () => {
  const { manager, workers } = setup();
  const urls = [];
  manager.startSheetPolling("first", url => urls.push(url));
  manager.stopSheetPolling();
  workers[0].onmessage({ data: { type: "SPREADSHEET_READY", downloadUrl: "stale" } });
  assert.deepEqual(urls, ["https://example.test/first.xlsx"]);
  assert.equal(workers[0].messages.at(-1).type, "STOP_POLLING");
});
