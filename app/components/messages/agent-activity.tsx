import {
  Activity,
  BarChart3,
  CalendarRange,
  CircleDot,
  Clock3,
  ShieldCheck,
  UserRoundPen,
  UsersRound,
} from "lucide-react";
import Link from "next/link";

import {
  QUERY_STATUS_CODES,
  QueryStatusBadge,
  formatDayCount,
  getQueryStatusMetadata,
} from "@/app/components/messages/query-lifecycle";
import { LocalDateTime } from "@/app/components/messages/local-date-time";
import { Button } from "@/app/ui-primitives/button";
import { Separator } from "@/app/ui-primitives/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/app/ui-primitives/tooltip";
import { cn } from "@/app/utils";
import type {
  AgentActivityBenchmark,
  AgentActivityLane,
  AgentActivityResponse,
  AgentActivityWindow,
  QueryStatusCode,
} from "@/app/utils/message-types";

const ACTIVITY_WINDOWS: Array<{
  label: string;
  value: AgentActivityWindow;
}> = [
  { label: "30 days", value: "30" },
  { label: "90 days", value: "90" },
  { label: "180 days", value: "180" },
  { label: "All", value: "all" },
];
const DAY_MS = 24 * 60 * 60 * 1000;

type DisplayLaneEvent = {
  elapsedDays: number | null;
  occurredOn: string;
  status: QueryStatusCode;
};

type DisplayLane = {
  currentStatus: QueryStatusCode;
  events: DisplayLaneEvent[];
  isTerminal: boolean;
  isViewer: boolean;
  laneId: string;
  lastStatusOn: string;
  sentOn: string;
};

function toDay(value: string) {
  return value.slice(0, 10);
}

