"use client";

import { useEffect, useRef, useState } from "react";
import Confetti from "react-confetti";
import { LayoutDashboard } from "lucide-react";
import { KanbanBoard } from "./components/kanban-board";
import { KanbanMobile } from "./components/kanban-mobile";
import { QueryDashProvider, useQueryDashContext } from "./context/query-dash-context";
import { cn } from "@/app/utils";
import TypeForm from "@/app/components/type-form";

const CONFETTI_DURATION_MS = 10000;

function QueryDashboardContent() {
  const { offerMadeCelebrationNonce, isEmpty, isLoading } = useQueryDashContext();
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
    []
  );

  useEffect(() => {
    const className = "query-dashboard-overflow-hidden";
    const updateOverflowClass = () => {
      if (window.innerWidth < 768) {
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
  }, []);

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
      {!isEmpty && !isLoading && <h1 className="ml-4 hidden items-center gap-2 text-xl font-semibold leading-tight text-accent md:flex md:text-[32px] font-serif">
        <LayoutDashboard className="w-10 h-10" />
        Query Dashboard
      </h1>}
      {/* Desktop view */}
      <div className="hidden md:block">
        <KanbanBoard />
      </div>
      {/* Mobile view */}
      <div className={cn("md:hidden flex flex-col flex-1 min-h-0 overflow-hidden pl-4", isEmpty && "pl-0")}>
        <KanbanMobile />
      </div>
    </div>
  );
}

export default function QueryDashboardPage() {
  return (
    <QueryDashProvider>
      <QueryDashboardContent />
      <TypeForm id="xZn6IEXK" />
    </QueryDashProvider>
  );
}
