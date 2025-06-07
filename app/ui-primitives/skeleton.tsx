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
        className={cn("bg-gray-100 animate-pulse rounded-md", className)}
      />
    );
  }
);

Skeleton.displayName = "Skeleton";

export { Skeleton };
export type { SkeletonProps };
