import {
  QUERY_DASH_COLUMNS,
  isQueryDashColumnId,
  type QueryDashColumnId,
} from "@/app/(app)/query-dashboard/components/kanban-config";
import type { AgentMatch, DashboardProject } from "@/app/types";
import { getProjectDashboardHrefById } from "@/app/utils/project-dashboard-route";
import { getProjectScope } from "@/app/utils/project-scope";

const FALLBACK_COLUMN_ID = QUERY_DASH_COLUMNS[0].id;

export const PROJECT_STATUS_CHIP_LABELS: Record<QueryDashColumnId, string> = {
  "agents-to-research": "Research",
  "submitted-query": "Submitted",
  "pages-requested": "Pages",
  rejected: "Rejected",
  "offer-made": "Offers",
};

export type ProjectDashboardSummary = {
  dashboardProjectId: string;
  writerProjectId: string | null;
  projectName: string;
  href: string;
  savedAgentCount: number;
  lastActivityAt: string | null;
  lastActivityLabel: "Saved" | "Updated";
  countsByColumn: Record<QueryDashColumnId, number>;
};

type ProjectDashboardSummaryWithSort = ProjectDashboardSummary & {
  latestActivityTimestamp: number | null;
};

export function normalizeProjectName(projectName?: string | null) {
  return getProjectScope({ projectName }).projectName;
}

function getProjectNameKey(projectName?: string | null) {
  return getProjectScope({ projectName }).key;
}

function getWriterProjectId(writerProjectId?: string | null) {
  return getProjectScope({ writerProjectId }).writerProjectId;
}

export function getProjectDashboardHref(
  agentsList: AgentMatch[] | undefined,
  projectName: string,
  writerProjectId?: string | null,
) {
  const scope = getProjectScope({ projectName, writerProjectId }).key;
  const saved = agentsList?.find(
    (agent) =>
      getProjectScope({
        projectName: agent.project_name,
        writerProjectId: agent.writer_project_id,
      }).key === scope,
  );
  return saved?.dashboard_project_id
    ? getProjectDashboardHrefById(saved.dashboard_project_id)
    : undefined;
}

export function getNormalizedQueryDashColumnId(
  columnName?: string | null,
): QueryDashColumnId {
  return columnName && isQueryDashColumnId(columnName)
    ? columnName
    : FALLBACK_COLUMN_ID;
}

export function createEmptyCountsByColumn(): Record<QueryDashColumnId, number> {
  return QUERY_DASH_COLUMNS.reduce(
    (counts, column) => {
      counts[column.id] = 0;
      return counts;
    },
    {} as Record<QueryDashColumnId, number>,
  );
}

export function getProjectNamesFromAgentMatches(
  agentsList: AgentMatch[] | undefined,
) {
  const namesByKey = new Map<string, string>();

  for (const agent of agentsList ?? []) {
    const projectName = normalizeProjectName(agent.project_name);
    const projectKey = getProjectNameKey(projectName);

    if (!namesByKey.has(projectKey)) {
      namesByKey.set(projectKey, projectName);
    }
  }

  return Array.from(namesByKey.values()).sort((a, b) => a.localeCompare(b));
}

export function getProjectNavigationItemsFromAgentMatches(
  agentsList: AgentMatch[] | undefined,
) {
  return buildProjectDashboardSummaries(agentsList).map((summary) => ({
    href: summary.href,
    projectName: summary.projectName,
    writerProjectId: summary.writerProjectId,
  }));
}

function getUniqueWriterProjectIdsByProjectName(
  agentsList: AgentMatch[] | undefined,
) {
  const idsByNameKey = new Map<string, Set<string>>();

  for (const agent of agentsList ?? []) {
    const writerProjectId = getWriterProjectId(agent.writer_project_id);
    if (!writerProjectId) continue;

    const projectKey = getProjectNameKey(agent.project_name);
    const ids = idsByNameKey.get(projectKey) ?? new Set<string>();
    ids.add(writerProjectId);
    idsByNameKey.set(projectKey, ids);
  }

  const uniqueIdsByNameKey = new Map<string, string>();

  for (const [projectKey, ids] of idsByNameKey.entries()) {
    if (ids.size === 1) {
      uniqueIdsByNameKey.set(projectKey, Array.from(ids)[0]);
    }
  }

  return uniqueIdsByNameKey;
}

export function getWriterProjectIdForProjectName(
  agentsList: AgentMatch[] | undefined,
  projectName: string,
) {
  const projectKey = getProjectNameKey(projectName);
  return (
    getUniqueWriterProjectIdsByProjectName(agentsList).get(projectKey) ?? null
  );
}

