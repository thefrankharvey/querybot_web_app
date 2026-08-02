"use client";

import Link from "next/link";
import { AlertTriangle, Building2, ExternalLink, ShieldQuestion } from "lucide-react";
import { useId, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/app/ui-primitives/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/app/ui-primitives/alert-dialog";
import { Badge } from "@/app/ui-primitives/badge";
import { Button } from "@/app/ui-primitives/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/ui-primitives/dialog";
import { Separator } from "@/app/ui-primitives/separator";
import type { AgencyGuardServiceResult } from "@/app/utils/query-safety/agency-guard";
import { captureQuerySafetyEvent } from "@/app/utils/query-safety/product-analytics.client";

type RenderableAgencyGuard = Pick<
  AgencyGuardServiceResult,
  | "agency"
  | "counts"
  | "liveDataStatus"
  | "records"
  | "resultVersion"
  | "status"
>;

function getGuardLabel(status: RenderableAgencyGuard["status"]) {
  switch (status) {
    case "warning":
      return "Agency query warning";
    case "possible_match":
      return "Possible agency match";
    case "history":
      return "Agency query history";
    default:
      return "No same-agency history";
  }
}

function getRenderedGuardLabel(guard: RenderableAgencyGuard) {
  if (guard.liveDataStatus === "unavailable") {
    return "Agency history unavailable";
  }

  if (guard.liveDataStatus === "partial") {
    return "Checking agency history";
  }

  return getGuardLabel(guard.status);
}

function getGuardSummary(guard: RenderableAgencyGuard) {
  if (guard.liveDataStatus === "unavailable") {
    return "Live query history is temporarily unavailable. You can continue after reviewing your saved records.";
  }

  if (guard.liveDataStatus === "partial") {
    return "WQH is still checking live query history. Saved query records are shown below.";
  }

  if (guard.status === "warning") {
    const count = guard.counts.sameProjectActive;
    return `WQH found ${count === 1 ? "another active query" : `${count} active queries`} at this agency for this project.`;
  }

  if (guard.status === "possible_match") {
    return `WQH found query history that may belong to ${guard.agency.name}. Verify the agency before deciding what to do.`;
  }

  if (guard.status === "history") {
    return "WQH found previous or other-project query history at this agency.";
  }

  return "WQH did not find sent query history at this agency.";
}

function GuardIcon({ status }: { status: RenderableAgencyGuard["status"] }) {
  if (status === "possible_match") return <ShieldQuestion aria-hidden="true" />;
  if (status === "warning") return <AlertTriangle aria-hidden="true" />;
  return <Building2 aria-hidden="true" />;
}

export function AgencyGuardBadge({
  guard,
  compact = false,
}: {
  guard: RenderableAgencyGuard;
  compact?: boolean;
}) {
  if (guard.status === "clear" && guard.liveDataStatus === "available") {
    return null;
  }

  const label = getRenderedGuardLabel(guard);
  const compactLabel =
    guard.liveDataStatus === "unavailable"
      ? "Unavailable"
      : guard.liveDataStatus === "partial"
        ? "Checking"
        : guard.status === "warning"
          ? "Warning"
          : guard.status === "possible_match"
            ? "Possible match"
            : "History";

  return (
    <Badge
      aria-label={label}
      variant={guard.status === "warning" ? "destructive" : "secondary"}
    >
      <GuardIcon status={guard.status} />
      {compact ? compactLabel : label}
    </Badge>
  );
}

export function AgencyGuardDetails({
  guard,
  includeAllProjects = false,
  showClear = false,
}: {
  guard: RenderableAgencyGuard;
  includeAllProjects?: boolean;
  showClear?: boolean;
}) {
  const historyHeadingId = useId();

  if (
    !showClear &&
    guard.status === "clear" &&
    guard.liveDataStatus === "available"
  ) {
    return null;
  }

  const visibleRecords = includeAllProjects
    ? guard.records
    : guard.records.filter((record) => record.sameProject);

  return (
    <div className="flex flex-col gap-4">
      <Alert
        role={guard.status === "warning" ? "alert" : "status"}
        variant={guard.status === "warning" ? "destructive" : "muted"}
      >
        <GuardIcon status={guard.status} />
        <AlertTitle>{getRenderedGuardLabel(guard)}</AlertTitle>
        <AlertDescription>{getGuardSummary(guard)}</AlertDescription>
      </Alert>

      {visibleRecords.length > 0 ? (
        <section aria-labelledby={historyHeadingId} className="flex flex-col gap-3">
          <div>
            <h3 id={historyHeadingId} className="font-semibold text-accent">
              Query history
            </h3>
            <p className="text-sm leading-6 text-accent/72">
              Query history is shown for planning only. Check the agency’s current
              guidelines before acting.
            </p>
          </div>
          <ul className="flex flex-col gap-3">
            {visibleRecords.map((record) => (
              <li
                className="rounded-2xl border border-accent/10 bg-white/72 p-4"
                key={record.recordId}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-accent">
                      {record.agentName}
                    </p>
                    <p className="text-sm text-accent/72">{record.projectName}</p>
                    <p className="mt-1 text-sm font-medium text-accent">
                      {record.stageLabel}
                    </p>
                    <p className="text-xs text-accent/62">
                      {record.sameProject ? "Same project" : "Another project"}
                      {record.sentAt ? ` · Sent ${record.sentAt.split("T")[0]}` : ""}
                      {record.tracking === "live" ? " · Live status" : " · Manually tracked"}
                    </p>
                  </div>
                  <Button asChild size="sm" type="button" variant="outline">
                    <Link href={record.href}>
                      View
                      <ExternalLink data-icon="inline-end" />
                    </Link>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

export function AgencyGuardDetailsDialog({
  guard,
  children,
  originSurface = "query_dashboard",
}: {
  guard: RenderableAgencyGuard;
  children: React.ReactNode;
  originSurface?: "agent_card" | "agent_profile" | "query_dashboard" | "kanban_dialog";
}) {
  const [includeAllProjects, setIncludeAllProjects] = useState(false);
  const otherProjectCount =
    guard.counts.otherProjectActive + guard.counts.otherProjectTerminal;

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) return;
        captureQuerySafetyEvent("agency_guard_history_opened", {
          warningStatus: guard.status,
          matchMethod: guard.agency.matchMethod,
          originSurface,
        });
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[min(44rem,calc(100vh-2rem))] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Agency query history</DialogTitle>
          <DialogDescription>
            Review sent queries that WQH associated with this agency.
          </DialogDescription>
        </DialogHeader>
        <Separator />
        <AgencyGuardDetails
          guard={guard}
          includeAllProjects={includeAllProjects}
          showClear
        />
        {otherProjectCount > 0 ? (
          <Button
            className="w-fit"
            onClick={() => setIncludeAllProjects((current) => !current)}
            size="sm"
            type="button"
            variant="outline"
          >
            {includeAllProjects
              ? "Show this project only"
              : `Show all projects (${otherProjectCount})`}
          </Button>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

export function AgencyGuardConfirmationDialog({
  guard,
  isContinuing,
  onCancel,
  onContinue,
  open,
  unavailableMessage,
}: {
  guard: RenderableAgencyGuard | null;
  isContinuing: boolean;
  onCancel: () => void;
  onContinue: () => void;
  open: boolean;
  unavailableMessage?: string | null;
}) {
  return (
    <AlertDialog open={open} onOpenChange={(nextOpen) => !nextOpen && onCancel()}>
      <AlertDialogContent className="max-h-[min(44rem,calc(100vh-2rem))] overflow-y-auto sm:max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Review agency query history</AlertDialogTitle>
          <AlertDialogDescription>
            Sending is still your choice. Review the history before continuing.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {guard ? <AgencyGuardDetails guard={guard} showClear /> : null}
        {!guard && unavailableMessage ? (
          <Alert role="status" variant="muted">
            <ShieldQuestion aria-hidden="true" />
            <AlertTitle>Agency history unavailable</AlertTitle>
            <AlertDescription>{unavailableMessage}</AlertDescription>
          </Alert>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isContinuing}>
            Go back
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isContinuing}
            onClick={(event) => {
              event.preventDefault();
              onContinue();
            }}
          >
            {isContinuing ? "Checking again…" : "Continue anyway"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
