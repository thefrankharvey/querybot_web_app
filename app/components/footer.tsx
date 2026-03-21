"use client";

import React from "react";
import CopyToClipboard from "./copy-to-clipboard";
import Link from "next/link";
import { SignedOut } from "@clerk/nextjs";
import KitEmailBar from "./kit-email-bar";
import { usePathname } from "next/navigation";
import InstagramIcon from "./custom-icons/instagram-icon";
import TiktokIcon from "./custom-icons/tiktok-icon";
import XIcon from "./custom-icons/x-icon";
import BlueskyIcon from "./custom-icons/bluesky-icon";
import ThreadsIcon from "./custom-icons/threads-icon";

const Footer = () => {
  const pathname = usePathname();

  if (
    pathname.includes("query-dashboard") ||
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up")
  ) {
    return null;
  }

  return (
    <div
      id="footer"
      className="w-full border-t border-white/60 bg-[linear-gradient(180deg,rgba(26,60,63,0.96),rgba(18,38,41,1))] py-10"
    >
      <div className="flex max-w-screen-xl mx-auto justify-between items-baseline flex-col-reverse gap-8 px-4 md:flex-row">
        <div className="flex flex-col justify-left gap-6 py-4 md:flex-row md:gap-20 md:py-10">
          <div className="flex flex-col gap-2">
            <h2 className="text-base text-white font-semibold">Legal</h2>
            <Link
              href="/legal/privacy-policy"
              className="text-base text-white/84 transition-all duration-300 hover:text-white"
            >
              Privacy Policy
            </Link>
            <Link
              href="/legal/refund-policy"
              className="text-base text-white/84 transition-all duration-300 hover:text-white"
            >
              Refund Policy
            </Link>
            <Link
              href="/legal/terms-of-service"
              className="text-base text-white/84 transition-all duration-300 hover:text-white"
            >
              Terms of Service
            </Link>
          </div>
          <div className="flex flex-col gap-2 md:mb-8">
            <h2 className="text-base text-white font-semibold">Connect</h2>
            <Link
              href="/about"
              className="text-base text-white/84 transition-all duration-300 hover:text-white"
            >
              About
            </Link>
            <Link
              href="/creator-resources"
              className="text-base text-white/84 transition-all duration-300 hover:text-white"
            >
              Creator Resources
            </Link>
            <CopyToClipboard
              text="feedback@writequeryhook.com"
              className="text-white/84 hover:text-white"
            />
            <div className="flex flex-row gap-3 mt-2">
              <a href="https://www.instagram.com/writequeryhook" target="_blank" rel="noopener noreferrer" className="text-white/84 transition hover:text-white">
                <InstagramIcon className="w-6 h-6" />
              </a>
              <a href="https://www.tiktok.com/@write.query.hook?is_from_webapp=1" target="_blank" rel="noopener noreferrer" className="text-white/84 transition hover:text-white">
                <TiktokIcon className="w-6 h-6" />
              </a>
              <a href="https://x.com/writequeryhook" target="_blank" rel="noopener noreferrer" className="text-white/84 transition hover:text-white">
                <XIcon className="w-6 h-6" />
              </a>
              <a href="https://bsky.app/profile/writequeryhook.bsky.social" target="_blank" rel="noopener noreferrer" className="text-white/84 transition hover:text-white">
                <BlueskyIcon className="w-6 h-6" />
              </a>
              <a href="https://www.threads.com/@writequeryhook" target="_blank" rel="noopener noreferrer" className="text-white/84 transition hover:text-white">
                <ThreadsIcon className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>
        {pathname === "/" && (
          <SignedOut>
            <KitEmailBar />
          </SignedOut>
        )}
      </div>

      <div className="max-w-screen-lg mx-auto flex justify-center px-4">
        <p className="mt-4 text-center text-xs text-white/70">
          © 2026 Write Query Hook. All Rights Reserved.
        </p>
      </div>
    </div>
  );
};

export default Footer;
