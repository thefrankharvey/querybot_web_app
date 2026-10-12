import type { AgentMatch } from "@/app/(app)/context/agent-matches-context";
import type { SmartMatchProjectReference } from "./smart-match-projects";

export type RecommendationCountry = "US" | "GB" | "all";

export type RecommendationAgent = AgentMatch & { agent_id: string };

export type RecommendationProject = SmartMatchProjectReference & {
  searchWriterProjectId: string;
};

export type HomeAgentRecommendations = {
  project: RecommendationProject | null;
  country: RecommendationCountry;
  matches: RecommendationAgent[];
  isSubscribed: boolean;
};

export function getRecommendationCountry(headers: Pick<Headers, "get">): RecommendationCountry {
  const country = (
    headers.get("cf-ipcountry") ?? headers.get("x-vercel-ip-country") ?? ""
  ).trim().toUpperCase();
  return country === "US" || country === "GB" ? country : "all";
}

export function getRecommendationAgentHref(agentId: string, projectId: string) {
  return `/agent-matches/recommendations/${encodeURIComponent(agentId)}?project=${encodeURIComponent(projectId)}`;
}

export function resolveRecommendationProject(
  searchId: string,
  projects: { id: string; project_name: string; writer_project_id: string | null }[],
): RecommendationProject | null {
  const dashboard = projects.find(
    (project) => project.writer_project_id === searchId ||
      (!project.writer_project_id && project.id === searchId),
  );
  if (!dashboard) return null;
  return {
    searchWriterProjectId: searchId,
    projectName: dashboard.project_name || "Untitled Project",
    writerProjectId: dashboard.writer_project_id,
    dashboardProjectId: dashboard.id,
  };
}
