"use client";

import { useMemo } from "react";
import { FolderOpen, Home, Newspaper, NotebookPen, ScanSearch } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import {
  WorkspaceHamburgerNav,
  WorkspaceNavLink,
  WorkspaceSignOutButton,
  type WorkspaceNavEntry,
} from "@/app/components/workspace-nav";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/ui-primitives/accordion";
import { useClerkUser } from "@/app/hooks/use-clerk-user";
import { cn } from "@/app/utils";
import { getProjectNamesFromAgentMatches } from "@/app/utils/project-dashboard-summary";

import { useProfileContext } from "../context/profile-context";

export const AppHamburger = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { agentsList } = useProfileContext();
  const { isSubscribed } = useClerkUser();

  const projectNames = useMemo(() => {
    return getProjectNamesFromAgentMatches(agentsList);
  }, [agentsList]);

  const activeProject = pathname.includes("query-dashboard")
    ? searchParams.get("project")
    : null;

  const entries: WorkspaceNavEntry[] = [
    {
      label: "Home",
      href: "/home",
      icon: Home,
      prefetch: true,
      isActive: (currentPathname) => currentPathname.includes("home"),
    },
    {
      label: "Smart Match",
      href: "/smart-match",
      icon: ScanSearch,
      prefetch: true,
      isActive: (currentPathname) => currentPathname.includes("smart-match"),
    },
    {
      type: "custom",
      key: "my-projects",
      content: (closeMenu) => (
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="my-projects" className="border-b-0">
            <AccordionTrigger
              className={cn(
                "justify-center gap-2 rounded-[22px] py-3 text-base font-medium hover:no-underline",
                pathname.includes("query-dashboard")
                  ? "border border-accent/10 bg-white/82 text-accent"
                  : "text-accent/74"
              )}
            >
              <span className="flex items-center gap-2">
                <FolderOpen className="size-4" />
                My Projects
              </span>
            </AccordionTrigger>
            <AccordionContent className="pb-0">
              {projectNames.length > 0 ? (
                <div className="flex flex-col items-center gap-1">
                  {projectNames.map((name) => (
                    <Link
                      key={name}
                      onClick={closeMenu}
                      href={`/query-dashboard?project=${encodeURIComponent(name)}`}
                      className={cn(
                        "flex w-full items-center justify-center gap-2 truncate rounded-[22px] py-2.5 text-base font-medium",
                        activeProject === name
                          ? "border border-accent/10 bg-white/82 text-accent"
                          : "text-accent/74"
                      )}
                    >
                      {name}
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="py-2.5 text-center text-base text-accent/60">
                  No projects yet
                </p>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      ),
    },
    {
      label: "Dispatch",
      href: "/dispatch",
      icon: Newspaper,
      prefetch: true,
      isActive: (currentPathname) => currentPathname.includes("dispatch"),
    },
    {
      label: "Blog",
      href: "/blog",
      icon: NotebookPen,
      prefetch: true,
      isActive: (currentPathname) => currentPathname.includes("blog"),
    },
  ];

  return (
    <WorkspaceHamburgerNav
      entries={entries}
      beforeEntries={
        !isSubscribed
          ? (closeMenu) => (
              <Link
                onClick={closeMenu}
                href="/subscribe"
                prefetch={true}
                className="w-full py-2 text-center text-base"
              >
                <div className="rounded-full border border-accent bg-accent px-4 py-3 text-center text-base font-medium text-white shadow-[0_18px_36px_rgba(28,74,78,0.18)]">
                  Subscribe
                </div>
              </Link>
            )
          : null
      }
      footer={(closeMenu) => (
        <>
          <WorkspaceNavLink
            item={{
              label: "Account",
              href: "/account",
              prefetch: true,
              isActive: (currentPathname) => currentPathname.includes("account"),
            }}
            pathname={pathname}
            variant="mobile"
            onNavigate={closeMenu}
          />
          <WorkspaceSignOutButton variant="mobile" onClick={closeMenu} />
        </>
      )}
    />
  );
};

export default AppHamburger;
