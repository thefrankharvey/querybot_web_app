import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
const require = createRequire(import.meta.url);
const ts = require("typescript");
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
function loader(mocks = {}, globals = {}) {
  const modules = new Map();
  function load(path) {
    if (modules.has(path)) return modules.get(path);
    const module = { exports: {} };
    const source = ts.transpileModule(
      readFileSync(resolve(root, path), "utf8"),
      {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          target: ts.ScriptTarget.ES2022,
          jsx: ts.JsxEmit.ReactJSX,
          esModuleInterop: true,
        },
      },
    ).outputText;
    vm.runInNewContext(source, {
      module,
      exports: module.exports,
      console,
      URL,
      URLSearchParams,
      Request,
      Response,
      Headers,
      AbortSignal,
      setTimeout,
      clearTimeout,
      process,
      ...globals,
      require: (specifier) => {
        if (Object.hasOwn(mocks, specifier)) return mocks[specifier];
        if (specifier === "server-only") return {};
        if (specifier.startsWith("@/") || specifier.startsWith(".")) {
          const base = specifier.startsWith("@/")
            ? resolve(root, specifier.slice(2))
            : resolve(root, dirname(path), specifier);
          const alias = "@/" + base.slice(root.length + 1);
          if (Object.hasOwn(mocks, alias)) return mocks[alias];
          return load([base + ".ts", base + ".tsx"].find(existsSync));
        }
        return require(specifier);
      },
    });
    modules.set(path, module.exports);
    return module.exports;
  }
  return load;
}
const load = loader();
const pure = load("app/utils/query-safety/agency-guard.ts");
const { buildAgencyGuard, resolveAgencyMatch, querySentDay } = pure;
const id = (number) =>
  `00000000-0000-4000-8000-${String(number).padStart(12, "0")}`;
const projectA = id(1),
  projectB = id(2),
  projectOtherUser = id(3);
const agencyA = id(800),
  agencyB = id(801);
const row = (overrides = {}) => ({
  id: id(10),
  user_id: "owner",
  dashboard_project_id: projectA,
  project_name: "Same name",
  name: "Agent A",
  agency: "Oak Literary Agency",
  agency_url: "https://oak.example",
  index_id: id(100),
  column_name: "submitted-query",
  query_sent_date: "2026-09-01",
  ...overrides,
});
const input = { dashboardProjectId: projectA, candidateRecordId: id(11) };
const canonical = {
  agencyId: agencyA,
  agencyName: "Oak",
  agencyUrl: "https://oak.example",
};
const fallback = {
  agencyName: "Oak Literary Agency",
  agencyUrl: "https://oak.example",
};

test("canonical active same-project manual history warns and excludes only the candidate row", () => {
  const result = buildAgencyGuard(input, canonical, [
    row({ identity: canonical }),
    row({ id: id(11), identity: canonical }),
  ]);
  assert.equal(result.status, "warning");
  assert.equal(result.records.length, 1);
  assert.equal(result.counts.sameProjectActive, 1);
  assert.equal(result.agency.confidence, "high");
  assert.equal(result.records[0].querySentOn, "2026-09-01");
});
for (const column_name of ["rejected", "offer-made"])
  test(`${column_name} is informational even with a fallback match`, () => {
    const result = buildAgencyGuard(input, fallback, [row({ column_name })]);
    assert.equal(result.status, "history");
    assert.equal(result.counts.sameProjectActive, 0);
    assert.equal(result.counts.sameProjectTerminal, 1);
  });
