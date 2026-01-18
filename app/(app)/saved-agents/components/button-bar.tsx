import { useClerkUser } from "@/app/hooks/use-clerk-user";
import { Button } from "@/app/ui-primitives/button";
import { getFromLocalStorage } from "@/app/utils";
import { ExternalLinkIcon } from "lucide-react";
import Link from "next/link";

export default function ButtonBar() {
  const { isSubscribed } = useClerkUser();
  const hasAgentMatches = getFromLocalStorage("agent_matches");

  return (
    <div className="flex md:flex-row flex-col gap-4 items-center md:justify-end justify-center mb-4 w-full">
      <Link href="/smart-match">
        <Button
          className="cursor-pointer text-sm p-2 px-4 w-full md:w-auto shadow-lg hover:shadow-xl flex items-center gap-2"
        >
          Find Agents
        </Button>
      </Link>
      {isSubscribed ?
        hasAgentMatches &&
        hasAgentMatches.length > 0 && (
          <Link href="/agent-matches" className="w-full md:w-fit">
            <Button
              className="cursor-pointer text-sm p-2 px-4 w-full md:w-auto shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              Previous Agent Matches
            </Button>
          </Link>
        ) : <a
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
        </a>}

    </div>
  );
}
