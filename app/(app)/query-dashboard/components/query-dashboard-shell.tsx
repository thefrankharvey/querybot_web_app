"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Confetti from "react-confetti";
import { Columns3, Table2 } from "lucide-react";
import { ProjectPageHeader } from "@/app/components/projects/project-page-header";

import Link from "next/link";
import { Button } from "@/app/ui-primitives/button";
import { ButtonGroup } from "@/app/ui-primitives/button-group";
import { cn } from "@/app/utils";

import {
  QueryDashProvider,
  useQueryDashContext,
} from "../context/query-dash-context";
import { ProjectDashboardLoading } from "./project-dashboard-loading";
import { ProjectDashboardTitle } from "./project-dashboard-title";
import { QueryDashboardTable } from "./query-dashboard-table";

const KanbanBoard = dynamic(
  () => import("./kanban-board").then((module) => module.KanbanBoard),
  { ssr: false },
);
const KanbanMobile = dynamic(
  () => import("./kanban-mobile").then((module) => module.KanbanMobile),
  { ssr: false },
);

const CONFETTI_DURATION_MS = 10000;

export function QueryDashboardContent({
  embedded = false,
}: {
  embedded?: boolean;
}) {
  const {
    dashboardView,
    setDashboardView,
    offerMadeCelebrationNonce,
    isEmpty,
    isLoading,
    hasLoadError,
    activeProjectName,
    dashboardProjectId,
  } = useQueryDashContext();
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (offerMadeCelebrationNonce === 0) return;

    setShowConfetti(true);

    if (confettiTimerRef.current) {
      clearTimeout(confettiTimerRef.current);
    }

    confettiTimerRef.current = setTimeout(() => {
      setShowConfetti(false);
      confettiTimerRef.current = null;
    }, CONFETTI_DURATION_MS);
  }, [offerMadeCelebrationNonce]);

  useEffect(
    () => () => {
      if (confettiTimerRef.current) {
        clearTimeout(confettiTimerRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    const className = "query-dashboard-overflow-hidden";
    const updateOverflowClass = () => {
      if (dashboardView === "board" && window.innerWidth < 768) {
        document.body.classList.add(className);
        return;
      }
      document.body.classList.remove(className);
    };

    updateOverflowClass();
    window.addEventListener("resize", updateOverflowClass);

    return () => {
      window.removeEventListener("resize", updateOverflowClass);
      document.body.classList.remove(className);
    };
  }, [dashboardView]);

  const viewControls = (
    <ButtonGroup className="shrink-0">
      <Button
        aria-pressed={dashboardView === "table"}
        size="sm"
        type="button"
        variant={dashboardView === "table" ? "solid" : "outline"}
        onClick={() => setDashboardView("table")}
      >
        <Table2 data-icon="inline-start" />
        Table
      </Button>
      <Button
        aria-pressed={dashboardView === "board"}
        size="sm"
        type="button"
        variant={dashboardView === "board" ? "solid" : "outline"}
        onClick={() => setDashboardView("board")}
      >
        <Columns3 data-icon="inline-start" />
        Board
      </Button>
    </ButtonGroup>
  );

  if (hasLoadError)
    return (
      <div className="flex flex-col gap-5 py-4 md:py-6">
        {!embedded && (
          <ProjectPageHeader
            projectId={dashboardProjectId ?? undefined}
            title={activeProjectName || "Project"}
          />
        )}
        <div role="alert" className="flex flex-col items-start gap-3 p-4">
          <p>Unable to load your saved records. Please try again.</p>
          <Button
            type="button"
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Reload dashboard
          </Button>
        </div>
      </div>
    );
  if (isLoading) return <ProjectDashboardLoading />;

  return (
    <div
      className={cn(
        "query-dashboard-page ambient-page flex h-full min-h-0 flex-col",
        embedded ? "gap-4" : "py-0 md:py-6",
      )}
    >
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <Confetti
            recycle={false}
            numberOfPieces={500}
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      )}
      {embedded ? (
        <div className="flex shrink-0 justify-end">{viewControls}</div>
      ) : (
        <ProjectPageHeader
          projectId={dashboardProjectId ?? undefined}
          title={
            <ProjectDashboardTitle projectName={activeProjectName ?? ""} />
          }
          actions={viewControls}
        />
      )}
      {isEmpty && (
        <div
          className={cn(
            "flex flex-wrap items-center justify-between gap-3",
            !embedded && "px-4 pt-5",
          )}
          role="status"
        >
          <p>No saved agents yet. Your project is ready when you are.</p>
          <Button asChild variant="outline" size="sm">
            <Link
              href={`/smart-match?project=${encodeURIComponent(dashboardProjectId ?? "")}`}
            >
              Find agents for this project
            </Link>
          </Button>
        </div>
      )}
      {dashboardView === "table" ? (
        <div
          className={cn(
            "flex min-h-0 flex-1 flex-col",
            !embedded && "px-4 pb-4 pt-4",
          )}
        >
          <QueryDashboardTable />
        </div>
      ) : (
        <>
          <div className={cn("hidden md:block", embedded && "-mx-4")}>
            <KanbanBoard />
          </div>
          <div
            className={cn(
              "flex min-h-0 flex-1 flex-col overflow-hidden md:hidden",
              !embedded && !isEmpty && "pl-4",
            )}
          >
            <KanbanMobile />
          </div>
        </>
      )}
    </div>
  );
}

export function QueryDashboardShell({
  dashboardProjectId,
  projectName,
  writerProjectId,
}: {
  dashboardProjectId?: string;
  projectName?: string | null;
  writerProjectId?: string | null;
}) {
  return (
    <Suspense fallback={<ProjectDashboardLoading />}>
      <QueryDashProvider
        dashboardProjectId={dashboardProjectId}
        projectName={projectName}
        writerProjectId={writerProjectId}
      >
        <QueryDashboardContent />
      </QueryDashProvider>
    </Suspense>
  );
}