test("other projects and same-agent duplicates stay separate despite identical project names and renames", () => {
  const rows = [
    row({ id: id(11), identity: canonical }),
    row({ dashboard_project_id: projectB, identity: canonical }),
  ];
  const basic = buildAgencyGuard(input, canonical, rows);
  assert.equal(basic.records.length, 0);
  assert.equal(basic.counts.otherProjectActive, null);
  const expanded = buildAgencyGuard(
    { ...input, includeAllProjects: true },
    canonical,
    rows,
  );
  assert.equal(expanded.status, "history");
  assert.equal(expanded.counts.otherProjectActive, 1);
  rows[1].project_name = "Renamed";
  assert.equal(
    buildAgencyGuard({ ...input, includeAllProjects: true }, canonical, rows)
      .records[0].sameProject,
    false,
  );
});
test("contradictory canonical IDs never fall back to a matching name or domain", () => {
  assert.equal(
    resolveAgencyMatch(canonical, { ...canonical, agencyId: agencyB }),
    "none",
  );
});
test("canonical and fallback matches both remain visible, each with its own evidence", () => {
  const result = buildAgencyGuard(input, canonical, [
    row({ identity: canonical }),
    row({ id: id(12) }),
  ]);
  assert.equal(result.records.length, 2);
  assert.equal(result.records[1].matchMethod, "domain");
});
test("manual URL-only rows participate and fallback never claims high confidence", () => {
  const result = buildAgencyGuard(
    input,
    { agencyUrl: "https://www.oak.example/submissions" },
    [row({ agency: null, index_id: null })],
  );
  assert.equal(result.status, "possible_match");
  assert.equal(result.agency.confidence, "fallback");
});
for (const host of [
  "querymanager.com",
  "agent.querymanager.com",
  "www.querytracker.net",
  "agency.submittable.com",
  "docs.google.com",
  "www.instagram.com",
  "x.com",
])
  test(`shared host ${host} cannot identify an agency`, () => {
    assert.equal(
      resolveAgencyMatch(
        { agencyUrl: `https://${host}/a` },
        { agencyUrl: `https://${host}/b` },
      ),
      "none",
    );
  });
