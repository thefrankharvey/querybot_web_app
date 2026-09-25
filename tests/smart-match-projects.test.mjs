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

function loadModule(path, modules = {}, globals = {}) {
  const filename = resolve(repositoryRoot, path);
  const output = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
    fileName: filename,
  }).outputText;
  const compiledModule = { exports: {} };
  vm.runInNewContext(
    output,
    {
      module: compiledModule,
      exports: compiledModule.exports,
      URL,
      URLSearchParams,
      AbortController,
      AbortSignal,
      setTimeout,
      clearTimeout,
      console: { log() {}, error() {} },
      ...globals,
      require: (specifier) =>
        Object.hasOwn(modules, specifier)
          ? modules[specifier]
          : require(specifier),
    },
    { filename },
  );
  return compiledModule.exports;
}

const projectUtils = loadModule("app/utils/smart-match-projects.ts");
const {
  buildSmartMatchProjectOptions,
  resolveSmartMatchProject,
  getSmartMatchSaveProjectId,
} = projectUtils;
const original = {
  projectName: "Cool Finance",
  writerProjectId: "original-book",
};
const duplicate = {
  projectName: "Cool Finance",
  writerProjectId: "duplicate-book",
};

test("same-name projects stay separate and selection retains the original book ID", () => {
  const options = buildSmartMatchProjectOptions(
    [
      { ...original, savedAgentCount: 12 },
      { ...duplicate, savedAgentCount: 1 },
    ],
    [original, duplicate],
  );
  assert.equal(options.length, 2);
  assert.equal(new Set(options.map((option) => option.key)).size, 2);
  assert.equal(new Set(options.map((option) => option.label)).size, 2);
  assert.match(
    options.find(
      (option) => option.writerProjectId === original.writerProjectId,
    ).label,
    /12 saved agents/,
  );
  assert.equal(
    resolveSmartMatchProject("Cool Finance", original, options).writerProjectId,
    "original-book",
  );
  assert.equal(
    resolveSmartMatchProject("Cool Finance", duplicate, options)
      .writerProjectId,
    "duplicate-book",
  );
  assert.throws(
    () => resolveSmartMatchProject("Cool Finance", null, options),
    /Choose the existing project/,
  );
});

test("older saved projects retain their save scope when search history has an ID", () => {
  const options = buildSmartMatchProjectOptions(
    [
      {
        projectName: " cool finance ",
        writerProjectId: null,
        savedAgentCount: 12,
      },
    ],
    [original],
  );
  assert.equal(options.length, 1);
  assert.equal(options[0].savedAgentCount, 12);
  const target = resolveSmartMatchProject(" COOL FINANCE ", null, options);
  assert.equal(target.writerProjectId, null);
  assert.equal(
    getSmartMatchSaveProjectId({ save_project: target }, "original-book"),
    null,
  );
  assert.equal(
    resolveSmartMatchProject("Cool Finance", original, options).writerProjectId,
    null,
  );
});

test("projects with no saved agents can be reused and genuinely new names stay new", () => {
  const options = buildSmartMatchProjectOptions([
    {
      ...original,
      savedAgentCount: 0,
      dashboardProjectId: "dashboard-original",
    },
  ]);
  assert.equal(
    resolveSmartMatchProject("Cool Finance", null, options).writerProjectId,
    "original-book",
  );
  const next = resolveSmartMatchProject(" My New Book ", original, options);
  assert.equal(next.writerProjectId, null);
  assert.equal(next.projectName, "My New Book");
});

test("existing legacy and canonical dashboards stay distinct even with the same title", () => {
  const legacy = {
    projectName: "Cool Finance",
    writerProjectId: null,
    savedAgentCount: 12,
  };
  const options = buildSmartMatchProjectOptions(
    [legacy, { ...duplicate, savedAgentCount: 1 }],
    [original, duplicate],
  );
  assert.equal(options.length, 2);
  assert.equal(
    resolveSmartMatchProject("Cool Finance", legacy, options).writerProjectId,
    null,
  );
  assert.equal(
    resolveSmartMatchProject("Cool Finance", duplicate, options)
      .writerProjectId,
    "duplicate-book",
  );
  assert.throws(
    () => resolveSmartMatchProject("Cool Finance", null, options),
    /Choose the existing project/,
  );
});

