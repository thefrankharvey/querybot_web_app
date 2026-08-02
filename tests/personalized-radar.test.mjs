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

function compileTypeScriptModule(relativePath, { modules = {}, environment = {} } = {}) {
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
    AbortSignal,
    Buffer,
    Date,
    Headers,
    Map,
    Request,
    Response,
    Set,
    URL,
    URLSearchParams,
    console,
    exports: compiledModule.exports,
    fetch: modules.__fetch ?? fetch,
    module: compiledModule,
    process: { env: { ...environment } },
    require(specifier) {
      if (specifier === "server-only") return {};
      if (Object.hasOwn(modules, specifier)) return modules[specifier];
      return require(specifier);
    },
  });
  vm.runInContext(output, context, { filename: filePath });
  return compiledModule.exports;
}

const contracts = compileTypeScriptModule(
  "app/utils/personalized-radar/contracts.ts",
);
const validation = compileTypeScriptModule(
  "app/utils/personalized-radar/validation.ts",
  { modules: { "@/app/utils/personalized-radar/contracts": contracts } },
);
const entitlements = compileTypeScriptModule(
  "app/utils/personalized-radar/entitlements.server.ts",
  {
    modules: {
      "@/app/utils/personalized-radar/contracts": contracts,
      "@/lib/clerk-utils": { clerkClient: {} },
    },
  },
);
const sourceEvents = compileTypeScriptModule(
  "app/utils/personalized-radar/source-events.ts",
  { modules: { "@/app/utils/personalized-radar/contracts": contracts } },
);
const notificationValidation = compileTypeScriptModule(
  "app/utils/personalized-radar/notification-validation.ts",
);

function reopenedEvent(overrides = {}) {
  return {
    event_id: "evt_reopened_001",
    schema_version: "agent-change-v1",
    event_type: "submission_reopened",
    occurred_at: "2026-08-01T13:20:00.000Z",
    recorded_at: "2026-08-01T13:23:00.000Z",
    agent: {
      profile_id: "profile_123",
      index_id: "index_123",
      name: "Example Agent",
      agency_id: "agency_123",
      agency_name: "Example Literary",
    },
    headline: "Open to submissions",
    summary: "This agent is accepting submissions again.",
    source_url: "https://example.test/agents/example-agent",
    changed_fields: ["open_to_queries"],
    previous: { open_to_queries: "closed" },
    current: { open_to_queries: "open" },
    supersedes_event_id: null,
    ...overrides,
  };
}

test("free watches default to verified reopening alerts only", () => {
  const input = validation.parseCreateAgentWatchInput({
    indexId: "11111111-1111-4111-8111-111111111111",
    originAgentMatchId: "22222222-2222-4222-8222-222222222222",
    originSurface: "query_dashboard",
  });
  assert.deepEqual(JSON.parse(JSON.stringify(input)), {
    agentProfileId: null,
    indexId: "11111111-1111-4111-8111-111111111111",
    originAgentMatchId: "22222222-2222-4222-8222-222222222222",
    originSurface: "query_dashboard",
    eventTypes: ["submission_reopened"],
    inAppEnabled: true,
    emailDigestEnabled: false,
  });

  const free = entitlements.getRadarWatchCapabilities({
    isAuthenticated: true,
    isSubscribed: false,
  });
  assert.equal(free.maxActiveWatches, 5);
  assert.deepEqual([...free.allowedEventTypes], ["submission_reopened"]);
  assert.equal(free.emailDigest, false);
  validation.enforceWatchCapabilities(input, free);
});

test("premium categories and email are enforced server-side", () => {
  const input = validation.parseCreateAgentWatchInput({
    agentProfileId: "profile_123",
    eventTypes: ["submission_reopened", "agency_change"],
    inAppEnabled: true,
    emailDigestEnabled: true,
  });
  const free = entitlements.getRadarWatchCapabilities({
    isAuthenticated: true,
    isSubscribed: false,
  });
  assert.throws(
    () => validation.enforceWatchCapabilities(input, free),
    (error) => error.code === "RADAR_ENTITLEMENT_REQUIRED",
  );

  const premium = entitlements.getRadarWatchCapabilities({
    isAuthenticated: true,
    isSubscribed: true,
  });
  assert.equal(premium.maxActiveWatches, 250);
  assert.equal(premium.allowedEventTypes.length, 5);
  assert.equal(premium.emailDigest, true);
  validation.enforceWatchCapabilities(input, premium);
});

