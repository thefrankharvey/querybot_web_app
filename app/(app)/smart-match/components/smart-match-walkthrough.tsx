"use client";

import {
  type CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Check, X } from "lucide-react";

import { Button } from "@/app/ui-primitives/button";
import { cn } from "@/app/utils";
import {
  SMART_MATCH_WALKTHROUGH_STEPS,
  SMART_MATCH_WALKTHROUGH_STORAGE_KEY,
  type SmartMatchWalkthroughPlacement,
  type SmartMatchWalkthroughStep,
  type SmartMatchWalkthroughStepId,
} from "./smart-match-walkthrough-config";

type TargetRect = {
  bottom: number;
  height: number;
  left: number;
  right: number;
  top: number;
  width: number;
};

type SmartMatchWalkthroughProps = {
  enabled: boolean;
  onActiveStepChange?: (stepId: SmartMatchWalkthroughStepId | null) => void;
};

const VIEWPORT_MARGIN = 16;
const TARGET_PADDING = 8;
const TOOLTIP_GAP = 14;
const DESKTOP_TOOLTIP_WIDTH = 304;
const MOBILE_BREAKPOINT = 768;
const TARGET_RETRY_DELAY_MS = 80;
const MAX_TARGET_RETRY_COUNT = 10;
const WALKTHROUGH_STEPS = SMART_MATCH_WALKTHROUGH_STEPS;
const WALKTHROUGH_STORAGE_KEY = SMART_MATCH_WALKTHROUGH_STORAGE_KEY;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function hasCompletedWalkthrough() {
  if (typeof window === "undefined") return true;

  try {
    return window.localStorage.getItem(WALKTHROUGH_STORAGE_KEY) === "true";
  } catch {
    return true;
  }
}

function markWalkthroughComplete() {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(WALKTHROUGH_STORAGE_KEY, "true");
  } catch {
    // localStorage can be unavailable in private browsing or locked-down contexts.
  }
}

function getStepTarget(step: SmartMatchWalkthroughStep) {
  if (typeof document === "undefined") return null;

  const target = document.querySelector(step.targetSelector);
  return target instanceof HTMLElement ? target : null;
}

function getTargetRect(target: HTMLElement): TargetRect {
  const rect = target.getBoundingClientRect();
  const top = Math.max(VIEWPORT_MARGIN, rect.top - TARGET_PADDING);
  const left = Math.max(VIEWPORT_MARGIN, rect.left - TARGET_PADDING);
  const right = Math.min(
    window.innerWidth - VIEWPORT_MARGIN,
    rect.right + TARGET_PADDING,
  );
  const bottom = Math.min(
    window.innerHeight - VIEWPORT_MARGIN,
    rect.bottom + TARGET_PADDING,
  );

  return {
    bottom,
    height: Math.max(0, bottom - top),
    left,
    right,
    top,
    width: Math.max(0, right - left),
  };
}

