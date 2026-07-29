"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowRight, FolderOpen, MessageSquare, Users } from "lucide-react";
import type { AgentMatch } from "@/app/types";
import { QUERY_DASH_COLUMNS } from "@/app/(writer-app)/query-dashboard/components/kanban-config";
import { useWriterMessageThreads } from "@/app/hooks/use-message-query-lifecycle";
import { Button } from "@/app/ui-primitives/button";
import { Skeleton } from "@/app/ui-primitives/skeleton";
import { getProjectMessagesHref } from "@/app/utils/message-routes";
import {
  buildProjectDashboardSummaries,
  PROJECT_STATUS_CHIP_LABELS,
  type ProjectDashboardSummary,
} from "@/app/utils/project-dashboard-summary";
import AnimatedCount from "./animated-count";

export interface ProjectDashboardOverviewProps {
  agentsList: AgentMatch[] | undefined;
}

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
      aria-label="Projects"
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
          <ProjectDashboardCard
            key={summary.writerProjectId ?? summary.projectName}
            summary={summary}
          />
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
  const messageProjectId = summary.writerProjectId ?? summary.projectName;
  const messageThreadsQuery = useWriterMessageThreads({
    projectId: messageProjectId,
  });
  const messageThreads = messageThreadsQuery.data?.threads ?? [];
  const queriedAgentCount = new Set(
    messageThreads.map((thread) => thread.agentProfileId),
  ).size;
  const unreadMessageCount = messageThreads.reduce(
    (total, thread) => total + thread.unreadCount,
    0,
  );

  return (
    <ProjectDashboardCardView
      isQueryActivityLoading={messageThreadsQuery.isPending}
      queriedAgentCount={queriedAgentCount}
      summary={summary}
      unreadMessageCount={unreadMessageCount}
    />
  );
}

function ProjectDashboardCardView({
  isQueryActivityLoading,
  queriedAgentCount,
  summary,
  unreadMessageCount,
}: {
  isQueryActivityLoading: boolean;
  queriedAgentCount: number;
  summary: ProjectDashboardSummary;
  unreadMessageCount: number;
}) {
  const visibleStatuses = QUERY_DASH_COLUMNS.map((column) => ({
    id: column.id,
    label: PROJECT_STATUS_CHIP_LABELS[column.id],
    count: summary.countsByColumn[column.id],
  })).filter((status) => status.count > 0);
  const hasQueries = queriedAgentCount > 0;
  const hasUnreadMessages = unreadMessageCount > 0;
  const messagesHref = getProjectMessagesHref(
    summary.projectName,
    summary.writerProjectId,
  );
  const messagesLabel = hasUnreadMessages
    ? `Messages, ${unreadMessageCount} unread`
    : "Messages";

  return (
    <article
      className="flex min-h-[148px] w-full min-w-0 flex-col justify-between rounded-[20px] border border-white/85 bg-white/88 p-4 text-left shadow-[0_16px_36px_rgba(24,44,69,0.08)] backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_48px_rgba(24,44,69,0.12)]"
    >
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Link
            href={summary.href}
            className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            <h3 className="line-clamp-2 min-w-0 break-words text-lg font-semibold leading-snug text-accent">
              {summary.projectName}
            </h3>
          </Link>
        </div>
        <Button asChild size="icon" variant="ghost">
          <Link href={summary.href} aria-label={`Open ${summary.projectName}`}>
            <ArrowRight />
          </Link>
        </Button>
      </div>
      <div className="mt-5 flex flex-col gap-3">
        {isQueryActivityLoading ? (
          <div
            className="flex min-h-9 items-center justify-between gap-3"
            aria-label="Loading project query activity"
          >
            <Skeleton className="h-4 w-28" />
            <Skeleton className="size-9" />
          </div>
        ) : (
          <div className="flex items-end justify-between gap-3">
            <div className="flex min-w-0 flex-col gap-1">
              <div className="flex items-center gap-2 text-accent/64">
                <Users className="size-4 shrink-0" />
                <span className="text-xs font-semibold uppercase text-accent/54">
                  {hasQueries ? "Queried Agents" : "Matched Agents"}
                </span>
              </div>
              <span className="text-3xl font-bold leading-none text-accent">
                <AnimatedCount
                  value={
                    hasQueries ? queriedAgentCount : summary.savedAgentCount
                  }
                />
              </span>
            </div>

            {hasQueries ? (
              <Button asChild size="sm" variant="outline">
                <Link
                  href={messagesHref}
                  aria-label={messagesLabel}
                  className="relative"
                >
                  <MessageSquare data-icon="inline-start" />
                  Messages
                  {hasUnreadMessages ? (
                    <span
                      aria-hidden="true"
                      className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-destructive ring-2 ring-background"
                    />
                  ) : null}
                </Link>
              </Button>
            ) : null}
          </div>
        )}

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
    </article>
  );
}
