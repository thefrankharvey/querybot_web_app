"use client";

import { useState } from "react";
import { cn } from "../utils";
import Link from "next/link";
import { SignOutButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { useClerkUser } from "../hooks/use-clerk-user";
import { usePathname } from "next/navigation";
import { Home, Newspaper, NotebookPen, ScanSearch, LayoutDashboard } from "lucide-react";
import { useProfileContext } from "../(app)/context/profile-context";

export const AppHamburger = () => {
  const pathname = usePathname();
  const { agentsList } = useProfileContext();
  const [open, setOpen] = useState(false);
  const { isSubscribed } = useClerkUser();

  return (
    <>
      {open && (
        <style jsx global>{`
          body {
            overflow: hidden;
          }
        `}</style>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Toggle menu"
        aria-expanded={open}
        className="flex flex-col justify-center items-center w-10 h-10 p-0 md:hidden"
      >
        <span
          className={`block w-10 h-0.5 bg-current transition-transform duration-200 ${open ? "translate-y-[10px] rotate-45" : ""
            }`}
        />
        <span
          className={`block w-10 h-0.5 bg-current my-2 transition-opacity duration-200 ${open ? "opacity-0" : "opacity-100"
            }`}
        />
        <span
          className={`block w-10 h-0.5 bg-current transition-transform duration-200 ${open ? "-translate-y-[10px] -rotate-45" : ""
            }`}
        />
      </button>
      <div
        className={cn(
          "absolute inset-0 w-screen h-dvh-safe transition-opacity duration-300 bg-background z-99 overflow-hidden overscroll-none p-6 pt-16 mt-[80px]",
          open
            ? "opacity-100 visible"
            : "opacity-0 invisible pointer-events-none"
        )}
      >
        <div className="flex flex-col gap-4 items-center w-full h-full overflow-y-auto">
          <SignedIn>
            {!isSubscribed && (
              <Link
                onClick={() => setOpen(false)}
                href="/subscribe"
                className="text-base w-full text-center py-2"
              >
                <div className="cursor-pointer text-base font-medium text-center p-2 px-4 rounded-md bg-accent text-white shadow-lg w-full">
                  Subscribe
                </div>
              </Link>
            )}
            <Link
              onClick={() => setOpen(false)}
              href="/home"
              className={cn(
                "text-base w-full font-medium text-center py-2 flex items-center justify-center gap-2",
                pathname.includes("home")
                  ? "text-accent bg-accent/10 rounded-md"
                  : "text-black"
              )}
            >
              <Home className="w-4 h-4" />
              Home
            </Link>
            <Link
              onClick={() => setOpen(false)}
              href="/smart-match"
              className={cn(
                "text-base w-full font-medium text-center py-2 flex items-center justify-center gap-2",
                pathname.includes("smart-match")
                  ? "text-accent bg-accent/10 rounded-md"
                  : "text-black"
              )}
            >
              <ScanSearch className="w-4 h-4" />
              Smart Match
            </Link>
            <Link
              onClick={() => setOpen(false)}
              href="/query-dashboard"
              className={cn(
                "text-base w-full font-medium text-center py-2 flex items-center justify-center gap-2",
                pathname.includes("query-dashboard")
                  ? "text-accent bg-accent/10 rounded-md"
                  : "text-black"
              )}
            >
              {agentsList && agentsList.length > 0 ? (
                <span className="flex justify-center items-center text-accent bg-accent/10 rounded-[50px] h-[18px] w-[18px] text-xs p-3 ml-[-3px]">
                  {agentsList.length}
                </span>
              ) : (
                <LayoutDashboard className="w-4 h-4" />
              )}
              Query Dashboard
            </Link>
            <Link
              onClick={() => setOpen(false)}
              href="/dispatch"
              className={cn(
                "text-base w-full font-medium text-center py-2 flex items-center justify-center gap-2",
                pathname.includes("dispatch")
                  ? "text-accent bg-accent/10 rounded-md"
                  : "text-black"
              )}
            >
              <Newspaper className="w-4 h-4" />
              Dispatch
            </Link>
            <Link
              onClick={() => setOpen(false)}
              href="/blog"
              className={cn(
                "text-base w-full font-medium text-center py-2 flex items-center justify-center gap-2",
                pathname.includes("blog")
                  ? "text-accent bg-accent/10 rounded-md"
                  : "text-black"
              )}
            >
              <NotebookPen className="w-4 h-4" />
              Blog
            </Link>
          </SignedIn>
          <div className="flex justify-center flex-col items-center gap-6 w-full md:w-fit mt-10">
            <hr className="w-full border-t-1 border-accent/10 md:hidden" />
            <SignedIn>
              <Link
                onClick={() => setOpen(false)}
                href="/account"
                className="text-base font-medium w-full text-center py-2 md:hidden"
              >
                Account
              </Link>
              <div
                className="cursor-pointer text-base font-medium text-center p-2 px-4 rounded-md bg-white text-black shadow-lg w-full"
                onClick={() => setOpen(false)}
              >
                <SignOutButton />
              </div>
            </SignedIn>
          </div>
          <SignedOut>
            <Link
              href="/sign-in"
              onClick={() => setOpen(false)}
              className="w-full"
            >
              <div
                className="cursor-pointer text-base font-medium text-center p-2 px-4 rounded-md bg-white text-black shadow-lg w-full"
                onClick={() => setOpen(false)}
              >
                Sign In
              </div>
            </Link>
            <Link
              href="/sign-up"
              onClick={() => setOpen(false)}
              className="w-full"
            >
              <div className="cursor-pointer text-base font-medium p-2 px-4 rounded-md bg-accent text-white shadow-lg w-full text-center mt-4">
                Create an Account
              </div>
            </Link>
          </SignedOut>
        </div>
      </div>
    </>
  );
};

export default AppHamburger;