test("the existing-project dropdown passes identity and typing another name clears it", () => {
  const ProjectName = loadModule(
    "app/(app)/smart-match/components/project-name.tsx",
    {
      "@/app/ui-primitives/input": { Input: "input" },
      "@/app/ui-primitives/select": Object.fromEntries(
        [
          "Select",
          "SelectContent",
          "SelectGroup",
          "SelectItem",
          "SelectTrigger",
          "SelectValue",
        ].map((name) => [name, name]),
      ),
    },
  ).default;
  const projects = buildSmartMatchProjectOptions(
    [
      { ...original, savedAgentCount: 12 },
      { ...duplicate, savedAgentCount: 1 },
    ],
    [],
  );
  let form = { project_name: "" };
  let selectedProject = null;
  const render = () =>
    ProjectName({
      form,
      projects,
      selectedProject,
      setForm: (update) => {
        form = update(form);
      },
      onProjectSelect: (project) => {
        selectedProject = project;
      },
    });
  function find(element, type) {
    if (!element || typeof element !== "object") return null;
    if (element.type === type) return element;
    return [element.props?.children]
      .flat()
      .map((child) => find(child, type))
      .find(Boolean);
  }
  find(render(), "Select").props.onValueChange("writer:original-book");
  assert.equal(form.project_name, "Cool Finance");
  assert.equal(selectedProject.writerProjectId, "original-book");
  assert.equal(find(render(), "Select").props.value, "writer:original-book");
  find(render(), "input").props.onChange({ target: { value: "New Book" } });
  assert.equal(selectedProject, null);
  assert.equal(find(render(), "Select").props.value, "");
});

function createApi({
  projects = [original],
  userId = "writer",
  lookupStatus = 200,
} = {}) {
  const calls = [];
  const store = {
    createServerSupabase: () => ({
      from: (table) => {
        assert.equal(table, "dashboard_projects");
        return {
          select: () => ({
            eq: async (key, value) => {
              assert.equal(key, "user_id");
              assert.equal(value, userId);
              calls.push({ lookup: true });
              return {
                data: projects.map((project) => ({
                  id:
                    project.dashboardProjectId ??
                    `dashboard-${project.writerProjectId}`,
                  project_name: project.projectName,
                  writer_project_id: project.writerProjectId,
                })),
                error: lookupStatus === 200 ? null : { message: "Unavailable" },
              };
            },
          }),
        };
      },
    }),
  };
  const fetch = async (url, init) => {
    calls.push({ url, init });
    if (url.includes("/get-writer-projects?")) {
      return Response.json(
        {
          status: lookupStatus === 200 ? "success" : "error",
          writer_projects: projects.map((project) => ({
            id: project.writerProjectId,
            project_name: project.projectName,
          })),
        },
        { status: lookupStatus },
      );
    }
    const payload = JSON.parse(init.body);
    return Response.json({
      matches: [{ id: "agent-new" }],
      writer_project_id: payload.writer_project_id || "created-project",
      task_id: "sheet-task",
    });
  };
  const config = {
    getWqhApiUrl: () => "https://matching.example.test",
    getWqhApiEndpoint: (path) => `https://matching.example.test/${path}`,
  };
  const historyAuth = {
    getWqhHistoryHeaders: () => ({ Authorization: "Bearer server-key" }),
    getWriterEmail: (user) => user.primaryEmailAddress.emailAddress,
  };
  const server = loadModule(
    "app/utils/smart-match-projects.server.ts",
    {
      "server-only": {},
      "@/app/api/supabase/server": store,
      "@/lib/config": config,
      "@/lib/wqh-history-auth": historyAuth,
      "./smart-match-projects": projectUtils,
      "./smart-match-restore": loadModule("app/utils/smart-match-restore.ts"),
    },
    { fetch },
  );
  const modules = {
    "@/lib/config": config,
    "@/lib/wqh-history-auth": historyAuth,
    "@/app/utils/smart-match-projects.server": server,
    "@clerk/nextjs/server": {
      auth: async () => ({ userId }),
      currentUser: async () => ({
        id: userId,
        primaryEmailAddress: { emailAddress: "writer+test@example.test" },
      }),
    },
    "next/server": {
      NextResponse: { json: (body, init) => Response.json(body, init) },
    },
  };
  return {
    calls,
    route: (tier) =>
      loadModule(`app/api/get-agents-${tier}/route.ts`, modules, { fetch }),
    projectsRoute: () =>
      loadModule("app/api/smart-match/projects/route.ts", modules),
  };
}

