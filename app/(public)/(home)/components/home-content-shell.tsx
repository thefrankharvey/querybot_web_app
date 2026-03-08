import type { ReactNode } from "react";

import { cn } from "@/app/utils";

export default function HomeContentShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-screen-xl px-4", className)}>
      {children}
    </div>
  );
}
