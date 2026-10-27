import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import test from "node:test";
const require = createRequire(import.meta.url);
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
function load(path, mocks = {}) {
  const module = { exports: {} };
  const code = ts.transpileModule(readFileSync(new URL(`../${path}`, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  vm.runInNewContext(code, { module, exports: module.exports,
    require: (name) => Object.hasOwn(mocks, name) ? mocks[name] : require(name) });
  return module.exports;
}
const badge = load("app/components/fit-rating-badge.tsx", { "@/app/utils": { cn: (...values) => values.filter(Boolean).join(" ") } });
const { resultSetQuery } = load("lib/agent-search-v2.ts");

test("search badges retain their original labels and score thresholds", () => {
  for (const [score, rating, label] of [[4.9, "perfect", "Perfect Fit"], [3.2, "great", "Great Fit"], [2.7, "good", "Good Fit"], [null, "neutral", "Neutral Fit"]]) {
    assert.equal(badge.getFitRatingFromScore(score), rating);
    const html = renderToStaticMarkup(React.createElement(badge.FitRatingBadge, { rating }));
    assert.ok(html.includes(label));
  }
});

test("paging keeps its frozen token and changing filters starts a new result set", () => {
  assert.equal(resultSetQuery("result/token", false), "&result_set_id=result%2Ftoken");
  assert.equal(resultSetQuery("result/token", true), "");
  assert.equal(resultSetQuery(undefined, false), "");
});
