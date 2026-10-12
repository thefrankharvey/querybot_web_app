import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import test from "node:test";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
function load(path, mocks = {}, globals = {}) {
  const filename = new URL(`../${path}`, import.meta.url);
  const compiled = { exports: {} };
  const output = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  vm.runInNewContext(output, {
    module: compiled, exports: compiled.exports, URL, URLSearchParams, Headers,
    AbortController, setTimeout, clearTimeout, console: { error() {} },
    require: (name) => Object.hasOwn(mocks, name) ? mocks[name] : require(name),
    ...globals,
  });
  return compiled.exports;
}
const plain = (value) => JSON.parse(JSON.stringify(value));
const utils = load("app/utils/home-agent-recommendations.ts");
const restore = load("app/utils/smart-match-restore.ts");
const profiles = load("app/utils/project-profile.ts", { "./smart-match-restore": restore });

test("country comes only from infrastructure headers, with all-country fallback", () => {
  for (const headers of [{}, { "cf-ipcountry": "FR" }, { "cf-ipcountry": "UK" },
    { "cf-ipcountry": "XX" }, { "accept-language": "en-US" },
    { "country": "GB" }, { "x-forwarded-for": "1.2.3.4" }]) {
    assert.equal(utils.getRecommendationCountry(new Headers(headers)), "all");
  }
  assert.equal(utils.getRecommendationCountry(new Headers({ "cf-ipcountry": "US" })), "US");
  assert.equal(utils.getRecommendationCountry(new Headers({ "cf-ipcountry": " gb " })), "GB");
  assert.equal(utils.getRecommendationCountry(new Headers({ "x-vercel-ip-country": "GB" })), "GB");
});

test("project identity comes only from a current dashboard, including renames and explicit legacy IDs", () => {
  const dashboards = [
    { id: "dashboard-a", project_name: "Renamed book", writer_project_id: "writer-a" },
    { id: "dashboard-legacy", project_name: "Older Book", writer_project_id: null },
  ];
  assert.deepEqual(plain(utils.resolveRecommendationProject("writer-a", dashboards)), {
    projectName: "Renamed book", searchWriterProjectId: "writer-a", writerProjectId: "writer-a", dashboardProjectId: "dashboard-a",
  });
  assert.equal(utils.resolveRecommendationProject("dashboard-legacy", dashboards).writerProjectId, null);
  assert.equal(utils.resolveRecommendationProject("search-only", dashboards), null);
  assert.equal(utils.resolveRecommendationProject("new", dashboards), null);
  assert.match(utils.getRecommendationAgentHref("agent/a", "book b"), /agent%2Fa\?project=book%20b$/);
});