test("normalization accepts only http/https and matches normalized names conservatively", () => {
  assert.equal(pure.normalizeAgencyDomain("ftp://oak.example"), null);
  assert.equal(
    resolveAgencyMatch(
      { agencyName: "Oak & Elm Literary Agency" },
      { agencyName: "OAK and ELM" },
    ),
    "normalized_name",
  );
});
test("missing identity and incomplete history cannot become clear", () => {
  assert.equal(buildAgencyGuard(input, {}, []).status, "unknown");
  assert.equal(buildAgencyGuard(input, fallback, [], false).status, "unknown");
});
test("research without a valid query date is excluded; submitted without a date stays undated", () => {
  assert.equal(
    buildAgencyGuard(input, fallback, [
      row({ column_name: "agents-to-research", query_sent_date: null }),
    ]).records.length,
    0,
  );
  const result = buildAgencyGuard(input, fallback, [
    row({ query_sent_date: null }),
  ]);
  assert.equal(result.records[0].stage, "active");
  assert.equal(result.records[0].querySentOn, null);
  assert.equal(querySentDay("2026-02-30"), null);
  assert.equal(querySentDay("not-a-date"), null);
  assert.equal(querySentDay("2026-09-01Tgarbage"), null);
});
function database(rows, { failure = false, cap = 1000 } = {}) {
  const projects = [
    { id: projectA, user_id: "owner" },
    { id: projectB, user_id: "owner" },
    { id: projectOtherUser, user_id: "other" },
  ];
  const calls = [];
  return {
    calls,
    from(table) {
      const predicates = [];
      let one = false,
        start = 0,
        end = cap - 1;
      const call = { table, predicates };
      calls.push(call);
      const query = {
        select() {
          return query;
        },
        eq(key, value) {
          predicates.push([key, value]);
          return query;
        },
        maybeSingle() {
          one = true;
          return query;
        },
        order() {
          return query;
        },
        range(a, b) {
          start = a;
          end = b;
          return query;
        },
        then(resolve) {
          const eligible = (
            table === "dashboard_projects" ? projects : rows
          ).filter((record) =>
            predicates.every(([key, value]) => record[key] === value),
          );
          const data = one
            ? (eligible[0] ?? null)
            : eligible.slice(start, Math.min(end + 1, start + cap));
          return Promise.resolve({
            data: failure ? null : data,
            error: failure ? { code: "unavailable" } : null,
          }).then(resolve);
        },
      };
      return query;
    },
  };
}
function harness({
  userId = "owner",
  subscribed = false,
  enabled = true,
  limited = false,
  rows = [row()],
  identities = new Map(),
  ...dbOptions
} = {}) {
  const db = database(rows, dbOptions);
  const modules = loader(
    {
      "@clerk/nextjs/server": { auth: async () => ({ userId }) },
      "next/server": {
        NextResponse: { json: (body, init) => Response.json(body, init) },
      },
      "@/app/api/supabase/server": { createServerSupabase: () => db },
      "@/app/constants": { AGENT_MATCHES_TABLE: "agent_matches" },
      "@/lib/clerk-utils": {
        clerkClient: {
          users: {
            getUser: async () => ({
              publicMetadata: { isSubscribed: subscribed },
            }),
          },
        },
      },
      "@/app/utils/query-safety/agency-identity.server": {
        fetchAgencyIdentities: async () => identities,
      },
      "@/app/utils/query-safety/rate-limit.server": {
        checkAgencyHistoryRateLimit: () => !limited,
      },
    },
    {
      process: {
        env: enabled ? { QUERY_SAFETY_AGENCY_HISTORY_ENABLED: "true" } : {},
      },
    },
  );
  const route = modules("app/api/query-safety/agency-guard/route.ts");
  return {
    db,
    config: modules("app/api/query-safety/config/route.ts"),
    request: async (
      body = {
        dashboardProjectId: projectA,
        candidateAgencyName: "Oak Literary Agency",
      },
    ) => {
      const response = await route.POST(
        new Request("https://local/api/query-safety/agency-guard", {
          method: "POST",
          body: JSON.stringify(body),
        }),
      );
      assert.equal(response.headers.get("cache-control"), "private, no-store");
      return { response, body: await response.json() };
    },
  };
}
test("anonymous, disabled and rate-limited requests never read saved data", async () => {
  for (const [opts, status, code] of [
    [{ userId: null }, 401, "UNAUTHORIZED"],
    [{ enabled: false }, 404, "FEATURE_DISABLED"],
    [{ limited: true }, 429, "RATE_LIMITED"],
  ]) {
    const h = harness(opts),
      result = await h.request();
    assert.equal(result.response.status, status);
    assert.equal(result.body.code, code);
    assert.equal(h.db.calls.length, 0);
  }
});
test("strict manual contract rejects spoofed identity, bad IDs, thread fields and invalid types", async () => {
  for (const fields of [
    { agency_id: agencyA },
    { candidateAgencyId: agencyA },
    { threadId: id(9) },
    { dashboardProjectId: "name" },
    { candidateRecordId: "manual-id" },
    { candidateIndexId: "x".repeat(201) },
    { candidateAgencyName: "x".repeat(201) },
    { candidateAgencyUrl: "javascript:alert(1)" },
    { includeAllProjects: "true" },
    { candidateIndexId: null },
  ]) {
    const h = harness();
    const result = await h.request({ dashboardProjectId: projectA, ...fields });
    assert.equal(result.body.code, "INVALID_PAYLOAD");
    assert.equal(h.db.calls.length, 0);
  }
  assert.equal(
    (
      await harness().request({
        dashboardProjectId: projectA,
        candidateIndexId: "opaque/manual:42",
      })
    ).response.status,
    200,
  );
});
test("missing, cross-user and mismatched row/project identifiers share one generic 404", async () => {
  const h = harness({
    rows: [
      row(),
      row({
        id: id(99),
        user_id: "other",
        dashboard_project_id: projectOtherUser,
      }),
    ],
  });
  for (const payload of [
    { dashboardProjectId: projectOtherUser },
    { dashboardProjectId: id(987) },
    { dashboardProjectId: projectA, candidateRecordId: id(99) },
    { dashboardProjectId: projectB, candidateRecordId: id(10) },
    {
      dashboardProjectId: projectA,
      candidateRecordId: id(10),
      candidateIndexId: "contradiction",
    },
  ]) {
    const result = await h.request(payload);
    assert.equal(result.response.status, 404);
    assert.equal(result.body.code, "NOT_FOUND");
    assert.equal(result.body.error, "Saved project or agent not found.");
  }
});
test("saved candidate identity is derived from the owned row, ignoring spoofed names and URLs", async () => {
  const h = harness({ rows: [row({ id: id(11) }), row()] });
  const result = await h.request({
    ...input,
    candidateAgencyName: "Another agency",
    candidateAgencyUrl: "https://attacker.example",
  });
  assert.equal(result.body.records.length, 1);
  assert.equal(result.body.agency.displayName, "Oak Literary Agency");
});
test("expanded history is checked using server subscription metadata and never leaks other users", async () => {
  const rows = [
    row(),
    row({ id: id(12), dashboard_project_id: projectB }),
    row({
      id: id(13),
      user_id: "other",
      dashboard_project_id: projectOtherUser,
    }),
  ];
  const basic = await harness({ rows }).request();
  assert.equal(basic.body.counts.otherProjectActive, null);
  assert.equal(basic.body.records.length, 1);
  const payload = {
    dashboardProjectId: projectA,
    candidateAgencyName: "Oak Literary Agency",
    includeAllProjects: true,
  };
  assert.equal(
    (await harness({ rows }).request(payload)).body.code,
    "CAPABILITY_REQUIRED",
  );
  const paid = await harness({ rows, subscribed: true }).request(payload);
  assert.equal(paid.body.records.length, 2);
  assert.equal(paid.body.counts.otherProjectActive, 1);
});
test("pagination exhausts history even when the database cap is smaller than the requested page", async () => {
  const rows = Array.from({ length: 1250 }, (_, i) =>
    row({
      id: id(i + 2000),
      agency: i === 1249 ? "Oak" : "Different",
      agency_url: null,
    }),
  );
  const result = await harness({ rows, cap: 200 }).request();
  assert.equal(result.body.records.length, 1);
  assert.equal(result.body.coverage.historyComplete, true);
});
test("protective history bound suppresses clear", async () => {
  const rows = Array.from({ length: 10001 }, (_, i) =>
    row({ id: id(i + 2000), agency: "Other", agency_url: null }),
  );
  const result = await harness({ rows }).request();
  assert.equal(result.body.status, "unknown");
  assert.equal(result.body.coverage.historyComplete, false);
});
test("history outages are retryable 503s and do not report clear", async () => {
  const result = await harness({ failure: true }).request();
  assert.equal(result.response.status, 503);
  assert.equal(result.body.code, "HISTORY_UNAVAILABLE");
});
test("canonical lookup can produce the strongest warning without storing identities", async () => {
  const h = harness({
    rows: [row()],
    identities: new Map([
      [id(100), canonical],
      [id(101), canonical],
    ]),
  });
  const result = await h.request({
    dashboardProjectId: projectA,
    candidateIndexId: id(101),
  });
  assert.equal(result.body.status, "warning");
});
test("config capability responses align with the default-off flag and server metadata", async () => {
  for (const opts of [
    { enabled: false },
    { subscribed: false },
    { subscribed: true },
  ]) {
    const response = await harness(opts).config.GET();
    const body = await response.json();
    assert.equal(body.agencyHistory, opts.enabled !== false);
    assert.equal(
      body.capabilities.allProjectsAgencyHistory,
      opts.enabled !== false && opts.subscribed === true,
    );
    assert.equal(response.headers.get("cache-control"), "private, no-store");
  }
});
test("identity adapter batches, deduplicates, rejects injected identities and limits concurrency", async () => {
  let active = 0,
    maxActive = 0;
  const batches = [];
  const adapter = loader(
    { "@/lib/config": { getWqhApiUrl: () => "https://catalog.example" } },
    {
      fetch: async (_url, options) => {
        active++;
        maxActive = Math.max(maxActive, active);
        const batch = JSON.parse(options.body).agent_ids;
        batches.push(batch);
        await new Promise((resolve) => setTimeout(resolve, 1));
        active--;
        return Response.json({
          status: "success",
          identities: [
            ...batch.map((agent_id) => ({
              agent_id,
              agency_identity: {
                agency_id: agencyA,
                agency_name: "Oak",
                agency_url: null,
              },
            })),
            {
              agent_id: id(99999),
              agency_identity: { agency_id: agencyA, agency_name: "Injected" },
            },
          ],
        });
      },
    },
  )("app/utils/query-safety/agency-identity.server.ts");
  const ids = Array.from({ length: 250 }, (_, i) => id(i + 1000));
  const result = await adapter.fetchAgencyIdentities([
    ...ids,
    ids[0],
    "manual:1",
  ]);
  assert.equal(result.size, 250);
  assert.equal(batches.length, 3);
  assert.ok(batches.every((batch) => batch.length <= 100));
  assert.ok(maxActive <= 2);
  assert.equal(result.has(id(99999)), false);
});
test("identity timeout falls back without failing manual history", async () => {
  const adapter = loader(
    { "@/lib/config": { getWqhApiUrl: () => "https://catalog.example" } },
    {
      fetch: async () => {
        throw new DOMException("timeout", "TimeoutError");
      },
    },
  )("app/utils/query-safety/agency-identity.server.ts");
  assert.equal((await adapter.fetchAgencyIdentities([id(100)])).size, 0);
  assert.equal((await harness().request()).body.status, "possible_match");
});
test("rate limiting expires and accounts have independent budgets", () => {
  const rate = load("app/utils/query-safety/rate-limit.server.ts");
  for (let n = 0; n < 60; n++)
    assert.equal(rate.checkAgencyHistoryRateLimit("one", 0), true);
  assert.equal(rate.checkAgencyHistoryRateLimit("one", 1), false);
  assert.equal(rate.checkAgencyHistoryRateLimit("two", 1), true);
  assert.equal(rate.checkAgencyHistoryRateLimit("one", 60001), true);
});