export function buildProjectDashboardSummaries(
  agentsList: AgentMatch[] | undefined,
  projects?: DashboardProject[],
): ProjectDashboardSummary[] {
  const summariesByProject = new Map<string, ProjectDashboardSummaryWithSort>();

  for (const project of projects ?? []) {
    summariesByProject.set(
      project.id,
      createProjectSummaryAccumulator(
        project.id,
        project.project_name,
        project.writer_project_id,
      ),
    );
  }

  for (const agent of agentsList ?? []) {
    if (projects && !summariesByProject.has(agent.dashboard_project_id ?? ""))
      continue;
    const agentProjectName = normalizeProjectName(agent.project_name);
    const writerProjectId = getWriterProjectId(agent.writer_project_id);
    const summaryKey = agent.dashboard_project_id;
    if (!summaryKey)
      throw new Error("Saved project is missing its dashboard ID");
    const columnId = getNormalizedQueryDashColumnId(agent.column_name);
    const currentSummary =
      summariesByProject.get(summaryKey) ??
      createProjectSummaryAccumulator(
        summaryKey,
        agentProjectName,
        writerProjectId,
      );

    currentSummary.savedAgentCount += 1;
    currentSummary.countsByColumn[columnId] += 1;

    const activity = getAgentActivity(agent);
    if (
      activity.timestamp !== null &&
      (currentSummary.latestActivityTimestamp === null ||
        activity.timestamp > currentSummary.latestActivityTimestamp)
    ) {
      currentSummary.latestActivityTimestamp = activity.timestamp;
      currentSummary.lastActivityAt = activity.value;
      currentSummary.lastActivityLabel = activity.label;
    }

    summariesByProject.set(summaryKey, currentSummary);
  }

  return Array.from(summariesByProject.values())
    .sort((a, b) => {
      const aTimestamp = a.latestActivityTimestamp ?? Number.NEGATIVE_INFINITY;
      const bTimestamp = b.latestActivityTimestamp ?? Number.NEGATIVE_INFINITY;
      const activityDiff = bTimestamp - aTimestamp;

      if (activityDiff !== 0) return activityDiff;

      return a.projectName.localeCompare(b.projectName);
    })
    .map((summary) => ({
      dashboardProjectId: summary.dashboardProjectId,
      writerProjectId: summary.writerProjectId,
      projectName: summary.projectName,
      href: summary.href,
      savedAgentCount: summary.savedAgentCount,
      lastActivityAt: summary.lastActivityAt,
      lastActivityLabel: summary.lastActivityLabel,
      countsByColumn: summary.countsByColumn,
    }));
}

function createProjectSummaryAccumulator(
  dashboardProjectId: string,
  projectName: string,
  writerProjectId: string | null,
): ProjectDashboardSummaryWithSort {
  return {
    dashboardProjectId,
    writerProjectId,
    projectName,
    href: getProjectDashboardHrefById(dashboardProjectId),
    savedAgentCount: 0,
    lastActivityAt: null,
    lastActivityLabel: "Saved",
    countsByColumn: createEmptyCountsByColumn(),
    latestActivityTimestamp: null,
  };
}

function getAgentActivity(agent: AgentMatch): {
  label: "Saved" | "Updated";
  timestamp: number | null;
  value: string | null;
} {
  const updatedTimestamp = parseActivityTimestamp(agent.updated_date);
  const savedTimestamp = parseActivityTimestamp(agent.created_at);

  if (updatedTimestamp !== null) {
    return {
      label: "Updated",
      timestamp: Math.max(updatedTimestamp, savedTimestamp ?? updatedTimestamp),
      value: agent.updated_date ?? null,
    };
  }

  return {
    label: "Saved",
    timestamp: savedTimestamp,
    value: agent.created_at ?? null,
  };
}

function parseActivityTimestamp(value?: string | null) {
  if (!value) return null;

  const datePart = value.split("T")[0];
  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);

  if (dateOnlyMatch) {
    const year = Number(dateOnlyMatch[1]);
    const month = Number(dateOnlyMatch[2]);
    const day = Number(dateOnlyMatch[3]);
    const parsed = new Date(year, month - 1, day);

    if (
      parsed.getFullYear() === year &&
      parsed.getMonth() === month - 1 &&
      parsed.getDate() === day
    ) {
      return parsed.getTime();
    }
  }

  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? null : timestamp;
}
