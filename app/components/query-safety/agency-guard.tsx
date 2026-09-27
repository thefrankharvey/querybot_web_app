"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useProfileContext } from "@/app/(app)/context/profile-context";
import { useAgencyHistoryConfig } from "./agency-history-provider";
import { useAgencyGuard } from "@/app/hooks/use-agency-guard";
import {
  buildAgencyGuard,
  rowIdentity,
  type AgencyGuardInput,
  type ManualAgencyGuardResponse,
} from "@/app/utils/query-safety/agency-guard";
import { Button } from "@/app/ui-primitives/button";
import { Badge } from "@/app/ui-primitives/badge";
import { Alert, AlertDescription, AlertTitle } from "@/app/ui-primitives/alert";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/app/ui-primitives/dialog";

type Candidate = Omit<AgencyGuardInput, "dashboardProjectId"> & {
  dashboardProjectId?: string | null;
};
const stages = {
  active: "Active query",
  requested: "Requested material",
  rejected: "Rejected",
  offer: "Offer made",
  unknown_sent: "Submitted; status uncertain",
};
function title(result: ManualAgencyGuardResponse) {
  switch (result.status) {
    case "warning":
      return "Active query at this agency";
    case "possible_match":
      return "Possible agency match";
    case "history":
      return "Agency query history";
    case "unknown":
      return "Unable to determine agency history";
    default:
      return "No matching history found in your saved records.";
  }
}
export function AgencyHistoryIndicator({
  candidate,
}: {
  candidate: Candidate;
}) {
  const config = useAgencyHistoryConfig();
  const { agentsList } = useProfileContext();
  if (!config?.agencyHistory || !candidate.dashboardProjectId || !agentsList)
    return null;
  const saved = candidate.candidateRecordId
    ? agentsList.find(
        (row) =>
          row.id === candidate.candidateRecordId &&
          row.dashboard_project_id === candidate.dashboardProjectId,
      )
    : undefined;
  if (candidate.candidateRecordId && !saved) return null;
  const result = buildAgencyGuard(
    {
      ...candidate,
      dashboardProjectId: candidate.dashboardProjectId,
      includeAllProjects: false,
    },
    saved
      ? rowIdentity(saved)
      : {
          agencyName: candidate.candidateAgencyName,
          agencyUrl: candidate.candidateAgencyUrl,
        },
    agentsList,
    false,
  );
  // Loaded rows may be capped. Absence of a local match must never imply a clear result.
  if (!result.records.length) return null;
  return (
    <Badge variant="outline">
      {result.counts.sameProjectActive
        ? "Possible agency match"
        : "Agency query history"}
    </Badge>
  );
}
export function AgencyGuard({
  candidate,
  defaultOpen = false,
}: {
  candidate: Candidate;
  defaultOpen?: boolean;
}) {
  const config = useAgencyHistoryConfig();
  if (!config?.agencyHistory) return null;
  if (!candidate.dashboardProjectId)
    return (
      <p className="text-sm text-muted-foreground">
        Agency history becomes available after this project has saved agents.
      </p>
    );
  // Reset expansion when changing candidate/project.
  return (
    <AgencyGuardDetails
      defaultOpen={defaultOpen}
      key={JSON.stringify(candidate)}
      input={{ ...candidate, dashboardProjectId: candidate.dashboardProjectId }}
    />
  );
}
function AgencyGuardDetails({
  input,
  defaultOpen,
}: {
  input: AgencyGuardInput;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [includeAllProjects, setIncludeAllProjects] = useState(false);
  const config = useAgencyHistoryConfig();
  const query = useAgencyGuard({ ...input, includeAllProjects }, open);
  const result = query.data;
  return (
    <details
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
      className="text-sm"
    >
      <summary className="cursor-pointer rounded-sm py-2 focus-visible:outline focus-visible:outline-2">
        Agency query history
      </summary>
      {open && (
        <div className="flex flex-col gap-3 py-3" aria-live="polite">
          <p>Based on your saved dashboard records. Advisory only.</p>
          {config?.capabilities.allProjectsAgencyHistory ? (
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={includeAllProjects}
                onChange={(event) =>
                  setIncludeAllProjects(event.target.checked)
                }
              />
              Include my other projects
            </label>
          ) : (
            <p className="text-muted-foreground">
              Showing this project. A subscription includes history across your
              projects.
            </p>
          )}
          {query.isFetching ? (
            <p role="status">Checking saved history...</p>
          ) : query.isError ? (
            <Alert>
              <AlertTitle>History unavailable</AlertTitle>
              <AlertDescription>{query.error.message}</AlertDescription>
            </Alert>
          ) : result ? (
            <>
              <Alert>
                <AlertTitle>{title(result)}</AlertTitle>
                <AlertDescription>
                  {result.status === "warning" && (
                    <p>
                      You have an active manually tracked query at this agency
                      for this project.
                    </p>
                  )}
                  {result.records.some(
                    (row) => row.matchMethod !== "canonical_id",
                  ) && (
                    <p>
                      Possible agency match based on agency domain or normalized
                      name. Check the agency&apos;s current submission policy.
                    </p>
                  )}
                  {result.coverage.identitySource !== "canonical" && (
                    <p>
                      Verified agency identity is unavailable. Names and
                      official domains provide fallback evidence only.
                    </p>
                  )}
                  {!result.coverage.historyComplete && (
                    <p>
                      History coverage is incomplete. Additional saved records
                      may exist.
                    </p>
                  )}
                </AlertDescription>
              </Alert>
              <p>
                {result.counts.sameProjectActive} active ·{" "}
                {result.counts.sameProjectTerminal} closed in this project
              </p>
              {includeAllProjects && (
                <p>
                  Other projects: {result.counts.otherProjectActive} active ·{" "}
                  {result.counts.otherProjectTerminal} closed. Other-project
                  history does not establish a restriction on a different
                  manuscript.
                </p>
              )}
              <ul className="flex flex-col gap-3">
                {result.records.map((row) => (
                  <li key={row.recordId} className="flex flex-col gap-1">
                    <Link href={row.href} className="underline">
                      {row.agentName} · {row.projectName}
                    </Link>
                    <span>
                      {stages[row.stage]} ·{" "}
                      {row.querySentOn
                        ? `Query sent ${row.querySentOn}`
                        : "Manually marked submitted; date missing."}
                    </span>
                    {row.matchMethod !== "canonical_id" && (
                      <span className="text-muted-foreground">
                        Possible agency match:{" "}
                        {row.matchMethod === "domain"
                          ? "official domain"
                          : "normalized agency name"}
                        .
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </>
          ) : null}
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="self-start"
            disabled={query.isFetching}
            onClick={() => void query.refetch()}
          >
            Refresh history
          </Button>
        </div>
      )}
    </details>
  );
}
export function AgencyHistoryButton({ candidate }: { candidate: Candidate }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const search = useSearchParams();
  useEffect(() => setOpen(false), [pathname, search]);
  const config = useAgencyHistoryConfig();
  if (!config?.agencyHistory) return null;
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="ghost" size="sm">
          <AgencyHistoryIndicator candidate={candidate} />
          History
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogTitle>Agency query history</DialogTitle>
        <DialogDescription>
          Review manually tracked queries in your saved records.
        </DialogDescription>
        <AgencyGuard candidate={candidate} defaultOpen />
      </DialogContent>
    </Dialog>
  );
}
