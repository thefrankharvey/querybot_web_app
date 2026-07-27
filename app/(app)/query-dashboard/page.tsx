"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Confetti from "react-confetti";
import { Columns3, LayoutDashboard, Table2 } from "lucide-react";

import { Button } from "@/app/ui-primitives/button";
import { ButtonGroup } from "@/app/ui-primitives/button-group";
import { cn } from "@/app/utils";

import { QueryDashProvider, useQueryDashContext } from "./context/query-dash-context";
import { EditableProjectTitle } from "./components/editable-project-title";
import { QueryDashboardTable } from "./components/query-dashboard-table";

const KanbanBoard = dynamic(
  () =>
    import("./components/kanban-board").then((module) => module.KanbanBoard),
  { ssr: false },
);
const KanbanMobile = dynamic(
  () =>
    import("./components/kanban-mobile").then((module) => module.KanbanMobile),
  { ssr: false },
);

const CONFETTI_DURATION_MS = 10000;

type DashboardView = "table" | "board";

function QueryDashboardContent() {
  const { offerMadeCelebrationNonce, isEmpty, isLoading, activeProjectName } =
    useQueryDashContext();
  const [showConfetti, setShowConfetti] = useState(false);
  const [dashboardView, setDashboardView] =
    useState<DashboardView>("table");
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
    []
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

  return (
    <div className="ambient-page flex h-full min-h-0 flex-col py-0 md:py-6">
      <div className="ambient-orb-top" />
      <div className="ambient-orb-bottom" />
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <Confetti
            recycle={false}
            numberOfPieces={500}
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      )}
      {!isLoading ? (
        <div
          className={cn(
            "flex flex-col gap-3 px-4 md:flex-row md:items-center md:justify-between",
            isEmpty && "pt-4 md:pt-0",
          )}
        >
          <h1 className="flex min-w-0 items-center gap-2 font-serif text-xl font-semibold leading-tight text-accent md:text-[32px]">
            <LayoutDashboard className="hidden size-10 shrink-0 md:block" />
            <EditableProjectTitle projectName={activeProjectName ?? ""} />
          </h1>
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
        </div>
      ) : null}
      {dashboardView === "table" ? (
        <div className="flex min-h-0 flex-1 flex-col px-4 pt-4">
          <QueryDashboardTable />
        </div>
      ) : (
        <>
          <div className="hidden md:block">
            <KanbanBoard />
          </div>
          <div
            className={cn(
              "flex min-h-0 flex-1 flex-col overflow-hidden pl-4 md:hidden",
              isEmpty && "pl-0",
            )}
          >
            <KanbanMobile />
          </div>
        </>
      )}
    </div>
  );
}

export default function QueryDashboardPage() {
  return (
    <Suspense fallback={null}>
      <QueryDashProvider>
        <QueryDashboardContent />
      </QueryDashProvider>
    </Suspense>
  );
}
