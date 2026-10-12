"use client";

import { ProjectViewToggle } from "./project-view-toggle";
import { BookOpen } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/app/utils";

export function ProjectPageHeader({
  projectId,
  title,
  actions,
  className,
}: {
  projectId?: string;
  title: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex shrink-0 flex-col gap-5 px-4 pt-4 md:pt-0",
        className,
      )}
    >
      <h1 className="flex min-w-0 items-center gap-2 font-serif text-2xl font-semibold leading-tight text-accent md:text-[32px]">
        <BookOpen
          className="hidden size-8 shrink-0 md:block"
          aria-hidden="true"
        />
        {title}
      </h1>
      <div className="flex flex-col items-start gap-3 md:flex-row md:items-center md:justify-between">
        {projectId && <ProjectViewToggle projectId={projectId} />}
        {actions}
      </div>
    </header>
  );
}
