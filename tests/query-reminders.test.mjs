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

function compileTypeScriptModule(
  relativePath,
  { environment = {}, modules = {} } = {},
) {
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
    Buffer,
    Date,
    Headers,
    Intl,
    Map,
    Request,
    Response,
    Set,
    URL,
    URLSearchParams,
    console,
    exports: compiledModule.exports,
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
  "app/utils/query-reminders/contracts.ts",
);
const calendar = compileTypeScriptModule("app/utils/query-reminders/calendar.ts");
const stateMachine = compileTypeScriptModule(
  "app/utils/query-reminders/state-machine.ts",
  {
    modules: {
      "@/app/utils/query-reminders/contracts": contracts,
    },
  },
);
const suggestions = compileTypeScriptModule(
  "app/utils/query-reminders/suggestions.ts",
  {
    modules: {
      "@/app/utils/query-reminders/contracts": contracts,
      "@/app/utils/query-reminders/calendar": calendar,
    },
  },
);
const notifications = compileTypeScriptModule(
  "app/utils/query-reminders/notifications.ts",
  {
    modules: {
      "@/app/utils/query-reminders/contracts": contracts,
      "@/app/utils/query-reminders/calendar": calendar,
    },
  },
);
const validation = compileTypeScriptModule(
  "app/utils/query-reminders/validation.ts",
  {
    modules: {
      "@/app/utils/query-reminders/contracts": contracts,
      "@/app/utils/query-reminders/calendar": calendar,
      "@/app/utils/query-reminders/state-machine": stateMachine,
    },
  },
);
const reminderViewModel = compileTypeScriptModule(
  "app/components/query-safety/reminder-view-model.ts",
  {
    modules: {
      "@/app/utils/query-reminders/contracts": contracts,
      "@/app/utils/query-reminders/calendar": calendar,
    },
  },
);

const scheduledReminder = {
  id: "11111111-1111-4111-8111-111111111111",
  agentMatchId: "22222222-2222-4222-8222-222222222222",
  kind: "manual",
  dueOn: "2026-09-15",
  timezone: "America/New_York",
  note: null,
  status: "scheduled",
  source: "manual",
  suggestionRule: null,
  completedAt: null,
  dismissedAt: null,
  canceledAt: null,
  createdAt: "2026-08-01T12:00:00.000Z",
  updatedAt: "2026-08-01T12:00:00.000Z",
};

test("reminder editor validation is calendar and timezone safe", () => {
  assert.equal(
    JSON.stringify(reminderViewModel.validateReminderEditorValues({
      kind: "manual",
      dueOn: "2026-02-30",
      timezone: "Not/AZone",
      note: "x".repeat(501),
    })),
    JSON.stringify({
      dueOn: "Choose a valid date.",
      timezone: "Enter a valid IANA timezone, such as America/New_York.",
      note: "Keep the note to 500 characters or fewer.",
    }),
  );
  assert.equal(
    JSON.stringify(reminderViewModel.validateReminderEditorValues({
      kind: "query_check_in",
      dueOn: "2026-09-15",
      timezone: "America/New_York",
      note: "Review the agency guidelines.",
    })),
    "{}",
  );
});

test("reminder urgency respects each reminder timezone", () => {
  const instant = new Date("2026-08-01T02:00:00.000Z");

  assert.equal(
    reminderViewModel.getReminderUrgency(
      { dueOn: "2026-07-31", timezone: "America/New_York" },
      instant,
    ),
    "due",
  );
  assert.equal(
    reminderViewModel.getReminderUrgency(
      { dueOn: "2026-07-31", timezone: "UTC" },
      instant,
    ),
    "overdue",
  );
});

test("needs-attention reminders are bounded, ordered, and exclude future or terminal items", () => {
  const reminders = [
    {
      ...scheduledReminder,
      id: "10000000-0000-4000-8000-000000000001",
      dueOn: "2026-08-03",
    },
    {
      ...scheduledReminder,
      id: "10000000-0000-4000-8000-000000000002",
      dueOn: "2026-07-31",
    },
    {
      ...scheduledReminder,
      id: "10000000-0000-4000-8000-000000000003",
      dueOn: "2026-08-01",
    },
    {
      ...scheduledReminder,
      id: "10000000-0000-4000-8000-000000000004",
      dueOn: "2026-07-30",
      status: "completed",
    },
  ];

  const needsAttention = reminderViewModel.getNeedsAttentionReminders(
    reminders,
    { now: new Date("2026-08-01T16:00:00.000Z"), limit: 2 },
  );

  assert.deepEqual(
    needsAttention.map((reminder) => reminder.id),
    [
      "10000000-0000-4000-8000-000000000002",
      "10000000-0000-4000-8000-000000000003",
    ],
  );
});

