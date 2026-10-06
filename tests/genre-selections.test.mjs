// GSR-028: additional genres are sent losslessly and come back when a search is restored.
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

function loadModule(path, modules = {}) {
  const filename = resolve(repositoryRoot, path);
  const output = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { esModuleInterop: true, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    fileName: filename,
  }).outputText;
  const compiledModule = { exports: {} };
  vm.runInNewContext(output, {
    module: compiledModule, exports: compiledModule.exports, console,
    require: (specifier) => (Object.hasOwn(modules, specifier) ? modules[specifier] : require(specifier)),
  }, { filename });
  return compiledModule.exports;
}

const { buildGenreSelections } = loadModule("app/utils.ts", { "./(app)/context/agent-matches-context": {} });
const { normalizeWriterProjectForSmartMatch } = loadModule("app/utils/smart-match-restore.ts");
// Values built inside the sandbox come from another realm; compare plain copies.
const plain = (value) => (value === undefined ? undefined : JSON.parse(JSON.stringify(value)));

test("a single-genre search sends no genres list, so the request is unchanged", () => {
  assert.equal(buildGenreSelections("romance", []), undefined);
  assert.equal(buildGenreSelections("romance", ["Romance", "  "]), undefined);
});

test("every selected genre is sent, primary first, without duplicates", () => {
  assert.deepEqual(plain(buildGenreSelections("romance", ["fantasy", "Fantasy", " horror ", "ROMANCE"])),
    ["romance", "fantasy", "horror"]);
});

test("no primary genre means no list (the form requires a primary genre)", () => {
  assert.equal(buildGenreSelections("  ", ["fantasy"]), undefined);
});

test("a restored search brings its additional genres back, minus the primary", () => {
  const form = normalizeWriterProjectForSmartMatch({ genre: "romance", genres: ["romance", "fantasy", "horror"] });
  assert.equal(form.genre, "romance");
  assert.deepEqual(plain(form.additional_genres), ["fantasy", "horror"]);
  const fromJson = normalizeWriterProjectForSmartMatch({ genre: "romance", genres: '["Romance","fantasy"]' });
  assert.deepEqual(plain(fromJson.additional_genres), ["fantasy"]);
});

test("projects saved before multi-genre restore with no additional genres", () => {
  assert.deepEqual(plain(normalizeWriterProjectForSmartMatch({ genre: "romance" }).additional_genres), []);
});