test("watch lookup is bounded, deduplicated, and never joins by name", () => {
  const input = validation.parseWatchLookupInput({
    agentKeys: [
      { indexId: "legacy_1" },
      { indexId: "legacy_1" },
      { agentProfileId: "profile_2", indexId: "legacy_2" },
    ],
  });
  assert.equal(input.length, 2);
  assert.equal(input[0].key, "index:legacy_1");
  assert.equal(input[1].key, "profile:profile_2");
  assert.throws(
    () => validation.parseWatchLookupInput({ agentKeys: [{ name: "Agent Name" }] }),
    /Unknown request field: name/,
  );
  assert.throws(
    () =>
      validation.parseWatchLookupInput({
        agentKeys: Array.from({ length: 101 }, (_, index) => ({
          indexId: `agent_${index}`,
        })),
      }),
    /at most 100/,
  );
});

test("migration freezes global uniqueness and atomic entitlement enforcement", () => {
  const migration = readFileSync(
    resolve(
      repositoryRoot,
      "supabase/migrations/20260802000000_personalized_radar_foundation.sql",
    ),
    "utf8",
  );
  assert.match(migration, /create table if not exists public\.agent_watches/);
  assert.match(migration, /agent_watches_active_profile_unique/);
  assert.match(migration, /agent_watches_active_index_unique/);
  assert.match(migration, /pg_advisory_xact_lock/);
  assert.match(migration, /RADAR_WATCH_LIMIT_REACHED/);
  assert.match(migration, /foreign key \(watch_id, user_id\)/);
  assert.match(migration, /on delete set null/);
  assert.match(migration, /notification_delivery_items/);
  assert.match(migration, /claim_radar_processor_lease/);
  assert.match(migration, /complete_radar_processor_run/);
  assert.match(migration, /quarantine_radar_event/);
  assert.match(migration, /revoke all on table public\.agent_watches from anon, authenticated/);
});

test("canonical source parsing rejects false reopenings and undeclared fields", () => {
  const parsed = sourceEvents.parseAgentChangeEvent(reopenedEvent());
  assert.equal(parsed.event_id, "evt_reopened_001");
  assert.equal(parsed.current.open_to_queries, "open");

  assert.throws(
    () =>
      sourceEvents.parseAgentChangeEvent(
        reopenedEvent({ previous: { open_to_queries: "open" } }),
      ),
    /verified transition/,
  );
  assert.throws(
    () =>
      sourceEvents.parseAgentChangeEvent(
        reopenedEvent({
          previous: { open_to_queries: "closed", email: "private@example.test" },
        }),
      ),
    /undeclared field/,
  );
  assert.throws(
    () => sourceEvents.parseAgentChangeEvent(reopenedEvent({ event_id: "bad id" })),
    /event_id is invalid/,
  );
});

test("watch matching uses stable IDs and selected event categories", () => {
  const event = sourceEvents.parseAgentChangeEvent(reopenedEvent());
  const baseWatch = {
    id: "11111111-1111-4111-8111-111111111111",
    agentProfileId: "profile_123",
    indexId: null,
    eventTypes: ["submission_reopened"],
  };
  assert.equal(sourceEvents.watchMatchesAgentChangeEvent(baseWatch, event), true);
  assert.equal(
    sourceEvents.watchMatchesAgentChangeEvent(
      { ...baseWatch, agentProfileId: "different", indexId: "different" },
      event,
    ),
    false,
  );
  assert.equal(
    sourceEvents.watchMatchesAgentChangeEvent(
      { ...baseWatch, eventTypes: ["agency_change"] },
      event,
    ),
    false,
  );
});

test("identity verification supports canonical profile IDs and legacy index IDs", async () => {
  const requested = [];
  const identity = compileTypeScriptModule(
    "app/utils/personalized-radar/identity.server.ts",
    {
      modules: {
        "@/app/utils/personalized-radar/contracts": contracts,
        "@/lib/config": { getWqhApiUrl: () => "https://api.example.test" },
        __fetch: async (url) => {
          const parsed = new URL(url);
          requested.push(`${parsed.pathname}?${parsed.searchParams}`);
          return parsed.pathname === "/get-agent-profile"
            ? Response.json({
                status: "success",
                agent: { profile_id: "11111111-1111-4111-8111-111111111111" },
              })
            : Response.json({
                status: "success",
                agent: { agent_id: "legacy_agent_1" },
              });
        },
      },
    },
  );

  assert.equal(
    await identity.verifyRadarAgentIdentity({
      agentProfileId: "11111111-1111-4111-8111-111111111111",
      indexId: null,
    }),
    true,
  );
  assert.equal(
    await identity.verifyRadarAgentIdentity({
      agentProfileId: null,
      indexId: "legacy_agent_1",
    }),
    true,
  );
  assert.deepEqual(requested, [
    "/get-agent-profile?lookup_by=profile_id&value=11111111-1111-4111-8111-111111111111",
    "/get-agent?lookup_by=id&value=legacy_agent_1",
  ]);
});

