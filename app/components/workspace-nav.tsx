"use client";

import { SignOutButton } from "@clerk/nextjs";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

import { BrandLockup } from "@/app/components/brand-lockup";
import { Separator } from "@/app/ui-primitives/separator";
import { cn } from "@/app/utils";

export type WorkspaceNavItem = {
  label: string;
  href: string;
  icon?: LucideIcon;
  prefetch?: boolean;
  dataTourTarget?: string;
  isActive?: (pathname: string) => boolean;
  badge?: ReactNode;
};

type WorkspaceNavSlot = ReactNode | ((closeMenu: () => void) => ReactNode);

export type WorkspaceNavEntry =
  | WorkspaceNavItem
  | {
      type: "custom";
      key: string;
      content: WorkspaceNavSlot;
    };

type WorkspaceNavVariant = "desktop" | "mobile";

type WorkspaceNavLinkProps = {
  item: WorkspaceNavItem;
  pathname?: string;
  variant: WorkspaceNavVariant;
  onNavigate?: () => void;
};

type WorkspaceSideBarNavProps = {
  entries: WorkspaceNavEntry[];
  beforeEntries?: WorkspaceNavSlot;
  afterEntries?: WorkspaceNavSlot;
  footer?: WorkspaceNavSlot;
  brandHref: string;
  containerClassName?: string;
};

type WorkspaceHamburgerNavProps = {
  entries: WorkspaceNavEntry[];
  beforeEntries?: WorkspaceNavSlot;
  afterEntries?: WorkspaceNavSlot;
  footer?: WorkspaceNavSlot;
};

function isCustomEntry(
  entry: WorkspaceNavEntry
): entry is Extract<WorkspaceNavEntry, { type: "custom" }> {
  return "type" in entry && entry.type === "custom";
}

function isItemActive(item: WorkspaceNavItem, pathname: string) {
  if (item.isActive) return item.isActive(pathname);

  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function renderWorkspaceNavSlot(slot: WorkspaceNavSlot, closeMenu: () => void) {
  return typeof slot === "function" ? slot(closeMenu) : slot;
}

export function WorkspaceNavLink({
  item,
  pathname,
  variant,
  onNavigate,
}: WorkspaceNavLinkProps) {
  const currentPathname = usePathname();
  const active = isItemActive(item, pathname ?? currentPathname);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      prefetch={item.prefetch}
      data-tour-target={item.dataTourTarget}
      onClick={onNavigate}
      className={cn(
        variant === "desktop"
          ? "my-1 flex items-center gap-3 rounded-[20px] px-4 py-3 text-sm font-medium transition-all duration-200 hover:bg-white/70 hover:text-accent"
          : "flex w-full items-center justify-center gap-2 rounded-[22px] py-3 text-base font-medium",
        active
          ? "border border-accent/10 bg-white/82 text-accent shadow-[0_12px_28px_rgba(24,44,69,0.06)]"
          : "text-accent/74"
      )}
    >
      {Icon ? <Icon className="size-4" /> : null}
      {item.label}
      {item.badge ? <span className="ml-auto">{item.badge}</span> : null}
    </Link>
  );
}

export function WorkspaceSignOutButton({
  variant,
  onClick,
}: {
  variant: WorkspaceNavVariant;
  onClick?: () => void;
}) {
  return (
    <SignOutButton>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "cursor-pointer font-medium transition-all duration-200",
          variant === "desktop"
            ? "my-1 w-full rounded-[20px] px-4 py-3 text-left text-sm text-accent/74 hover:bg-white/70 hover:text-accent"
            : "w-full rounded-full border border-accent/12 bg-white/82 px-4 py-3 text-center text-base text-accent shadow-[0_16px_34px_rgba(24,44,69,0.07)]"
        )}
      >
        Sign out
      </button>
    </SignOutButton>
  );
}

