import Hamburger from "../components/hamburger";
import { SideBarNav } from "../components/side-bar-nav";
import { ProfileProvider } from "./context/profile-context";
import Footer from "../components/footer";
import { AgentMatchesProvider } from "./context/agent-matches-context";
import { BrandLockup } from "../components/brand-lockup";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProfileProvider>
      <AgentMatchesProvider>
        <div className="app-layout-shell ambient-page min-h-screen pt-2">
          <div className="ambient-orb-top" />
          <div className="app-layout-mobile-header ambient-page-shell flex items-center justify-between py-4 px-4 md:hidden z-50">
            <BrandLockup
              className="min-w-0 flex-1"
              imageClassName="h-12 w-12"
              labelClassName="inline truncate text-[12px] text-accent/72"
            />
            <Hamburger isApp={true} />
          </div>

          <div className="app-layout-main-shell ambient-page-shell flex max-w-screen-2xl sm:px-0">
            <SideBarNav />
            <main className="app-layout-main min-w-0 flex-1 overflow-x-auto">
              {children}
            </main>
          </div>
        </div>
        <Footer />
      </AgentMatchesProvider>
    </ProfileProvider>
  );
}
