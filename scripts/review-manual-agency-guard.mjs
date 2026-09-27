/**
 * Disposable UI review environment. No Supabase or catalog requests leave localhost.
 * Clerk sign-in and subscription metadata remain real. This is a REST fixture, not
 * PostgreSQL acceptance evidence. Restart to reset all rows.
 * Usage: node scripts/review-manual-agency-guard.mjs /absolute/env/directory
 */
import http from "node:http";
import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import nextEnv from "@next/env";
const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.argv[2] || process.cwd(), false, {
  info() {},
  error() {},
});
const port = Number(process.env.REVIEW_PORT || 3001);
const dataPort = Number(process.env.REVIEW_DATA_PORT || 54331);
const uuid = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const projects = [
  {
    id: uuid(1),
    project_name: "Agency Guard Review A",
    writer_project_id: null,
  },
  {
    id: uuid(2),
    project_name: "Agency Guard Review B",
    writer_project_id: null,
  },
];
const template = [
  {
    id: uuid(10),
    name: "Alex Oak",
    index_id: uuid(100),
    agency: "Oak Literary Agency",
    agency_url: "https://oak.example",
    column_name: "submitted-query",
    query_sent_date: "2026-09-01",
  },
  {
    id: uuid(11),
    name: "Blair Oak",
    index_id: uuid(101),
    agency: "Oak Literary Agency",
    agency_url: "https://oak.example",
    column_name: "agents-to-research",
  },
  {
    id: uuid(12),
    name: "Casey Oak",
    index_id: uuid(102),
    agency: "Oak Literary Agency",
    agency_url: "https://oak.example",
    column_name: "submitted-query",
    dashboard_project_id: uuid(2),
  },
  {
    id: uuid(13),
    name: "Devon Oak",
    index_id: "manual:devon",
    agency_url: "https://oak.example/submissions",
    column_name: "agents-to-research",
  },
  {
    id: uuid(14),
    name: "Ellis",
    index_id: "manual:ellis",
    column_name: "agents-to-research",
  },
  {
    id: uuid(15),
    name: "Finley",
    index_id: uuid(105),
    agency: "Oak Literary Agency",
    agency_url: "https://oak.example",
    column_name: "agents-to-research",
  },
  {
    id: uuid(16),
    name: "Gale",
    index_id: "manual:gale",
    agency_url: "https://agency.querymanager.com",
    column_name: "submitted-query",
  },
  {
    id: uuid(17),
    name: "Harper",
    index_id: "manual:harper",
    agency_url: "https://agency.querymanager.com",
    column_name: "agents-to-research",
  },
];
const users = new Map();
function stateFor(userId) {
  if (!users.has(userId)) {
    const ownedProjects = projects.map((project) => ({
      ...project,
      user_id: userId,
    }));
    users.set(userId, {
      dashboard_projects: ownedProjects,
      agent_matches: template.map((row) => {
        const project = ownedProjects.find(
          (p) => p.id === (row.dashboard_project_id || uuid(1)),
        );
        return {
          created_at: "2026-09-01T12:00:00Z",
          fit_rating: "neutral",
          query_letter_ready: false,
          notes:
            "Disposable local review data. Restart the review script to reset.",
          ...row,
          user_id: userId,
          dashboard_project_id: project.id,
          project_name: project.project_name,
          writer_project_id: null,
        };
      }),
    });
  }
  return users.get(userId);
}
function matches(row, params) {
  for (const [key, filter] of params) {
    if (["select", "order", "offset", "limit", "columns"].includes(key))
      continue;
    if (filter.startsWith("eq.") && String(row[key]) !== filter.slice(3))
      return false;
    if (
      filter.startsWith("is.") &&
      filter.slice(3) === "null" &&
      row[key] != null
    )
      return false;
    if (
      filter.startsWith("in.(") &&
      !filter
        .slice(4, -1)
        .split(",")
        .map((value) => value.replaceAll('"', ""))
        .includes(String(row[key]))
    )
      return false;
  }
  return true;
}
const server = http.createServer(async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  const reply = (body, status = 200) => {
    res.statusCode = status;
    res.end(JSON.stringify(body));
  };
  try {
    const url = new URL(req.url, `http://127.0.0.1:${dataPort}`);
    let text = "";
    for await (const chunk of req) text += chunk;
    const body = text ? JSON.parse(text) : null;
    if (url.pathname === "/get-agent-agency-identities") {
      return reply({
        status: "success",
        identities: (body.agent_ids || []).map((agent_id) => ({
          agent_id,
          agency_identity: [
            uuid(100),
            uuid(101),
            uuid(102),
            uuid(105),
          ].includes(agent_id)
            ? {
                agency_id: agent_id === uuid(105) ? uuid(801) : uuid(800),
                agency_name: "Oak Literary Agency",
                agency_url: "https://oak.example",
              }
            : null,
        })),
      });
    }
    const table = url.pathname.replace("/rest/v1/", "");
    const owner =
      url.searchParams.get("user_id")?.replace(/^eq\./, "") ||
      body?.p_user_id ||
      (Array.isArray(body) ? body[0]?.user_id : body?.user_id);
    if (!owner)
      return reply(
        {
          message:
            "The local review fixture supports owned dashboard requests only.",
        },
        501,
      );
    const state = stateFor(owner);
    if (table.startsWith("rpc/")) {
      const project = state.dashboard_projects.find(
        (p) => p.id === body.p_project_id,
      );
      if (!project) return reply(null);
      if (table === "rpc/rename_dashboard_project") {
        if (
          state.dashboard_projects.some(
            (p) =>
              p.id !== project.id &&
              p.project_name.toLowerCase() === body.p_name.toLowerCase(),
          )
        )
          return reply({ code: "23505" }, 409);
        project.project_name = body.p_name;
        for (const row of state.agent_matches)
          if (row.dashboard_project_id === project.id)
            row.project_name = body.p_name;
        return reply(project);
      }
      if (table === "rpc/delete_dashboard_project") {
        state.dashboard_projects = state.dashboard_projects.filter(
          (p) => p.id !== project.id,
        );
        state.agent_matches = state.agent_matches.filter(
          (row) => row.dashboard_project_id !== project.id,
        );
        return reply(true);
      }
      return reply({ message: "Unsupported review operation" }, 501);
    }
    if (!Object.hasOwn(state, table))
      return reply({ message: "Unsupported review table" }, 501);
    let selected = state[table].filter((row) => matches(row, url.searchParams));
    if (req.method === "POST") {
      selected = [];
      for (const incoming of Array.isArray(body) ? body : [body]) {
        let project = incoming.dashboard_project_id
          ? state.dashboard_projects.find(
              (p) => p.id === incoming.dashboard_project_id,
            )
          : state.dashboard_projects.find(
              (p) => p.project_name === incoming.project_name,
            );
        if (incoming.dashboard_project_id && !project)
          return reply({ code: "23503", message: "Project not found" }, 409);
        if (!project) {
          project = {
            id: randomUUID(),
            user_id: owner,
            project_name: incoming.project_name || "Untitled Project",
            writer_project_id: incoming.writer_project_id || null,
          };
          state.dashboard_projects.push(project);
        }
        const record = {
          id: randomUUID(),
          created_at: new Date().toISOString(),
          ...incoming,
          dashboard_project_id: project.id,
          project_name: project.project_name,
        };
        state[table].push(record);
        selected.push(record);
      }
    } else if (req.method === "PATCH") {
      for (const row of selected) Object.assign(row, body);
    } else if (req.method === "DELETE") {
      state[table] = state[table].filter((row) => !selected.includes(row));
    }
    const order = url.searchParams.get("order")?.split(".");
    if (order)
      selected.sort(
        (a, b) =>
          String(a[order[0]]).localeCompare(String(b[order[0]])) *
          (order[1] === "desc" ? -1 : 1),
      );
    const offset = Number(url.searchParams.get("offset") || 0);
    const limit = Number(url.searchParams.get("limit") || 1000);
    const page = selected.slice(offset, offset + limit);
    res.setHeader(
      "Content-Range",
      `${offset}-${offset + page.length - 1}/${selected.length}`,
    );
    return reply(
      req.headers.accept?.includes("application/vnd.pgrst.object+json")
        ? page[0] || null
        : page,
    );
  } catch {
    return reply({ message: "Local review fixture error" }, 500);
  }
});
server.listen(dataPort, "127.0.0.1", () => {
  const local = `http://127.0.0.1:${dataPort}`;
  const child = spawn(
    process.execPath,
    [
      "node_modules/next/dist/bin/next",
      "dev",
      "-H",
      "localhost",
      "-p",
      String(port),
    ],
    {
      stdio: "inherit",
      env: {
        ...process.env,
        NEXT_PUBLIC_SUPABASE_URL: local,
        SUPABASE_SERVICE_ROLE_KEY: "local-review-only",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "local-review-only",
        WQH_DEV_API_URL: local,
        WQH_PROD_API_URL: local,
        WQH_TRAITS_API_URL: local,
        QUERY_SAFETY_AGENCY_HISTORY_ENABLED: "true",
      },
    },
  );
  console.log(
    `DISPOSABLE REVIEW: http://localhost:${port}/home. Database and catalog are local fixtures. Clerk authentication remains real. Restart to reset data.`,
  );
  const stop = () => {
    child.kill("SIGTERM");
    server.close();
  };
  process.on("SIGTERM", stop);
  process.on("SIGINT", stop);
  child.on("exit", () => {
    server.close();
  });
});
