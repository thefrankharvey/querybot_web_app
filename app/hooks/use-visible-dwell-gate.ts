"use client";

import { useCallback, useEffect, useState } from "react";

type UseVisibleDwellGateOptions = {
  delayMs: number;
  enabled: boolean;
  storageKey: string;
};

export function useVisibleDwellGate({
  delayMs,
  enabled,
  storageKey,
}: UseVisibleDwellGateOptions) {
  const [open, setOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const hasDismissed = useCallback(() => {
    if (typeof window === "undefined") return false;

    try {
      return window.localStorage.getItem(storageKey) === "true";
    } catch {
      return false;
    }
  }, [storageKey]);

  const dismiss = useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(storageKey, "true");
      } catch {
        // localStorage may be unavailable in private browsing or locked-down contexts.
      }
    }

    setIsDismissed(true);
    setOpen(false);
  }, [storageKey]);

  useEffect(() => {
    if (!enabled || isDismissed) {
      setOpen(false);
      return;
    }

    if (typeof window === "undefined") return;

    if (hasDismissed()) {
      setIsDismissed(true);
      setOpen(false);
      return;
    }

    let remainingMs = delayMs;
    let startedAt = 0;
    let timeoutId: number | null = null;

    const clearTimer = () => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
        timeoutId = null;
      }
    };

    const pauseTimer = () => {
      if (startedAt > 0) {
        remainingMs = Math.max(0, remainingMs - (Date.now() - startedAt));
        startedAt = 0;
      }

      clearTimer();
    };

    const showGate = () => {
      startedAt = 0;
      clearTimer();

      if (hasDismissed()) {
        setIsDismissed(true);
        return;
      }

      setOpen(true);
    };

    const resumeTimer = () => {
      if (document.visibilityState !== "visible" || timeoutId !== null) {
        return;
      }

      if (remainingMs <= 0) {
        showGate();
        return;
      }

      startedAt = Date.now();
      timeoutId = window.setTimeout(showGate, remainingMs);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        pauseTimer();
        return;
      }

      resumeTimer();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    resumeTimer();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearTimer();
    };
  }, [delayMs, enabled, hasDismissed, isDismissed]);

  return {
    dismiss,
    open,
    setOpen,
  };
}
