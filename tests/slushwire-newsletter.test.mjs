import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function loadSchedule() {
  const filePath = resolve(root, "lib/blog-schedule.ts");
  const output = ts.transpileModule(readFileSync(filePath, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    fileName: filePath,
  }).outputText;
  const mod = { exports: {} };
  vm.runInNewContext(output, { exports: mod.exports, module: mod, process: { env: { NODE_ENV: "production" } }, Intl, Date });
  return mod.exports;
}

const s = loadSchedule();

test("newsletter issues publish at 00:00 New York on their Sunday (EDT)", () => {
  const { publishAt } = s.parsePublishInfo("slushwire-weekly-sunday-10-18-2026");
  assert.equal(publishAt.toISOString(), "2026-10-18T04:00:00.000Z");
  assert.equal(s.isBlogPublished("slushwire-weekly-sunday-10-18-2026", null, new Date("2026-10-18T12:00:00Z")), true);
  assert.equal(s.isBlogPublished("slushwire-weekly-sunday-10-18-2026", null, new Date("2026-10-18T03:59:00Z")), false);
});

test("newsletter gate is DST-correct (EST)", () => {
  const { publishAt } = s.parsePublishInfo("slushwire-weekly-sunday-12-06-2026");
  assert.equal(publishAt.toISOString(), "2026-12-06T05:00:00.000Z");
});

test("daily newsletter slugs publish at 00:00 New York on the send date", () => {
  const slug = "slushwire-friday-10-23-2026";
  assert.equal(s.parsePublishInfo(slug).publishAt.toISOString(), "2026-10-23T04:00:00.000Z");
  assert.equal(s.isBlogPublished(slug, null, new Date("2026-10-23T04:00:00Z")), true);
  assert.equal(s.isBlogPublished(slug, null, new Date("2026-10-23T03:59:00Z")), false);
});

test("daily newsletter gate is DST-correct (EST)", () => {
  assert.equal(s.parsePublishInfo("slushwire-friday-12-04-2026").publishAt.toISOString(), "2026-12-04T05:00:00.000Z");
});

test("non-weekday slushwire-named posts are regular posts", () => {
  assert.equal(s.parsePublishInfo("slushwire-tips-10-23-2026").publishAt.toISOString(), "2026-10-23T19:00:00.000Z");
  assert.equal(s.isNewsletterSlug("slushwire-tips-10-23-2026"), false);
  assert.equal(s.isNewsletterSlug("slushwire-friday-10-23-2026-am"), false);
});

test("regular posts keep the 15:00 / 18:00 slots", () => {
  assert.equal(s.parsePublishInfo("some-post-10-18-2026").publishAt.toISOString(), "2026-10-18T19:00:00.000Z");
  assert.equal(s.parsePublishInfo("some-post-10-18-2026-pm").publishAt.toISOString(), "2026-10-18T22:00:00.000Z");
});

test("drafts stay hidden", () => {
  assert.equal(s.isBlogPublished("slushwire-weekly-sunday-10-18-2026", { status: "draft" }, new Date("2026-10-19T00:00:00Z")), false);
});
