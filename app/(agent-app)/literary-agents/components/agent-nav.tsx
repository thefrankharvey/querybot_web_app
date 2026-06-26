"use client";

import { MessageSquare, Search, Settings, UserRound } from "lucide-react";
import { usePathname } from "next/navigation";

import {
  WorkspaceHamburgerNav,
  WorkspaceNavLink,
  WorkspaceSideBarNav,
  WorkspaceSignOutButton,
  type WorkspaceNavItem,
} from "@/app/components/workspace-nav";

const AGENT_NAV_ITEMS: WorkspaceNavItem[] = [
  {
    label: "Profile",
    href: "/literary-agents/home",
    icon: UserRound,
    isActive: (pathname) => pathname === "/literary-agents/home",
  },
  {
    label: "Messages",
    href: "/literary-agents/messages",
    icon: MessageSquare,
  },
  {
    label: "Writer Search",
    href: "/literary-agents/writer-search",
    icon: Search,
  },
];

const AGENT_ACCOUNT_ITEM: WorkspaceNavItem = {
  label: "Account",
  href: "/literary-agents/account",
  icon: Settings,
};

export function AgentSideBarNav() {
  const pathname = usePathname();

  return (
    <WorkspaceSideBarNav
      brandHref="/literary-agents/home"
      entries={AGENT_NAV_ITEMS}
      containerClassName="mb-88 md:w-[230px]"
      footer={
        <>
          <WorkspaceNavLink
            item={AGENT_ACCOUNT_ITEM}
            pathname={pathname}
            variant="desktop"
          />
          <WorkspaceSignOutButton variant="desktop" />
        </>
      }
    />
  );
}

export function AgentAppHamburger() {
  const pathname = usePathname();

  return (
    <WorkspaceHamburgerNav
      entries={AGENT_NAV_ITEMS}
      footer={(closeMenu) => (
        <>
          <WorkspaceNavLink
            item={AGENT_ACCOUNT_ITEM}
            pathname={pathname}
            variant="mobile"
            onNavigate={closeMenu}
          />
          <WorkspaceSignOutButton variant="mobile" onClick={closeMenu} />
        </>
      )}
    />
  );
}
