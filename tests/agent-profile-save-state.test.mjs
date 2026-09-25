import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import test from "node:test";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const React = require("react");
const { QueryClient } = require("@tanstack/react-query");
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
function load(path, mocks = {}, globals = {}) {
  const source = process.env.TEST_BASE_REF
    ? execFileSync("git", ["show", `${process.env.TEST_BASE_REF}:${path}`], {
        cwd: root,
        encoding: "utf8",
      })
    : readFileSync(resolve(root, path), "utf8");
  const compiledModule = { exports: {} };
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText;
  vm.runInNewContext(output, {
    module: compiledModule,
    exports: compiledModule.exports,
    console,
    Response,
    require: (specifier) =>
      Object.hasOwn(mocks, specifier) ? mocks[specifier] : require(specifier),
    ...globals,
  });
  return compiledModule.exports;
}
const first = {
  id: "saved-one",
  index_id: "agent-one",
  name: "Agent One",
  project_name: "Cool Finance",
  writer_project_id: null,
  dashboard_project_id: "dashboard-one",
  match_score: 4,
};
const otherProject = {
  ...first,
  id: "saved-two",
  writer_project_id: "other-project",
  dashboard_project_id: "dashboard-two",
};
const scope = load("app/utils/project-scope.ts", {
  "@/app/constants": { DEFAULT_PROJECT_NAME: "Untitled Project" },
});

test("removing a saved agent cancels a stale list refresh before it can restore the deleted row", async () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  client.setQueryData(["agent-matches"], {
    agent_matches: [first, otherProject],
  });
  let finishRefresh;
  const refresh = client
    .fetchQuery({
      queryKey: ["agent-matches"],
      queryFn: () =>
        new Promise((resolveRefresh) => {
          finishRefresh = resolveRefresh;
        }),
    })
    .catch(() => {});
  const { ProfileProvider } = load("app/(app)/context/profile-context.tsx", {
    react: {
      ...React,
      useState: (value) => [value, () => {}],
      useRef: (value) => ({ current: value }),
      useEffect: () => {},
      useMemo: (calculate) => calculate(),
    },
    "@tanstack/react-query": { useQueryClient: () => client },
    "@/app/hooks/use-fetch-agents-list": {
      useFetchAgentsList: () => ({
        data: client.getQueryData(["agent-matches"]),
      }),
    },
    "@/app/utils/project-scope": scope,
    "@/app/utils/project-dashboard-summary": {
      buildProjectDashboardSummaries: () => [],
    },
    sonner: { toast: {} },
  });
  const profile = ProfileProvider({ children: null }).props.value;
  await profile.removeAgent(first.id);
  finishRefresh({ agent_matches: [first, otherProject] });
  await refresh;
  assert.deepEqual(
    client
      .getQueryData(["agent-matches"])
      .agent_matches.map((agent) => agent.id),
    [otherProject.id],
  );
  client.clear();
});

function content(element) {
  if (typeof element === "string" || typeof element === "number")
    return String(element);
  if (!element || typeof element !== "object") return "";
  return [element.props?.children].flat(Infinity).map(content).join("");
}
function findButton(element, label) {
  if (!element || typeof element !== "object") return null;
  if (element.type === "button" && content(element) === label) return element;
  return [element.props?.children]
    .flat()
    .map((child) => findButton(child, label))
    .find(Boolean);
}
function profileHarness({ deleteSucceeds = true } = {}) {
  let rows = [first, otherProject];
  const slots = [];
  let slot = 0;
  const navigations = [];
  let mutation;
  let savePayload;
  let viewedAgent;
  const useDeleteAgentMatch = load(
    "app/hooks/use-delete-agent.tsx",
    {
      "@tanstack/react-query": {
        useMutation: (options) => ({
          isPending: false,
          mutate: (id) => {
            mutation = options
              .mutationFn(id)
              .then(options.onSuccess, options.onError);
          },
        }),
      },
      sonner: { toast: { success() {}, error() {} } },
    },
    {
      fetch: async () =>
        new Response(null, { status: deleteSucceeds ? 200 : 500 }),
    },
  ).useDeleteAgentMatch;
  const Profile = load("app/(app)/query-dashboard/[agent-id]/page.tsx", {
    react: {
      ...React,
      use: (value) => value,
      useState: (initial) => {
        const index = slot++;
        if (!(index in slots)) slots[index] = initial;
        return [
          slots[index],
          (value) => {
            slots[index] = value;
          },
        ];
      },
    },
    "@/app/hooks/use-fetch-agent": {
      useFetchAgent: (id) => {
        viewedAgent = id;
        return {
          data: id ? { agent: { name: "Agent One", genres: "Finance" } } : null,
        };
      },
    },
    "@/app/(app)/context/profile-context": {
      useProfileContext: () => ({
        agentsList: rows,
        removeAgent: async (id) => {
          rows = rows.filter((row) => row.id !== id);
        },
        savingAgentId: null,
        saveAgent: async (payload) => {
          savePayload = payload;
          rows = [...rows, { ...first, ...payload, id: "saved-again" }];
          return { created: [{ id: "saved-again" }] };
        },
      }),
    },
    "@/app/hooks/use-delete-agent": { useDeleteAgentMatch },
    "@/app/ui-primitives/button": { Button: "button" },
    "@/app/ui-primitives/spinner": { Spinner: "spinner" },
    "@/app/components/tooltip": "tooltip",
    "@/app/components/star-rating": "rating",
    "@/app/components/agent-contact-details": "details",
    "@/app/utils": {
      formatGenres: (value) => [value],
      formatDisplayString: (value) => value,
      capitalizeFirstCharacter: (value) => value,
    },
    "next/link": "link",
    "next/navigation": {
      useRouter: () => ({ replace: (href) => navigations.push(href) }),
    },
  }).default;
  return {
    render: (id = first.id) => {
      slot = 0;
      return Profile({ params: { "agent-id": id } });
    },
    finishDelete: () => mutation,
    navigations,
    get rows() {
      return rows;
    },
    get savePayload() {
      return savePayload;
    },
    get viewedAgent() {
      return viewedAgent;
    },
  };
}

test("deleting on the profile keeps that agent visible and switches Delete Agent to Save Agent", async () => {
  const harness = profileHarness();
  findButton(harness.render(), "Delete Agent").props.onClick();
  await harness.finishDelete();
  const after = harness.render();
  assert.ok(findButton(after, "Save Agent"));
  assert.equal(findButton(after, "Delete Agent"), undefined);
  assert.equal(harness.viewedAgent, "agent-one");
  assert.deepEqual(harness.navigations, []);
  assert.deepEqual(
    harness.rows.map((row) => row.id),
    [otherProject.id],
  );
  await findButton(after, "Save Agent").props.onClick();
  assert.equal(harness.savePayload.project_name, "Cool Finance");
  assert.equal(harness.savePayload.writer_project_id, null);
  assert.equal(harness.savePayload.index_id, first.index_id);
  assert.deepEqual(harness.navigations, ["/query-dashboard/saved-again"]);
  assert.ok(findButton(harness.render("saved-again"), "Delete Agent"));
});

test("a failed deletion retains the saved state", async () => {
  const harness = profileHarness({ deleteSucceeds: false });
  findButton(harness.render(), "Delete Agent").props.onClick();
  await harness.finishDelete();
  assert.ok(findButton(harness.render(), "Delete Agent"));
  assert.equal(harness.rows.length, 2);
});
