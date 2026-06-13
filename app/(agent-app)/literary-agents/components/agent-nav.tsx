"use client";

import { SignOutButton } from "@clerk/nextjs";
import { Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { BrandLockup } from "@/app/components/brand-lockup";
import { cn } from "@/app/utils";

export function AgentNav() {
  const pathname = usePathname();

  return (
    <header className="ambient-page-shell py-4">
      <nav className="glass-panel mx-auto flex w-full max-w-screen-2xl items-center justify-between gap-4 rounded-[28px] px-4 py-3">
        <BrandLockup
          href="/literary-agents/home"
          className="min-w-0"
          imageClassName="h-12 w-12"
          labelClassName="inline truncate text-[12px] text-accent/72"
        />

        <div className="flex items-center gap-2">
          <Link
            href="/literary-agents/home"
            className={cn(
              "flex min-h-[42px] items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 hover:bg-white/70 hover:text-accent",
              pathname === "/literary-agents/home"
                ? "border border-accent/10 bg-white/82 text-accent shadow-[0_12px_28px_rgba(24,44,69,0.06)]"
                : "text-accent/74"
            )}
          >
            <Home className="size-4" />
            Home
          </Link>
          <SignOutButton>
            <button className="min-h-[42px] rounded-full border border-accent/12 bg-white/82 px-4 py-2 text-sm font-medium text-accent shadow-[0_16px_34px_rgba(24,44,69,0.07)] transition duration-200 hover:border-accent/20 hover:bg-white">
              Sign out
            </button>
          </SignOutButton>
        </div>
      </nav>
    </header>
  );
}
