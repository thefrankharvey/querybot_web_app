"use client";

import Image from "next/image";
import Link from "next/link";

export const SideBarNav = () => {
  return (
    <div className="w-[250px] min-h-screen pt-12 ml-8">
      <Link href="/" className="text-xl font-semibold text-black">
        <Image
          src="/wqh-logo.png"
          alt="logo"
          width={60}
          height={60}
          className="w-[60px] h-[60px] rounded-full"
        />
      </Link>
      <div className="w-full flex flex-col md:flex-row">
        <aside className="w-full md:sticky md:top-24 h-full md:max-w-[173px]">
          <nav className="w-full flex flex-col gap-2 p-4 md:p-0 rounded-none shadow-none mt-0 md:mt-16">
            <Link href="/smart-match" className="flex-1">
              Smart Match
            </Link>
            <Link href="/dispatch" className="flex-1">
              Dispatch
            </Link>
            <Link href="/blog">Blog</Link>
            <Link
              href="/profile/saved-match"
              onClick={(e) => e.stopPropagation()}
              className="flex-1"
            >
              Saved Agents
            </Link>
            <Link href="/profile/account">Account</Link>
          </nav>
        </aside>
      </div>
    </div>
  );
};
