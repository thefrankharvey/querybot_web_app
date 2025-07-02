"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/app/utils";
import { Hamburger } from "./hamburger";
// import {
//   SignUpButton,
//   SignedOut,
//   SignedIn,
//   SignInButton,
//   useClerk,
//   SignOutButton,
// } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { Newspaper, ScanSearch } from "lucide-react";

function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// Client component that handles scroll behavior
const ClientNav = () => {
  const [scrolled, setScrolled] = useState(false);
  // const { openUserProfile } = useClerk();

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

  return (
    <nav
      className={cn(
        "sticky top-0 z-5 w-full flex items-center p-4 transition-colors duration-300",
        scrolled ? "bg-[#F9E0E2]" : "bg-transparent"
      )}
    >
      <ScrollToTop />
      <div className="flex items-center justify-between max-w-screen-xl mx-auto px-0 md:px-4 w-full">
        <Link href="/" className="text-xl font-semibold text-dark-blue">
          <Image
            src="/query_logo.png"
            alt="logo"
            width={60}
            height={60}
            className="w-[60px] h-[60px]"
          />
        </Link>
        <div className="hidden md:flex items-center gap-4">
          {/* <SignedOut>
            <div className="cursor-pointer text-base p-2 px-4 rounded-md font-semibold bg-accent text-[var(--text-dark-blue)] hover:bg-text-dark-blue hover:text-primary-foreground transition-all duration-300">
              <SignUpButton />
            </div>
            <div className="cursor-pointer text-base font-semibold hover:text-accent transition-all duration-300">
              <SignInButton />
            </div>
          </SignedOut> */}
          <Link
            href="/query-form"
            className="text-base font-normal hover:text-accent transition-all duration-300 flex gap-1 items-center"
          >
            <ScanSearch className="w-6 h-6" />
            Smart Query
          </Link>
          <Link
            href="/slush-feed"
            className="text-base font-normal hover:text-accent transition-all duration-300 flex gap-1 items-center"
          >
            <Newspaper className="w-5 h-5" />
            Slushwire Dispatch
          </Link>
          {/* <a
            href="https://writequeryhook.com/slushwire/"
            target="_blank"
            className="text-base font-normal hover:text-accent transition-all duration-300 flex gap-1 items-center"
          >
            Subscribe for Free!
          </a> */}
          {/* <SignedIn>
            <div className="cursor-pointer text-base font-semibold hover:text-accent transition-all duration-300">
              <SignOutButton />
            </div>
            <a
              onClick={() => openUserProfile()}
              className="text-base font-semibold hover:text-accent transition-all duration-300"
            >
              Account
            </a>
          </SignedIn> */}
        </div>
        <Hamburger />
      </div>
    </nav>
  );
};

export default ClientNav;
