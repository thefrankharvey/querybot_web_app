"use client";

import { useState } from "react";
import { cn } from "../utils";
import Link from "next/link";

export const ClientHamburger = () => {
  const [open, setOpen] = useState(false);

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
          "absolute top-0 left-0 w-screen h-screen transition-opacity duration-300 bg-background z-50 mt-20 overflow-hidden",
          open
            ? "opacity-100 visible"
            : "opacity-0 invisible pointer-events-none"
        )}
      >
        <div className="flex flex-col gap-8 items-center w-full h-full mt-50">
          <Link
            onClick={() => setOpen(false)}
            href="/smart-query"
            className="text-2xl font-semibold hover:text-accent transition-all duration-300 underline"
          >
            Smart Query
          </Link>
          <Link
            onClick={() => setOpen(false)}
            href="/slush-feed"
            className="text-2xl font-semibold hover:text-accent transition-all duration-300 underline"
          >
            Slushwire Dispatch
          </Link>
          <a
            onClick={() => setOpen(false)}
            href="https://writequeryhook.com/slushwire/"
            target="_blank"
            className="text-2xl font-semibold hover:text-accent transition-all duration-300 underline"
          >
            Subscribe for Free!
          </a>
        </div>
      </div>
    </>
  );
};

export default ClientHamburger;
