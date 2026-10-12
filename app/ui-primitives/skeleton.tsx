import * as React from "react";
import { cn } from "../utils";
interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  isLoading?: boolean;
  variant?: "default" | "muted";
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ children, className, isLoading = true, variant = "default" }, forwardedRef) => {
    if (!isLoading) {
      return children;
    }

    return (
      <div
        ref={forwardedRef}
        aria-hidden
        className={cn(
          "animate-pulse rounded-[1rem] border motion-reduce:animate-none",
          variant === "muted"
            ? "border-accent/5 bg-accent/8"
            : "border-white/60 bg-[linear-gradient(135deg,rgba(255,255,255,0.86),rgba(240,246,248,0.78))] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]",
          className,
        )}
      />
    );
  }
);

Skeleton.displayName = "Skeleton";

export { Skeleton };
export type { SkeletonProps };
