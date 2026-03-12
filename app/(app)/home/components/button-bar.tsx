import { Button } from "@/app/ui-primitives/button";
import { getFromLocalStorage } from "@/app/utils";
import { ExternalLinkIcon, ScanSearch, UsersIcon } from "lucide-react";
import Link from "next/link";

export default function ButtonBar() {
  const hasAgentMatches = getFromLocalStorage("agent_matches");

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
        {hasAgentMatches &&
          hasAgentMatches.length > 0 && (
            <Link href="/agent-matches" className="w-full md:w-fit">
              <Button
                variant="secondary"
                className="h-11 w-full rounded-full border-white/90 bg-white/88 px-5 text-sm font-semibold shadow-[0_14px_32px_rgba(24,44,69,0.08)] backdrop-blur-sm sm:w-auto"
              >
                <UsersIcon data-icon="inline-start" />
                Previous Agent Matches
              </Button>
            </Link>
          )}
        <a
          href="https://docs.google.com/spreadsheets/u/4/d/17yQjT-helZqZF1kdF7UzUQYFdNRwrAvGc8Dm2Inbahw/edit?gid=419639381#gid=419639381"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full md:w-fit"
        >
          <Button
            variant="outline"
            className="h-11 w-full rounded-full border-accent/12 bg-white/70 px-5 text-sm font-semibold shadow-[0_14px_32px_rgba(24,44,69,0.06)] backdrop-blur-sm sm:w-auto"
          >
            <ExternalLinkIcon data-icon="inline-start" />
            Free Query Spreadsheet
          </Button>
        </a>
      </div>
    </div>
  );
}