const latestProject = { id: "latest", project_name: "Latest book", genre: "fantasy", comps: ["Title", "Author"], updated_at: "2026-10-12T12:00:00Z" };
function harness({ subscribed = false, history = [latestProject], saved = [], dashboards = [{ id: "dashboard-latest", project_name: "Latest book", writer_project_id: "latest" }], userId = "owner", user, matchResult, dbError = false, pageCap = Infinity } = {}) {
  const calls = [], reads = [];
  const account = user === undefined ? { id: "owner", publicMetadata: { isSubscribed: subscribed }, primaryEmailAddress: { emailAddress: "owner@example.test" } } : user;
  const route = load("app/api/home/agent-recommendations/route.ts", {
    "@clerk/nextjs/server": { auth: async () => ({ userId }), currentUser: async () => account },
    "next/server": { NextResponse: { json: (body, init) => Response.json(body, init) } },
    "@/app/constants": { AGENT_MATCHES_TABLE: "agent_matches" },
    "@/app/utils/home-agent-recommendations": utils,
    "@/app/utils/smart-match-restore": restore,
    "@/app/utils/project-profile": profiles,
    "@/app/utils": { formatComps: (comps) => comps.flatMap(({ title, author }) => [title, author]).filter(Boolean) },
    "@/lib/config": { getWqhApiEndpoint: (name) => `https://backend.test/${name}` },
    "@/lib/wqh-history-auth": { getWriterEmail: (value) => value.primaryEmailAddress?.emailAddress, getWqhHistoryHeaders: () => ({ Authorization: "Bearer server-secret" }) },
    "@/app/api/supabase/server": { createServerSupabase: () => ({
      from(table) {
        const read = { table, owner: null, start: 0, end: Infinity };
        reads.push(read);
        const query = {
          select() { return this; }, eq(key, value) { if (key === "user_id") read.owner = value; return this; },
          order() { return this; }, range(start, end) { read.start = start; read.end = end; return this; },
          then(resolve) { return Promise.resolve({ data: (table === "agent_matches" ? saved : dashboards).slice(read.start, Math.min(read.end + 1, read.start + pageCap)), error: dbError ? { message: "down" } : null }).then(resolve); },
        };
        return query;
      },
    }) },
  }, {
    fetch: async (url, options) => {
      calls.push({ url: new URL(url), options });
      if (new URL(url).pathname === "/get-writer-projects") return Response.json({ status: "success", writer_projects: history });
      return Response.json(matchResult ?? { recommendations_only: true, matches: [{ agent_id: "match-a", name: "Agent A", status: "open" }] });
    },
  });
  return { calls, reads, get: (url = "", headers = {}) => route.GET(new Request(`https://app.test/api/home/agent-recommendations${url}`, { headers })) };
}

for (const subscribed of [false, true]) {
  test(`${subscribed ? "paid" : "free"} home uses latest project, server identity, open status and geolocation`, async () => {
    const api = harness({ subscribed, history: [
      { ...latestProject, id: "older", updated_at: "2026-09-01T12:00:00Z" }, latestProject,
    ], saved: [{ id: "saved-1", index_id: "already-saved", project_name: "Another book", column_name: "rejected" }] });
    const response = await api.get("?country_code=US&country_filter=US", { "cf-ipcountry": "GB" });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("cache-control"), "private, no-store");
    const result = await response.json();
    assert.equal(result.country, "GB");
    assert.equal(result.project.searchWriterProjectId, "latest");
    assert.equal(api.calls[0].url.searchParams.get("include_profiles"), "true");
    const call = api.calls[1];
    assert.equal(call.url.pathname, `/get-agents-${subscribed ? "paid" : "free"}`);
    assert.equal(call.url.searchParams.get("status"), "open");
    assert.equal(call.url.searchParams.get("country_code"), "GB");
    assert.equal(call.options.headers.Authorization, "Bearer server-secret");
    const payload = JSON.parse(call.options.body);
    assert.equal(payload.email, "owner@example.test");
    assert.equal(payload.writer_project_id, "latest");
    assert.equal(payload.recommendations_only, true);
    assert.deepEqual(payload.exclude_agent_ids, ["already-saved"]);
    assert.deepEqual(payload.comps, ["Title", "Author"]);
    assert.ok(api.reads.every((read) => read.owner === "owner"));
    assert.doesNotMatch(JSON.stringify(result), /server-secret|owner@example/);
  });
}

test("unsupported or missing country never sends a country restriction", async () => {
  for (const headers of [{}, { "cf-ipcountry": "CA" }, { "cf-ipcountry": "XX" }]) {
    const api = harness();
    assert.equal((await (await api.get("?country_code=GB", headers)).json()).country, "all");
    assert.equal(api.calls[1].url.searchParams.has("country_code"), false);
  }
});

test("saved-agent exclusions read all pages and fail closed if the dashboard cannot load", async () => {
  const saved = Array.from({ length: 1001 }, (_, index) => ({ id: `row-${index}`, index_id: `agent-${index}` }));
  for (const pageCap of [Infinity, 300]) {
    const api = harness({ saved, pageCap });
    assert.equal((await api.get()).status, 200);
    assert.equal(JSON.parse(api.calls[1].options.body).exclude_agent_ids.length, 1001);
    assert.equal(api.reads.filter((read) => read.table === "agent_matches").length, pageCap === Infinity ? 3 : 5);
  }
  const failed = harness({ dbError: true });
  assert.equal((await failed.get()).status, 502);
  assert.equal(failed.calls.length, 1);
});

