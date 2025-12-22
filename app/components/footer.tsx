"use client";

import React from "react";
import CopyToClipboard from "./copy-to-clipboard";
import Link from "next/link";
import { SignedOut } from "@clerk/nextjs";
import KitEmailBar from "./kit-email-bar";
import { usePathname } from "next/navigation";

const Footer = () => {
  const pathname = usePathname();

  return (
    <div
      id="footer"
      className="bg-accent w-full py-10 border-t border-black mt-[300px]"
    >
      <div className="flex max-w-screen-xl mx-auto justify-between items-baseline flex-col-reverse md:flex-row">
        <div className="flex flex-col md:flex-row gap-6 md:gap-20 justify-left px-4 py-4 md:py-10">
          <div className="flex flex-col gap-2">
            <h1 className="text-base text-white font-semibold">Legal</h1>
            <Link
              href="/legal/privacy-policy"
              className="text-base text-white transition-all duration-300"
            >
              Privacy Policy
            </Link>
            <Link
              href="/legal/refund-policy"
              className="text-base text-white transition-all duration-300"
            >
              Refund Policy
            </Link>
            <Link
              href="/legal/terms-of-service"
              className="text-base text-white transition-all duration-300"
            >
              Terms of Service
            </Link>
          </div>
          <div className="flex flex-col gap-2 md:mb-8">
            <h1 className="text-base text-white font-semibold">Connect</h1>
            <Link
              href="/about"
              className="text-base text-white transition-all duration-300"
            >
              About
            </Link>
            <a
              className="text-base flex items-center gap-2 text-white transition-all duration-300"
              href="https://bsky.app/profile/writequeryhook.bsky.social"
              target="_blank"
            >
              <span>Bluesky</span>
            </a>
            <CopyToClipboard
              text="feedback@writequeryhook.com"
              className="text-white"
            />
          </div>
        </div>
        {pathname === "/" && (
          <SignedOut>
            <KitEmailBar />
          </SignedOut>
        )}
      </div>

      <div className="max-w-screen-lg mx-auto flex justify-center px-4">
        <p className="text-xs mt-4 text-center text-white">
          © 2025 Write Query Hook. All Rights Reserved.
        </p>
      </div>
    </div>
  );
};

export default Footer;
