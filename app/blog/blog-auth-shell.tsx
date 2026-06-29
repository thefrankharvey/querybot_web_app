"use client";

import type { ReactNode } from "react";
import { useUser } from "@clerk/nextjs";

import { AgentMatchesProvider } from "@/app/(app)/context/agent-matches-context";
import { ProfileProvider } from "@/app/(app)/context/profile-context";
import { BrandLockup } from "@/app/components/brand-lockup";
import ClientNav from "@/app/components/client-nav";
import Footer from "@/app/components/footer";
import Hamburger from "@/app/components/hamburger";
import { SideBarNav } from "@/app/components/side-bar-nav";

interface BlogAuthShellProps {
  children: ReactNode;
}

export function BlogAuthShell({ children }: BlogAuthShellProps) {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <ClientNav />
        <div className="min-h-screen w-full">{children}</div>
        <Footer />
      </div>
    );
  }

  return (
    <ProfileProvider>
      <AgentMatchesProvider>
        <div className="app-layout-shell ambient-page min-h-screen pt-2">
          <div className="ambient-orb-top" />
          <div className="app-layout-mobile-header ambient-page-shell z-50 flex items-center justify-between px-4 py-4 md:hidden">
            <BrandLockup
              className="min-w-0 flex-1"
              imageClassName="h-12 w-12"
              labelClassName="inline truncate text-[12px] text-accent/72"
            />
            <Hamburger isApp={true} />
          </div>

          <div className="app-layout-main-shell ambient-page-shell flex max-w-screen-2xl sm:px-0">
            <SideBarNav />
            <div className="app-layout-main min-w-0 flex-1 overflow-x-auto">
              {children}
            </div>
          </div>
        </div>
        <Footer />
      </AgentMatchesProvider>
    </ProfileProvider>
  );
}
