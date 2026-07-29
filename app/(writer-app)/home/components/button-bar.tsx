"use client";

import { Button } from "@/app/ui-primitives/button";
import { getFromLocalStorage } from "@/app/utils";
import { DownloadIcon, ScanSearch, UsersIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ButtonBar() {
  const [hasAgentMatches, setHasAgentMatches] = useState(false);

  useEffect(() => {
    const storedAgentMatches = getFromLocalStorage("agent_matches");
    setHasAgentMatches(
      Array.isArray(storedAgentMatches) && storedAgentMatches.length > 0,
    );
  }, []);

  return (
    <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="shrink-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent/58">
          Quick actions
        </p>
        <p className="mt-1 text-sm leading-6 text-accent/68">
          Jump back in fast.
        </p>
      </div>

      <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap lg:w-auto">
        <Link href="/smart-match" className="w-full md:w-fit">
          <Button className="h-11 w-full rounded-full px-5 text-sm font-semibold shadow-[0_18px_36px_rgba(56,88,116,0.18)] sm:w-auto">
            <ScanSearch data-icon="inline-start" />
            Find Agents
          </Button>
        </Link>
        {hasAgentMatches ? (
          <Link href="/agent-matches" className="w-full md:w-fit">
            <Button
              variant="secondary"
              className="h-11 w-full rounded-full border-white/90 bg-white/88 px-5 text-sm font-semibold shadow-[0_14px_32px_rgba(24,44,69,0.08)] backdrop-blur-sm sm:w-auto"
            >
              <UsersIcon data-icon="inline-start" />
              Previous Agent Matches
            </Button>
          </Link>
        ) : null}
        <Button
          asChild
          variant="outline"
          className="h-11 w-full rounded-full border-accent/12 bg-white/70 px-5 text-sm font-semibold shadow-[0_14px_32px_rgba(24,44,69,0.06)] backdrop-blur-sm sm:w-auto"
        >
          <a href="/api/project-dashboard/export" download>
            <DownloadIcon data-icon="inline-start" />
            Free Query Spreadsheet
          </a>
        </Button>
      </div>
    </div>
  );
}
