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
import { QueryDashboardViewToggle } from "@/app/(app)/query-dashboard/components/query-dashboard-view-toggle";
import type { DashboardProject } from "@/app/types";

function ProjectWorkspaceContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { dashboardProjectId, activeProjectName } = useQueryDashContext();
  return (
    <div className="project-workspace ambient-page flex h-full min-h-0 w-full flex-col gap-5 px-4 pb-[200px] pt-4 md:pb-60 md:pt-6">
      <ProjectPageHeader
        className="px-0 pt-0"
        projectId={dashboardProjectId}
        actions={
          pathname.endsWith("/dashboard") ? (
            <QueryDashboardViewToggle />
          ) : undefined
        }
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
