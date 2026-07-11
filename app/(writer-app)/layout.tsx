import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { HydrationBoundary } from "@tanstack/react-query";

import AppHamburger from "./components/app-hamburger";
import { SideBarNav } from "./components/side-bar-nav";
import { ProfileProvider } from "./context/profile-context";
import Footer from "../components/footer";
import { AgentMatchesProvider } from "./context/agent-matches-context";
import { BrandLockup } from "../components/brand-lockup";
import ClientNav from "../components/client-nav";
import { getAccountMetadata } from "@/lib/clerk-metadata";
import { getTraitsDehydratedState } from "@/lib/traits-server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();

  if (!userId) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <ClientNav />
        <div className="min-h-screen w-full">{children}</div>
        <Footer />
      </div>
    );
  }

  const user = await currentUser();
  const { accountType } = getAccountMetadata(user);

  if (accountType === "agent") {
    redirect("/literary-agents/home");
  }

  const traitsState = await getTraitsDehydratedState();

  return (
    <ProfileProvider>
      <AgentMatchesProvider>
        <HydrationBoundary state={traitsState}>
          <div className="app-layout-shell ambient-page min-h-screen pt-2">
            <div className="ambient-orb-top" />
            <div className="app-layout-mobile-header ambient-page-shell flex items-center justify-between py-4 px-4 md:hidden z-50">
              <BrandLockup
                className="min-w-0 flex-1"
                imageClassName="h-12 w-12"
                labelClassName="inline truncate text-[12px] text-accent/72"
              />
              <AppHamburger />
            </div>

            <div className="app-layout-main-shell ambient-page-shell flex max-w-screen-2xl sm:px-0">
              <SideBarNav />
              <main className="app-layout-main min-w-0 flex-1 overflow-x-auto">
                {children}
              </main>
            </div>
          </div>
          <Footer />
        </HydrationBoundary>
      </AgentMatchesProvider>
    </ProfileProvider>
  );
}
