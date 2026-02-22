"use client";

import { useEffect, useRef, useState } from "react";

export interface AnimatedCountProps {
  value: number;
  durationMs?: number;
}

export default function AnimatedCount({
  value,
  durationMs = 600,
}: AnimatedCountProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    const safeTarget = Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0;
    if (safeTarget === 0 || durationMs <= 0) {
      setDisplayValue(safeTarget);
      return;
    }

    const start = performance.now();

    const step = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      const nextValue = Math.round(safeTarget * progress);
      setDisplayValue(nextValue);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
        return;
      }

      frameRef.current = null;
    };

    setDisplayValue(0);
    frameRef.current = requestAnimationFrame(step);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [durationMs, value]);

  return <span>{displayValue}</span>;
}
