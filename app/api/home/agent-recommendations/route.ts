import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/app/api/supabase/server";
import { AGENT_MATCHES_TABLE } from "@/app/constants";
import {
  getRecommendationCountry,
  resolveRecommendationProject,
  type HomeAgentRecommendations,
  type RecommendationAgent,
} from "@/app/utils/home-agent-recommendations";
import {
  getStoredWriterProjectId,
  selectMostRecentWriterProject,
  type StoredWriterProject,
} from "@/app/utils/smart-match-restore";
import { hasProjectProfileTraits, profileTraits, toProjectProfile } from "@/app/utils/project-profile";
import { getWqhApiEndpoint } from "@/lib/config";
import { getWriterEmail, getWqhHistoryHeaders } from "@/lib/wqh-history-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const json = (body: unknown, status = 200) => NextResponse.json(body, {
  status,
  headers: { "Cache-Control": "private, no-store" },
});

async function getSavedAgentIds(userId: string) {
  const ids = new Set<string>();
  const db = createServerSupabase();
  const pageSize = 1000;
  let offset = 0;
  while (true) {
    const { data, error } = await db
      .from(AGENT_MATCHES_TABLE)
      .select("id,index_id")
      .eq("user_id", userId)
      .order("id")
      .range(offset, offset + pageSize - 1);
    if (error || !data) throw new Error("Unable to load saved agents");
    if (!data.length) return [...ids];
    for (const row of data) {
      if (row.index_id) ids.add(String(row.index_id));
    }
    // Confirm completeness even when the database enforces a smaller page cap.
    offset += data.length;
    if (offset > 10000) throw new Error("Saved agent limit exceeded");
  }
}

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return json({ error: "Unauthorized" }, 401);
  const user = await currentUser();
  if (!user || user.id !== userId) return json({ error: "Unauthorized" }, 401);
  const email = getWriterEmail(user);
  if (!email) return json({ error: "An email address is required" }, 422);
  const historyHeaders = getWqhHistoryHeaders();
  if (!historyHeaders) return json({ error: "Smart Match service is not configured" }, 503);

  const country = getRecommendationCountry(req.headers);
  const isSubscribed = user.publicMetadata?.isSubscribed === true;
  const { searchParams } = new URL(req.url);
  const requestedProject = searchParams.get("project");
  const requestedAgent = searchParams.get("agent");
  if (Boolean(requestedProject) !== Boolean(requestedAgent)) {
    return json({ error: "An agent and project are required" }, 400);
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);
  const abort = () => controller.abort();
  req.signal.addEventListener("abort", abort, { once: true });

  try {
    const historyUrl = new URL(getWqhApiEndpoint("get-writer-projects"));
    historyUrl.searchParams.set("email", email);
    historyUrl.searchParams.set("include_profiles", "true");
    const [historyResponse, savedIds, dashboards] = await Promise.all([
      fetch(historyUrl, { headers: historyHeaders, cache: "no-store", signal: controller.signal }),
      requestedAgent ? Promise.resolve([]) : getSavedAgentIds(userId),
      createServerSupabase().from("dashboard_projects")
        .select("id,project_name,writer_project_id").eq("user_id", userId),
    ]);
    if (!historyResponse.ok || dashboards.error) throw new Error("Unable to load project history");
    const history = await historyResponse.json();
    if (history.status !== "success" || !Array.isArray(history.writer_projects)) {
      throw new Error("Invalid project history response");
    }
    const projects: StoredWriterProject[] = history.writer_projects.filter(
      (value: unknown): value is StoredWriterProject => Boolean(value) && typeof value === "object" && !Array.isArray(value),
    );
    // My Projects owns project identity. Orphaned history and matching titles
    // cannot establish a relationship to a current dashboard.
    const eligible = projects.filter((project) => {
      const id = getStoredWriterProjectId(project);
      return id && resolveRecommendationProject(id, dashboards.data ?? []) &&
        hasProjectProfileTraits(toProjectProfile(project, "").form);
    });
    const latest = requestedProject
      ? eligible.find((project) => getStoredWriterProjectId(project) === requestedProject)
      : selectMostRecentWriterProject(eligible);
    const projectId = latest && getStoredWriterProjectId(latest);
    if (!latest || !projectId) {
      if (requestedProject) return json({ error: "Project not found" }, 404);
      return json({ project: null, country, matches: [], isSubscribed } satisfies HomeAgentRecommendations);
    }
    const project = resolveRecommendationProject(projectId, dashboards.data ?? []);
    if (!project) return json({ error: "Project not found" }, 404);
    const { form } = toProjectProfile(latest, project.projectName);
    const matchUrl = new URL(getWqhApiEndpoint(isSubscribed ? "get-agents-paid" : "get-agents-free"));
    matchUrl.searchParams.set("status", "open");
    if (country !== "all") matchUrl.searchParams.set("country_code", country);
    const matchResponse = await fetch(matchUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...historyHeaders },
      body: JSON.stringify({
        ...form,
        comps: profileTraits(form).comps,
        email,
        writer_project_id: projectId,
        recommendations_only: true,
        exclude_agent_ids: savedIds,
        ...(requestedAgent ? { recommendation_agent_id: requestedAgent } : {}),
      }),
      cache: "no-store",
      signal: controller.signal,
    });
    if (!matchResponse.ok) throw new Error("Unable to load agent matches");
    const result = await matchResponse.json();
    // Require the read-only contract; never substitute an ordinary search response.
    if (result.recommendations_only !== true || !Array.isArray(result.matches)) {
      throw new Error("Recommendations are not available on the matching service");
    }
    const matches = result.matches.filter(
      (agent: unknown): agent is RecommendationAgent => agent !== null &&
        typeof agent === "object" && "agent_id" in agent &&
        typeof agent.agent_id === "string" && Boolean(agent.agent_id.trim()),
    ).slice(0, 3);
    if (requestedAgent && !matches.some((agent: { agent_id?: string }) => String(agent.agent_id) === requestedAgent)) {
      return json({ error: "This agent is no longer available in these matches" }, 404);
    }
    return json({ project, country, matches, isSubscribed } satisfies HomeAgentRecommendations);
  } catch (error) {
    console.error("[home-recommendations] Request failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return json({ error: "Unable to load agent recommendations. Please try again." }, 502);
  } finally {
    clearTimeout(timeout);
    req.signal.removeEventListener("abort", abort);
  }
}
