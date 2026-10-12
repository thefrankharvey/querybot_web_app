"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SegmentedControl,
  SegmentedControlItem,
} from "@/app/ui-primitives/segmented-control";

export function ProjectViewToggle({ projectId }: { projectId: string }) {
  const pathname = usePathname();
  const profileActive = pathname.endsWith("/profile");
  return (
    <SegmentedControl
      activeIndex={profileActive ? 1 : 0}
      className="md:max-w-[330px]"
      asChild
    >
      <nav aria-label="Project views">
        {[
          { view: "dashboard", label: "Query dashboard" },
          { view: "profile", label: "Project profile" },
        ].map(({ view, label }) => {
          const href = `/projects/${projectId}/${view}`;
          const active = pathname === href;
          return (
            <SegmentedControlItem key={view} active={active} asChild>
              <Link
                href={href}
                scroll={false}
                aria-current={active ? "page" : undefined}
              >
                {label}
              </Link>
            </SegmentedControlItem>
          );
        })}
      </nav>
    </SegmentedControl>
  );
}
