"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/app/utils";

export function ProjectViewToggle({ projectId }: { projectId: string }) {
  const pathname = usePathname();
  const profileActive = pathname.endsWith("/profile");
  return (
    <nav
      aria-label="Project views"
      className="relative isolate grid w-full max-w-[330px] grid-cols-2 rounded-full bg-accent/5 p-1"
    >
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-y-1 left-1 w-[calc((100%_-_0.5rem)/2)] rounded-full bg-accent shadow-sm transition-transform duration-200 ease-in-out motion-reduce:transition-none",
          profileActive && "translate-x-full",
        )}
      />
      {[
        { view: "dashboard", label: "Query dashboard" },
        { view: "profile", label: "Project profile" },
      ].map(({ view, label }) => {
        const href = `/projects/${projectId}/${view}`;
        const active = pathname === href;
        return (
          <Link
            key={view}
            href={href}
            scroll={false}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex min-h-11 items-center justify-center rounded-full px-3 py-2 text-center text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 motion-reduce:transition-none",
              active ? "text-background" : "text-accent hover:bg-accent/10",
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
