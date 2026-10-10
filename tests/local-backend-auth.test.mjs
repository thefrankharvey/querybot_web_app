import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import test from "node:test";

const require = createRequire(import.meta.url);
const ts = require("typescript");
function load(path, env = {}, mocks = {}, globals = {}) {
  const module = { exports: {} };
  const code = ts.transpileModule(readFileSync(new URL(`../${path}`, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(code, {
    module, exports: module.exports, URL, Response, AbortController, setTimeout, clearTimeout,
    console, process: { env },
    require: (name) => name === "server-only" ? {} : Object.hasOwn(mocks, name) ? mocks[name] : require(name),
    ...globals,
  });
  return module.exports;
}
const enabled = {
  NODE_ENV: "development", WQH_LOCAL_BACKEND_TESTING: "true",
  WQH_VOCAB_WRITE_TOKEN: " local-test-token ",
};

test("vocabulary write token is restricted to explicit local development", () => {
  for (const endpoint of ["http://localhost:10000/create-trait", "http://127.0.0.1:10000/create-trait", "http://[::1]:10000/create-trait"]) {
    const helper = load("lib/wqh-local-backend-auth.ts", enabled);
    assert.equal(helper.getLocalVocabularyWriteHeaders(endpoint).Authorization, "Bearer local-test-token");
  }
  for (const [env, endpoint] of [
    [{ ...enabled, NODE_ENV: "production" }, "http://localhost:10000/create-trait"],
    [{ ...enabled, WQH_LOCAL_BACKEND_TESTING: "false" }, "http://localhost:10000/create-trait"],
    [{ ...enabled, WQH_VOCAB_WRITE_TOKEN: " " }, "http://localhost:10000/create-trait"],
    [enabled, "https://querybot-api.onrender.com/create-trait"],
    [enabled, "http://localhost.example.com/create-trait"],
    [enabled, "file://localhost/create-trait"],
    [enabled, "http://user:password@localhost/create-trait"],
    [enabled, "invalid URL"],
  ]) {
    assert.equal(Object.keys(load("lib/wqh-local-backend-auth.ts", env).getLocalVocabularyWriteHeaders(endpoint)).length, 0);
  }
});

test("signed-in trait creation forwards the server token and excludes browser credentials", async () => {
  const traits = load("lib/traits.ts");
  const calls = [];
  function route(userId, endpoint = "http://127.0.0.1:10000") {
    return load("app/api/traits/route.ts", {}, {
      "@clerk/nextjs/server": { auth: async () => ({ userId }) },
      "next/server": { NextResponse: { json: (body, init) => Response.json(body, init) } },
      "@/lib/config": { getWqhTraitsApiUrl: () => endpoint },
      "@/lib/traits": traits,
      "@/lib/wqh-local-backend-auth": load("lib/wqh-local-backend-auth.ts", enabled),
    }, { fetch: async (url, init) => { calls.push({ url, init }); return Response.json({ status: "success" }, { status: 201 }); } });
  }
  const request = () => ({ json: async () => ({ type: "theme", value: "Found Family", Authorization: "injected" }) });
  assert.equal((await route("writer").POST(request())).status, 201);
  assert.equal(calls[0].init.headers.Authorization, "Bearer local-test-token");
  assert.deepEqual(JSON.parse(calls[0].init.body), { type: "theme", value: "found-family" });
  assert.equal((await route(null).POST(request())).status, 401);
  assert.equal(calls.length, 1);
  await route("writer", "https://traits.example.test").POST(request());
  assert.equal(calls[1].init.headers.Authorization, undefined);
});