test("next reminder selection ignores terminal reminders and preserves date-only formatting", () => {
  const next = reminderViewModel.getNextScheduledReminder([
    { ...scheduledReminder, dueOn: "2026-10-01", status: "completed" },
    { ...scheduledReminder, id: "later", dueOn: "2026-09-22" },
    { ...scheduledReminder, id: "next", dueOn: "2026-09-16" },
  ]);

  assert.equal(next?.id, "next");
  assert.equal(
    reminderViewModel.formatReminderDate("2026-09-16", "en-US"),
    "Sep 16, 2026",
  );
});

test("calendar dates and timezone conversion remain local-day safe across DST", () => {
  assert.equal(calendar.isValidLocalDate("2026-02-29"), false);
  assert.equal(calendar.isValidLocalDate("2028-02-29"), true);
  assert.equal(calendar.normalizeIanaTimeZone(" America/New_York "), "America/New_York");
  assert.equal(calendar.normalizeIanaTimeZone("Not/AZone"), null);
  assert.equal(
    calendar.getLocalDateForInstant(
      "America/New_York",
      new Date("2026-03-08T04:30:00.000Z"),
    ),
    "2026-03-07",
  );
  assert.equal(
    calendar.getLocalDateForInstant(
      "America/New_York",
      new Date("2026-03-08T07:30:00.000Z"),
    ),
    "2026-03-08",
  );
  assert.equal(calendar.addCalendarDays("2026-03-08", 1), "2026-03-09");
  assert.equal(
    calendar.differenceInCalendarDays("2026-11-02", "2026-10-31"),
    2,
  );
});

test("create and action validation rejects unknown fields and unsafe values", () => {
  const parsed = validation.parseCreateQueryReminderInput({
    agentMatchId: "22222222-2222-4222-8222-222222222222",
    kind: "manual",
    dueOn: "2026-09-15",
    timezone: " America/New_York ",
    note: "  Review guidelines.  ",
  });

  assert.equal(parsed.note, "Review guidelines.");
  assert.equal(parsed.timezone, "America/New_York");
  assert.equal(parsed.source, "manual");
  assert.throws(
    () =>
      validation.parseCreateQueryReminderInput({
        ...parsed,
        privateNoteForLogs: "must not pass",
      }),
    /Unknown request field/,
  );
  assert.throws(
    () =>
      validation.parseCreateQueryReminderInput({
        ...parsed,
        dueOn: "2026-02-30",
      }),
    /YYYY-MM-DD/,
  );
  assert.throws(
    () =>
      validation.parseCreateQueryReminderInput({
        ...parsed,
        timezone: "Not/AZone",
      }),
    /IANA timezone/,
  );
  assert.throws(
    () =>
      validation.parseCreateQueryReminderInput({
        ...parsed,
        source: "accepted_suggestion",
      }),
    /suggestionRule is required/,
  );
  assert.throws(
    () =>
      validation.parseCreateQueryReminderInput({
        ...parsed,
        source: "accepted_suggestion",
        suggestionRule: "query-check-in-30-v1",
        kind: "research_revisit",
      }),
    /kind does not match/,
  );
  assert.deepEqual(
    JSON.parse(
      JSON.stringify(
        validation.parseQueryReminderTransitionInput({ action: "complete" }),
      ),
    ),
    { action: "complete" },
  );
  assert.throws(
    () =>
      validation.parseQueryReminderTransitionInput({
        action: "complete",
        note: "not accepted",
      }),
    /Unknown request field/,
  );
});