function searchRequest(payload = {}) {
  return new Request(
    "https://app.example.test/api/get-agents-paid?last_index=21&status=open",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "writer+test@example.test",
        project_name: "Cool Finance",
        genre: "finance",
        ...payload,
      }),
    },
  );
}

for (const tier of ["paid", "free"]) {
  test(`${tier}: name-only searches append to the existing project before matching`, async () => {
    const api = createApi();
    const response = await api
      .route(tier)
      .POST(searchRequest({ project_name: " cool finance " }));
    assert.equal(response.status, 200);
    assert.equal(api.calls.length, 2);
    assert.equal(api.calls[0].lookup, true);
    const forwarded = JSON.parse(api.calls[1].init.body);
    assert.equal(forwarded.writer_project_id, "original-book");
    assert.equal(forwarded.genre, "finance");
    assert.equal(forwarded.async_sheet, tier === "paid");
    const body = await response.json();
    assert.equal(body.writer_project_id, "original-book");
    assert.equal(body.task_id, tier === "paid" ? "sheet-task" : undefined);
  });

  test(`${tier}: explicit selection wins when two projects have the same name`, async () => {
    const api = createApi({ projects: [original, duplicate] });
    const response = await api
      .route(tier)
      .POST(searchRequest({ writer_project_id: " original-book " }));
    assert.equal(response.status, 200);
    assert.equal(api.calls.length, 1);
    assert.equal(
      JSON.parse(api.calls[0].init.body).writer_project_id,
      "original-book",
    );
  });

  test(`${tier}: an ambiguous name cannot silently create a third project`, async () => {
    const api = createApi({ projects: [original, duplicate] });
    const response = await api.route(tier).POST(searchRequest());
    assert.equal(response.status, 409);
    assert.match((await response.json()).error, /Choose the existing project/);
    assert.equal(api.calls.length, 1);
  });

  test(`${tier}: a failed project lookup stops the request before project creation`, async () => {
    const api = createApi({ lookupStatus: 503 });
    const response = await api.route(tier).POST(searchRequest());
    assert.equal(response.status, 502);
    assert.equal(api.calls.length, 1);
  });

  test(`${tier}: new project names still allow creation`, async () => {
    const api = createApi();
    const response = await api
      .route(tier)
      .POST(searchRequest({ project_name: "New Book" }));
    assert.equal(response.status, 200);
    assert.equal(JSON.parse(api.calls[1].init.body).writer_project_id, null);
    assert.equal((await response.json()).writer_project_id, "created-project");
  });

  test(`${tier}: unauthenticated searches do not call the matching service`, async () => {
    const api = createApi({ userId: null });
    assert.equal((await api.route(tier).POST(searchRequest())).status, 401);
    assert.equal(api.calls.length, 0);
  });
}

