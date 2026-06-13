import { DEFAULT_PROJECT_NAME } from "@/app/constants";
import {
  QUERY_DASH_COLUMNS,
  isQueryDashColumnId,
  type QueryDashColumnId,
} from "@/app/(writer-app)/query-dashboard/components/kanban-config";
import type { AgentMatch } from "@/app/types";

const FALLBACK_COLUMN_ID = QUERY_DASH_COLUMNS[0].id;

export type ProjectDashboardSummary = {
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
  const trimmed = projectName?.trim();
  return trimmed || DEFAULT_PROJECT_NAME;
}

export function getProjectDashboardHref(projectName: string) {
  return `/query-dashboard?project=${encodeURIComponent(normalizeProjectName(projectName))}`;
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
  const names = new Set<string>();

  for (const agent of agentsList ?? []) {
    names.add(normalizeProjectName(agent.project_name));
  }

  return Array.from(names).sort((a, b) => a.localeCompare(b));
}

export function buildProjectDashboardSummaries(
  agentsList: AgentMatch[] | undefined,
): ProjectDashboardSummary[] {
  const summariesByProject = new Map<string, ProjectDashboardSummaryWithSort>();

  for (const agent of agentsList ?? []) {
    const projectName = normalizeProjectName(agent.project_name);
    const columnId = getNormalizedQueryDashColumnId(agent.column_name);
    const currentSummary =
      summariesByProject.get(projectName) ??
      createProjectSummaryAccumulator(projectName);

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

    summariesByProject.set(projectName, currentSummary);
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
      projectName: summary.projectName,
      href: summary.href,
      savedAgentCount: summary.savedAgentCount,
      lastActivityAt: summary.lastActivityAt,
      lastActivityLabel: summary.lastActivityLabel,
      countsByColumn: summary.countsByColumn,
    }));
}

function createProjectSummaryAccumulator(
  projectName: string,
): ProjectDashboardSummaryWithSort {
  return {
    projectName,
    href: getProjectDashboardHref(projectName),
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