test("reminder transitions are explicit, idempotent, and terminal-safe", () => {
  const occurredAt = "2026-09-15T14:00:00.000Z";
  const completed = stateMachine.transitionQueryReminder(
    scheduledReminder,
    { action: "complete" },
    occurredAt,
  );
  assert.equal(completed.idempotent, false);
  assert.equal(completed.patch.status, "completed");
  assert.equal(completed.patch.completedAt, occurredAt);
  assert.equal(completed.patch.dismissedAt, null);

  const completedReminder = {
    ...scheduledReminder,
    status: "completed",
    completedAt: occurredAt,
  };
  assert.equal(
    stateMachine.transitionQueryReminder(
      completedReminder,
      { action: "complete" },
      occurredAt,
    ).idempotent,
    true,
  );
  assert.throws(
    () =>
      stateMachine.transitionQueryReminder(completedReminder, {
        action: "snooze",
        dueOn: "2026-09-22",
        timezone: "America/New_York",
      }),
    (error) => error.code === "QUERY_REMINDER_TRANSITION_CONFLICT",
  );

  const rescheduled = stateMachine.transitionQueryReminder(
    scheduledReminder,
    {
      action: "reschedule",
      dueOn: "2026-09-22",
      timezone: "America/Chicago",
      note: "Review again",
    },
  );
  assert.equal(rescheduled.patch.dueOn, "2026-09-22");
  assert.equal(rescheduled.patch.note, "Review again");
});

test("versioned suggestions apply lifecycle, duplicate, live-action, and cooldown suppression", () => {
  const common = {
    today: "2026-08-01",
    evaluatedAt: "2026-08-01T12:00:00.000Z",
    lifecycle: "active_query",
    querySentOn: "2026-04-01",
  };
  const activeSuggestions = suggestions.getQueryReminderSuggestions(common);
  assert.deepEqual(
    Array.from(activeSuggestions, (suggestion) => suggestion.ruleId),
    ["query-check-in-30-v1", "no-response-review-90-v1"],
  );

  const suppressed = suggestions.getQueryReminderSuggestions({
    ...common,
    scheduledKinds: ["query_check_in"],
    liveNextActionDueOn: "2026-08-01",
    dismissals: [
      {
        ruleId: "no-response-review-90-v1",
        dismissedAt: "2026-07-20T12:00:00.000Z",
        cooldownUntil: "2026-08-19T12:00:00.000Z",
      },
    ],
  });
  assert.equal(suppressed.length, 0);

  const research = suggestions.getQueryReminderSuggestions({
    today: "2026-08-01",
    evaluatedAt: "2026-08-01T12:00:00.000Z",
    lifecycle: "research",
  });
  assert.equal(research[0].ruleId, "research-revisit-v1");
  assert.deepEqual(Array.from(research[0].presetDueOns), [
    "2026-08-08",
    "2026-08-15",
    "2026-08-31",
  ]);
  assert.equal(
    suggestions.getQueryReminderSuggestions({
      ...common,
      lifecycle: "terminal",
    }).length,
    0,
  );
});

test("notification dedupe keys are stable and snoozing creates a new version", () => {
  const first = notifications.createDueReminderNotification({
    reminderId: scheduledReminder.id,
    userId: "user_123",
    kind: "manual",
    dueOn: "2026-09-15",
    occurredAt: "2026-09-15T14:00:00.000Z",
  });
  const repeated = notifications.createDueReminderNotification({
    reminderId: scheduledReminder.id,
    userId: "user_123",
    kind: "manual",
    dueOn: "2026-09-15",
    occurredAt: "2026-09-15T18:00:00.000Z",
  });
  const snoozed = notifications.createDueReminderNotification({
    reminderId: scheduledReminder.id,
    userId: "user_123",
    kind: "manual",
    dueOn: "2026-09-22",
    occurredAt: "2026-09-22T14:00:00.000Z",
  });

  assert.equal(first.source_event_id, repeated.source_event_id);
  assert.notEqual(first.source_event_id, snoozed.source_event_id);
  assert.equal("note" in first, false);
  assert.equal(first.target_href, "/query-dashboard");
});

test("due processor preparation respects each reminder timezone and skips invalid rows", () => {
  const processor = compileTypeScriptModule(
    "app/utils/query-reminders/process-due.server.ts",
    {
      modules: {
        "@/app/api/supabase/server": { createServerSupabase: () => null },
        "@/app/utils/query-reminders/contracts": contracts,
        "@/app/utils/query-reminders/calendar": calendar,
        "@/app/utils/query-reminders/notifications": notifications,
      },
    },
  );
  const result = processor.prepareDueReminderNotifications(
    [
      {
        id: "11111111-1111-4111-8111-111111111111",
        user_id: "user_1",
        kind: "manual",
        due_on: "2026-09-15",
        timezone: "America/New_York",
      },
      {
        id: "22222222-2222-4222-8222-222222222222",
        user_id: "user_2",
        kind: "research_revisit",
        due_on: "2026-09-16",
        timezone: "America/Los_Angeles",
      },
      {
        id: "33333333-3333-4333-8333-333333333333",
        user_id: "user_3",
        kind: "manual",
        due_on: "2026-09-15",
        timezone: "Invalid/Timezone",
      },
    ],
    new Date("2026-09-15T16:00:00.000Z"),
  );

  assert.equal(result.notifications.length, 1);
  assert.equal(result.notifications[0].user_id, "user_1");
  assert.equal(result.invalid, 1);
});