test("fanout deduplicates per user and respects entitlements and global opt-out", () => {
  const notifications = compileTypeScriptModule(
    "app/utils/personalized-radar/notifications.ts",
    { modules: { "@/app/utils/personalized-radar/contracts": contracts } },
  );
  const processor = compileTypeScriptModule(
    "app/utils/personalized-radar/process-events.server.ts",
    {
      modules: {
        "@/app/api/supabase/server": { createServerSupabase: () => null },
        "@/app/utils/personalized-radar/entitlements.server": {
          getRadarWatchCapabilitiesForUser: async () => null,
        },
        "@/app/utils/personalized-radar/contracts": contracts,
        "@/app/utils/personalized-radar/notifications": notifications,
        "@/app/utils/personalized-radar/source-events": sourceEvents,
        "@/lib/config": { getWqhApiUrl: () => "https://api.example.test" },
      },
    },
  );
  const event = sourceEvents.parseAgentChangeEvent(reopenedEvent());
  const watch = (id) => ({
    id,
    agentProfileId: "profile_123",
    indexId: null,
    eventTypes: ["submission_reopened"],
  });
  const watches = [
    watch("11111111-1111-4111-8111-111111111111"),
    watch("22222222-2222-4222-8222-222222222222"),
  ];
  const ownerByWatchId = new Map(watches.map(({ id }) => [id, "user_123"]));
  const capabilitiesByUser = new Map([
    ["user_123", { allowedEventTypes: ["submission_reopened"] }],
  ]);

  const enabled = processor.prepareWatchNotifications({
    events: [event],
    watches,
    capabilitiesByUser,
    disabledPreferenceUserIds: new Set(),
    watchOwnerById: ownerByWatchId,
  });
  assert.equal(enabled.notifications.length, 1);
  assert.equal(enabled.notifications[0].source_event_id, "evt_reopened_001");
  assert.equal(enabled.notifications[0].title, "Example Agent: Open to submissions");
  assert.match(enabled.notifications[0].summary, /^Example Literary — /);
  assert.equal(enabled.notifications[0].target_href, "/dispatch?scope=watched&eventId=evt_reopened_001");

  const disabled = processor.prepareWatchNotifications({
    events: [event],
    watches,
    capabilitiesByUser,
    disabledPreferenceUserIds: new Set(["user_123"]),
    watchOwnerById: ownerByWatchId,
  });
  assert.equal(disabled.notifications.length, 0);
  assert.equal(disabled.unmatched, 1);
});

test("notification filters, actions, and mark-all boundary fail closed", () => {
  assert.deepEqual(
    JSON.parse(
      JSON.stringify(
        notificationValidation.parseNotificationListFilters(
          new URLSearchParams("status=unread&limit=50"),
        ),
      ),
    ),
    { status: "unread", cursor: null, limit: 50 },
  );
  assert.throws(
    () =>
      notificationValidation.parseNotificationListFilters(
        new URLSearchParams("status=deleted"),
      ),
    /not supported/,
  );
  assert.deepEqual(
    JSON.parse(
      JSON.stringify(notificationValidation.parseNotificationAction({ action: "archive" })),
    ),
    { action: "archive" },
  );
  assert.equal(
    notificationValidation.parseMarkAllReadInput({
      before: "2026-08-01T12:00:00-04:00",
    }).before,
    "2026-08-01T16:00:00.000Z",
  );
  assert.throws(
    () => notificationValidation.parseMarkAllReadInput({ before: "not-a-date" }),
    /ISO-8601/,
  );
});

