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
const { indexSavedAgencies, findSavedAgencyMatches, resolveAgencyMatch } = pure;
const id = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const projectA = id(1),
  projectB = id(2),
  projectOtherUser = id(3);
const canonical = {
  agencyId: id(800),
  agencyName: "Oak",
  agencyUrl: "https://oak.example",
};
const row = (overrides = {}) => ({
  id: id(10),
  user_id: "owner",
  dashboard_project_id: projectA,
  project_name: "Project A",
  name: "Alex",
  index_id: id(100),
  agency: "Oak",
  agency_url: "https://oak.example",
  column_name: "agents-to-research",
  ...overrides,
});
const saved = (overrides = {}) => ({
  ...row(),
  identity: canonical,
  ...overrides,
});
const response = (records, identities = {}) => ({
  contractVersion: pure.CONTRACT_VERSION,
  enabled: true,
  records,
  identities,
});
const matches = (
  records,
  candidate = { indexId: id(999) },
  identities = { [id(999)]: canonical },
) =>
  findSavedAgencyMatches(
    indexSavedAgencies(response(records, identities)),
    candidate,
  );

test("all saved stages count, group by stable project IDs, and exclude the current agent across projects", () => {
  const result = matches([
    saved(),
    saved({
      id: id(11),
      index_id: id(101),
      name: "Blair",
      column_name: "rejected",
    }),
    saved({
      id: id(12),
      index_id: id(102),
      name: "Casey",
      dashboard_project_id: projectB,
      project_name: "Project B",
      column_name: "offer-made",
    }),
    saved({
      id: id(13),
      index_id: id(999),
      name: "Current agent",
      dashboard_project_id: projectB,
    }),
  ]);
  assert.equal(result.projects.length, 2);
  assert.equal(result.projects[0].agents.join(", "), "Alex, Blair");
  assert.equal(result.projects[1].agents.join(", "), "Casey");
  assert.equal(result.hasFallback, false);
});
test("same-named projects remain distinct, repeated saves of one agent are deduplicated within each project", () => {
  const result = matches([
    saved(),
    saved({ id: id(11) }),
    saved({ id: id(12), dashboard_project_id: projectB }),
  ]);
  assert.equal(result.projects.length, 2);
  assert.equal(result.projects[0].agents.length, 1);
});
test("different canonical IDs do not match through a common name or domain", () => {
  assert.equal(
    resolveAgencyMatch(canonical, { ...canonical, agencyId: id(801) }),
    "none",
  );
  assert.equal(
    matches([saved({ identity: { ...canonical, agencyId: id(801) } })]).projects
      .length,
    0,
  );
});
test("domain/name fallback is identified, shared hosts and missing identity never match", () => {
  assert.equal(
    matches([
      saved({ identity: { agencyUrl: "https://www.oak.example/submissions" } }),
    ]).hasFallback,
    true,
  );
  assert.equal(
    matches([saved({ identity: { agencyName: "Oak Literary Agency" } })])
      .hasFallback,
    true,
  );
  const shared = { agencyUrl: "https://agency.querymanager.com" };
  assert.equal(resolveAgencyMatch(shared, shared), "none");
  assert.equal(resolveAgencyMatch({}, {}), "none");
  assert.equal(pure.normalizeAgencyDomain("javascript:alert(1)"), null);
});
test("deleting the last other agent removes the warning; deleted candidates cannot use stale props", () => {
  const current = saved({ id: id(11), index_id: id(101), name: "Blair" });
  const candidate = { recordId: current.id };
  assert.equal(matches([saved(), current], candidate).projects.length, 1);
  assert.equal(matches([current], candidate).projects.length, 0);
  assert.equal(
    matches([saved()], { ...candidate, agencyName: "Oak" }).projects.length,
    0,
  );
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
  enabled = true,
  limited = false,
  rows = [row()],
  identities = new Map(),
  ...options
} = {}) {
  const db = database(rows, options);
  let catalogIds;
  const route = loader(
    {
      "@clerk/nextjs/server": { auth: async () => ({ userId }) },
      "next/server": {
        NextResponse: { json: (body, init) => Response.json(body, init) },
      },
      "@/app/api/supabase/server": { createServerSupabase: () => db },
      "@/app/constants": { AGENT_MATCHES_TABLE: "agent_matches" },
      "@/app/utils/query-safety/agency-identity.server": {
        fetchAgencyIdentities: async (ids) => {
          catalogIds = ids;
          return identities;
        },
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
  )("app/api/query-safety/agency-guard/route.ts");
  return {
    db,
    catalogIds: () => catalogIds,
    request: async (body = { candidateIds: [] }) => {
      const result = await route.POST(
        new Request("https://local/api/query-safety/agency-guard", {
          method: "POST",
          body: JSON.stringify(body),
        }),
      );
      assert.equal(result.headers.get("cache-control"), "private, no-store");
      return { result, body: await result.json() };
    },
  };
}
test("unauthenticated, disabled and rate limited checks do not read private records", async () => {
  for (const [options, status] of [
    [{ userId: null }, 401],
    [{ enabled: false }, 200],
    [{ limited: true }, 429],
  ]) {
    const h = harness(options);
    const { result, body } = await h.request();
    assert.equal(result.status, status);
    assert.equal(h.db.calls.length, 0);
    if (options.enabled === false) assert.equal(body.enabled, false);
  }
});
test("batch input rejects ownership/identity spoofing, oversized batches, malformed IDs and old per-agent contracts", async () => {
  for (const body of [
    { candidateIds: [], userId: "other" },
    { candidateIds: ["manual:one"] },
    { candidateIds: Array(1001).fill(id(1)) },
    { dashboardProjectId: projectA },
    { candidateIds: [], agencyId: id(800) },
    null,
  ]) {
    const h = harness();
    assert.equal((await h.request(body)).result.status, 400);
    assert.equal(h.db.calls.length, 0);
  }
});
test("every account gets all owned projects and every stage, never another account's records", async () => {
  const h = harness({
    rows: [
      row(),
      row({
        id: id(11),
        index_id: id(101),
        dashboard_project_id: projectB,
        column_name: "rejected",
      }),
      row({ id: id(12), user_id: "other" }),
    ],
    identities: new Map([[id(100), canonical]]),
  });
  const { result, body } = await h.request({ candidateIds: [id(999)] });
  assert.equal(result.status, 200);
  assert.equal(body.records.length, 2);
  assert.equal(body.records[0].identity.agencyId, canonical.agencyId);
  assert.ok(h.catalogIds().includes(id(999)));
  for (const call of h.db.calls)
    assert.ok(
      call.predicates.some(
        ([key, value]) => key === "user_id" && value === "owner",
      ),
    );
  assert.equal(body.records[0].column_name, undefined);
  assert.equal(body.records[0].user_id, undefined);
});
test("batch scans all pages even with a lower database cap and fails on incomplete/error reads", async () => {
  const rows = Array.from({ length: 5 }, (_, i) => row({ id: id(i + 10) }));
  const h = harness({ rows, cap: 2 });
  assert.equal((await h.request()).body.records.length, 5);
  assert.equal(h.db.calls.length, 4);
  assert.equal((await harness({ failure: true }).request()).result.status, 503);
  const tooMany = Array.from({ length: 10001 }, (_, i) =>
    row({ id: id(i + 10) }),
  );
  assert.equal((await harness({ rows: tooMany }).request()).result.status, 503);
});
test("one provider check is keyed by account, navigation and successful saved changes, but not query stage", () => {
  const React = require("react");
  const effects = [];
  let options,
    userId = "owner",
    path = "/projects/a/dashboard",
    rows = [row()],
    discovery = [];
  const client = { cancelQueries() {}, removeQueries() {} };
  const Provider = loader({
    react: {
      ...React,
      useMemo: (fn) => fn(),
      useEffect: (fn) => effects.push(fn),
    },
    "@clerk/nextjs": { useUser: () => ({ user: { id: userId } }) },
    "next/navigation": { usePathname: () => path },
    "@tanstack/react-query": {
      useQuery: (value) => {
        options = value;
        return {};
      },
      useQueryClient: () => client,
    },
    "@/app/(app)/context/profile-context": {
      useProfileContext: () => ({ agentsList: rows }),
    },
    "@/app/(app)/context/agent-matches-context": {
      useAgentMatches: () => ({ matches: discovery }),
    },
  })(
    "app/components/query-safety/agency-history-provider.tsx",
  ).AgencyHistoryProvider;
  const render = () => {
    Provider({ children: null });
    return JSON.stringify(options.queryKey);
  };
  const original = render();
  assert.equal(options.enabled, true);
  assert.equal(options.gcTime, 0);
  assert.equal(options.refetchOnMount, "always");
  rows = [{ ...rows[0], column_name: "rejected" }];
  assert.equal(render(), original);
  rows = [];
  assert.notEqual(render(), original);
  rows = [row()];
  userId = "other";
  assert.notEqual(render(), original);
  userId = "owner";
  path = "/agent-matches";
  discovery = [{ agent_id: id(777) }, { agent_id: id(778) }];
  assert.ok(render().includes(id(777)));
  rows = undefined;
  render();
  assert.equal(options.enabled, false);
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
                agency_id: canonical.agencyId,
                agency_name: "Oak",
                agency_url: null,
              },
            })),
            {
              agent_id: id(99999),
              agency_identity: {
                agency_id: canonical.agencyId,
                agency_name: "Injected",
              },
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
  const { body } = await harness().request();
  assert.equal(body.records[0].identity.agencyName, "Oak");
});
test("rate limiting expires and accounts have independent budgets", () => {
  const rate = load("app/utils/query-safety/rate-limit.server.ts");
  for (let n = 0; n < 60; n++)
    assert.equal(rate.checkAgencyHistoryRateLimit("one", 0), true);
  assert.equal(rate.checkAgencyHistoryRateLimit("one", 1), false);
  assert.equal(rate.checkAgencyHistoryRateLimit("two", 1), true);
  assert.equal(rate.checkAgencyHistoryRateLimit("one", 60001), true);
});

