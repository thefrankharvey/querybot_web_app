"use client";

import { ProjectViewToggle } from "./project-view-toggle";
import { BookOpen, ScanSearch } from "lucide-react";
import Link from "next/link";
import { Button } from "@/app/ui-primitives/button";
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
      <div className="flex w-full flex-col items-stretch gap-3 lg:flex-row lg:items-center">
        {projectId && (
          <>
            <ProjectViewToggle projectId={projectId} />
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-[52px] w-full lg:w-auto"
            >
              <Link
                href={`/smart-match?project=${encodeURIComponent(projectId)}`}
              >
                <ScanSearch data-icon="inline-start" aria-hidden="true" />
                Find agents
              </Link>
            </Button>
          </>
        )}
        {actions && (
          <div className="w-full lg:ml-auto lg:w-auto lg:shrink-0">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}
