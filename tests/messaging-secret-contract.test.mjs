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

const requiredEnvironment = {
  APP_ENV: "dev",
  STRIPE_DEV_MONTHLY_PRICE_ID: "price_dev_monthly",
  STRIPE_DEV_YEARLY_PRICE_ID: "price_dev_yearly",
  STRIPE_PROD_MONTHLY_PRICE_ID: "price_prod_monthly",
  STRIPE_PROD_YEARLY_PRICE_ID: "price_prod_yearly",
  STRIPE_SECRET_KEY_DEV: "sk_test_dev",
  STRIPE_SECRET_KEY_PROD: "sk_test_prod",
  STRIPE_WEBHOOK_SECRET_DEV: "whsec_dev",
  STRIPE_WEBHOOK_SECRET_PROD: "whsec_prod",
  WQH_DEV_API_URL: "https://dev-api.example.test",
  WQH_PROD_API_URL: "https://api.example.test",
};

function compileTypeScriptModule(
  relativePath,
  {
    environment = requiredEnvironment,
    fetchImplementation = globalThis.fetch,
    requireModule,
    transform,
  } = {},
) {
  const filePath = resolve(repositoryRoot, relativePath);
  const originalSource = readFileSync(filePath, "utf8");
  const source = transform ? transform(originalSource) : originalSource;
  const output = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: filePath,
  }).outputText;

  const module = { exports: {} };
  const context = vm.createContext({
    Buffer,
    Headers,
    Request,
    Response,
    URL,
    URLSearchParams,
    console,
    exports: module.exports,
    fetch: fetchImplementation,
    module,
    process: { env: { ...environment } },
    require: requireModule ?? require,
    setTimeout,
  });
  vm.runInContext(output, context, { filename: filePath });

  return { exports: module.exports, context };
}

function loadConfig(messagingSecret) {
  const environment = { ...requiredEnvironment };
  if (messagingSecret !== undefined) {
    environment.WQH_MESSAGING_API_SECRET = messagingSecret;
  }
  return compileTypeScriptModule("lib/config.ts", { environment }).exports;
}

test("messaging secret is optional and blank values normalize to undefined", () => {
  assert.equal(loadConfig().getWqhMessagingApiSecret(), undefined);
  assert.equal(loadConfig("").getWqhMessagingApiSecret(), undefined);
  assert.equal(loadConfig("   ").getWqhMessagingApiSecret(), undefined);
});

test("configured messaging secret is trimmed", () => {
  assert.equal(
    loadConfig("  configured-secret  ").getWqhMessagingApiSecret(),
    "configured-secret",
  );
});

function loadMessageFetch({ secret, fetchImplementation }) {
  const emptyModule = new Proxy(
    {},
    {
      get: () => () => undefined,
    },
  );

  return compileTypeScriptModule("app/utils/message-thread-data.ts", {
    fetchImplementation,
    requireModule(specifier) {
      if (specifier === "server-only") return {};
      if (specifier === "crypto") return require("node:crypto");
      if (specifier === "@/lib/config") {
        return {
          getWqhApiUrl: () => "https://api.example.test",
          getWqhMessagingApiSecret: () => secret,
        };
      }
      return emptyModule;
    },
    transform(source) {
      const transformed = source.replace(
        "function fetchWqhMessageApi(",
        "export function fetchWqhMessageApi(",
      );
      assert.notEqual(
        transformed,
        source,
        "fetchWqhMessageApi declaration could not be exposed to the test",
      );
      return transformed;
    },
  }).exports.fetchWqhMessageApi;
}

test("messaging requests omit the service header when no secret is configured", async () => {
  let capturedRequest;
  const fetchImplementation = async (url, init) => {
    capturedRequest = { init, url };
    return new Response(null, { status: 204 });
  };
  const fetchWqhMessageApi = loadMessageFetch({
    secret: undefined,
    fetchImplementation,
  });

  await fetchWqhMessageApi("https://api.example.test/message-threads", {
    headers: { "X-Existing-Header": "kept" },
  });

  assert.equal(capturedRequest.url, "https://api.example.test/message-threads");
  assert.equal(capturedRequest.init.headers.get("X-Existing-Header"), "kept");
  assert.equal(capturedRequest.init.headers.has("X-WQH-Messaging-Key"), false);
});

test("messaging requests send the service header when a secret is configured", async () => {
  let capturedRequest;
  const fetchWqhMessageApi = loadMessageFetch({
    secret: "configured-secret",
    fetchImplementation: async (url, init) => {
      capturedRequest = { init, url };
      return new Response(null, { status: 204 });
    },
  });

  await fetchWqhMessageApi("https://api.example.test/message-threads");

  assert.equal(
    capturedRequest.init.headers.get("X-WQH-Messaging-Key"),
    "configured-secret",
  );
});
