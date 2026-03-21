"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/app/utils";
import { useProfileContext } from "@/app/(app)/context/profile-context";
import { ScanSearch, Newspaper, NotebookPen, Home, LayoutDashboard } from "lucide-react";
import { useClerkUser } from "@/app/hooks/use-clerk-user";
import { SignOutButton } from "@clerk/nextjs";
import { BrandLockup } from "./brand-lockup";
import { Separator } from "@/app/ui-primitives/separator";

export const SideBarNav = () => {
  const pathname = usePathname();
  const { agentsList } = useProfileContext();
  const { isSubscribed, isLoading: isSubscribedLoading } = useClerkUser();

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
            <Link
              href="/query-dashboard"
              style={{
                paddingLeft: agentsList && agentsList.length > 0 ? "9px" : "",
                paddingTop: agentsList && agentsList.length > 0 ? "7px" : "",
                paddingBottom: agentsList && agentsList.length > 0 ? "7px" : "",
              }}
              className={cn(
                "flex items-center gap-3 rounded-[20px] px-4 py-3 text-sm font-medium transition-all duration-200 hover:bg-white/70 hover:text-accent my-1",
                pathname.includes("query-dashboard")
                  ? "border border-accent/10 bg-white/82 text-accent shadow-[0_12px_28px_rgba(24,44,69,0.06)]"
                  : "text-accent/74"
              )}
            >
              {agentsList && agentsList.length > 0 ? (
                <span className="flex h-8 min-w-8 items-center justify-center rounded-full border border-accent/10 bg-white/88 px-2 text-xs text-accent shadow-[0_8px_18px_rgba(24,44,69,0.06)]">
                  {agentsList.length}
                </span>
              ) : (
                <LayoutDashboard className="w-4 h-4" />
              )}
              Query Dashboard
            </Link>
            <Link
              href="/dispatch"
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