function getTooltipStyle(
  targetRect: TargetRect,
  preferredPlacement: SmartMatchWalkthroughPlacement,
): CSSProperties {
  const viewportWidth = window.innerWidth;

  if (viewportWidth < MOBILE_BREAKPOINT) {
    return {
      bottom: VIEWPORT_MARGIN,
      left: VIEWPORT_MARGIN,
      right: VIEWPORT_MARGIN,
    };
  }

  const viewportHeight = window.innerHeight;
  const tooltipHeightEstimate = 210;
  const tooltipTop = clamp(
    targetRect.top,
    VIEWPORT_MARGIN,
    Math.max(VIEWPORT_MARGIN, viewportHeight - tooltipHeightEstimate),
  );
  const centeredLeft = clamp(
    targetRect.left + targetRect.width / 2 - DESKTOP_TOOLTIP_WIDTH / 2,
    VIEWPORT_MARGIN,
    viewportWidth - DESKTOP_TOOLTIP_WIDTH - VIEWPORT_MARGIN,
  );

  if (
    preferredPlacement === "right" &&
    targetRect.right + TOOLTIP_GAP + DESKTOP_TOOLTIP_WIDTH <=
      viewportWidth - VIEWPORT_MARGIN
  ) {
    return {
      left: targetRect.right + TOOLTIP_GAP,
      top: tooltipTop,
      width: DESKTOP_TOOLTIP_WIDTH,
    };
  }

  if (
    preferredPlacement === "left" &&
    targetRect.left - TOOLTIP_GAP - DESKTOP_TOOLTIP_WIDTH >= VIEWPORT_MARGIN
  ) {
    return {
      left: targetRect.left - TOOLTIP_GAP - DESKTOP_TOOLTIP_WIDTH,
      top: tooltipTop,
      width: DESKTOP_TOOLTIP_WIDTH,
    };
  }

  if (preferredPlacement === "top") {
    return {
      bottom: Math.max(
        VIEWPORT_MARGIN,
        viewportHeight - targetRect.top + TOOLTIP_GAP,
      ),
      left: centeredLeft,
      width: DESKTOP_TOOLTIP_WIDTH,
    };
  }

  return {
    left: centeredLeft,
    top: clamp(
      targetRect.bottom + TOOLTIP_GAP,
      VIEWPORT_MARGIN,
      Math.max(VIEWPORT_MARGIN, viewportHeight - 228),
    ),
    width: DESKTOP_TOOLTIP_WIDTH,
  };
}

