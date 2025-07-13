import React from "react";
import CopyToClipboard from "./copy-to-clipboard";
import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  return (
    <div
      id="footer"
      className="bg-[#F9E0E2] w-full py-10 border-t border-text-dark-blue mt-[300px]"
    >
      <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row gap-6 md:gap-20 justify-left px-4 py-4 md:py-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-base font-semibold">Legal</h1>
          <Link
            href="/legal/privacy-policy"
            className="text-base hover:text-accent transition-all duration-300"
          >
            Privacy Policy
          </Link>
          <Link
            href="/legal/refund-policy"
            className="text-base hover:text-accent transition-all duration-300"
          >
            Refund Policy
          </Link>
          <Link
            href="/legal/terms-of-service"
            className="text-base hover:text-accent transition-all duration-300"
          >
            Terms of Service
          </Link>
        </div>
        <div className="flex flex-col gap-2 md:mb-8">
          <h1 className="text-base font-semibold">Connect</h1>
          <CopyToClipboard text="feedback@writequeryhook.com" />
          <a
            className="text-base flex items-center gap-2 hover:text-accent transition-all duration-300"
            href="https://bsky.app/profile/writequeryhook.bsky.social"
            target="_blank"
          >
            <span>Bluesky</span>
            <Image
              src="/bluesky-icon.svg"
              alt="bluesky butterfly"
              width={16}
              height={16}
            />
          </a>
        </div>
      </div>
      <div className="max-w-screen-lg mx-auto flex justify-center px-4">
        <p className="text-sm mt-4 text-center">
          © 2025 Write Query Hook. All Rights Reserved.
        </p>
      </div>
    </div>
  );
};

export default Footer;
