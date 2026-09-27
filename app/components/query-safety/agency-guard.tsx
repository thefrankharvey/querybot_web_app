"use client";
import { useMemo, useState } from "react";
import { TriangleAlert } from "lucide-react";
import { useSavedAgencyIndex } from "./agency-history-provider";
import {
  findSavedAgencyMatches,
  type AgencyCandidate,
} from "@/app/utils/query-safety/agency-guard";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/app/ui-primitives/tooltip";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/app/ui-primitives/popover";

export function AgencyWarning({ candidate }: { candidate: AgencyCandidate }) {
  const index = useSavedAgencyIndex();
  const { recordId, indexId, agencyName, agencyUrl } = candidate;
  const result = useMemo(
    () =>
      index
        ? findSavedAgencyMatches(index, {
            recordId,
            indexId,
            agencyName,
            agencyUrl,
          })
        : undefined,
    [index, recordId, indexId, agencyName, agencyUrl],
  );
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);
  if (!result?.projects.length) return null;
  const content = (
    <div className="flex flex-col gap-3">
      <p>
        {result.hasFallback
          ? "We have identified saved agents with a matching agency name or website."
          : "We have identified that you have saved other agents from this agency."}
      </p>
      <ul className="flex flex-col gap-3">
        {result.projects.map((project) => (
          <li key={project.id} className="flex flex-col gap-1">
            <strong>{project.name}</strong>
            <span>{project.agents.join(", ")}</span>
          </li>
        ))}
      </ul>
      <p>Consider only querying one agent at a time from the same agency.</p>
    </div>
  );
  return (
    <Popover open={pinned} onOpenChange={setPinned}>
      <Tooltip open={!pinned && hovered} onOpenChange={setHovered}>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="agency-warning-trigger"
              aria-label="Saved agents from this agency"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setPinned((open) => !open);
              }}
              onKeyDown={(event) => event.stopPropagation()}
            >
              <TriangleAlert aria-hidden="true" />
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          align="start"
          sideOffset={6}
          className="agency-warning-content"
        >
          {content}
        </TooltipContent>
      </Tooltip>
      <PopoverContent
        surface="solid"
        side="bottom"
        align="start"
        sideOffset={6}
        className="agency-warning-content"
        aria-label="Saved agents from this agency"
        onOpenAutoFocus={(event) => event.preventDefault()}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          setHovered(false);
        }}
        onClick={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
      >
        {content}
      </PopoverContent>
    </Popover>
  );
}