test("running the due processor twice inserts one ledger record", async () => {
  const reminderRows = [
    {
      id: "11111111-1111-4111-8111-111111111111",
      user_id: "user_1",
      kind: "manual",
      due_on: "2026-09-15",
      timezone: "America/New_York",
    },
  ];
  const ledgerKeys = new Set();
  const fakeSupabase = {
    from(table) {
      if (table === "query_reminders") {
        return {
          select() {
            return this;
          },
          eq() {
            return this;
          },
          async lte() {
            return { data: reminderRows, error: null };
          },
        };
      }
      if (table === "user_notifications") {
        return {
          upsert(rows) {
            return {
              async select() {
                const inserted = [];
                for (const row of rows) {
                  const key = `${row.user_id}:${row.kind}:${row.source_event_id}`;
                  if (ledgerKeys.has(key)) continue;
                  ledgerKeys.add(key);
                  inserted.push({ id: `notification-${inserted.length + 1}` });
                }
                return { data: inserted, error: null };
              },
            };
          },
        };
      }
      throw new Error(`Unexpected table: ${table}`);
    },
  };
  const processor = compileTypeScriptModule(
    "app/utils/query-reminders/process-due.server.ts",
    {
      modules: {
        "@/app/api/supabase/server": {
          createServerSupabase: () => fakeSupabase,
        },
        "@/app/utils/query-reminders/contracts": contracts,
        "@/app/utils/query-reminders/calendar": calendar,
        "@/app/utils/query-reminders/notifications": notifications,
      },
    },
  );
  const now = new Date("2026-09-15T16:00:00.000Z");
  const first = await processor.runDueReminderProcessor(now);
  const second = await processor.runDueReminderProcessor(now);

  assert.equal(first.inserted, 1);
  assert.equal(first.duplicate, 0);
  assert.equal(second.inserted, 0);
  assert.equal(second.duplicate, 1);
  assert.equal(ledgerKeys.size, 1);
});

test("user features default on, the processor defaults off, and packaging stays separate", () => {
  const defaultFlags = compileTypeScriptModule(
    "app/utils/query-safety/feature-flags.server.ts",
  ).getQuerySafetyFeatureFlags();
  assert.equal(defaultFlags.agencyHistory, true);
  assert.equal(defaultFlags.composerGuard, true);
  assert.equal(defaultFlags.queryRounds, true);
  assert.equal(defaultFlags.manualReminders, true);
  assert.equal(defaultFlags.researchRevisitSuggestion, true);
  assert.equal(defaultFlags.queryCheckInSuggestion, true);
  assert.equal(defaultFlags.noResponseReviewSuggestion, true);
  assert.equal(defaultFlags.materialCheckInSuggestion, true);
  assert.equal(defaultFlags.dueReminderProcessor, false);

  const enabledFlags = compileTypeScriptModule(
    "app/utils/query-safety/feature-flags.server.ts",
    {
      environment: {
        QUERY_SAFETY_MANUAL_REMINDERS_ENABLED: " FALSE ",
        QUERY_REMINDER_DUE_PROCESSOR_ENABLED: "true",
      },
    },
  ).getQuerySafetyFeatureFlags();
  assert.equal(enabledFlags.manualReminders, false);
  assert.equal(enabledFlags.dueReminderProcessor, true);

  const entitlements = compileTypeScriptModule(
    "app/utils/query-safety/entitlements.server.ts",
    { modules: { "@/lib/clerk-utils": { clerkClient: {} } } },
  );
  const free = entitlements.getQuerySafetyCapabilities({
    isAuthenticated: true,
    isSubscribed: false,
  });
  assert.equal(free.sameProjectAgencyGuard, true);
  assert.equal(free.queryRounds, false);
  const premium = entitlements.getQuerySafetyCapabilities({
    isAuthenticated: true,
    isSubscribed: true,
  });
  assert.equal(premium.sameProjectAgencyGuard, true);
  assert.equal(premium.customReminderSchedules, true);
});

