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

function compileTypeScriptModule(relativePath, { fetchImplementation, modules }) {
  const filePath = resolve(repositoryRoot, relativePath);
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
    AbortController,
    Headers,
    Request,
    Response,
    URL,
    URLSearchParams,
    console,
    exports: compiledModule.exports,
    fetch: fetchImplementation ?? globalThis.fetch,
    module: compiledModule,
    process,
    require(specifier) {
      if (specifier === "server-only") return {};
      if (Object.hasOwn(modules ?? {}, specifier)) return modules[specifier];
      return require(specifier);
    },
  });

  vm.runInContext(output, context, { filename: filePath });
  return compiledModule.exports;
}

function loadEnrollment(fetchImplementation) {
  return compileTypeScriptModule(
    "app/utils/agent-messaging-profile.server.ts",
    {
      fetchImplementation,
      modules: {
        "@/lib/config": {
          getWqhApiUrl: () => "https://api.example.test",
          getWqhMessagingApiSecret: () => "messaging-secret",
        },
      },
    },
  );
}

test("existing messaging enrollment is returned without backend calls", async () => {
  let fetchCount = 0;
  const { ensureAgentMessagingProfile } = loadEnrollment(async () => {
    fetchCount += 1;
    throw new Error("fetch should not run");
  });
  const profile = {
    profile_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    user_id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  };

  const result = await ensureAgentMessagingProfile({
    email: "agent@example.test",
    profile,
  });

  assert.equal(result, profile);
  assert.equal(fetchCount, 0);
});

test("new profiles reuse an existing backend user and are claimed immediately", async () => {
  const requests = [];
  const existingUserId = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
  const profileId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
  const { ensureAgentMessagingProfile } = loadEnrollment(async (url, init) => {
    requests.push({ url: String(url), init });

    if (String(url).includes("/get-writer-projects")) {
      return Response.json({
        status: "success",
        writer_projects: [{ user_id: existingUserId }],
      });
    }

    return Response.json({
      status: "success",
      agent: { profile_id: profileId, user_id: existingUserId },
    });
  });

  const result = await ensureAgentMessagingProfile({
    email: "agent@example.test",
    profile: { profile_id: profileId, user_id: null },
  });

  assert.equal(result.user_id, existingUserId);
  assert.equal(requests.length, 2);
  assert.match(requests[0].url, /get-writer-projects\?email=agent%40example\.test/);
  assert.equal(
    requests[0].init.headers.get("X-WQH-Messaging-Key"),
    "messaging-secret",
  );
  assert.equal(new URL(requests[1].url).pathname, "/claim-agent-profile");
  assert.deepEqual(JSON.parse(requests[1].init.body), {
    email: "agent@example.test",
    profile_id: profileId,
    user_id: existingUserId,
  });
});

test("profile creation enrolls immediately and a 409 retry repairs enrollment", async () => {
  const profile = {
    legacy_agent_id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
    profile_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    user_id: null,
  };

  for (const createStatus of [201, 409]) {
    let fetchedExistingProfile = false;
    let enrolledProfile = false;
    const route = compileTypeScriptModule("app/api/create-agent-profile/route.ts", {
      fetchImplementation: async () =>
        createStatus === 201
          ? Response.json({ status: "success", agent: profile }, { status: 201 })
          : Response.json(
              { status: "error", message: "Profile already exists" },
              { status: 409 },
            ),
      modules: {
        "@clerk/nextjs/server": {
          auth: async () => ({ userId: "user_agent" }),
          currentUser: async () => ({
            primaryEmailAddress: { emailAddress: "agent@example.test" },
            emailAddresses: [],
          }),
        },
        "next/server": {
          NextResponse: { json: (body, init) => Response.json(body, init) },
        },
        "@/app/utils/agent-messaging-profile.server": {
          AgentMessagingProfileError: class extends Error {},
          ensureAgentMessagingProfile: async ({ profile: candidate }) => {
            enrolledProfile = true;
            return {
              ...candidate,
              user_id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
            };
          },
          fetchAgentMessagingProfileByLegacyId: async () => {
            fetchedExistingProfile = true;
            return profile;
          },
        },
        "@/lib/config": {
          getWqhApiUrl: () => "https://api.example.test",
          getWqhMessagingApiSecret: () => undefined,
        },
        "@/lib/clerk-metadata": {
          getAccountMetadata: () => ({ accountType: "agent" }),
        },
      },
    });
    const request = new Request("https://app.example.test/api/create-agent-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ legacy_agent_id: profile.legacy_agent_id }),
    });

    const response = await route.POST(request);
    const body = await response.json();

    assert.equal(response.status, createStatus === 201 ? 201 : 200);
    assert.equal(body.status, "success");
    assert.equal(enrolledProfile, true);
    assert.equal(fetchedExistingProfile, createStatus === 409);
  }
});