test("details request keys include account, dashboard, candidate, expansion and contract, and stay disabled until opened", () => {
  let options;
  const hook = loader({
    "@clerk/nextjs": { useUser: () => ({ user: { id: "owner" } }) },
    "@tanstack/react-query": {
      useQuery: (value) => {
        options = value;
        return value;
      },
    },
  })("app/hooks/use-agency-guard.ts");
  hook.useAgencyGuard(input, false);
  assert.equal(options.enabled, false);
  assert.equal(options.gcTime, 0);
  const key = JSON.stringify(options.queryKey);
  for (const fragment of ["owner", projectA, id(11), "manual-agency-guard-v1"])
    assert.ok(key.includes(fragment));
  hook.useAgencyGuard({ ...input, includeAllProjects: true }, true);
  assert.equal(options.enabled, true);
  assert.notEqual(JSON.stringify(options.queryKey), key);
});
test("only successful persisted cache changes invalidate history; account cleanup cancels and removes private data", async () => {
  const React = require("react");
  const { QueryClient } = require("@tanstack/react-query");
  const client = new QueryClient();
  const effects = [];
  const historyKey = [
    "manual-agency-history",
    "owner",
    "manual-agency-guard-v1",
    input,
  ];
  const otherKey = [
    "manual-agency-history",
    "other",
    "manual-agency-guard-v1",
    input,
  ];
  client.setQueryData(historyKey, { status: "clear" });
  client.setQueryData(otherKey, { status: "clear" });
  const Provider = loader({
    react: { ...React, useEffect: (callback) => effects.push(callback) },
    "@clerk/nextjs": { useUser: () => ({ user: { id: "owner" } }) },
    "@tanstack/react-query": {
      useQuery: () => ({ data: { agencyHistory: true } }),
      useQueryClient: () => client,
    },
  })(
    "app/components/query-safety/agency-history-provider.tsx",
  ).AgencyHistoryProvider;
  Provider({ children: null });
  const cleanup = effects[0]();
  await client
    .fetchQuery({
      queryKey: ["agent-matches", "owner"],
      queryFn: () => {
        throw new Error("save failed");
      },
      retry: false,
    })
    .catch(() => {});
  assert.equal(client.getQueryState(historyKey).isInvalidated, false);
  client.setQueryData(["agent-matches", "other"], { agent_matches: [] });
  assert.equal(client.getQueryState(historyKey).isInvalidated, false);
  client.setQueryData(["agent-matches", "owner"], {
    agent_matches: [row({ column_name: "rejected" })],
  });
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.equal(client.getQueryState(historyKey).isInvalidated, true);
  assert.equal(client.getQueryState(otherKey).isInvalidated, false);
  cleanup();
  assert.equal(client.getQueryData(historyKey), undefined);
  assert.ok(client.getQueryData(otherKey));
  client.clear();
});
test("UI renders fallback, undated, terminal, missing, loading and error states without stale clear copy", () => {
  const React = require("react");
  const { renderToStaticMarkup } = require("react-dom/server");
  function render({
    result,
    enabled = true,
    isError = false,
    isFetching = false,
    project = projectA,
  } = {}) {
    const component = loader({
      "@/app/(app)/context/profile-context": {
        useProfileContext: () => ({ agentsList: [row()] }),
      },
      "./agency-history-provider": {
        useAgencyHistoryConfig: () => ({
          agencyHistory: enabled,
          capabilities: { allProjectsAgencyHistory: true },
        }),
      },
      "@/app/hooks/use-agency-guard": {
        useAgencyGuard: () => ({
          data: result,
          isError,
          isFetching,
          error: new Error("Unable to load agency history. Try again."),
          refetch() {},
        }),
      },
      "next/link": ({ children, ...props }) =>
        React.createElement("a", props, children),
      "@/app/utils": { cn: (...classes) => classes.filter(Boolean).join(" ") },
    })("app/components/query-safety/agency-guard.tsx");
    return renderToStaticMarkup(
      React.createElement(component.AgencyGuard, {
        candidate: { ...input, dashboardProjectId: project },
        defaultOpen: true,
      }),
    );
  }
  const result = buildAgencyGuard(input, fallback, [
    row({ query_sent_date: null }),
  ]);
  const html = render({ result });
  assert.match(html, /Possible agency match/);
  assert.match(html, /date missing/);
  assert.match(html, /official domain/);
  assert.match(html, /Include my other projects/);
  assert.doesNotMatch(html, /Safe to|Approved|You cannot query/);
  const error = render({
    result: buildAgencyGuard(input, fallback, []),
    isError: true,
  });
  assert.match(error, /History unavailable/);
  assert.doesNotMatch(error, /No matching history/);
  assert.match(render({ result, isFetching: true }), /Checking saved history/);
  assert.match(
    render({ result: buildAgencyGuard(input, {}, []) }),
    /Unable to determine agency history/,
  );
  assert.match(
    render({ project: null }),
    /after this project has saved agents/,
  );
  assert.equal(render({ enabled: false }), "");
});