test("analytics adapter allowlists aggregate properties and drops private input", async () => {
  const analytics = compileTypeScriptModule(
    "app/utils/query-safety/product-analytics.server.ts",
  );
  let captured;
  const adapter = analytics.createQuerySafetyAnalyticsAdapter(
    (event, properties) => {
      captured = { event, properties };
    },
  );

  await adapter.capture("reminder_created", {
    reminderKind: "manual",
    daysBucket: "7-14",
    agentName: "private",
    projectId: "private",
    note: "private",
    rawUserId: "private",
  });

  assert.equal(captured.event, "reminder_created");
  assert.deepEqual(JSON.parse(JSON.stringify(captured.properties)), {
    reminderKind: "manual",
    daysBucket: "7-14",
  });
});

test("reminder routes bind repository calls to the authenticated Clerk owner", async () => {
  let capturedUserId;
  const api = {
    queryReminderError: (status, code, message) =>
      Response.json(
        { status: "error", code, message },
        { status, headers: { "Cache-Control": "private, no-store" } },
      ),
    queryReminderErrorResponse: () =>
      Response.json({ status: "error" }, { status: 500 }),
    queryReminderJson: (body, status = 200) =>
      Response.json(body, {
        status,
        headers: { "Cache-Control": "private, no-store" },
      }),
    readQueryReminderJson: (request) => request.json(),
  };
  const route = compileTypeScriptModule("app/api/query-reminders/route.ts", {
    modules: {
      "@clerk/nextjs/server": {
        auth: async () => ({ userId: "clerk_owner" }),
      },
      "@/app/utils/query-reminders/api.server": api,
      "@/app/utils/query-reminders/repository.server": {
        createOwnedQueryReminder: async (userId) => {
          capturedUserId = userId;
          return scheduledReminder;
        },
        listOwnedQueryReminders: async (userId) => {
          capturedUserId = userId;
          return [scheduledReminder];
        },
      },
      "@/app/utils/query-reminders/validation": {
        parseCreateQueryReminderInput: (value) => value,
        parseQueryReminderListFilters: () => ({}),
      },
    },
  });

  const getResponse = await route.GET(
    new Request("https://app.example.test/api/query-reminders"),
  );
  assert.equal(getResponse.status, 200);
  assert.equal(capturedUserId, "clerk_owner");
  assert.equal(getResponse.headers.get("cache-control"), "private, no-store");

  const postResponse = await route.POST(
    new Request("https://app.example.test/api/query-reminders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agentMatchId: scheduledReminder.agentMatchId }),
    }),
  );
  assert.equal(postResponse.status, 201);
  assert.equal(capturedUserId, "clerk_owner");
});

test("unauthenticated reminder requests are no-store 401 responses", async () => {
  const route = compileTypeScriptModule("app/api/query-reminders/route.ts", {
    modules: {
      "@clerk/nextjs/server": { auth: async () => ({ userId: null }) },
      "@/app/utils/query-reminders/api.server": {
        queryReminderError: (status, code, message) =>
          Response.json(
            { status: "error", code, message },
            { status, headers: { "Cache-Control": "private, no-store" } },
          ),
      },
      "@/app/utils/query-reminders/repository.server": {},
      "@/app/utils/query-reminders/validation": {},
    },
  });

  const response = await route.GET(
    new Request("https://app.example.test/api/query-reminders"),
  );
  assert.equal(response.status, 401);
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  assert.equal((await response.json()).code, "QUERY_REMINDER_UNAUTHORIZED");
});

