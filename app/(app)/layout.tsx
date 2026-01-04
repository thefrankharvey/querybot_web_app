import Link from "next/link";
import Hamburger from "../components/hamburger";
import { SideBarNav } from "../components/side-bar-nav";
import { ProfileProvider } from "./context/profile-context";
import Image from "next/image";
import Footer from "../components/footer";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProfileProvider>
      <div className="flex items-center justify-between max-w-screen-xl mx-auto p-4 w-full top-0 md:hidden z-50">
        <Link
          href="/"
          className="text-xl font-semibold text-black w-[60px] h-[60px]"
        >
          <Image
            src="/wqh-logo.png"
            alt="logo"
            width={60}
            height={60}
            className="w-[60px] h-[60px] rounded-full"
          />
        </Link>
        <Hamburger isApp={true} />
      </div>

      {/* Main content wrapper - sidebar + content */}
      <div className="flex max-w-screen-2xl mx-auto">
        <SideBarNav />
        <main className="md:px-0 px-4 min-h-screen flex-1 pt-14">
          {children}
        </main>
      </div>

      {/* Footer - full width, outside constrained container */}
      <Footer />
    </ProfileProvider>
  );
}