test("empty history shows onboarding without starting a search", async () => {
  const api = harness({ history: [] });
  const result = await (await api.get()).json();
  assert.equal(result.project, null);
  assert.deepEqual(result.matches, []);
  assert.equal(api.calls.length, 1);
});

test("orphaned or removed projects never override a current My Projects dashboard", async () => {
  const api = harness({
    history: [latestProject, { ...latestProject, id: "orphan", project_name: "Finance Fun Time", updated_at: "2026-10-13" }],
    dashboards: [{ id: "dashboard-latest", project_name: "Crime in the Streets", writer_project_id: "latest" }],
  });
  const result = await (await api.get()).json();
  assert.equal(result.project.projectName, "Crime in the Streets");
  assert.equal(JSON.parse(api.calls[1].options.body).writer_project_id, "latest");
  assert.equal((await api.get("?project=orphan&agent=match-a")).status, 404);
  assert.equal(api.calls.length, 3);
  const removed = harness({ dashboards: [] });
  assert.equal((await (await removed.get()).json()).project, null);
  assert.equal(removed.calls.length, 1);
});

test("matching a legacy title alone cannot revive unrelated search history", async () => {
  const api = harness({ dashboards: [{ id: "legacy", project_name: "Latest book", writer_project_id: null }] });
  assert.equal((await (await api.get()).json()).project, null);
  assert.equal(api.calls.length, 1);
});

test("current saved profile edits and manual projects can drive recommendations before a search", async () => {
  const api = harness({
    history: [latestProject, { ...latestProject, id: "manual", updated_at: "2026-10-13", profile_only: true, comps: ["Book", "", "Second", "Author"] }],
    dashboards: [
      { id: "dashboard-latest", project_name: "Latest book", writer_project_id: "latest" },
      { id: "manual", project_name: "Edited manuscript", writer_project_id: null },
    ],
  });
  const result = await (await api.get()).json();
  assert.equal(result.project.projectName, "Edited manuscript");
  const body = JSON.parse(api.calls[1].options.body);
  assert.equal(body.writer_project_id, "manual");
  assert.deepEqual(body.comps, ["Book", "", "Second", "Author"]);
});

test("title-only projects do not start an unqualified agent search", async () => {
  const api = harness({ history: [{ id: "latest", project_name: "Untitled", non_fiction: false }] });
  assert.equal((await (await api.get()).json()).project, null);
  assert.equal(api.calls.length, 1);
});

test("unauthenticated and mismatched accounts cannot read recommendations", async () => {
  for (const options of [{ userId: null }, { user: null }, { user: { id: "someone-else" } }]) {
    const api = harness(options);
    assert.equal((await api.get()).status, 401);
    assert.equal(api.calls.length, 0);
    assert.equal(api.reads.length, 0);
  }
});

test("profile refresh resolves an owned project and the exact agent even after it was saved", async () => {
  const api = harness({ saved: [{ index_id: "match-a" }], history: [
    latestProject, { ...latestProject, id: "previous", project_name: "Earlier book", updated_at: "2026-01-01" },
  ], dashboards: [{ id: "dashboard-previous", project_name: "Earlier book", writer_project_id: "previous" }] });
  const response = await api.get("?project=previous&agent=match-a");
  assert.equal(response.status, 200);
  assert.equal((await response.json()).project.searchWriterProjectId, "previous");
  const body = JSON.parse(api.calls[1].options.body);
  assert.equal(body.recommendation_agent_id, "match-a");
  assert.deepEqual(body.exclude_agent_ids, []);
  const denied = harness();
  assert.equal((await denied.get("?project=another-account&agent=match-a")).status, 404);
  assert.equal(denied.calls.length, 1);
  assert.equal((await harness().get("?agent=match-a")).status, 400);
});

