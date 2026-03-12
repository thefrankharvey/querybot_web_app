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
        <div className="app-layout-shell">
          <div className="app-layout-mobile-header flex items-center justify-between max-w-screen-xl mx-auto p-4 w-full md:hidden z-50">
            <BrandLockup
              className="min-w-0 flex-1"
              imageClassName="h-12 w-12"
              labelClassName="inline truncate text-[12px] text-accent"
            />
            <Hamburger isApp={true} />
          </div>

          {/* Main content wrapper - sidebar + content */}
          <div className="app-layout-main-shell flex max-w-screen-2xl mx-auto w-full">
            <SideBarNav />
            <main className="app-layout-main md:px-0 px-0 flex-1 overflow-x-auto">
              {children}
            </main>
          </div>
        </div>

        {/* Footer - full width, outside constrained container */}
        <Footer />
      </AgentMatchesProvider>
    </ProfileProvider>
  );
}