test("direct dashboard loads wait for Clerk and rehydrate when the account resolves", async () => {
  const React = require("react");
  let user = null,
    agentsList,
    isError = false,
    stateIndex = 0,
    effectIndex = 0;
  const states = [],
    previousDeps = [],
    effects = [];
  const refetch = async () => ({ data: { agent_matches: [row()] } });
  const Provider = loader({
    react: {
      ...React,
      useState: (initial) => {
        const slot = stateIndex++;
        if (!(slot in states)) states[slot] = initial;
        return [
          states[slot],
          (value) => {
            states[slot] =
              typeof value === "function" ? value(states[slot]) : value;
          },
        ];
      },
      useCallback: (callback) => callback,
      useMemo: (callback) => callback(),
      useEffect: (callback, deps) => {
        const slot = effectIndex++;
        if (
          !previousDeps[slot] ||
          deps.some((value, i) => value !== previousDeps[slot][i])
        )
          effects.push(callback);
        previousDeps[slot] = deps;
      },
    },
    "@clerk/nextjs": { useUser: () => ({ user }) },
    "next/navigation": { useRouter: () => ({ push() {} }) },
    "@/app/(app)/context/profile-context": {
      useProfileContext: () => ({
        agentsList,
        isError,
        refetch,
        projects: [],
        isLoading: false,
      }),
    },
    "@/app/components/fit-rating-badge": {
      getFitRatingFromScore: () => "neutral",
    },
    "@/app/constants": { DEFAULT_PROJECT_NAME: "Untitled Project" },
    "@/app/utils/project-dashboard-summary": {
      normalizeProjectName: (name) => name,
    },
  })(
    "app/(app)/query-dashboard/context/query-dash-context.tsx",
  ).QueryDashProvider;
  function render() {
    stateIndex = 0;
    effectIndex = 0;
    return Provider({ children: null, dashboardProjectId: projectA }).props
      .value;
  }
  render();
  effects.splice(0).forEach((effect) => effect());
  assert.equal(render().isLoading, true);
  user = { id: "owner" };
  render();
  effects.splice(0).forEach((effect) => effect());
  assert.equal(render().isLoading, true);
  isError = true;
  assert.equal(render().hasLoadError, true);
  assert.equal(render().isLoading, false);
  isError = false;
  agentsList = [row()];
  render();
  effects.splice(0).forEach((effect) => effect());
  const state = render();
  assert.equal(state.visibleCards.length, 1);
  assert.equal(state.isLoading, false);
  user = null;
  render();
  effects.splice(0).forEach((effect) => effect());
  assert.equal(render().visibleCards.length, 0);
});

