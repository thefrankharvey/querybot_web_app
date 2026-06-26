import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { BrandLockup } from "@/app/components/brand-lockup";
import { getAccountMetadata } from "@/lib/clerk-metadata";
import { AgentAppHamburger, AgentSideBarNav } from "./components/agent-nav";

export default async function AgentAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/literary-agents/sign-in");
  }

  const user = await currentUser();
  const { accountType } = getAccountMetadata(user);

  if (accountType !== "agent") {
    redirect("/home");
  }

  return (
    <div className="app-layout-shell ambient-page min-h-screen pt-2">
      <div className="ambient-orb-top" />
      <div className="app-layout-mobile-header ambient-page-shell z-50 flex items-center justify-between px-4 py-4 md:hidden">
        <BrandLockup
          href="/literary-agents/home"
          className="min-w-0 flex-1"
          imageClassName="h-12 w-12"
          labelClassName="inline truncate text-[12px] text-accent/72"
        />
        <AgentAppHamburger />
      </div>

      <div className="app-layout-main-shell ambient-page-shell flex max-w-screen-2xl sm:px-0">
        <AgentSideBarNav />
        <main className="app-layout-main min-w-0 flex-1 overflow-x-auto px-4 pb-16 md:px-6">
          {children}
        </main>
      </div>
    </div>
  );
}
