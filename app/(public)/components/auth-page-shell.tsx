import type { ReactNode } from "react";

import Link from "next/link";

import { BrandLockup } from "@/app/components/brand-lockup";

import HomeContentShell from "../(home)/components/home-content-shell";

type AuthPageShellProps = {
  title: string;
  description: string;
  proofItems?: string[];
  authPrompt: string;
  authLinkHref: string;
  authLinkLabel: string;
  children: ReactNode;
};

export function AuthPageShell({
  title,
  description,
  proofItems,
  authPrompt,
  authLinkHref,
  authLinkLabel,
  children,
}: AuthPageShellProps) {
  return (
    <section className="relative overflow-hidden bg-background">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(28,74,78,0.12),transparent_34%),radial-gradient(circle_at_78%_32%,rgba(255,255,255,0.88),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.42),rgba(246,244,236,0.9))]" />
      <div className="absolute left-[8%] top-28 h-64 w-64 rounded-full bg-accent/8 blur-3xl" />
      <div className="absolute bottom-16 right-[12%] h-72 w-72 rounded-full bg-white/60 blur-3xl" />

      <HomeContentShell className="relative flex min-h-screen flex-col px-4 pb-10 pt-6 md:px-6 md:pb-14 md:pt-8">
        <div className="flex items-center justify-between gap-6">
          <BrandLockup
            imageClassName="shadow-[0_14px_40px_rgba(24,44,69,0.12)]"
          />

          <div className="flex items-center gap-2 text-sm text-accent/75">
            <span className="hidden sm:inline">{authPrompt}</span>
            <Link
              href={authLinkHref}
              className="rounded-full border border-accent/14 bg-white/82 px-4 py-2 font-medium text-accent shadow-[0_12px_32px_rgba(24,44,69,0.06)] backdrop-blur-sm transition duration-200 hover:border-accent/24 hover:bg-white"
            >
              {authLinkLabel}
            </Link>
          </div>
        </div>

        <div className="flex flex-1 items-center py-10 md:py-14 lg:py-16">
          <div className="grid w-full items-center gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,520px)] lg:gap-16">
            <div className="mx-auto flex w-full max-w-xl flex-col items-center text-center lg:mx-0 lg:items-start lg:text-left">
              <span className="rounded-full border border-accent/10 bg-white/80 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-accent/65 shadow-[0_12px_32px_rgba(24,44,69,0.06)] backdrop-blur-sm">
                Writer workflow
              </span>

              <h1 className="mt-6 font-serif text-4xl leading-tight text-accent md:text-5xl">
                {title}
              </h1>

              <p className="mt-5 max-w-lg text-base leading-8 text-accent/78 md:text-lg">
                {description}
              </p>

              {proofItems && proofItems.length > 0 ? (
                <div className="mt-8 flex flex-wrap justify-center gap-x-3 gap-y-2 text-sm text-accent/72 lg:justify-start">
                  {proofItems.map((item, index) => (
                    <span key={item} className="flex items-center gap-3">
                      {index > 0 ? (
                        <span className="text-accent/35" aria-hidden="true">
                          •
                        </span>
                      ) : null}
                      <span className="text-[15px] font-medium text-accent/78">
                        {item}
                      </span>
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="relative flex w-full justify-center lg:justify-end">
              <div className="absolute inset-x-6 top-10 h-64 rounded-full bg-[radial-gradient(circle,rgba(28,74,78,0.14),transparent_68%)] blur-3xl" />
              <div className="relative w-full max-w-[30rem]">{children}</div>
            </div>
          </div>
        </div>
      </HomeContentShell>
    </section>
  );
}