export function SmartMatchWalkthrough({
  enabled,
  onActiveStepChange,
}: SmartMatchWalkthroughProps) {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const activeStep = WALKTHROUGH_STEPS[activeStepIndex];
  const isLastStep = activeStepIndex === WALKTHROUGH_STEPS.length - 1;

  const getTargetElement = useCallback(() => {
    if (!activeStep) return null;

    return getStepTarget(activeStep);
  }, [activeStep]);

  const updateTargetRect = useCallback(() => {
    const target = getTargetElement();

    if (!target) {
      setTargetRect(null);
      return;
    }

    setTargetRect(getTargetRect(target));
  }, [getTargetElement]);

  const scheduleTargetUpdate = useCallback(() => {
    if (typeof window === "undefined" || animationFrameRef.current !== null) {
      return;
    }

    animationFrameRef.current = window.requestAnimationFrame(() => {
      animationFrameRef.current = null;
      updateTargetRect();
    });
  }, [updateTargetRect]);

  const hideWalkthrough = useCallback(() => {
    setIsOpen(false);
    setTargetRect(null);
    onActiveStepChange?.(null);
  }, [onActiveStepChange]);

  const closeWalkthrough = useCallback(() => {
    markWalkthroughComplete();
    hideWalkthrough();
  }, [hideWalkthrough]);

  const advanceOrHide = useCallback(() => {
    if (!isLastStep) {
      setActiveStepIndex((currentIndex) => currentIndex + 1);
      return;
    }

    hideWalkthrough();
  }, [hideWalkthrough, isLastStep]);

  const handlePrimaryAction = useCallback(() => {
    if (!isLastStep) {
      setActiveStepIndex((currentIndex) => currentIndex + 1);
      return;
    }

    closeWalkthrough();
  }, [closeWalkthrough, isLastStep]);

  useEffect(() => {
    if (!enabled || hasCompletedWalkthrough() || !activeStep) {
      onActiveStepChange?.(null);
      return;
    }

    onActiveStepChange?.(activeStep.id);
  }, [activeStep, enabled, onActiveStepChange]);

  useEffect(() => {
    return () => {
      onActiveStepChange?.(null);

      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [onActiveStepChange]);

  useEffect(() => {
    if (!enabled || hasCompletedWalkthrough()) {
      hideWalkthrough();
      return;
    }

    let isCancelled = false;
    let retryCount = 0;
    let timeoutId: number | null = null;

    const openStep = () => {
      if (isCancelled) return;

      const target = getTargetElement();

      if (!target) {
        if (retryCount < MAX_TARGET_RETRY_COUNT) {
          retryCount += 1;
          timeoutId = window.setTimeout(openStep, TARGET_RETRY_DELAY_MS);
          return;
        }

        advanceOrHide();
        return;
      }

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      target.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "center",
        inline: "nearest",
      });

      updateTargetRect();
      setIsOpen(true);

      timeoutId = window.setTimeout(updateTargetRect, 350);
    };

    timeoutId = window.setTimeout(openStep, 0);

    return () => {
      isCancelled = true;

      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [
    activeStepIndex,
    advanceOrHide,
    enabled,
    getTargetElement,
    hideWalkthrough,
    updateTargetRect,
  ]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeWalkthrough();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [closeWalkthrough, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    window.addEventListener("resize", scheduleTargetUpdate);
    window.addEventListener("scroll", scheduleTargetUpdate, { passive: true });
    window.visualViewport?.addEventListener("resize", scheduleTargetUpdate);
    window.visualViewport?.addEventListener("scroll", scheduleTargetUpdate);

    return () => {
      window.removeEventListener("resize", scheduleTargetUpdate);
      window.removeEventListener("scroll", scheduleTargetUpdate);
      window.visualViewport?.removeEventListener("resize", scheduleTargetUpdate);
      window.visualViewport?.removeEventListener("scroll", scheduleTargetUpdate);
    };
  }, [isOpen, scheduleTargetUpdate]);

  useEffect(() => {
    if (!isOpen) return;

    const timeoutId = window.setTimeout(() => {
      tooltipRef.current?.focus({ preventScroll: true });
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [isOpen, activeStepIndex]);

  const spotlightStyle = useMemo<CSSProperties | null>(() => {
    if (!targetRect) return null;

    return {
      height: targetRect.height,
      left: targetRect.left,
      top: targetRect.top,
      width: targetRect.width,
    };
  }, [targetRect]);

  const tooltipStyle = useMemo<CSSProperties | null>(() => {
    if (!activeStep || !targetRect || typeof window === "undefined") return null;

    return getTooltipStyle(targetRect, activeStep.preferredPlacement);
  }, [activeStep, targetRect]);

  if (!activeStep || !isOpen || !spotlightStyle || !tooltipStyle) {
    return null;
  }

  const titleId = `smart-match-walkthrough-${activeStep.id}-title`;
  const bodyId = `smart-match-walkthrough-${activeStep.id}-body`;

  return (
    <>
      <div
        aria-hidden="true"
        className="fixed inset-0 z-[70] cursor-default"
        onMouseDown={(event) => event.preventDefault()}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed z-[71] rounded-[1.25rem] border border-white/85 ring-2 ring-white/70 transition-all duration-200"
        style={{
          ...spotlightStyle,
          boxShadow: "0 0 0 9999px rgba(22, 34, 51, 0.34)",
        }}
      />
      <div
        aria-describedby={bodyId}
        aria-labelledby={titleId}
        aria-modal="true"
        className={cn(
          "glass-panel-strong fixed z-[72] max-w-[calc(100vw-2rem)] rounded-[1rem] p-4 text-accent outline-none",
          "shadow-[0_28px_72px_rgba(22,34,51,0.22)]",
        )}
        ref={tooltipRef}
        role="dialog"
        style={tooltipStyle}
        tabIndex={-1}
      >
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent/52">
              Step {activeStepIndex + 1} of {WALKTHROUGH_STEPS.length}
            </p>
            <h2
              className="font-serif text-xl font-semibold leading-tight text-accent"
              id={titleId}
            >
              {activeStep.title}
            </h2>
            <p className="text-[14px] font-medium leading-5 text-accent/72" id={bodyId}>
              {activeStep.body}
            </p>
          </div>
          <div className="flex items-center justify-between gap-3">
            <Button onClick={closeWalkthrough} type="button" variant="ghost">
              <X data-icon="inline-start" />
              Skip
            </Button>
            <Button onClick={handlePrimaryAction} type="button">
              <Check data-icon="inline-start" />
              {isLastStep ? "Done" : "Next"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default SmartMatchWalkthrough;
