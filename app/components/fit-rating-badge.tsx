import type { CSSProperties } from "react";
import { cn } from "@/app/utils";

export type FitRating = "perfect" | "great" | "good" | "neutral";
export type FitRatingBadgeVariant = "dashboard" | "agent";

export const FIT_RATING_CONFIG: Record<
  FitRating,
  { label: string; color: string }
> = {
  perfect: { label: "Perfect Fit", color: "var(--fit-perfect)" },
  great: { label: "Great Fit", color: "var(--fit-great)" },
  good: { label: "Good Fit", color: "var(--fit-good)" },
  neutral: { label: "Neutral Fit", color: "var(--fit-neutral)" },
};

export function getFitRatingFromScore(score: number | null | undefined): FitRating {
  if (score == null) return "neutral";
  if (score >= 4) return "perfect";
  if (score >= 3) return "great";
  if (score > 2.5) return "good";
  return "neutral";
}

interface FitRatingBadgeProps {
  rating: FitRating;
  variant?: FitRatingBadgeVariant;
  className?: string;
  style?: CSSProperties;
}

const FIT_RATING_BADGE_VARIANT_CLASSES: Record<FitRatingBadgeVariant, string> = {
  dashboard: "px-2 py-0.5 text-xs font-medium",
  agent: "px-3 py-1 text-xs font-semibold",
};

export function FitRatingBadge({
  rating,
  variant = "dashboard",
  className,
  style,
}: FitRatingBadgeProps) {
  const config = FIT_RATING_CONFIG[rating];

  return (
    <span
      className={cn(
        "inline-block rounded-full text-white shadow-[0_8px_18px_rgba(24,44,69,0.12)]",
        FIT_RATING_BADGE_VARIANT_CLASSES[variant],
        className
      )}
      style={{ backgroundColor: config.color, ...style }}
    >
      {config.label}
    </span>
  );
}