test("item routes use async params, owner scope, and existence-safe 404s", async () => {
  let captured;
  const api = {
    queryReminderError: (status, code, message) =>
      Response.json(
        { status: "error", code, message },
        { status, headers: { "Cache-Control": "private, no-store" } },
      ),
    queryReminderErrorResponse: () =>
      Response.json({ status: "error" }, { status: 500 }),
    queryReminderJson: (body, status = 200) =>
      Response.json(body, {
        status,
        headers: { "Cache-Control": "private, no-store" },
      }),
    readQueryReminderJson: (request) => request.json(),
  };
  const route = compileTypeScriptModule(
    "app/api/query-reminders/[reminderId]/route.ts",
    {
      modules: {
        "@clerk/nextjs/server": {
          auth: async () => ({ userId: "clerk_owner" }),
        },
        "@/app/utils/query-reminders/api.server": api,
        "@/app/utils/query-reminders/repository.server": {
          transitionOwnedQueryReminder: async (userId, reminderId, input) => {
            captured = { userId, reminderId, input };
            return null;
          },
        },
        "@/app/utils/query-reminders/validation": {
          isUuid: () => true,
          parseQueryReminderTransitionInput: (value) => value,
        },
      },
    },
  );
  const reminderId = "11111111-1111-4111-8111-111111111111";
  const response = await route.PATCH(
    new Request(`https://app.example.test/api/query-reminders/${reminderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "complete" }),
    }),
    { params: Promise.resolve({ reminderId }) },
  );

  assert.equal(response.status, 404);
  assert.deepEqual(JSON.parse(JSON.stringify(captured)), {
    userId: "clerk_owner",
    reminderId,
    input: { action: "complete" },
  });
  assert.equal((await response.json()).code, "QUERY_REMINDER_NOT_FOUND");
});

test("internal due processor is default-off and requires its bearer secret", async () => {
  let processorCalls = 0;
  const api = {
    QUERY_REMINDER_NO_STORE_HEADERS: { "Cache-Control": "private, no-store" },
    queryReminderError: (status, code, message) =>
      Response.json(
        { status: "error", code, message },
        { status, headers: { "Cache-Control": "private, no-store" } },
      ),
    queryReminderJson: (body, status = 200) =>
      Response.json(body, {
        status,
        headers: { "Cache-Control": "private, no-store" },
      }),
  };
  const processorModule = {
    DueReminderProcessorError: class extends Error {
      status = 500;
      code = "QUERY_REMINDER_PROCESSOR_FAILED";
    },
    runDueReminderProcessor: async () => {
      processorCalls += 1;
      return { scanned: 1, eligible: 1, inserted: 1, duplicate: 0, invalid: 0 };
    },
  };
  const loadRoute = (enabled, secret = "processor-secret") =>
    compileTypeScriptModule(
      "app/api/internal/query-reminders/process-due/route.ts",
      {
        environment: { QUERY_REMINDER_PROCESSOR_SECRET: secret },
        modules: {
          "@/app/utils/query-reminders/api.server": api,
          "@/app/utils/query-reminders/process-due.server": processorModule,
          "@/app/utils/query-safety/feature-flags.server": {
            isDueReminderProcessorEnabled: () => enabled,
          },
        },
      },
    );

  const disabledResponse = await loadRoute(false).POST(
    new Request(
      "https://app.example.test/api/internal/query-reminders/process-due",
      { method: "POST" },
    ),
  );
  assert.equal(disabledResponse.status, 503);
  assert.equal(
    (await disabledResponse.json()).code,
    "QUERY_REMINDER_PROCESSOR_DISABLED",
  );
  assert.equal(processorCalls, 0);

  const enabledRoute = loadRoute(true);
  const unauthorizedResponse = await enabledRoute.POST(
    new Request(
      "https://app.example.test/api/internal/query-reminders/process-due",
      {
        method: "POST",
        headers: { Authorization: "Bearer wrong-secret" },
      },
    ),
  );
  assert.equal(unauthorizedResponse.status, 401);
  assert.equal(processorCalls, 0);

  const successResponse = await enabledRoute.POST(
    new Request(
      "https://app.example.test/api/internal/query-reminders/process-due",
      {
        method: "POST",
        headers: { Authorization: "Bearer processor-secret" },
      },
    ),
  );
  assert.equal(successResponse.status, 200);
  assert.equal(processorCalls, 1);
  assert.equal((await successResponse.json()).summary.inserted, 1);
});

test("migration freezes ownership cascade and notification dedupe contracts", () => {
  const migration = readFileSync(
    resolve(
      repositoryRoot,
      "supabase/migrations/20260801010000_query_reminders_and_notifications.sql",
    ),
    "utf8",
  );

  assert.match(
    migration,
    /constraint query_reminders_agent_owner_fk foreign key \(agent_match_id, user_id\)\s*references public\.agent_matches\(id, user_id\) on delete cascade/,
  );
  assert.match(
    migration,
    /unique index if not exists query_reminders_one_scheduled_kind_idx/,
  );
  assert.match(
    migration,
    /constraint user_notifications_owner_source_unique unique\s*\(\s*user_id,\s*kind,\s*source_event_id\s*\)/,
  );
  assert.doesNotMatch(migration, /enable row level security/i);
});
