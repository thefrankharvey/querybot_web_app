"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/app/utils";
import { useProfileContext } from "../context/profile-context";
import { ScanSearch, Newspaper, NotebookPen, Home, FolderOpen } from "lucide-react";
import { useClerkUser } from "@/app/hooks/use-clerk-user";
import { SignOutButton } from "@clerk/nextjs";
import { BrandLockup } from "@/app/components/brand-lockup";
import { Separator } from "@/app/ui-primitives/separator";
import { getProjectNamesFromAgentMatches } from "@/app/utils/project-dashboard-summary";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/ui-primitives/accordion";

export const SideBarNav = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { agentsList } = useProfileContext();
  const { isSubscribed, isLoading: isSubscribedLoading } = useClerkUser();

  const projectNames = useMemo(() => {
    return getProjectNamesFromAgentMatches(agentsList);
  }, [agentsList]);

  const activeProject = pathname.includes("query-dashboard")
    ? searchParams.get("project")
    : null;

  return (
    <div className={cn("hidden h-fit shrink-0 self-start pt-4 md:sticky md:top-0 md:ml-2 md:block", pathname.includes("query-dashboard") ? "mb:[0px]" : "md:w-[230px] mb-88")}>
      <BrandLockup
        stacked={true}
        className="rounded-[28px] border border-white/75 bg-white/55 px-5 py-5 shadow-[0_20px_50px_rgba(24,44,69,0.08)] backdrop-blur-sm"
        labelClassName="inline text-[12px] leading-5 text-accent/72"
      />
      <div className="flex w-full flex-col pt-6">
        <aside className="h-full w-full md:sticky md:top-24 md:max-w-[230px]">
          <nav className="glass-panel w-full rounded-[30px] p-3">
            {!isSubscribed && !isSubscribedLoading && (
              <Link href="/subscribe">
                <div className="mb-3 rounded-full border border-accent bg-accent px-4 py-3 text-center text-sm font-medium text-white shadow-[0_18px_36px_rgba(28,74,78,0.18)] transition hover:-translate-y-0.5 hover:bg-[#163b3e]">
                  Subscribe
                </div>
              </Link>
            )}
            <Link
              href="/home"
              className={cn(
                "flex items-center gap-3 rounded-[20px] px-4 py-3 text-sm font-medium transition-all duration-200 hover:bg-white/70 hover:text-accent my-1",
                pathname.includes("home")
                  ? "border border-accent/10 bg-white/82 text-accent shadow-[0_12px_28px_rgba(24,44,69,0.06)]"
                  : "text-accent/74"
              )}
            >
              <Home className="w-4 h-4" />
              Home
            </Link>
            <Link
              href="/smart-match"
              data-tour-target="home-walkthrough-smart-match-nav"
              className={cn(
                "flex items-center gap-3 rounded-[20px] px-4 py-3 text-sm font-medium transition-all duration-200 hover:bg-white/70 hover:text-accent my-1",
                pathname.includes("smart-match") ||
                  pathname.includes("agent-matches")
                  ? "border border-accent/10 bg-white/82 text-accent shadow-[0_12px_28px_rgba(24,44,69,0.06)]"
                  : "text-accent/74"
              )}
            >
              <ScanSearch className="w-4 h-4" />
              Smart Match
            </Link>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="my-projects" className="border-b-0">
                <AccordionTrigger
                  data-tour-target="home-walkthrough-query-dashboard-nav"
                  className={cn(
                    "rounded-[20px] px-4 py-3 text-sm font-medium transition-all duration-200 hover:bg-white/70 hover:text-accent hover:no-underline my-1",
                    pathname.includes("query-dashboard")
                      ? "border border-accent/10 bg-white/82 text-accent shadow-[0_12px_28px_rgba(24,44,69,0.06)]"
                      : "text-accent/74"
                  )}
                >
                  <span className="flex items-center gap-3">
                    <FolderOpen className="w-4 h-4" />
                    My Projects
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-0">
                  {projectNames.length > 0 ? (
                    <div className="flex flex-col pl-4">
                      {projectNames.map((name) => (
                        <Link
                          key={name}
                          href={`/query-dashboard?project=${encodeURIComponent(name)}`}
                          className={cn(
                            "truncate rounded-[20px] px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-white/70 hover:text-accent my-0.5",
                            activeProject === name
                              ? "border border-accent/10 bg-white/82 text-accent shadow-[0_12px_28px_rgba(24,44,69,0.06)]"
                              : "text-accent/74"
                          )}
                        >
                          {name}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="px-4 py-2.5 pl-8 text-sm text-accent/60">
                      No projects yet
                    </p>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <Link
              href="/dispatch"
              data-tour-target="home-walkthrough-dispatch-nav"
              prefetch={true}
              className={cn(
                "flex items-center gap-3 rounded-[20px] px-4 py-3 text-sm font-medium transition-all duration-200 hover:bg-white/70 hover:text-accent my-1",
                pathname.includes("dispatch")
                  ? "border border-accent/10 bg-white/82 text-accent shadow-[0_12px_28px_rgba(24,44,69,0.06)]"
                  : "text-accent/74"
              )}
            >
              <Newspaper className="w-4 h-4" />
              Dispatch
            </Link>
            <Link
              href="/blog"
              className={cn(
                "flex items-center gap-3 rounded-[20px] px-4 py-3 text-sm font-medium transition-all duration-200 hover:bg-white/70 hover:text-accent my-1",
                pathname.includes("blog")
                  ? "border border-accent/10 bg-white/82 text-accent shadow-[0_12px_28px_rgba(24,44,69,0.06)]"
                  : "text-accent/74"
              )}
            >
              <NotebookPen className="w-4 h-4" />
              Blog
            </Link>
            <Separator className="my-2 mb-4" />
            <Link
              href="/account"
              className={cn(
                "rounded-[20px] px-4 py-3 text-sm font-medium transition-all duration-200 hover:bg-white/70 hover:text-accent my-1 flex w-full",
                pathname.includes("account")
                  ? "border border-accent/10 bg-white/82 text-accent shadow-[0_12px_28px_rgba(24,44,69,0.06)]"
                  : "text-accent/74"
              )}
            >
              Account
            </Link>
            <SignOutButton>
              <div className="cursor-pointer rounded-[20px] px-4 py-3 text-sm font-medium text-accent/74 transition-all duration-200 hover:bg-white/70 hover:text-accent my-1">
                Sign out
              </div>
            </SignOutButton>
          </nav>
        </aside>
      </div>
    </div>
  );
};
