"use client";

import React, { useEffect, useState, useRef } from "react";
import { AgentCards } from "../components/agent-cards";
import { Button } from "../ui-primitives/button";
import {
  useAgentMatches,
  AgentMatchesProvider,
} from "../context/agent-matches-context";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

declare global {
  interface Window {
    isScrollLocked?: boolean;
    lastTouchY?: number;
  }
}

const AgentMatches = () => {
  const matchesContext = useAgentMatches();
  const matches = matchesContext?.matches || [];
  const [showOverlay, setShowOverlay] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef<number>(0);
  const targetScrollY = useRef<number | null>(null);

  useEffect(() => {
    // Calculate the exact scroll position that shows half of the second row
    const calculateTargetScrollPosition = () => {
      if (!gridRef.current) return null;

      const gridRect = gridRef.current.getBoundingClientRect();
      const totalCards = matches.length;

      // Get rows and columns based on responsive design
      let columns = 1; // Default for mobile
      if (window.innerWidth >= 1024) columns = 3; // lg breakpoint
      else if (window.innerWidth >= 768) columns = 3; // md breakpoint

      const totalRows = Math.ceil(totalCards / columns);
      if (totalRows < 2) return null; // Not enough cards for a second row

      const cardHeight = gridRect.height / totalRows;

      // Position to show first row completely and half of the second row
      // gridRect.top is relative to viewport, so we add current scroll
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

      // Get grid information
      const gridRect = gridRef.current.getBoundingClientRect();
      const totalCards = matches.length;

      // Get rows and columns based on responsive design
      let columns = 1; // Default for mobile
      if (window.innerWidth >= 1024) columns = 3; // lg breakpoint
      else if (window.innerWidth >= 768) columns = 2; // md breakpoint

      const totalRows = Math.ceil(totalCards / columns);
      const cardHeight = gridRect.height / totalRows;

      // First row height plus half of second row
      const visibilityThreshold = gridRect.top + cardHeight * 1.5;

      // If we've scrolled to where half of the second row is visible
      if (visibilityThreshold <= window.innerHeight / 2 + 300) {
        if (!showOverlay) {
          setShowOverlay(true);
        }

        // Only calculate the target position once when we first hit the threshold
        if (targetScrollY.current === null) {
          targetScrollY.current = calculateTargetScrollPosition();
        }

        // If we're below the target position, we need to lock
        if (targetScrollY.current !== null && scrollY > targetScrollY.current) {
          // Prevent scrolling past target but don't change the current scroll position
          window.isScrollLocked = true;

          // Only adjust if we're significantly past the target
          if (Math.abs(scrollY - targetScrollY.current) > 5) {
            // Use requestAnimationFrame to smooth out scroll updates
            requestAnimationFrame(() => {
              window.scrollTo({
                top: targetScrollY.current || 0,
                behavior: "auto", // Using 'smooth' can cause continuous scrolling issues
              });
            });
          }
        }
      } else {
        // When scrolling back up
        setShowOverlay(false);
        window.isScrollLocked = false;
        targetScrollY.current = null;
      }
    };

    // Use wheel event to precisely control scrolling
    const handleWheel = (e: WheelEvent) => {
      if (window.isScrollLocked && e.deltaY > 0) {
        // Only prevent default for downward scrolling when locked
        e.preventDefault();
      }
    };

    // For touch devices
    const handleTouchMove = (e: TouchEvent) => {
      if (window.isScrollLocked) {
        const currentY = e.touches[0].clientY;
        const lastTouchY = window.lastTouchY || currentY;

        // Detect downward swipe
        if (currentY < lastTouchY) {
          e.preventDefault();
        }

        window.lastTouchY = currentY;
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      window.lastTouchY = e.touches[0].clientY;
    };

    // Setup event listeners
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchmove", handleTouchMove as EventListener, {
      passive: false,
    });
    window.addEventListener("touchstart", handleTouchStart as EventListener, {
      passive: true,
    });

    // Initial calculation on mount
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
      <h1 className="text-4xl md:text-[40px] font-extrabold leading-tight mb-8">
        Agent Matches
      </h1>
      <div>
        <Link href="/query-form" className="flex items-center gap-2 mb-4">
          <ArrowLeft className="w-8 h-8" />
          <h2 className="text-2xl">Back</h2>
        </Link>
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          ref={gridRef}
        >
          {matches.map((match, index: number) => (
            <AgentCards
              key={index}
              agent={match}
              index={index}
              id={`agent-${index}`}
            />
          ))}
        </div>
      </div>
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
            <a
              href="https://subscribe.writequeryhook.com/products/slush-wire-pro-direct?step=checkout&_gl=1*1o0mzku*_ga*MTczNjM3NTEyMC4xNzQ2MjEwNTg0*_ga_4C1NS70GTD*czE3NDY0ODEyMTAkbzckZzAkdDE3NDY0ODEyMTAkajAkbDAkaDA."
              target="_blank"
              className="flex justify-center items-center"
            >
              <Button className="cursor-pointer text-xl p-8 font-semibold mt-10 hover:border-accent border-2 border-transparent">
                GET FULL ACCESS
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AgentMatchesPage() {
  return (
    <AgentMatchesProvider>
      <AgentMatches />
    </AgentMatchesProvider>
  );
}