function parseDay(value?: string | null) {
  if (!value) return null;
  const date = new Date(`${value.slice(0, 10)}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toDisplayLane(lane: AgentActivityLane): DisplayLane {
  return {
    currentStatus: lane.currentStatus,
    events: lane.events,
    isTerminal: lane.isTerminal,
    isViewer: false,
    laneId: lane.laneId,
    lastStatusOn: lane.lastStatusOn,
    sentOn: lane.sentOn,
  };
}

function getDisplayLanes(activityData: AgentActivityResponse) {
  const viewerProgress = activityData.viewerQuery.queryProgress;
  const viewerEvents = activityData.viewerQuery.events.map(
    (event, index, events) => {
      const occurredOn = toDay(event.occurredAt);
      const currentDate = parseDay(occurredOn);
      const previousDate =
        index > 0 ? parseDay(events[index - 1].occurredAt) : null;
      const elapsedDays =
        currentDate && previousDate
          ? Math.max(
              0,
              Math.round(
                (currentDate.getTime() - previousDate.getTime()) /
                  (24 * 60 * 60 * 1000),
              ),
            )
          : null;

      return {
        elapsedDays,
        occurredOn,
        status: event.toStatus,
      };
    },
  );
  const viewerLane: DisplayLane = {
    currentStatus: viewerProgress.currentCode,
    events: viewerEvents,
    isTerminal: viewerProgress.isTerminal,
    isViewer: true,
    laneId: "viewer-query",
    lastStatusOn: toDay(viewerProgress.changedAt),
    sentOn: toDay(viewerProgress.sentAt),
  };
  const anonymousLanes = activityData.lanes
    .toSorted((left, right) => {
      const sentDateOrder = right.sentOn.localeCompare(left.sentOn);
      return sentDateOrder || left.laneId.localeCompare(right.laneId);
    })
    .map(toDisplayLane);

  return [viewerLane, ...anonymousLanes].toSorted((left, right) => {
    const sentDateOrder = right.sentOn.localeCompare(left.sentOn);
    if (sentDateOrder) return sentDateOrder;
    if (left.isViewer !== right.isViewer) return left.isViewer ? -1 : 1;
    return left.laneId.localeCompare(right.laneId);
  });
}

function getElapsedDays(startValue: string, endValue: string) {
  const start = parseDay(startValue);
  const end = parseDay(endValue);
  if (!start || !end) return 0;

  return Math.max(
    0,
    Math.round((end.getTime() - start.getTime()) / DAY_MS),
  );
}

function getElapsedPosition(elapsedDays: number, maxElapsedDays: number) {
  return Math.min(100, Math.max(0, (elapsedDays / maxElapsedDays) * 100));
}

function WriterLaneIdentity({ isViewer }: { isViewer: boolean }) {
  const label = isViewer ? "Your query" : "Writer query";

  return (
    <div className="flex items-center gap-2">
      <span
        aria-label={label}
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full border",
          isViewer
            ? "border-accent bg-accent text-white"
            : "border-accent/12 bg-white/72 text-accent/68",
        )}
        role="img"
        title={label}
      >
        <UserRoundPen aria-hidden className="size-4" />
      </span>
      {isViewer ? (
        <span className="text-sm font-semibold text-accent">Your query</span>
      ) : null}
    </div>
  );
}

function ActivityWindowControls({
  activeWindow,
  getWindowHref,
}: {
  activeWindow: AgentActivityWindow;
  getWindowHref: (window: AgentActivityWindow) => string;
}) {
  return (
    <nav
      aria-label="Agent activity date range"
      className="flex flex-wrap gap-2"
    >
      {ACTIVITY_WINDOWS.map((window) => (
        <Button
          asChild
          key={window.value}
          size="sm"
          variant={activeWindow === window.value ? "secondary" : "ghost"}
        >
          <Link
            aria-current={activeWindow === window.value ? "page" : undefined}
            href={getWindowHref(window.value)}
          >
            {window.label}
          </Link>
        </Button>
      ))}
    </nav>
  );
}

function SummaryMetric({
  description,
  icon: Icon,
  label,
  value,
}: {
  description: string;
  icon: typeof Activity;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-[1.1rem] border border-accent/10 bg-white/64 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-2xl font-semibold text-accent">{value}</p>
          <p className="mt-1 text-sm font-semibold text-accent">{label}</p>
        </div>
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-accent/10 bg-accent/6 text-accent/68">
          <Icon aria-hidden className="size-4" />
        </span>
      </div>
      <p className="mt-2 text-xs leading-5 text-accent/76">{description}</p>
    </div>
  );
}

function BenchmarkCard({
  benchmark,
  label,
}: {
  benchmark: AgentActivityBenchmark | null;
  label: string;
}) {
  return (
    <div className="rounded-[1rem] border border-accent/10 bg-white/54 p-3">
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-accent/72">
        {label}
      </p>
      {benchmark && benchmark.medianDays !== null ? (
        <>
          <p className="mt-1 text-base font-semibold text-accent">
            {formatDayCount(benchmark.medianDays)} median
          </p>
          <p className="mt-1 text-xs leading-5 text-accent/76">
            Middle 50%: {formatDayCount(benchmark.p25Days)}–
            {formatDayCount(benchmark.p75Days)} · {benchmark.sampleSize}{" "}
            {benchmark.sampleSize === 1 ? "query" : "queries"}
          </p>
        </>
      ) : (
        <p className="mt-1 text-sm leading-6 text-accent/76">
          Not enough completed activity yet.
        </p>
      )}
    </div>
  );
}

function AgentActivitySummaryCards({
  activityData,
  viewerRole,
}: {
  activityData: AgentActivityResponse;
  viewerRole: "agent" | "writer";
}) {
  const summary = activityData.summary;
  if (!summary) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryMetric
          description="Write Query Hook queries sent in this date range."
          icon={UsersRound}
          label="Queries"
          value={summary.totalQueries}
        />
        <SummaryMetric
          description="Queries without a terminal outcome as of this update."
          icon={Activity}
          label="Still active"
          value={summary.activeQueries}
        />
        <SummaryMetric
          description="Queries with a recorded terminal outcome."
          icon={CircleDot}
          label="Completed"
          value={summary.terminalQueries}
        />
        <SummaryMetric
          description={`Queries sent before ${viewerRole === "writer" ? "yours" : "this one"} that remain active—not a queue position.`}
          icon={Clock3}
          label="Earlier & active"
          value={summary.priorSentStillActive}
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <BenchmarkCard
          benchmark={summary.durations.timeToFirstView}
          label="Time to first view"
        />
        <BenchmarkCard
          benchmark={summary.durations.timeToTerminal}
          label="Time to recorded outcome"
        />
      </div>

      <div className="rounded-[1rem] border border-accent/10 bg-white/54 p-3">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-accent/72">
          Recorded statuses
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {QUERY_STATUS_CODES.map((status) => {
            const count = summary.statusCounts[status];
            return count > 0 ? (
              <span
                className="inline-flex items-center gap-2 rounded-full border border-accent/10 bg-white/72 py-1 pl-1 pr-2.5"
                key={status}
              >
                <QueryStatusBadge
                  compact
                  status={status}
                  viewerRole={viewerRole}
                />
                <span className="text-xs font-semibold text-accent/76">
                  {count}
                </span>
              </span>
            ) : null;
          })}
        </div>
      </div>
    </div>
  );
}

function ActivityLegend({
  lanes,
  viewerRole,
}: {
  lanes: DisplayLane[];
  viewerRole: "agent" | "writer";
}) {
  const visibleStatuses = QUERY_STATUS_CODES.filter((status) =>
    lanes.some(
      (lane) =>
        lane.currentStatus === status ||
        lane.events.some((event) => event.status === status),
    ),
  );

  if (visibleStatuses.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-accent/72">
        Status key
      </p>
      <div className="flex flex-wrap gap-2">
        {visibleStatuses.map((status) => (
          <QueryStatusBadge
            compact
            key={status}
            status={status}
            viewerRole={viewerRole}
          />
        ))}
      </div>
    </div>
  );
}

function ActivityLaneChart({
  activityData,
  lanes,
  viewerRole,
}: {
  activityData: AgentActivityResponse;
  lanes: DisplayLane[];
  viewerRole: "agent" | "writer";
}) {
  const maxElapsedDays = Math.max(
    1,
    ...lanes.map((lane) =>
      getElapsedDays(
        lane.sentOn,
        lane.isTerminal ? lane.lastStatusOn : activityData.scope.to,
      ),
    ),
  );

  return (
    <div className="hidden md:block">
      <div className="grid grid-cols-[8rem_minmax(0,1fr)_8rem] gap-3 px-3 pb-2 text-xs font-medium text-accent/72">
        <span>Writer</span>
        <span className="px-3">Sent</span>
        <span className="text-right">Current status</span>
      </div>
      <div className="flex flex-col gap-2">
        {lanes.map((lane) => {
          const lineEndDate = lane.isTerminal
            ? lane.lastStatusOn
            : activityData.scope.to;
          const elapsedToEnd = getElapsedDays(lane.sentOn, lineEndDate);
          const lineWidth = Math.max(
            1.5,
            getElapsedPosition(elapsedToEnd, maxElapsedDays),
          );

          return (
            <div
              className={cn(
                "grid min-h-14 grid-cols-[8rem_minmax(0,1fr)_8rem] items-center gap-3 rounded-[0.9rem] px-3 py-2",
                lane.isViewer
                  ? "border border-accent/16 bg-accent/6"
                  : "border border-transparent bg-white/42",
              )}
              key={lane.laneId}
              style={
                lane.isViewer
                  ? undefined
                  : { containIntrinsicSize: "56px", contentVisibility: "auto" }
              }
            >
              <div className="flex min-w-0 flex-col gap-1">
                <WriterLaneIdentity isViewer={lane.isViewer} />
                <p className="mt-0.5 text-xs text-accent/72">
                  Sent <LocalDateTime value={lane.sentOn} variant="shortDate" />
                </p>
              </div>
              <div
                aria-label="Query status milestones"
                className="relative mx-3 h-8"
              >
                <span
                  aria-hidden
                  className={cn(
                    "absolute top-1/2 border-t-2 border-accent/34",
                    lane.isTerminal ? "border-solid" : "border-dashed",
                  )}
                  style={{
                    left: 0,
                    width: `${lineWidth}%`,
                  }}
                />
                {lane.events.map((event, index) => {
                  const metadata = getQueryStatusMetadata(
                    event.status,
                    viewerRole,
                  );
                  const Icon = metadata.icon;
                  const elapsedDays = getElapsedDays(
                    lane.sentOn,
                    event.occurredOn,
                  );
                  return (
                    <Tooltip
                      key={`${event.occurredOn}-${event.status}-${index}`}
                    >
                      <TooltipTrigger
                        aria-label={metadata.label}
                        className={cn(
                          "absolute top-1/2 flex size-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border bg-white shadow-sm outline-none focus-visible:ring-[4px] focus-visible:ring-ring/30",
                          lane.isViewer
                            ? "border-accent text-accent"
                            : "border-accent/18 text-accent/68",
                        )}
                        style={{
                          left: `${getElapsedPosition(
                            elapsedDays,
                            maxElapsedDays,
                          )}%`,
                        }}
                        type="button"
                      >
                        <Icon aria-hidden className="size-3" />
                      </TooltipTrigger>
                      <TooltipContent side="top" sideOffset={6}>
                        <p>{metadata.label}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
              <div className="flex justify-end">
                <QueryStatusBadge
                  compact
                  status={lane.currentStatus}
                  viewerRole={viewerRole}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ActivityLaneList({
  lanes,
  viewerRole,
}: {
  lanes: DisplayLane[];
  viewerRole: "agent" | "writer";
}) {
  return (
    <ol className="flex flex-col gap-3">
      {lanes.map((lane) => (
        <li
          className={cn(
            "rounded-[1rem] border p-3",
            lane.isViewer
              ? "border-accent/18 bg-accent/6"
              : "border-accent/10 bg-white/54",
          )}
          key={lane.laneId}
          style={
            lane.isViewer
              ? undefined
              : { containIntrinsicSize: "140px", contentVisibility: "auto" }
          }
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <WriterLaneIdentity isViewer={lane.isViewer} />
              <p className="mt-1 text-xs text-accent/72">
                Sent <LocalDateTime value={lane.sentOn} variant="date" />
                {lane.isTerminal ? " · Completed" : " · Still active"}
              </p>
            </div>
            <QueryStatusBadge
              compact
              status={lane.currentStatus}
              viewerRole={viewerRole}
            />
          </div>
          <ol className="mt-3 flex flex-col gap-2 border-l border-accent/12 pl-3">
            {lane.events.map((event, index) => {
              const metadata = getQueryStatusMetadata(
                event.status,
                viewerRole,
              );
              return (
                <li
                  className="text-xs leading-5 text-accent/76"
                  key={`${event.occurredOn}-${event.status}-${index}`}
                >
                  <span className="font-medium text-accent/78">
                    {metadata.label}
                  </span>{" "}
                  · <LocalDateTime value={event.occurredOn} variant="date" />
                  {index > 0 && event.elapsedDays !== null
                    ? ` · ${formatDayCount(event.elapsedDays)} after the previous milestone`
                    : ""}
                </li>
              );
            })}
          </ol>
        </li>
      ))}
    </ol>
  );
}

function PrivacyFallback({
  activityData,
  lanes,
  viewerRole,
}: {
  activityData: AgentActivityResponse;
  lanes: DisplayLane[];
  viewerRole: "agent" | "writer";
}) {
  const viewerLane = lanes.find((lane) => lane.isViewer);

  return (
    <div className="flex min-h-64 flex-col gap-5 rounded-[1.25rem] border border-accent/10 bg-white/54 px-5 py-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex size-11 items-center justify-center rounded-full border border-accent/10 bg-accent/6 text-accent/68">
          <ShieldCheck aria-hidden className="size-5" />
        </span>
        <div className="max-w-lg">
          <h3 className="text-base font-semibold text-accent">
            More activity is needed for a private comparison
          </h3>
          <p className="mt-2 text-sm leading-6 text-accent/76">
            Fewer than {activityData.privacy.minimumSampleSize} distinct writers
            have qualifying queries in this range. More are required before
            anonymous agent-wide details appear.
          </p>
        </div>
      </div>
      {viewerRole === "writer" && viewerLane ? (
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-2">
          <p className="text-sm font-semibold text-accent">
            Your query remains visible
          </p>
          <ActivityLaneList lanes={[viewerLane]} viewerRole={viewerRole} />
        </div>
      ) : null}
    </div>
  );
}

export function AgentActivityLoading() {
  return (
    <section
      aria-busy="true"
      aria-labelledby="agent-activity-loading-heading"
      className="glass-panel-strong p-4 md:p-6"
    >
      <h2
        className="text-xl font-semibold text-accent"
        id="agent-activity-loading-heading"
      >
        Agent activity
      </h2>
      <div className="mt-4 flex min-h-48 flex-col items-center justify-center gap-3 rounded-[1.1rem] border border-accent/10 bg-white/54 px-5 py-8 text-center">
        <BarChart3
          aria-hidden
          className="size-7 animate-pulse text-accent/68"
        />
        <p className="text-sm font-medium text-accent/72">
          Loading the private comparison…
        </p>
      </div>
    </section>
  );
}

export function AgentActivityPanel({
  activityData,
  activeWindow,
  getWindowHref,
  viewerRole,
}: {
  activityData: AgentActivityResponse | null;
  activeWindow: AgentActivityWindow;
  getWindowHref: (window: AgentActivityWindow) => string;
  viewerRole: "agent" | "writer";
}) {
  if (!activityData) {
    return (
      <section
        aria-labelledby="agent-activity-heading"
        className="glass-panel-strong p-4 md:p-6"
      >
        <h2
          className="text-xl font-semibold text-accent"
          id="agent-activity-heading"
        >
          Agent activity
        </h2>
        <div className="mt-4 flex min-h-48 flex-col items-center justify-center gap-3 rounded-[1.1rem] border border-accent/10 bg-white/54 px-5 py-8 text-center">
          <BarChart3 aria-hidden className="size-7 text-accent/48" />
          <p className="max-w-md text-sm leading-6 text-accent/76">
            {viewerRole === "writer"
              ? "Agent activity is temporarily unavailable. Your conversation is still available."
              : "Agent-wide activity is temporarily unavailable. This query’s exact timeline above is still complete."}
          </p>
        </div>
      </section>
    );
  }

  const lanes = getDisplayLanes(activityData);

  return (
    <section
      aria-labelledby="agent-activity-heading"
      className="glass-panel-strong flex flex-col gap-5 p-4 md:p-6"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-accent/72">
            <CalendarRange aria-hidden className="size-3.5" />
            Write Query Hook activity only
          </p>
          <h2
            className="mt-1 text-xl font-semibold text-accent"
            id="agent-activity-heading"
          >
            Agent activity
          </h2>
          <p className="mt-2 text-sm leading-6 text-accent/76">
            Each row is one Write Query Hook query. Other writers remain
            anonymous while recorded milestones show how far each query has
            moved through the agent’s process.
          </p>
        </div>
        <ActivityWindowControls
          activeWindow={activeWindow}
          getWindowHref={getWindowHref}
        />
      </div>

      <Separator />

      {activityData.privacy.detailsAvailable ? (
        <>
          {viewerRole === "agent" && activityData.summary ? (
            <>
              <AgentActivitySummaryCards
                activityData={activityData}
                viewerRole={viewerRole}
              />
              <Separator />
            </>
          ) : null}
          <div>
            <div className="flex justify-end">
              <p className="text-xs text-accent/72">
                Updated <LocalDateTime value={activityData.asOf} />
              </p>
            </div>
            <div className="mt-4 flex flex-col gap-4">
              <ActivityLegend lanes={lanes} viewerRole={viewerRole} />
              <ActivityLaneChart
                activityData={activityData}
                lanes={lanes}
                viewerRole={viewerRole}
              />
              <div className="md:hidden">
                <ActivityLaneList lanes={lanes} viewerRole={viewerRole} />
              </div>
            </div>
          </div>
        </>
      ) : (
        <PrivacyFallback
          activityData={activityData}
          lanes={lanes}
          viewerRole={viewerRole}
        />
      )}
    </section>
  );
}