test("successful bulk removals and saves update the shared cache even if a follow-up read fails", async () => {
  const React = require("react");
  const { QueryClient } = require("@tanstack/react-query");
  const client = new QueryClient();
  const key = ["agent-matches", "owner"];
  const original = row();
  client.setQueryData(key, { agent_matches: [original], projects: [] });
  let succeed = true;
  const created = row({ id: id(555), index_id: id(556), name: "New agent" });
  const Provider = loader({
    react: { ...React, useMemo: (fn) => fn(), useState: (value) => [value, () => {}], useRef: () => ({current: false}), useEffect: () => {} },
    "@clerk/nextjs": {useUser: () => ({user:{id:"owner"}})},
    "@tanstack/react-query": {useQueryClient: () => client},
    "@/app/hooks/use-fetch-agents-list": {useFetchAgentsList: () => ({ data:client.getQueryData(key), refetch:async () => ({isError:true}) })},
    "sonner": {toast:{success(){},error(){}}},
  }, {fetch:async () => Response.json(succeed ? {created:[created]} : {error:"Failed"}, {status:succeed?201:500})})("app/(app)/context/profile-context.tsx").ProfileProvider;
  const value = Provider({children:null}).props.value;
  await value.saveAgent({name:"New agent", index_id:id(556)});
  assert.equal(client.getQueryData(key).agent_matches.length,2);
  await value.removeAgents([original.id,created.id]);
  assert.equal(client.getQueryData(key).agent_matches.length,0);
  succeed=false;
  await value.saveAgent({name:"Failed"});
  assert.equal(client.getQueryData(key).agent_matches.length,0);
  client.clear();
});
