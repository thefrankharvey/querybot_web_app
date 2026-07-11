"use client";

import { useMemo } from "react";
import {
  FolderOpen,
  Home,
  MessageSquare,
  Newspaper,
  NotebookPen,
  ScanSearch,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import {
  WorkspaceNavLink,
  WorkspaceSideBarNav,
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
import {
  getProjectNavigationItemsFromAgentMatches,
} from "@/app/utils/project-dashboard-summary";
import { getProjectRouteId } from "@/app/utils/project-profile";

import { useProfileContext } from "../context/profile-context";

export const SideBarNav = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { agentsList } = useProfileContext();
  const { isSubscribed, isLoading: isSubscribedLoading } = useClerkUser();

  const projectItems = useMemo(() => {
    return getProjectNavigationItemsFromAgentMatches(agentsList);
  }, [agentsList]);

  const activeProject = pathname.includes("query-dashboard")
    ? searchParams.get("project")
    : pathname.includes("/projects/")
      ? decodeURIComponent(pathname.split("/projects/")[1]?.split("/")[0] ?? "")
      : null;
  const activeMessagesProject = pathname.includes("/messages/")
    ? decodeURIComponent(pathname.split("/messages/")[1]?.split("/")[0] ?? "")
    : null;

  const entries: WorkspaceNavEntry[] = [
    {
      label: "Home",
      href: "/home",
      icon: Home,
      isActive: (currentPathname) => currentPathname.includes("home"),
    },
    {
      label: "Smart Match",
      href: "/smart-match",
      icon: ScanSearch,
      dataTourTarget: "home-walkthrough-smart-match-nav",
      isActive: (currentPathname) =>
        currentPathname.includes("smart-match") ||
        currentPathname.includes("agent-matches"),
    },
    {
      type: "custom",
      key: "my-projects",
      content: (
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="my-projects" className="border-b-0">
            <AccordionTrigger
              data-tour-target="home-walkthrough-query-dashboard-nav"
              className={cn(
                "my-1 rounded-[20px] px-4 py-3 text-sm font-medium transition-all duration-200 hover:bg-white/70 hover:text-accent hover:no-underline",
                pathname.includes("query-dashboard") || pathname.includes("/projects")
                  ? "border border-accent/10 bg-white/82 text-accent shadow-[0_12px_28px_rgba(24,44,69,0.06)]"
                  : "text-accent/74"
              )}
            >
              <span className="flex items-center gap-3">
                <FolderOpen className="size-4" />
                My Projects
              </span>
            </AccordionTrigger>
            <AccordionContent className="pb-0">
              {projectItems.length > 0 ? (
                <div className="flex flex-col pl-4">
                  {projectItems.map((project) => (
                    <Link
                      key={project.writerProjectId ?? project.projectName}
                      href={project.href}
                      className={cn(
                        "my-0.5 truncate rounded-[20px] px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-white/70 hover:text-accent",
                        activeProject === project.projectName ||
                          activeProject === project.writerProjectId ||
                          activeProject === getProjectRouteId(project.projectName)
                          ? "border border-accent/10 bg-white/82 text-accent shadow-[0_12px_28px_rgba(24,44,69,0.06)]"
                          : "text-accent/74"
                      )}
                    >
                      {project.projectName}
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
      ),
    },
    {
      type: "custom",
      key: "messages",
      content: (
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="messages" className="border-b-0">
            <AccordionTrigger
              className={cn(
                "my-1 rounded-[20px] px-4 py-3 text-sm font-medium transition-all duration-200 hover:bg-white/70 hover:text-accent hover:no-underline",
                pathname.includes("/messages")
                  ? "border border-accent/10 bg-white/82 text-accent shadow-[0_12px_28px_rgba(24,44,69,0.06)]"
                  : "text-accent/74"
              )}
            >
              <span className="flex items-center gap-3">
                <MessageSquare className="size-4" />
                Messages
              </span>
            </AccordionTrigger>
            <AccordionContent className="pb-0">
              {projectItems.length > 0 ? (
                <div className="flex flex-col pl-4">
                  {projectItems.map((project) => {
                    const messagesProjectId =
                      project.writerProjectId ?? getProjectRouteId(project.projectName);

                    return (
                      <Link
                        key={project.writerProjectId ?? project.projectName}
                        href={`/messages/${encodeURIComponent(messagesProjectId)}`}
                        className={cn(
                          "my-0.5 truncate rounded-[20px] px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-white/70 hover:text-accent",
                          activeMessagesProject === project.projectName ||
                            activeMessagesProject === project.writerProjectId ||
                            activeMessagesProject === getProjectRouteId(project.projectName)
                            ? "border border-accent/10 bg-white/82 text-accent shadow-[0_12px_28px_rgba(24,44,69,0.06)]"
                            : "text-accent/74"
                        )}
                      >
                        {project.projectName}
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <p className="px-4 py-2.5 pl-8 text-sm text-accent/60">
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
      dataTourTarget: "home-walkthrough-dispatch-nav",
      isActive: (currentPathname) => currentPathname.includes("dispatch"),
    },
    {
      label: "Blog",
      href: "/blog",
      icon: NotebookPen,
      isActive: (currentPathname) => currentPathname.includes("blog"),
    },
  ];

  return (
    <WorkspaceSideBarNav
      brandHref="/home"
      entries={entries}
      containerClassName={cn(
        pathname.includes("query-dashboard") ||
          pathname.includes("/projects") ||
          pathname.includes("/messages")
          ? "mb-0"
          : "mb-88 md:w-[230px]"
      )}
      beforeEntries={
        !isSubscribed && !isSubscribedLoading ? (
          <Link href="/subscribe">
            <div className="mb-3 rounded-full border border-accent bg-accent px-4 py-3 text-center text-sm font-medium text-white shadow-[0_18px_36px_rgba(28,74,78,0.18)] transition hover:-translate-y-0.5 hover:bg-[#163b3e]">
              Subscribe
            </div>
          </Link>
        ) : null
      }
      footer={
        <>
          <WorkspaceNavLink
            item={{
              label: "Account",
              href: "/account",
              isActive: (currentPathname) => currentPathname.includes("account"),
            }}
            pathname={pathname}
            variant="desktop"
          />
          <WorkspaceSignOutButton variant="desktop" />
        </>
      }
    />
  );
};
