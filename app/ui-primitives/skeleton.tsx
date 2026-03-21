import * as React from "react";
import { cn } from "../utils";
interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  isLoading?: boolean;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ children, className, isLoading = true }, forwardedRef) => {
    if (!isLoading) {
      return children;
    }

    return (
      <div
        ref={forwardedRef}
        aria-hidden
        className={cn("animate-pulse rounded-[1rem] border border-white/60 bg-[linear-gradient(135deg,rgba(255,255,255,0.86),rgba(240,246,248,0.78))] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]", className)}
      />
    );
  }
);

Skeleton.displayName = "Skeleton";

export { Skeleton };
export type { SkeletonProps };