test("direct dashboard loads wait for Clerk and rehydrate when the account resolves", async () => {
  const React = require("react");
  let user = null, agentsList, isError = false, stateIndex = 0, effectIndex = 0;
  const states = [], previousDeps = [], effects = [];
  const refetch = async () => ({ data: { agent_matches: [row()] } });
  const Provider = loader({
    react: { ...React,
      useState: (initial) => { const slot = stateIndex++; if (!(slot in states)) states[slot] = initial; return [states[slot], (value) => { states[slot] = typeof value === "function" ? value(states[slot]) : value; }]; },
      useCallback: (callback) => callback, useMemo: (callback) => callback(),
      useEffect: (callback, deps) => { const slot = effectIndex++; if (!previousDeps[slot] || deps.some((value, i) => value !== previousDeps[slot][i])) effects.push(callback); previousDeps[slot] = deps; },
    },
    "@clerk/nextjs": { useUser: () => ({ user }) },
    "next/navigation": { useRouter: () => ({ push() {} }) },
    "@/app/(app)/context/profile-context": { useProfileContext: () => ({ agentsList, isError, refetch, projects: [], isLoading: false }) },
    "@/app/components/fit-rating-badge": { getFitRatingFromScore: () => "neutral" },
    "@/app/constants": { DEFAULT_PROJECT_NAME: "Untitled Project" },
    "@/app/utils/project-dashboard-summary": { normalizeProjectName: (name) => name },
  })("app/(app)/query-dashboard/context/query-dash-context.tsx").QueryDashProvider;
  function render() { stateIndex = 0; effectIndex = 0; return Provider({ children: null, dashboardProjectId: projectA }).props.value; }
  render(); effects.splice(0).forEach((effect) => effect());
  assert.equal(render().isLoading, true);
  user = { id: "owner" }; render(); effects.splice(0).forEach((effect) => effect());
  assert.equal(render().isLoading, true);
  isError = true; assert.equal(render().hasLoadError, true); assert.equal(render().isLoading, false);
  isError = false; agentsList = [row()]; render(); effects.splice(0).forEach((effect) => effect());
  const state = render(); assert.equal(state.visibleCards.length, 1); assert.equal(state.isLoading, false);
  user = null; render(); effects.splice(0).forEach((effect) => effect());
  assert.equal(render().visibleCards.length, 0);
});
