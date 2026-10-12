"use client";

import { Suspense, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import {
  QueryDashProvider,
  useQueryDashContext,
} from "@/app/(app)/query-dashboard/context/query-dash-context";
import { ProjectDashboardTitle } from "@/app/(app)/query-dashboard/components/project-dashboard-title";
import { ProjectDashboardLoading } from "@/app/(app)/query-dashboard/components/project-dashboard-loading";
import { ProjectPageHeader } from "./project-page-header";
import type { DashboardProject } from "@/app/types";
import { cn } from "@/app/utils";

function ProjectWorkspaceContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { dashboardProjectId, activeProjectName } = useQueryDashContext();
  const isProfile = pathname.endsWith("/profile");
  return (
    <div
      className={cn(
        "project-workspace ambient-page flex h-full min-h-0 w-full flex-col gap-5 px-4 pt-4 md:pt-6",
        isProfile ? "pb-[200px] md:pb-60" : "pb-4",
      )}
    >
      <ProjectPageHeader
        className="px-0 pt-0"
        projectId={dashboardProjectId}
        title={<ProjectDashboardTitle projectName={activeProjectName ?? ""} />}
      />
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}

export function ProjectWorkspace({
  project,
  children,
}: {
  project: DashboardProject;
  children: ReactNode;
}) {
  return (
    <Suspense fallback={<ProjectDashboardLoading />}>
      <QueryDashProvider
        dashboardProjectId={project.id}
        projectName={project.project_name}
        writerProjectId={project.writer_project_id}
      >
        <ProjectWorkspaceContent>{children}</ProjectWorkspaceContent>
      </QueryDashProvider>
    </Suspense>
  );
}
