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

function loadProjectScope() {
  const filePath = resolve(repositoryRoot, "app/utils/project-scope.ts");
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
    exports: compiledModule.exports,
    module: compiledModule,
    require(specifier) {
      if (specifier === "@/app/constants") {
        return { DEFAULT_PROJECT_NAME: "Untitled Project" };
      }
      return require(specifier);
    },
  });

  vm.runInContext(output, context, { filename: filePath });
  return compiledModule.exports;
}

const {
  getProjectScope,
  isSameProjectScope,
  savedRecordMatchesProjectScope,
} = loadProjectScope();

test("canonical writer project IDs take precedence and remain case-sensitive", () => {
  assert.deepEqual(
    { ...getProjectScope({ writerProjectId: "  Project-A  ", projectName: " My Book " }) },
    {
      key: "writer:Project-A",
      writerProjectId: "Project-A",
      projectName: "My Book",
    },
  );
  assert.equal(
    isSameProjectScope(
      { writerProjectId: "Project-A", projectName: "One" },
      { writerProjectId: "project-a", projectName: "One" },
    ),
    false,
  );
});

test("legacy name scopes trim edges, lowercase the key, and preserve display case", () => {
  assert.deepEqual(
    { ...getProjectScope({ writerProjectId: "  ", projectName: "  MY Book  " }) },
    {
      key: "name:my book",
      writerProjectId: null,
      projectName: "MY Book",
    },
  );
  assert.equal(
    isSameProjectScope(
      { projectName: "My Book" },
      { projectName: " my book " },
    ),
    true,
  );
});

test("blank project identity uses the exact database default", () => {
  assert.deepEqual({ ...getProjectScope({ projectName: " \t " }) }, {
    key: "name:untitled project",
    writerProjectId: null,
    projectName: "Untitled Project",
  });
  assert.deepEqual({ ...getProjectScope() }, {
    key: "name:untitled project",
    writerProjectId: null,
    projectName: "Untitled Project",
  });
});

test("scope normalization preserves internal whitespace like the unique index", () => {
  assert.equal(
    getProjectScope({ projectName: "My  Book" }).key,
    "name:my  book",
  );
  assert.notEqual(
    getProjectScope({ projectName: "My  Book" }).key,
    getProjectScope({ projectName: "My Book" }).key,
  );
});

test("legacy compatibility matching is explicit and does not weaken exact equality", () => {
  const legacyRecord = { projectName: "My Book", writerProjectId: null };
  const canonicalTarget = {
    projectName: "my book",
    writerProjectId: "project-1",
  };

  assert.equal(isSameProjectScope(legacyRecord, canonicalTarget), false);
  assert.equal(
    savedRecordMatchesProjectScope(legacyRecord, canonicalTarget),
    true,
  );
  assert.equal(
    savedRecordMatchesProjectScope(
      { projectName: "My Book", writerProjectId: "project-2" },
      canonicalTarget,
    ),
    false,
  );
});
