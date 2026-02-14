"use client";

import { useEffect, useRef, useState } from "react";
import Confetti from "react-confetti";
import { LayoutDashboard } from "lucide-react";
import { KanbanBoard } from "./components/kanban-board";
import { KanbanMobile } from "./components/kanban-mobile";
import { QueryDashProvider, useQueryDashContext } from "./context/query-dash-context";

const CONFETTI_DURATION_MS = 10000;

function QueryDashboardContent() {
  const { offerMadeCelebrationNonce } = useQueryDashContext();
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

  return (
    <div className="md:py-6 py-0">
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <Confetti
            recycle={false}
            numberOfPieces={500}
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      )}
      <h1 className="text-xl md:text-[32px] md:flex hidden font-semibold leading-tight ml-4 items-center gap-2 text-accent">
        <LayoutDashboard className="w-10 h-10" />
        Query Dashboard
      </h1>
      {/* Desktop view */}
      <div className="hidden md:block">
        <KanbanBoard />
      </div>
      {/* Mobile view */}
      <div className="md:hidden flex flex-col overflow-hidden h-[calc(100dvh-0px)] pl-4">
        <KanbanMobile />
      </div>
    </div>
  );
}

export default function QueryDashboardPage() {
  return (
    <QueryDashProvider>
      <QueryDashboardContent />
    </QueryDashProvider>
  );
}
