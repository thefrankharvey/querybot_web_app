import Link from "next/link";
import Hamburger from "../components/hamburger";
import { SideBarNav } from "../components/side-bar-nav";
import { ProfileProvider } from "./context/profile-context";
import Image from "next/image";
import Footer from "../components/footer";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProfileProvider>
      {/* Mobile header */}
      <div className="items-center justify-between max-w-screen-xl mx-auto p-4 w-full fixed top-0 md:hidden sm:flex z-50 bg-white">
        <Link href="/" className="text-xl font-semibold text-black">
          <Image
            src="/wqh-logo.png"
            alt="logo"
            width={60}
            height={60}
            className="w-[60px] h-[60px] rounded-full"
          />
        </Link>
        <Hamburger />
      </div>

      {/* Main content wrapper - sidebar + content */}
      <div className="flex max-w-screen-2xl mx-auto">
        <SideBarNav />
        <main className="md:px-0 px-4 min-h-screen flex-1 pt-26">
          {children}
        </main>
      </div>

      {/* Footer - full width, outside constrained container */}
      <Footer />
    </ProfileProvider>
  );
}