test("project choices come from the signed-in user's persisted dashboards", async () => {
  const api = createApi();
  const response = await api.projectsRoute().GET();
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("Cache-Control"), "private, no-store");
  assert.deepEqual((await response.json()).projects, [
    { ...original, dashboardProjectId: "dashboard-original-book" },
  ]);
  assert.equal(api.calls[0].lookup, true);
});

test("project choices require authentication", async () => {
  const api = createApi({ userId: null });
  assert.equal((await api.projectsRoute().GET()).status, 401);
  assert.equal(api.calls.length, 0);
});

for (const storedId of [null, "original-book", "legacy-dashboard"]) {
  test(`previous results retain the resolved project for subsequent saves (stored ID: ${storedId})`, async () => {
    const legacy = storedId === "legacy-dashboard";
    const formData = {
      project_name: "Cool Finance",
      writer_project_id: null,
      ...(legacy
        ? {
            save_project: {
              projectName: "Cool Finance",
              writerProjectId: null,
            },
          }
        : {}),
    };
    const storage = new Map([
      ["query_form_data", JSON.stringify(formData)],
      ["project_name", JSON.stringify("Cool Finance")],
      ["writer_project_id", JSON.stringify(legacy ? null : storedId)],
    ]);
    const cache = new Map();
    const pendingMutations = [];
    const client = {
      cancelQueries: async () => {},
      setQueryData: (key, value) => cache.set(key[0], value),
    };
    let submitted;
    const context = loadModule(
      "app/(app)/context/agent-matches-context.tsx",
      {
        react: {
          ...require("react"),
          useState: (initial) => [
            typeof initial === "function" ? initial() : initial,
            () => {},
          ],
          useCallback: (callback) => callback,
          useMemo: (calculate) => calculate(),
          useEffect: () => {},
        },
        "@tanstack/react-query": {
          QueryClient: class {},
          QueryClientProvider: "QueryClientProvider",
          useQueryClient: () => client,
          useQuery: ({ initialData }) => ({
            data: initialData(),
            isLoading: false,
          }),
          useMutation: (options) => ({
            mutate: (value) =>
              pendingMutations.push(
                (async () => {
                  await options.onMutate?.(value);
                  return options.mutationFn(value);
                })(),
              ),
          }),
        },
        sonner: { toast: { error: assert.fail } },
        "../workers/sheet-worker-manager": {
          startSheetPolling() {},
          stopSheetPolling() {},
        },
        "@/app/utils/smart-match-projects": projectUtils,
        "../workers/agent-export-contract": loadModule(
          "app/(app)/workers/agent-export-contract.ts",
        ),
      },
      {
        window: {
          localStorage: {
            getItem: (key) => storage.get(key) ?? null,
            setItem: (key, value) => storage.set(key, value),
            removeItem: (key) => storage.delete(key),
          },
        },
        fetch: async (_url, init) => {
          submitted = JSON.parse(init.body);
          return Response.json({
            matches: [{ id: "agent-new" }],
            writer_project_id: "original-book",
          });
        },
      },
    );
    const innerProvider = context.AgentMatchesProvider({ children: null }).props
      .children;
    const { value } = innerProvider.type(innerProvider.props).props;
    assert.equal(await value.refreshPreviousAgentMatches(false), true);
    await Promise.all(pendingMutations);
    assert.equal(submitted.writer_project_id, legacy ? null : storedId);
    assert.equal(cache.get("writerProjectId"), legacy ? null : "original-book");
    assert.equal(cache.get("formData").writer_project_id, "original-book");
    assert.equal(
      JSON.parse(storage.get("query_form_data")).writer_project_id,
      "original-book",
    );
    assert.equal(
      storage.has("writer_project_id")
        ? JSON.parse(storage.get("writer_project_id"))
        : null,
      legacy ? null : "original-book",
    );
  });
}

test("search-only names and restored searches are not added to project choices", () => {
  assert.deepEqual(
    JSON.parse(JSON.stringify(buildSmartMatchProjectOptions([], [original]))),
    [],
  );
});
