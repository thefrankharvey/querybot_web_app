"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "../ui-primitives/button";
import { useStripeSubscribe } from "../hooks/use-stripe-subscribe";

const PayWall = ({
  gridRef,
  resultLength,
  title,
  lockAfterCards,
  lockTriggerViewportRatio,
}: {
  gridRef: React.RefObject<HTMLDivElement | null>;
  resultLength: number;
  title: string;
  lockAfterCards?: number;
  lockTriggerViewportRatio?: number;
}) => {
  const overlayVisibleRef = useRef(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const { handleSubscribe, isSubscribing } = useStripeSubscribe();

  useEffect(() => {
    const getColumns = () => {
      if (window.innerWidth >= 1024) return 3;
      if (window.innerWidth >= 768) return 2;
      return 1;
    };
    const clampedLockTriggerViewportRatio =
      typeof lockTriggerViewportRatio === "number"
        ? Math.min(1, Math.max(0, lockTriggerViewportRatio))
        : 1;

    const getFallbackVisibilityThreshold = () => {
      if (!gridRef?.current) return null;

      const gridRect = gridRef.current.getBoundingClientRect();
      const totalCards = resultLength;
      if (totalCards === 0) return null;

      const columns = getColumns();
      const totalRows = Math.ceil(totalCards / columns);
      if (totalRows === 0) return null;

      const cardHeight = gridRect.height / totalRows;
      const lockRowIndex =
        typeof lockAfterCards === "number"
          ? Math.floor(lockAfterCards / columns)
          : null;

      if (
        typeof lockAfterCards === "number" &&
        (lockAfterCards < 0 || totalCards <= lockAfterCards)
      ) {
        return null;
      }

      if (lockRowIndex !== null) {
        return gridRect.top + cardHeight * lockRowIndex;
      }

      if (totalRows < 2) return null;

      return gridRect.top + cardHeight * 1.5;
    };

    const getLockAnchorTop = () => {
      if (!gridRef?.current || typeof lockAfterCards !== "number") return null;
      if (lockAfterCards < 0 || resultLength <= lockAfterCards) return null;

      const anchor = gridRef.current.children.item(lockAfterCards);
      if (!(anchor instanceof HTMLElement)) return null;

      return anchor.getBoundingClientRect().top;
    };

    const handleScroll = () => {
      if (!gridRef?.current) return;

      const totalCards = resultLength;
      if (totalCards === 0) {
        if (overlayVisibleRef.current) {
          overlayVisibleRef.current = false;
          setShowOverlay(false);
        }
        return;
      }
      const hasLockAfterCards = typeof lockAfterCards === "number";

      if (
        hasLockAfterCards &&
        (lockAfterCards < 0 || totalCards <= lockAfterCards)
      ) {
        if (overlayVisibleRef.current) {
          overlayVisibleRef.current = false;
          setShowOverlay(false);
        }
        return;
      }

      const visibilityThreshold = hasLockAfterCards
        ? getLockAnchorTop() ?? getFallbackVisibilityThreshold()
        : getFallbackVisibilityThreshold();
      if (visibilityThreshold === null) return;

      const triggerPoint =
        hasLockAfterCards
          ? window.innerHeight * clampedLockTriggerViewportRatio
          : window.innerHeight / 2 + 300;
      const shouldShowOverlay = visibilityThreshold <= triggerPoint;

      if (overlayVisibleRef.current !== shouldShowOverlay) {
        overlayVisibleRef.current = shouldShowOverlay;
        setShowOverlay(shouldShowOverlay);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    requestAnimationFrame(() => {
      handleScroll();
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [gridRef, lockAfterCards, lockTriggerViewportRatio, resultLength]);

  return (
    <div
      className={`w-screen fixed bottom-0 left-0 right-0 h-[calc(40vh+200px)] pointer-events-none z-10 transition-transform duration-500 ${
        showOverlay ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="h-[100px] bg-gradient-to-b from-white/0 to-white"></div>
      <div className="h-[calc(40vh+100px)] bg-white pointer-events-auto">
        <div className="flex flex-col items-center justify-center h-full w-full">
          <p className="text-lg md:text-xl mt-4">{title}</p>
          <h1 className="text-xl md:text-3xl font-extrabold leading-tight mb-8 mt-4 w-[90%] text-center mx-auto">
            Subscribe to Write Query Hook for full access!
          </h1>
          <Button
            className="cursor-pointer text-xl p-8 font-semibold mt-2 shadow-lg hover:shadow-xl"
            onClick={() => handleSubscribe("monthly")}
            disabled={isSubscribing}
          >
            SUBSCRIBE NOW
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PayWall;
