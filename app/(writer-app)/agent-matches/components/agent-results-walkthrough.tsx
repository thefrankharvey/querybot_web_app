"use client";

import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Check, X } from "lucide-react";

import { cn } from "@/app/utils";
import { Button } from "@/app/ui-primitives/button";

type WalkthroughPlacement = "bottom" | "left" | "right" | "top";

type WalkthroughStep = {
  body: ReactNode;
  id: string;
  preferredPlacement: WalkthroughPlacement;
  targetSelector: string;
  title: string;
};

type TargetRect = {
  bottom: number;
  height: number;
  left: number;
  right: number;
  top: number;
  width: number;
};

type AgentResultsWalkthroughProps = {
  enabled: boolean;
  onActiveChange?: (isActive: boolean) => void;
};

const WALKTHROUGH_STORAGE_KEY = "wqh_agent_results_walkthrough:v2:completed";
const VIEWPORT_MARGIN = 16;
const TARGET_PADDING = 8;
const TOOLTIP_GAP = 14;
const DESKTOP_TOOLTIP_WIDTH = 304;
const MOBILE_BREAKPOINT = 768;

const WALKTHROUGH_STEPS: WalkthroughStep[] = [
  {
    body: (
      <>
        Matching <strong>Genres</strong> and <strong>Themes</strong> show where an
        agent&apos;s profile overlaps with your project.{" "}
        <strong>Fit Rating</strong> summarizes overall match strength, click the{" "}
        <strong>heart</strong> to save the agent to your Query Dashboard.
        Click the card to view the agent&apos;s profile, including their contact information and bio.
      </>
    ),
    id: "agent-card-overview",
    preferredPlacement: "right",
    targetSelector: '[data-tour-target="agent-results-first-card"]',
    title: "Understanding Your Matches",
  },
  {
    body: "Filter by submission status to focus on agents who are open, closed, or all matches.",
    id: "status-filter",
    preferredPlacement: "bottom",
    targetSelector: '[data-tour-target="agent-results-status-filter"]',
    title: "Filter By Status",
  },
  {
    body: "Filter by the country that matches your query needs.",
    id: "country-filter",
    preferredPlacement: "bottom",
    targetSelector: '[data-tour-target="agent-results-country-filter"]',
    title: "Filter By Country",
  },
  {
    body: '"Save All Agents" button saves the entire page of matches to your Query Dashboard.',
    id: "save-all-agents",
    preferredPlacement: "bottom",
    targetSelector: '[data-tour-target="agent-results-save-all"]',
    title: "Save All Agents",
  },
  {
    body: "Query Spreadsheet button creates a spreadsheet with the entire list of agent results for this search pre-filled for you.",
    id: "query-spreadsheet",
    preferredPlacement: "bottom",
    targetSelector: '[data-tour-target="agent-results-query-spreadsheet"]',
    title: "Query Spreadsheet",
  },
];

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

function getStepTarget(step: WalkthroughStep) {
  if (typeof document === "undefined") return null;

  const target = document.querySelector(step.targetSelector);
  return target instanceof HTMLElement ? target : null;
}

function getNextAvailableStepIndex(startIndex: number) {
  for (let index = startIndex; index < WALKTHROUGH_STEPS.length; index += 1) {
    if (getStepTarget(WALKTHROUGH_STEPS[index])) {
      return index;
    }
  }

  return -1;
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
  preferredPlacement: WalkthroughPlacement,
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

export function AgentResultsWalkthrough({
  enabled,
  onActiveChange,
}: AgentResultsWalkthroughProps) {
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

  const closeWalkthrough = useCallback(() => {
    markWalkthroughComplete();
    setIsOpen(false);
    setTargetRect(null);
  }, []);

  const handlePrimaryAction = useCallback(() => {
    if (!isLastStep) {
      const nextStepIndex = getNextAvailableStepIndex(activeStepIndex + 1);

      if (nextStepIndex === -1) {
        closeWalkthrough();
        return;
      }

      setActiveStepIndex(nextStepIndex);
      return;
    }

    closeWalkthrough();
  }, [activeStepIndex, closeWalkthrough, isLastStep]);

  useEffect(() => {
    onActiveChange?.(isOpen);
  }, [isOpen, onActiveChange]);

  useEffect(() => {
    return () => {
      onActiveChange?.(false);

      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [onActiveChange]);

  useEffect(() => {
    if (!enabled || hasCompletedWalkthrough()) {
      setIsOpen(false);
      setTargetRect(null);
      return;
    }

    const target = getTargetElement();

    if (!target) {
      const nextStepIndex = getNextAvailableStepIndex(activeStepIndex + 1);

      if (nextStepIndex === -1) {
        closeWalkthrough();
        return;
      }

      setActiveStepIndex(nextStepIndex);
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

    const timeoutId = window.setTimeout(updateTargetRect, 350);

    return () => window.clearTimeout(timeoutId);
  }, [
    activeStepIndex,
    closeWalkthrough,
    enabled,
    getTargetElement,
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

  const titleId = `agent-results-walkthrough-${activeStep.id}-title`;
  const bodyId = `agent-results-walkthrough-${activeStep.id}-body`;

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

export default AgentResultsWalkthrough;
