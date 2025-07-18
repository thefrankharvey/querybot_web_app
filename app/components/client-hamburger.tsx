"use client";

import { useState } from "react";
import { cn } from "../utils";
import Link from "next/link";
import {
  SignInButton,
  SignOutButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  useClerk,
} from "@clerk/nextjs";

export const ClientHamburger = () => {
  const [open, setOpen] = useState(false);
  const { openUserProfile } = useClerk();
  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Toggle menu"
        aria-expanded={open}
        className="flex flex-col justify-center items-center w-10 h-10 p-0 md:hidden"
      >
        <span
          className={`block w-10 h-0.5 bg-current transition-transform duration-200 ${
            open ? "translate-y-[10px] rotate-45" : ""
          }`}
        />
        <span
          className={`block w-10 h-0.5 bg-current my-2 transition-opacity duration-200 ${
            open ? "opacity-0" : "opacity-100"
          }`}
        />
        <span
          className={`block w-10 h-0.5 bg-current transition-transform duration-200 ${
            open ? "-translate-y-[10px] -rotate-45" : ""
          }`}
        />
      </button>
      <div
        className={cn(
          "absolute top-0 left-0 w-screen h-screen transition-opacity duration-300 bg-background z-50 mt-20 overflow-hidden p-6",
          open
            ? "opacity-100 visible"
            : "opacity-0 invisible pointer-events-none"
        )}
      >
        <div className="flex flex-col gap-8 items-center w-full h-full mt-30">
          <Link
            onClick={() => setOpen(false)}
            href="/smart-match"
            className="text-xl hover:text-accent transition-all duration-300"
          >
            Smart Match
          </Link>
          <Link
            onClick={() => setOpen(false)}
            href="/slush-feed"
            className="text-xl hover:text-accent transition-all duration-300"
          >
            Slushwire Dispatch
          </Link>
          <a
            onClick={() => setOpen(false)}
            href="https://writequeryhook.com/slushwire/"
            target="_blank"
            className="text-xl hover:text-accent transition-all duration-300"
          >
            Subscribe for Free!
          </a>
          <div className="flex justify-center items-center gap-8 w-full md:w-fit mt-10">
            <SignedIn>
              <a
                onClick={() => openUserProfile()}
                className="text-xl hover:text-accent transition-all duration-300 w-full text-center"
              >
                Account
              </a>
              <div
                className="cursor-pointer text-xl text-center p-2 px-4 rounded-md bg-accent text-[var(--text-dark-blue)] hover:bg-text-dark-blue hover:text-primary-foreground transition-all duration-300 shadow-lg hover:shadow-xl w-full"
                onClick={() => setOpen(false)}
              >
                <SignOutButton />
              </div>
            </SignedIn>
            <SignedOut>
              <div
                className="cursor-pointer text-xl hover:text-accent transition-all duration-300 w-full md:w-fit text-center"
                onClick={() => setOpen(false)}
              >
                <SignInButton />
              </div>
              <div
                className="cursor-pointer text-xl p-2 px-4 rounded-md bg-accent text-[var(--text-dark-blue)] hover:bg-text-dark-blue hover:text-primary-foreground transition-all duration-300 shadow-lg hover:shadow-xl w-full text-center"
                onClick={() => setOpen(false)}
              >
                <SignUpButton />
              </div>
            </SignedOut>
          </div>
        </div>
      </div>
    </>
  );
};

export default ClientHamburger;
