"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/app/utils";

export function ProjectPageHeader({
  projectId,
  title,
  actions,
}: {
  projectId?: string;
  title: ReactNode;
  actions?: ReactNode;
}) {
  const pathname = usePathname();
  return (
    <header className="flex shrink-0 flex-col gap-5 px-4 pt-4 md:pt-0">
      <h1 className="flex min-w-0 items-center gap-2 font-serif text-2xl font-semibold leading-tight text-accent md:text-[32px]">
        <BookOpen
          className="hidden size-8 shrink-0 md:block"
          aria-hidden="true"
        />
        {title}
      </h1>
      <div className="flex flex-wrap items-center justify-between gap-3">
        {projectId && (
          <nav
            aria-label="Project views"
            className="flex gap-1 rounded-full bg-accent/5 p-1"
          >
            {[
              {
                href: `/projects/${projectId}/dashboard`,
                label: "Query dashboard",
              },
              {
                href: `/projects/${projectId}/profile`,
                label: "Project profile",
              },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                aria-current={pathname === href ? "page" : undefined}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
                  pathname === href
                    ? "bg-accent text-background shadow-sm"
                    : "text-accent hover:bg-accent/10",
                )}
              >
                {label}
              </Link>
            ))}
          </nav>
        )}
        {actions}
      </div>
    </header>
  );
}