test("old backend contracts and unavailable agents return recoverable errors", async () => {
  assert.equal((await harness({ matchResult: { matches: [] } }).get()).status, 502);
  assert.equal((await harness({ matchResult: { recommendations_only: true, matches: [] } }).get("?project=latest&agent=gone")).status, 404);
});

test("recommendations without catalog IDs never produce broken profile links", async () => {
  const api = harness({ matchResult: { recommendations_only: true, matches: [
    null, { name: "Missing ID" }, { agent_id: "" }, { agent_id: "valid", name: "Agent A" },
  ] } });
  assert.deepEqual((await (await api.get()).json()).matches.map((agent) => agent.agent_id), ["valid"]);
});

test("recommendation requests use account-scoped cache keys without touching Smart Match state", async () => {
  let options, requestedUrl;
  const { useHomeAgentRecommendations } = load("app/hooks/use-home-agent-recommendations.ts", {
    "@clerk/nextjs": { useUser: () => ({ isLoaded: true, user: { id: "owner" } }) },
    "@tanstack/react-query": { useQuery: (value) => { options = value; return value; } },
  }, { fetch: async (url) => { requestedUrl = url; return Response.json({ matches: [] }); } });
  useHomeAgentRecommendations("book-a", "agent-a");
  assert.deepEqual(plain(options.queryKey), ["home-agent-recommendations", "owner", "book-a", "agent-a"]);
  assert.equal(options.refetchOnMount, "always");
  assert.equal(options.refetchOnWindowFocus, false);
  await options.queryFn({ signal: new AbortController().signal });
  assert.equal(requestedUrl, "/api/home/agent-recommendations?project=book-a&agent=agent-a");
});

function renderSection(state, profile = {}) {
  const cards = [];
  const ui = (tag) => ({ children, ...props }) => React.createElement(tag, props, children);
  const component = load("app/(app)/home/components/home-agent-recommendations.tsx", {
    "next/link": ui("a"),
    "@clerk/nextjs": { useUser: () => ({ isLoaded: true, user: { id: "owner" } }) },
    "@/app/hooks/use-home-agent-recommendations": { useHomeAgentRecommendations: () => ({ refetch: () => {}, ...state }) },
    "@/app/(app)/context/profile-context": { useProfileContext: () => ({ agentsList: [], ...profile }) },
    "@/app/(app)/agent-matches/components/agent-match-card": { AgentMatchCard: (props) => { cards.push(props); return React.createElement("a", { href: props.href }, props.agent.name); } },
    "@/app/ui-primitives/button": { Button: ({ children, asChild, ...props }) => asChild ? children : React.createElement("button", props, children) },
    "@/app/ui-primitives/skeleton": { Skeleton: () => React.createElement("div", { "data-skeleton": true }) },
    "@/app/ui-primitives/alert": Object.fromEntries(["Alert", "AlertDescription", "AlertTitle"].map((key) => [key, ui("div")])),
    "@/app/ui-primitives/empty": Object.fromEntries(["Empty", "EmptyContent", "EmptyDescription", "EmptyHeader", "EmptyTitle"].map((key) => [key, ui("div")])),
    "@/app/utils/home-agent-recommendations": utils,
  }).default;
  return { html: renderToStaticMarkup(React.createElement(component)), cards };
}

test("home reuses Smart Match cards with stable links and the recommendation project's save scope", async () => {
  const project = { projectName: "My book", writerProjectId: null, searchWriterProjectId: "search-a", dashboardProjectId: "dashboard-a" };
  let savedPayload, refetched = false;
  const { html, cards } = renderSection({ data: { project, country: "GB", isSubscribed: false, matches: [{ agent_id: "a", name: "Agent A" }, { agent_id: "saved", name: "Already saved" }] }, refetch: () => { refetched = true; } }, {
    agentsList: [{ index_id: "saved" }], saveAgent: async (payload) => { savedPayload = payload; return { created: [{}] }; },
  });
  assert.match(html, /Top 3 Agents for My book/);
  assert.doesNotMatch(html, /United Kingdom|United States|All countries/);
  assert.doesNotMatch(html, /Already saved/);
  assert.equal(cards[0].href, "/agent-matches/recommendations/a?project=search-a");
  assert.equal(cards[0].projectWriterId, null);
  cards[0].onSaveAgent({ name: "Agent A", index_id: "a" });
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(savedPayload.writer_project_id, null);
  assert.equal(savedPayload.dashboard_project_id, "dashboard-a");
  assert.equal(refetched, true);
});

