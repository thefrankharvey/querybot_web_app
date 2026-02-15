import { Button } from "@/app/ui-primitives/button";
import { getFromLocalStorage } from "@/app/utils";
import { ExternalLinkIcon, ScanSearch, UsersIcon } from "lucide-react";
import Link from "next/link";

export default function ButtonBar() {
  const hasAgentMatches = getFromLocalStorage("agent_matches");

  return (
    <div className="flex md:flex-row flex-col gap-6 md:gap-4 items-center md:justify-start justify-center md:mb-4 mb-6 w-full">
      <Link href="/smart-match" className="w-full md:w-fit">
        <Button
          className="cursor-pointer text-sm p-2 px-4 w-full md:w-auto shadow-lg hover:shadow-xl flex items-center gap-2"
        >
          <ScanSearch className="w-4 h-4" />
          Find Agents
        </Button>
      </Link>
      {hasAgentMatches &&
        hasAgentMatches.length > 0 && (
          <Link href="/agent-matches" className="w-full md:w-fit">
            <Button
              className="cursor-pointer text-sm p-2 px-4 w-full md:w-auto shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <UsersIcon className="w-4 h-4" />
              Previous Agent Matches
            </Button>
          </Link>
        )}
      <a
        href="https://docs.google.com/spreadsheets/u/4/d/17yQjT-helZqZF1kdF7UzUQYFdNRwrAvGc8Dm2Inbahw/edit?gid=419639381#gid=419639381"
        target="_blank"
        rel="noopener noreferrer"
        className="w-full md:w-auto"
      >
        <Button
          className="cursor-pointer text-sm p-2 px-4 w-full md:w-auto shadow-lg hover:shadow-xl flex items-center gap-2">
          <ExternalLinkIcon className="w-7 h-7" />
          Free Query Spreadsheet
        </Button>
      </a>
    </div>
  );
}
