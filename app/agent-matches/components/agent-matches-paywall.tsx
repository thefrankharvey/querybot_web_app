import { useAgentMatches } from "../../context/agent-matches-context";
import { useState, useRef, useEffect } from "react";
import AgentMatchesInner from "./agent-matches-inner";
import { Button } from "../../ui-primitives/button";
import Link from "next/link";

declare global {
  interface Window {
    isScrollLocked?: boolean;
    lastTouchY?: number;
  }
}

export const AgentMatchesPaywall = () => {
  const { matches, isLoading } = useAgentMatches();
  const [showOverlay, setShowOverlay] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef<number>(0);
  const targetScrollY = useRef<number | null>(null);

  useEffect(() => {
    const calculateTargetScrollPosition = () => {
      if (!gridRef.current) return null;

      const gridRect = gridRef.current.getBoundingClientRect();
      const totalCards = matches.length;

      let columns = 1;
      if (window.innerWidth >= 1024) columns = 3;
      else if (window.innerWidth >= 768) columns = 3;

      const totalRows = Math.ceil(totalCards / columns);
      if (totalRows < 2) return null;

      const cardHeight = gridRect.height / totalRows;

      const targetPosition =
        window.scrollY +
        gridRect.top +
        cardHeight * 1.5 -
        window.innerHeight / 2;

      return Math.max(0, targetPosition);
    };

    const handleScroll = () => {
      if (!gridRef.current) return;

      const scrollY = window.scrollY;
      lastScrollY.current = scrollY;

      const gridRect = gridRef.current.getBoundingClientRect();
      const totalCards = matches.length;

      let columns = 1;
      if (window.innerWidth >= 1024) columns = 3;
      else if (window.innerWidth >= 768) columns = 2;

      const totalRows = Math.ceil(totalCards / columns);
      const cardHeight = gridRect.height / totalRows;

      const visibilityThreshold = gridRect.top + cardHeight * 1.5;

      if (visibilityThreshold <= window.innerHeight / 2 + 300) {
        if (!showOverlay) {
          setShowOverlay(true);
        }

        if (targetScrollY.current === null) {
          targetScrollY.current = calculateTargetScrollPosition();
        }

        if (targetScrollY.current !== null && scrollY > targetScrollY.current) {
          window.isScrollLocked = true;

          if (Math.abs(scrollY - targetScrollY.current) > 5) {
            requestAnimationFrame(() => {
              window.scrollTo({
                top: targetScrollY.current || 0,
                behavior: "auto",
              });
            });
          }
        }
      } else {
        setShowOverlay(false);
        window.isScrollLocked = false;
        targetScrollY.current = null;
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (window.isScrollLocked && e.deltaY > 0) {
        e.preventDefault();
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (window.isScrollLocked) {
        const currentY = e.touches[0].clientY;
        const lastTouchY = window.lastTouchY || currentY;

        if (currentY < lastTouchY) {
          e.preventDefault();
        }

        window.lastTouchY = currentY;
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      window.lastTouchY = e.touches[0].clientY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchmove", handleTouchMove as EventListener, {
      passive: false,
    });
    window.addEventListener("touchstart", handleTouchStart as EventListener, {
      passive: true,
    });

    setTimeout(() => {
      handleScroll();
    }, 100);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchmove", handleTouchMove as EventListener);
      window.removeEventListener(
        "touchstart",
        handleTouchStart as EventListener
      );
      window.isScrollLocked = false;
      window.lastTouchY = undefined;
    };
  }, [matches.length, showOverlay]);

  return (
    <div className="pt-30 min-h-[700px]" ref={contentRef}>
      <AgentMatchesInner
        matches={matches}
        gridRef={gridRef}
        hasProPlan={false}
        isLoading={isLoading}
      />
      <div
        className={`w-screen fixed bottom-0 left-0 right-0 h-[calc(40vh+200px)] pointer-events-none z-10 transition-transform duration-500 ${
          showOverlay ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="h-[100px] bg-gradient-to-b from-white/0 to-white"></div>
        <div className="h-[calc(40vh+100px)] bg-white pointer-events-auto">
          <div className="flex flex-col items-center justify-center h-full w-full">
            <p className="text-lg md:text-xl mt-4">
              Your first three agent matches are free
            </p>
            <h1 className="text-2xl md:text-4xl md:text-[40px] font-extrabold leading-tight mb-8 mt-4">
              Sign up to see your full list!
            </h1>
            <Link href="/subscription">
              <Button className="cursor-pointer text-xl p-8 font-semibold mt-10 hover:border-accent border-2 border-transparent">
                GET FULL ACCESS
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentMatchesPaywall;