test("notification and watched-feed cursors are opaque and validated", () => {
  class RadarPersistenceError extends Error {}
  const notificationRepository = compileTypeScriptModule(
    "app/utils/personalized-radar/notification-repository.server.ts",
    {
      modules: {
        "@/app/api/supabase/server": { createServerSupabase: () => null },
        "@/app/utils/personalized-radar/notifications": {
          normalizeUserNotification: (value) => value,
        },
        "@/app/utils/personalized-radar/notification-validation": notificationValidation,
        "@/app/utils/personalized-radar/repository.server": { RadarPersistenceError },
      },
    },
  );
  const notificationCursor = notificationRepository.encodeNotificationCursor({
    createdAt: "2026-08-01T16:00:00.000Z",
    id: "11111111-1111-4111-8111-111111111111",
  });
  assert.deepEqual(
    JSON.parse(JSON.stringify(notificationRepository.decodeNotificationCursor(notificationCursor))),
    {
      createdAt: "2026-08-01T16:00:00.000Z",
      id: "11111111-1111-4111-8111-111111111111",
    },
  );
  assert.throws(() => notificationRepository.decodeNotificationCursor("not-a-cursor"));

  const dispatchCursorContract = compileTypeScriptModule(
    "app/utils/personalized-radar/dispatch-cursor.ts",
    {
    modules: {
      "@/app/utils/personalized-radar/source-events": sourceEvents,
    },
  });
  const dispatchCursor = dispatchCursorContract.encodeWatchedDispatchCursor({
    sourceCursor: "opaque-upstream",
    eventOffset: 17,
  });
  assert.deepEqual(
    JSON.parse(
      JSON.stringify(
        dispatchCursorContract.decodeWatchedDispatchCursor(dispatchCursor),
      ),
    ),
    { sourceCursor: "opaque-upstream", eventOffset: 17 },
  );
  assert.throws(() =>
    dispatchCursorContract.decodeWatchedDispatchCursor("not-a-cursor"),
  );
});

test("Radar list surfaces batch watch state and expose accessible toggles", () => {
  const hook = readFileSync(
    resolve(repositoryRoot, "app/hooks/use-agent-watches.tsx"),
    "utf8",
  );
  const dispatchFeed = readFileSync(
    resolve(repositoryRoot, "app/(writer-app)/dispatch/components/feed.tsx"),
    "utf8",
  );
  const watchButton = readFileSync(
    resolve(repositoryRoot, "app/components/personalized-radar/agent-watch-button.tsx"),
    "utf8",
  );
  const blipsCard = readFileSync(
    resolve(repositoryRoot, "app/components/blips-card.tsx"),
    "utf8",
  );
  assert.match(hook, /agentKeys: normalized\.map/);
  assert.match(dispatchFeed, /AgentWatchLookupProvider identities=/);
  assert.match(watchButton, /aria-pressed=/);
  assert.match(blipsCard, /Save this agent before adding them to Radar/);
});

test("in-app features default on while processors and every email stage default off", () => {
  const flags = compileTypeScriptModule(
    "app/utils/personalized-radar/feature-flags.server.ts",
  ).getRadarFeatureFlags();
  assert.equal(flags.watchCreation, true);
  assert.equal(flags.targetedDispatch, true);
  assert.equal(flags.notificationCenter, true);
  assert.equal(flags.fanoutProcessor, false);
  assert.equal(flags.emailPreferences, false);
  assert.equal(flags.emailScheduler, false);
  assert.equal(flags.providerSend, false);
});

test("watch routes authenticate and include capability-scoped query keys", async () => {
  const api = {
    radarError: (status, code, message) =>
      Response.json({ status: "error", code, message }, { status }),
    radarErrorResponse: (error) => {
      throw error;
    },
    radarJson: (body, status = 200) => Response.json(body, { status }),
    readRadarJson: (request) => request.json(),
  };
  const loadRoute = (userId) =>
    compileTypeScriptModule("app/api/agent-watches/route.ts", {
      modules: {
        "@clerk/nextjs/server": { auth: async () => ({ userId }) },
        "@/app/utils/personalized-radar/api.server": api,
        "@/app/utils/personalized-radar/entitlements.server": {
          getRadarWatchCapabilitiesForUser: async () => ({ maxActiveWatches: 5 }),
        },
        "@/app/utils/personalized-radar/feature-flags.server": {
          getRadarFeatureFlags: () => ({ watchCreation: true }),
        },
        "@/app/utils/personalized-radar/repository.server": {
          listOwnedAgentWatches: async (owner, status) => [{ owner, status }],
          createOwnedAgentWatch: async () => ({ watch: { id: "watch" }, created: true }),
        },
        "@/app/utils/personalized-radar/validation": {
          parseWatchStatusFilter: (params) => params.get("status") ?? "active",
          parseCreateAgentWatchInput: (value) => value,
          enforceWatchCapabilities: () => undefined,
        },
      },
    });

  const unauthorized = await loadRoute(null).GET(
    new Request("https://app.example.test/api/agent-watches"),
  );
  assert.equal(unauthorized.status, 401);

  const response = await loadRoute("user_123").GET(
    new Request("https://app.example.test/api/agent-watches?status=muted"),
  );
  assert.equal(response.status, 200);
  assert.deepEqual((await response.json()).watches, [
    { owner: "user_123", status: "muted" },
  ]);
});
