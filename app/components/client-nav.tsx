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
import { useClerkUser } from "@/app/hooks/use-clerk-user";

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
        <div className="hidden md:flex items-center justify-end gap-4 w-full">
          <div className="flex items-center gap-4">
            <SignedIn>
              <div className="font-medium cursor-pointer text-sm text-black transition-all duration-300">
                <SignOutButton />
              </div>
              {!isSubscribed && (
                <Link href="/subscribe">
                  <div className="cursor-pointer text-sm p-2 px-4 rounded-md bg-accent text-white hover:bg-white hover:text-accent transition-all duration-300 shadow-lg hover:shadow-xl font-medium">
                    Subscribe
                  </div>
                </Link>
              )}
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