export function WorkspaceSideBarNav({
  entries,
  beforeEntries,
  afterEntries,
  footer,
  brandHref,
  containerClassName,
}: WorkspaceSideBarNavProps) {
  const pathname = usePathname();
  const noop = () => {};

  return (
    <div
      className={cn(
        "hidden h-fit shrink-0 self-start pt-4 md:sticky md:top-0 md:ml-2 md:block",
        containerClassName
      )}
    >
      <BrandLockup
        href={brandHref}
        stacked={true}
        className="rounded-[28px] border border-white/75 bg-white/55 px-5 py-5 shadow-[0_20px_50px_rgba(24,44,69,0.08)] backdrop-blur-sm"
        labelClassName="inline text-[12px] leading-5 text-accent/72"
      />
      <div className="flex w-full flex-col pt-6">
        <aside className="h-full w-full md:sticky md:top-24 md:max-w-[230px]">
          <nav className="glass-panel w-full rounded-[30px] p-3">
            {beforeEntries ? renderWorkspaceNavSlot(beforeEntries, noop) : null}
            {entries.map((entry) =>
              isCustomEntry(entry) ? (
                <div key={entry.key}>
                  {renderWorkspaceNavSlot(entry.content, noop)}
                </div>
              ) : (
                <WorkspaceNavLink
                  key={entry.href}
                  item={entry}
                  pathname={pathname}
                  variant="desktop"
                />
              )
            )}
            {afterEntries ? renderWorkspaceNavSlot(afterEntries, noop) : null}
            {footer ? (
              <>
                <Separator className="my-2 mb-4" />
                {renderWorkspaceNavSlot(footer, noop)}
              </>
            ) : null}
          </nav>
        </aside>
      </div>
    </div>
  );
}

export function WorkspaceHamburgerNav({
  entries,
  beforeEntries,
  afterEntries,
  footer,
}: WorkspaceHamburgerNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);

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
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Toggle menu"
        aria-expanded={open}
        className="flex size-11 flex-col items-center justify-center rounded-full p-0 md:hidden"
      >
        <span
          className={cn(
            "block h-0.5 w-10 bg-current transition-transform duration-200",
            open && "translate-y-[10px] rotate-45"
          )}
        />
        <span
          className={cn(
            "my-2 block h-0.5 w-10 bg-current transition-all duration-200",
            open ? "scale-x-0 opacity-0" : "scale-x-100 opacity-100"
          )}
        />
        <span
          className={cn(
            "block h-0.5 w-10 bg-current transition-transform duration-200",
            open && "-translate-y-[10px] -rotate-45"
          )}
        />
      </button>
      <div
        className={cn(
          "absolute inset-0 z-99 mt-[80px] h-dvh-safe w-screen overflow-hidden overscroll-none bg-background/90 p-6 pt-0 transition-opacity duration-300 backdrop-blur-xl md:pt-4",
          open
            ? "visible opacity-100"
            : "invisible pointer-events-none opacity-0"
        )}
      >
        <div className="glass-panel-strong mx-auto flex h-full w-full max-w-xl flex-col gap-2 overflow-y-auto p-4">
          {beforeEntries ? renderWorkspaceNavSlot(beforeEntries, closeMenu) : null}
          {entries.map((entry) =>
            isCustomEntry(entry) ? (
              <div key={entry.key}>
                {renderWorkspaceNavSlot(entry.content, closeMenu)}
              </div>
            ) : (
              <WorkspaceNavLink
                key={entry.href}
                item={entry}
                pathname={pathname}
                variant="mobile"
                onNavigate={closeMenu}
              />
            )
          )}
          {afterEntries ? renderWorkspaceNavSlot(afterEntries, closeMenu) : null}
          {footer ? (
            <div className="mt-4 flex w-full flex-col items-center justify-center gap-2 md:w-fit">
              <Separator className="md:hidden" />
              {renderWorkspaceNavSlot(footer, closeMenu)}
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
