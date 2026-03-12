"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/app/utils";
import { Hamburger } from "./hamburger";
import { BrandLockup } from "./brand-lockup";
import {
  SignedOut,
  SignedIn,
  SignOutButton,
} from "@clerk/nextjs";
import { usePathname } from "next/navigation";

function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

const accentNavCtaClassName =
  "inline-flex min-h-[42px] items-center justify-center rounded-full border border-accent bg-accent px-5 py-3 text-sm text-white shadow-[0_18px_36px_rgba(28,74,78,0.18)] transition duration-200 hover:bg-[#163b3e] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(28,74,78,0.18)]";

const whiteNavCtaClassName =
  "inline-flex min-h-[42px] items-center justify-center rounded-full border border-accent/12 bg-white px-5 py-3 text-sm text-accent shadow-[0_18px_36px_rgba(24,44,69,0.08)] transition duration-200 hover:border-accent/20 hover:bg-[rgba(247,246,242,0.98)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(28,74,78,0.18)]";

// Client component that handles scroll behavior
const ClientNav = () => {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 0;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

  if (pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up")) {
    return null;
  }

  return (
    <nav className={cn("w-full flex items-center p-4")}>
      <ScrollToTop />
      <div className="flex items-center justify-between max-w-screen-xl mx-auto px-0 md:px-4 w-full">
        <BrandLockup
          className="shrink-0"
          labelClassName="hidden md:inline text-[13px] text-accent"
        />
        <div className="hidden md:flex items-center justify-end gap-4 w-full">
          <div className="flex items-center gap-4">
            <SignedIn>
              <Link
                href={"/home"}
                prefetch={true}
                className={accentNavCtaClassName}
              >
                Go to App
              </Link>
              <div className="font-medium cursor-pointer text-sm text-black transition-all duration-300">
                <SignOutButton />
              </div>
            </SignedIn>
            <SignedOut>
              <Link href="/sign-in" className={whiteNavCtaClassName}>
                Sign in
              </Link>
              <Link href="/sign-up" className={accentNavCtaClassName}>
                Create account
              </Link>
            </SignedOut>
          </div>
        </div>
        <Hamburger />
      </div>
    </nav>
  );
};

export default ClientNav;
