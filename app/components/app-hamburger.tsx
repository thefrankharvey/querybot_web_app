"use client";

import { useMemo, useState } from "react";
import { cn } from "../utils";
import Link from "next/link";
import { SignOutButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { useClerkUser } from "../hooks/use-clerk-user";
import { usePathname, useSearchParams } from "next/navigation";
import { Home, Newspaper, NotebookPen, ScanSearch, FolderOpen } from "lucide-react";
import { useProfileContext } from "../(app)/context/profile-context";
import { Separator } from "@/app/ui-primitives/separator";
import { getProjectNamesFromAgentMatches } from "@/app/utils/project-dashboard-summary";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/ui-primitives/accordion";

export const AppHamburger = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { agentsList } = useProfileContext();
  const [open, setOpen] = useState(false);
  const { isSubscribed } = useClerkUser();

  const projectNames = useMemo(() => {
    return getProjectNamesFromAgentMatches(agentsList);
  }, [agentsList]);

  const activeProject = pathname.includes("query-dashboard")
    ? searchParams.get("project")
    : null;

  return (
    <>
      {open && (
        <style jsx global>{`
          body {
            overflow: hidden;
          }
        `}</style>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Toggle menu"
        aria-expanded={open}
        className="flex size-11 flex-col items-center justify-center rounded-full p-0 md:hidden"
      >
        <span
          className={`block w-10 h-0.5 bg-current transition-transform duration-200 ${open ? "translate-y-[10px] rotate-45" : ""
            }`}
        />
        <span
          className={`block w-10 h-0.5 bg-current my-2 transition-all duration-200 ${open ? "opacity-0 scale-x-0" : "opacity-100 scale-x-100"
            }`}
        />
        <span
          className={`block w-10 h-0.5 bg-current transition-transform duration-200 ${open ? "-translate-y-[10px] -rotate-45" : ""
            }`}
        />
      </button>
      <div
        className={cn(
          "absolute inset-0 z-99 mt-[80px] h-dvh-safe w-screen overflow-hidden overscroll-none bg-background/90 p-6 pt-0 md:pt-4 transition-opacity duration-300 backdrop-blur-xl",
          open
            ? "opacity-100 visible"
            : "opacity-0 invisible pointer-events-none"
        )}
      >
        <div className="glass-panel-strong mx-auto flex h-full w-full max-w-xl flex-col gap-2 overflow-y-auto p-4">
          <SignedIn>
            {!isSubscribed && (
              <Link
                onClick={() => setOpen(false)}
                href="/subscribe"
                prefetch={true}
                className="text-base w-full text-center py-2"
              >
                <div className="rounded-full border border-accent bg-accent px-4 py-3 text-center text-base font-medium text-white shadow-[0_18px_36px_rgba(28,74,78,0.18)]">
                  Subscribe
                </div>
              </Link>
            )}
            <Link
              onClick={() => setOpen(false)}
              href="/home"
              prefetch={true}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-[22px] py-3 text-base font-medium",
                pathname.includes("home")
                  ? "border border-accent/10 bg-white/82 text-accent"
                  : "text-accent/74"
              )}
            >
              <Home className="w-4 h-4" />
              Home
            </Link>
            <Link
              onClick={() => setOpen(false)}
              href="/smart-match"
              prefetch={true}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-[22px] py-3 text-base font-medium",
                pathname.includes("smart-match")
                  ? "border border-accent/10 bg-white/82 text-accent"
                  : "text-accent/74"
              )}
            >
              <ScanSearch className="w-4 h-4" />
              Smart Match
            </Link>
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
                    <FolderOpen className="w-4 h-4" />
                    My Projects
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-0">
                  {projectNames.length > 0 ? (
                    <div className="flex flex-col items-center gap-1">
                      {projectNames.map((name) => (
                        <Link
                          key={name}
                          onClick={() => setOpen(false)}
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
            <Link
              onClick={() => setOpen(false)}
              href="/dispatch"
              prefetch={true}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-[22px] py-3 text-base font-medium",
                pathname.includes("dispatch")
                  ? "border border-accent/10 bg-white/82 text-accent"
                  : "text-accent/74"
              )}
            >
              <Newspaper className="w-4 h-4" />
              Dispatch
            </Link>
            <Link
              onClick={() => setOpen(false)}
              href="/blog"
              prefetch={true}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-[22px] py-3 text-base font-medium",
                pathname.includes("blog")
                  ? "border border-accent/10 bg-white/82 text-accent"
                  : "text-accent/74"
              )}
            >
              <NotebookPen className="w-4 h-4" />
              Blog
            </Link>
          </SignedIn>
          <div className="flex justify-center flex-col items-center gap-2 w-full md:w-fit mt-4">
            <Separator className="md:hidden" />
            <SignedIn>
              <Link
                onClick={() => setOpen(false)}
                href="/account"
                prefetch={true}
                className="w-full rounded-[22px] py-3 text-center text-base font-medium text-accent/74 md:hidden"
              >
                Account
              </Link>
              <div
                className="w-full cursor-pointer rounded-full border border-accent/12 bg-white/82 px-4 py-3 text-center text-base font-medium text-accent shadow-[0_16px_34px_rgba(24,44,69,0.07)]"
                onClick={() => setOpen(false)}
              >
                <SignOutButton />
              </div>
            </SignedIn>
          </div>
          <SignedOut>
            <Link
              href="/sign-in"
              onClick={() => setOpen(false)}
              className="w-full"
            >
              <div
                className="w-full cursor-pointer rounded-full border border-accent/12 bg-white/82 px-4 py-3 text-center text-base font-medium text-accent shadow-[0_16px_34px_rgba(24,44,69,0.07)]"
                onClick={() => setOpen(false)}
              >
                Sign In
              </div>
            </Link>
            <Link
              href="/sign-up"
              onClick={() => setOpen(false)}
              className="w-full"
            >
              <div className="mt-4 w-full cursor-pointer rounded-full border border-accent bg-accent px-4 py-3 text-center text-base font-medium text-white shadow-[0_18px_36px_rgba(28,74,78,0.18)]">
                Create an Account
              </div>
            </Link>
          </SignedOut>
        </div>
      </div>
    </>
  );
};

export default AppHamburger;
