"use client";

import { useState } from "react";
import { cn } from "../utils";
import Link from "next/link";
import { SignOutButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { useClerkUser } from "../hooks/use-clerk-user";
import { Separator } from "@/app/ui-primitives/separator";

export const PublicHamburger = () => {
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
        className="flex size-11 flex-col items-center justify-center rounded-full p-0 md:hidden"
      >
        <span
          className={`block w-10 h-0.5 bg-current transition-transform duration-200 ${open ? "translate-y-[10px] rotate-45" : ""
            }`}
        />
        <span
          className={`block w-10 h-0.5 bg-current my-2 transition-all duration-200 ${open ? "opacity-0 scale-x-0" : "opacity-100 scale-x-100"
            }`}
        />
        <span
          className={`block w-10 h-0.5 bg-current transition-transform duration-200 ${open ? "-translate-y-[10px] -rotate-45" : ""
            }`}
        />
      </button>
      <div
        className={cn(
          "absolute inset-0 z-99 mt-[80px] h-dvh-safe w-screen overflow-hidden overscroll-none bg-background/90 p-6 transition-opacity duration-300 backdrop-blur-xl",
          open
            ? "opacity-100 visible"
            : "opacity-0 invisible pointer-events-none"
        )}
      >
        <div className="glass-panel-strong mx-auto flex h-fit md:h-full w-full max-w-xl flex-col items-center overflow-y-auto p-4">
          <SignedIn>
            {!isSubscribed && (
              <Link
                onClick={() => setOpen(false)}
                href="/subscribe"
                className="text-base w-full text-center"
              >
                <div className="w-full rounded-full border border-accent bg-accent px-4 py-3 text-center text-base font-medium text-white shadow-[0_18px_36px_rgba(28,74,78,0.18)]">
                  Subscribe
                </div>
              </Link>
            )}
            <Link
              onClick={() => setOpen(false)}
              href="/home"
              className={cn(
                "text-base w-full text-center",
                !isSubscribed && "mt-4"
              )}
            >
              <div className="w-full cursor-pointer rounded-full border border-accent/12 bg-white/82 px-4 py-3 text-center text-base font-medium text-accent shadow-[0_16px_34px_rgba(24,44,69,0.07)]">
                Go to App
              </div>
            </Link>
          </SignedIn>
          <SignedIn>
            <div className="flex justify-center flex-col items-center gap-8 w-full md:w-fit mt-10">
              <Separator className="md:hidden" />
              <div
                className="w-full cursor-pointer rounded-full border border-accent/12 bg-white/82 px-4 py-3 text-center text-base font-medium text-accent shadow-[0_16px_34px_rgba(24,44,69,0.07)]"
                onClick={() => setOpen(false)}
              >
                <SignOutButton />
              </div>
            </div>
          </SignedIn>

          <SignedOut>
            <Link
              href="/sign-in"
              onClick={() => setOpen(false)}
              className="w-full"
            >
              <div
                className="w-full cursor-pointer rounded-full border border-accent/12 bg-white/82 px-4 py-3 text-center text-base font-medium text-accent shadow-[0_16px_34px_rgba(24,44,69,0.07)]"
                onClick={() => setOpen(false)}
              >
                Sign In
              </div>
            </Link>
            <Separator className="md:hidden mt-4" />
            <Link
              href="/sign-up"
              onClick={() => setOpen(false)}
              className="w-full"
            >
              <div className="mt-4 w-full cursor-pointer rounded-full border border-accent bg-accent px-4 py-3 text-center text-base font-medium text-white shadow-[0_18px_36px_rgba(28,74,78,0.18)]">
                Create an Account
              </div>
            </Link>
          </SignedOut>
        </div>
      </div>
    </>
  );
};

export default PublicHamburger;