test("loading, errors, first search and no new matches each have a usable state", () => {
  assert.match(renderSection({ isPending: true }).html, /Loading agent recommendations/);
  assert.match(renderSection({ isError: true }).html, /Try again/);
  assert.match(renderSection({ data: { country: "all", project: null, matches: [] } }).html, /Add manuscript details/);
  assert.match(renderSection({ data: { country: "US", project: { projectName: "Book" }, matches: [] } }).html, /No new open agents/);
});

test("shared profiles save and remove within the supplied project without current search state", async () => {
  const projectScope = load("app/utils/project-scope.ts", {
    "@/app/constants": { DEFAULT_PROJECT_NAME: "Untitled Project" },
  });
  const agent = { agent_id: "agent-a", name: "Agent A", genres: "fantasy", normalized_score: 4, status: "open" };
  const project = { projectName: "Older book", writerProjectId: null, dashboardProjectId: "dashboard-a" };
  let rows = [{ id: "other-row", index_id: "agent-a", project_name: "Current book", writer_project_id: "other-project" }];
  let saveClick, savedPayload, removedRow, contactAccess;
  const component = load("app/(app)/agent-matches/components/agent-profile-details.tsx", {
    "next/link": ({ children, ...props }) => React.createElement("a", props, children),
    "@/app/utils": { formatGenres: (value) => value.split(","), formatDisplayString: (value) => value, capitalizeFirstCharacter: (value) => value },
    "@/app/utils/string-utils": { normalizeAndDedup: (values) => [...new Set(values)] },
    "@/app/utils/project-scope": projectScope,
    "@/app/constants": { DEFAULT_PROJECT_NAME: "Untitled Project" },
    "@/app/components/query-safety/discovery-agency-guard": { DiscoveryAgencyGuard: () => null },
    "@/app/components/query-safety/agency-save-confirmation": { useAgencySaveConfirmation: () => ({ requestSave: (save) => save(), isChecking: false }) },
    "@/app/components/tooltip": ({ children }) => children,
    "@/app/ui-primitives/spinner": { Spinner: () => null },
    "@/app/ui-primitives/button": { Button: ({ children, onClick }) => { saveClick = onClick; return React.createElement("button", null, children); } },
    "@/app/components/agent-contact-details": ({ isSubscribed }) => { contactAccess = isSubscribed; return null; },
    "@/app/components/fit-rating-badge": { FitRatingBadge: () => null, getFitRatingFromScore: () => "great" },
    "@/app/(app)/query-dashboard/components/remove-agent": { RemoveAgent: ({ recordId }) => { removedRow = recordId; return React.createElement("button", null, "Remove Agent"); } },
    "@/app/(app)/context/profile-context": { useProfileContext: () => ({ agentsList: rows, savingAgentId: null, saveAgent: async (payload) => { savedPayload = payload; } }) },
  }).default;
  const render = (hasFullAccess) => renderToStaticMarkup(React.createElement(component, { agent, project, hasFullAccess, backHref: "/home" }));
  assert.match(render(false), /Save Agent/);
  assert.equal(contactAccess, false);
  saveClick({ currentTarget: {} });
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(savedPayload.project_name, "Older book");
  assert.equal(savedPayload.writer_project_id, null);
  assert.equal(savedPayload.dashboard_project_id, "dashboard-a");
  rows = [...rows, { id: "matching-row", index_id: "agent-a", project_name: "Older book", writer_project_id: null }];
  assert.match(render(true), /Remove Agent/);
  assert.equal(removedRow, "matching-row");
  assert.equal(contactAccess, true);
});
