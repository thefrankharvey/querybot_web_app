"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, FolderOpen, Users } from "lucide-react";
import type { AgentMatch } from "@/app/types";
import {
  QUERY_DASH_COLUMNS,
  type QueryDashColumnId,
} from "@/app/(writer-app)/query-dashboard/components/kanban-config";
import {
  buildProjectDashboardSummaries,
  type ProjectDashboardSummary,
} from "@/app/utils/project-dashboard-summary";
import AnimatedCount from "./animated-count";

export interface ProjectDashboardOverviewProps {
  agentsList: AgentMatch[] | undefined;
}

const STATUS_CHIP_LABELS: Record<QueryDashColumnId, string> = {
  "agents-to-research": "Research",
  "submitted-query": "Submitted",
  "pages-requested": "Pages",
  rejected: "Rejected",
  "offer-made": "Offers",
};

const ACTIVITY_DATE_FORMATTER = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export default function ProjectDashboardOverview({
  agentsList,
}: ProjectDashboardOverviewProps) {
  const projectSummaries = useMemo(
    () => buildProjectDashboardSummaries(agentsList),
    [agentsList],
  );

  if (projectSummaries.length === 0) return null;

  return (
    <section
      className="mt-8 flex w-full flex-col gap-4"
      aria-label="Project dashboards"
    >
      <div className="flex w-full items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 font-serif text-2xl font-semibold leading-tight text-accent md:text-[30px]">
            <FolderOpen className="size-7 shrink-0" />
            <span className="truncate">My Projects</span>
          </h2>
        </div>
      </div>

      <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {projectSummaries.map((summary) => (
          <ProjectDashboardCard key={summary.projectName} summary={summary} />
        ))}
      </div>
    </section>
  );
}

function ProjectDashboardCard({
  summary,
}: {
  summary: ProjectDashboardSummary;
}) {
  const visibleStatuses = QUERY_DASH_COLUMNS.map((column) => ({
    id: column.id,
    label: STATUS_CHIP_LABELS[column.id],
    count: summary.countsByColumn[column.id],
  })).filter((status) => status.count > 0);
  const activityDate = formatActivityDate(summary.lastActivityAt);

  return (
    <Link
      href={summary.href}
      className="group flex min-h-[148px] w-full min-w-0 flex-col justify-between rounded-[20px] border border-white/85 bg-white/88 p-4 text-left shadow-[0_16px_36px_rgba(24,44,69,0.08)] backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_48px_rgba(24,44,69,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
    >
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 min-w-0 break-words text-lg font-semibold leading-snug text-accent">
            {summary.projectName}
          </h3>
          <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-accent/58">
            <CalendarDays className="size-4 shrink-0" />
            <span className="min-w-0 truncate">
              {summary.lastActivityLabel} {activityDate}
            </span>
          </p>
        </div>
        <span
          aria-hidden="true"
          className="flex size-11 shrink-0 items-center justify-center rounded-full border border-accent/10 bg-accent/5 text-accent transition-colors duration-200 group-hover:bg-accent group-hover:text-white"
        >
          <ArrowRight className="size-5" />
        </span>
      </div>
      <div className="mt-5 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-accent/64">
            <Users className="size-4 shrink-0" />
            <span className="text-xs font-semibold uppercase text-accent/54">
              Saved Agents
            </span>
          </div>
          <span className="text-3xl font-bold leading-none text-accent">
            <AnimatedCount value={summary.savedAgentCount} />
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5" aria-label="Project status counts">
          {visibleStatuses.map((status) => (
            <span
              key={status.id}
              className="inline-flex min-h-8 items-center gap-1 rounded-full border border-accent/10 bg-white/86 px-2.5 text-xs font-semibold text-accent/68"
            >
              <span>{status.label}</span>
              <span className="text-accent">{status.count}</span>
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}

function formatActivityDate(value: string | null) {
  const parsedDate = parseDisplayDate(value);
  return parsedDate ? ACTIVITY_DATE_FORMATTER.format(parsedDate) : "Date unavailable";
}

function parseDisplayDate(value: string | null) {
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
      return parsed;
    }
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}
