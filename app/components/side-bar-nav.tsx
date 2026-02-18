"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/app/utils";
import { useProfileContext } from "@/app/(app)/context/profile-context";
import { ScanSearch, Newspaper, NotebookPen, Home, LayoutDashboard } from "lucide-react";
import { useClerkUser } from "@/app/hooks/use-clerk-user";
import { SignOutButton } from "@clerk/nextjs";

export const SideBarNav = () => {
  const pathname = usePathname();
  const { agentsList } = useProfileContext();
  const { isSubscribed, isLoading: isSubscribedLoading } = useClerkUser();

  return (
    <div className="w-[195px] shrink-0 pt-4 ml-8 sticky top-0 self-start h-fit hidden md:block">
      <Link href="/" className="text-xl font-semibold text-black">
        <Image
          src="/wqh-logo.png"
          alt="logo"
          width={60}
          height={60}
          className="w-[60px] h-[60px] rounded-full ml-8"
        />
      </Link>
      <div className="w-full flex flex-col md:flex-row pt-8">
        <aside className="w-full md:sticky md:top-24 h-full md:max-w-[195px]">
          <nav className="w-full flex flex-col gap-2 p-4 md:p-0 rounded-none shadow-none mt-0 md:mt-16">
            {!isSubscribed && !isSubscribedLoading && (
              <Link href="/subscribe">
                <div className="cursor-pointer text-sm p-2 px-4 mb-4 text-center rounded-md bg-accent text-white hover:bg-white hover:text-accent transition-all duration-300 shadow-lg hover:shadow-xl font-medium">
                  Subscribe
                </div>
              </Link>
            )}
            <Link
              href="/home"
              className={cn(
                "text-sm font-medium px-3 py-2 rounded-md flex items-center gap-2 hover:text-accent hover:bg-accent/10 transition-all duration-300",
                pathname.includes("home")
                  ? "text-accent bg-accent/10"
                  : "text-black"
              )}
            >
              <Home className="w-4 h-4" />
              Home
            </Link>
            <Link
              href="/smart-match"
              className={cn(
                "text-sm font-medium px-3 py-2 rounded-md flex items-center gap-2 hover:text-accent hover:bg-accent/10 transition-all duration-300",
                pathname.includes("smart-match") ||
                  pathname.includes("agent-matches")
                  ? "text-accent bg-accent/10"
                  : "text-black"
              )}
            >
              <ScanSearch className="w-4 h-4" />
              Smart Match
            </Link>
            <Link
              href="/query-dashboard"
              className={cn(
                "text-sm font-medium px-3 py-2 rounded-md flex items-center gap-2 hover:text-accent hover:bg-accent/10 transition-all duration-300",
                pathname.includes("query-dashboard")
                  ? "text-accent bg-accent/10"
                  : "text-black"
              )}
            >
              {agentsList && agentsList.length > 0 ? (
                <span className="flex justify-center items-center text-accent bg-accent/10 rounded-[50px] h-[18px] w-[18px] text-xs p-3 ml-[-3px]">
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
                "text-sm font-medium px-3 py-2 rounded-md flex items-center gap-2 hover:text-accent hover:bg-accent/10 transition-all duration-300",
                pathname.includes("dispatch")
                  ? "text-accent bg-accent/10"
                  : "text-black"
              )}
            >
              <Newspaper className="w-4 h-4" />
              Dispatch
            </Link>
            <Link
              href="/blog"
              className={cn(
                "text-sm font-medium px-3 py-2 rounded-md flex items-center gap-2 hover:text-accent hover:bg-accent/10 transition-all duration-300",
                pathname.includes("blog")
                  ? "text-accent bg-accent/10"
                  : "text-black"
              )}
            >
              <NotebookPen className="w-4 h-4" />
              Blog
            </Link>
            <hr className="my-2 border-t-1 border-accent/10" />
            <Link
              href="/account"
              className={cn(
                "text-sm font-medium px-3 py-2 rounded-md hover:text-accent hover:bg-accent/10 transition-all duration-300",
                pathname.includes("account")
                  ? "text-accent bg-accent/10"
                  : "text-black"
              )}
            >
              Account
            </Link>
            <SignOutButton>
              <div className="font-medium px-3 py-2 cursor-pointer text-sm text-black transition-all duration-300 hover:text-accent hover:bg-accent/10 rounded-md">
                Sign out
              </div>
            </SignOutButton>
          </nav>
        </aside>
      </div>
    </div>
  );
};
