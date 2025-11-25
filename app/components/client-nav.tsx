"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/app/utils";
import { Hamburger } from "./hamburger";
import {
  SignUpButton,
  SignedOut,
  SignedIn,
  SignInButton,
  SignOutButton,
  useUser,
} from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { Newspaper, NotebookPen, ScanSearch } from "lucide-react";
import { useClerkUser } from "../hooks/use-clerk-user";

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
  const { isSubscribed } = useClerkUser();
  const { isSignedIn } = useUser();

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
    <nav className={cn("w-full flex items-center p-4")}>
      <ScrollToTop />
      <div className="flex items-center justify-between max-w-screen-xl mx-auto px-0 md:px-4 w-full">
        <Link href="/" className="text-xl font-semibold text-black">
          <Image
            src="/wqh-logo.png"
            alt="logo"
            width={60}
            height={60}
            className="w-[60px] h-[60px] rounded-full"
          />
        </Link>
        <div className="hidden md:flex items-center justify-between gap-4 w-full">
          <div className="flex items-center gap-4 ml-8">
            {isSignedIn && (
              <>
                <Link
                  href="/smart-match"
                  className="text-sm hover:text-accent transition-all duration-300 flex gap-1 items-center font-medium"
                >
                  <ScanSearch className="w-4 h-4" />
                  Smart Match
                </Link>
                <Link
                  href="/slush-feed"
                  className="text-sm hover:text-accent transition-all duration-300 flex gap-1 items-center font-medium"
                >
                  <Newspaper className="w-4 h-4" />
                  Dispatch
                </Link>
                <Link
                  href="/blog"
                  className="text-sm hover:text-accent transition-all duration-300 flex gap-1 items-center font-medium"
                >
                  <NotebookPen className="w-4 h-4" />
                  Blog
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-4">
            <SignedIn>
              <Link
                href="/profile"
                className="text-sm hover:text-accent transition-all duration-300 font-medium"
              >
                Profile
              </Link>
              {!isSubscribed && (
                <Link href="/subscription">
                  <div className="cursor-pointer text-sm p-2 px-4 rounded-md bg-accent text-white hover:bg-white hover:text-accent transition-all duration-300 shadow-lg hover:shadow-xl font-medium">
                    Subscribe
                  </div>
                </Link>
              )}
              <div className="font-medium cursor-pointer text-sm p-2 px-4 rounded-md bg-white text-black hover:bg-white hover:text-accent transition-all duration-300 shadow-lg hover:shadow-xl">
                <SignOutButton />
              </div>
            </SignedIn>
            <SignedOut>
              <div className="font-medium cursor-pointer text-sm text-black transition-all duration-300">
                <SignInButton />
              </div>
              <div className="font-medium cursor-pointer text-sm p-2 px-4 rounded-md bg-accent text-white hover:bg-white hover:text-black transition-all duration-300 shadow-lg hover:shadow-xl">
                <SignUpButton />
              </div>
            </SignedOut>
          </div>
        </div>
        <Hamburger />
      </div>
    </nav>
  );
};

export default ClientNav;
