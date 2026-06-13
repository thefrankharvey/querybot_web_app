"use client";

import { SignOutButton } from "@clerk/nextjs";
import Link from "next/link";

export function AccountTypeMismatchActions() {
  return (
    <div className="rounded-[24px] border border-accent/10 bg-white/88 p-5 shadow-[0_24px_70px_rgba(24,44,69,0.12)] backdrop-blur-sm md:p-6">
      <div className="flex flex-col gap-3">
        <SignOutButton redirectUrl="/literary-agents/sign-up">
          <button className="min-h-[48px] w-full rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_42px_rgba(28,74,78,0.22)] transition duration-200 hover:bg-accent/92">
            Sign out and use a different email
          </button>
        </SignOutButton>

        <Link
          href="/home"
          className="flex min-h-[48px] w-full items-center justify-center rounded-full border border-accent/12 bg-white px-5 py-3 text-sm font-semibold text-accent shadow-[0_14px_34px_rgba(24,44,69,0.07)] transition duration-200 hover:border-accent/22"
        >
          Return to writer workspace
        </Link>
      </div>
    </div>
  );
}
