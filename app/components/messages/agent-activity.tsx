import {
  Activity,
  BarChart3,
  CalendarRange,
  CircleDot,
  Clock3,
  ShieldCheck,
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
  label: string;
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

function toDisplayLane(lane: AgentActivityLane, index: number): DisplayLane {
  return {
    currentStatus: lane.currentStatus,
    events: lane.events,
    isTerminal: lane.isTerminal,
    isViewer: false,
    label: `Anonymous query ${index + 1}`,
    laneId: lane.laneId,
    lastStatusOn: lane.lastStatusOn,
    sentOn: lane.sentOn,
  };
}

function getDisplayLanes(
  activityData: AgentActivityResponse,
  viewerRole: "agent" | "writer",
) {
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
    label: viewerRole === "writer" ? "Your query" : "This query",
    laneId: "viewer-query",
    lastStatusOn: toDay(viewerProgress.changedAt),
    sentOn: toDay(viewerProgress.sentAt),
  };
  const anonymousLanes = activityData.lanes
    .toSorted((left, right) => {
      const sentDateOrder = right.sentOn.localeCompare(left.sentOn);
      return sentDateOrder || left.laneId.localeCompare(right.laneId);
    })
    .map((lane, index) => toDisplayLane(lane, index));

  return [viewerLane, ...anonymousLanes].toSorted((left, right) => {
    const sentDateOrder = right.sentOn.localeCompare(left.sentOn);
    if (sentDateOrder) return sentDateOrder;
    if (left.isViewer !== right.isViewer) return left.isViewer ? -1 : 1;
    return left.laneId.localeCompare(right.laneId);
  });
}

function getRange(activityData: AgentActivityResponse, lanes: DisplayLane[]) {
  const end = parseDay(activityData.scope.to) ?? new Date();
  const scopedStart = parseDay(activityData.scope.from);
  if (scopedStart) return { end, start: scopedStart };

  let earliest = end;
  for (const lane of lanes) {
    const laneDate = parseDay(lane.sentOn);
    if (laneDate && laneDate < earliest) earliest = laneDate;
  }

  return {
    end,
    start:
      earliest.getTime() < end.getTime()
        ? earliest
        : new Date(end.getTime() - DAY_MS),
  };
}

function getPosition(value: string, start: Date, end: Date) {
  const date = parseDay(value);
  if (!date) return 0;

  const range = Math.max(1, end.getTime() - start.getTime());
  const offset = date.getTime() - start.getTime();
  return Math.min(100, Math.max(0, (offset / range) * 100));
}

function getTicks(start: Date, end: Date) {
  const count = 5;
  const range = end.getTime() - start.getTime();
  if (range <= 0) return [{ date: end, position: 100 }];

  return Array.from({ length: count }, (_, index) => {
    const ratio = index / (count - 1);
    return {
      date: new Date(start.getTime() + range * ratio),
      position: ratio * 100,
    };
  });
}

function formatTick(date: Date) {
  return <LocalDateTime value={date.toISOString()} variant="shortDate" />;
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
                <QueryStatusBadge compact status={status} />
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

function ActivityLegend({ lanes }: { lanes: DisplayLane[] }) {
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
          <QueryStatusBadge compact key={status} status={status} />
        ))}
      </div>
    </div>
  );
}

function ActivityLaneChart({
  activityData,
  lanes,
}: {
  activityData: AgentActivityResponse;
  lanes: DisplayLane[];
}) {
  const { end, start } = getRange(activityData, lanes);
  const ticks = getTicks(start, end);

  return (
    <div
      className="hidden md:block"
      role="img"
      aria-label="Anonymous query progress over time"
    >
      <div className="grid grid-cols-[9.5rem_minmax(0,1fr)_8rem] gap-3 px-3 pb-2 text-xs font-medium text-accent/72">
        <span>Query</span>
        <div className="relative h-5">
          {ticks.map((tick, index) => (
            <span
              className={cn(
                "absolute whitespace-nowrap",
                index === 0
                  ? "translate-x-0"
                  : index === ticks.length - 1
                    ? "-translate-x-full"
                    : "-translate-x-1/2",
              )}
              key={tick.date.toISOString()}
              style={{ left: `${tick.position}%` }}
            >
              {index === ticks.length - 1 ? "Today" : formatTick(tick.date)}
            </span>
          ))}
        </div>
        <span className="text-right">Current status</span>
      </div>
      <div className="flex flex-col gap-2">
        {lanes.map((lane) => {
          const startPosition = getPosition(lane.sentOn, start, end);
          const lineEndDate = lane.isTerminal
            ? lane.lastStatusOn
            : activityData.scope.to;
          const endPosition = getPosition(lineEndDate, start, end);
          const lineWidth = Math.max(1.5, endPosition - startPosition);

          return (
            <div
              className={cn(
                "grid min-h-14 grid-cols-[9.5rem_minmax(0,1fr)_8rem] items-center gap-3 rounded-[0.9rem] px-3 py-2",
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
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-accent">
                  {lane.label}
                </p>
                <p className="mt-0.5 text-xs text-accent/72">
                  Sent <LocalDateTime value={lane.sentOn} variant="shortDate" />
                </p>
              </div>
              <div aria-hidden className="relative h-8">
                {ticks.map((tick) => (
                  <span
                    className="absolute inset-y-0 w-px bg-accent/7"
                    key={tick.date.toISOString()}
                    style={{ left: `${tick.position}%` }}
                  />
                ))}
                <span
                  className={cn(
                    "absolute top-1/2 border-t-2 border-accent/34",
                    lane.isTerminal ? "border-solid" : "border-dashed",
                  )}
                  style={{
                    left: `${startPosition}%`,
                    width: `${lineWidth}%`,
                  }}
                />
                {lane.events.map((event, index) => {
                  const metadata = getQueryStatusMetadata(event.status);
                  const Icon = metadata.icon;
                  return (
                    <span
                      className={cn(
                        "absolute top-1/2 flex size-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border bg-white shadow-sm",
                        lane.isViewer
                          ? "border-accent text-accent"
                          : "border-accent/18 text-accent/68",
                      )}
                      key={`${event.occurredOn}-${event.status}-${index}`}
                      style={{
                        left: `${getPosition(event.occurredOn, start, end)}%`,
                      }}
                      title={metadata.label}
                    >
                      <Icon className="size-3" />
                    </span>
                  );
                })}
              </div>
              <div className="flex justify-end">
                <QueryStatusBadge compact status={lane.currentStatus} />
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-xs leading-5 text-accent/72">
        Dashed lines continue through the latest activity date for queries that
        remain active. Rows are sorted by sent date, newest first, and do not
        represent a reading queue.
      </p>
    </div>
  );
}

function ActivityLaneList({ lanes }: { lanes: DisplayLane[] }) {
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
              <p className="text-sm font-semibold text-accent">{lane.label}</p>
              <p className="mt-1 text-xs text-accent/72">
                Sent <LocalDateTime value={lane.sentOn} variant="date" />
                {lane.isTerminal ? " · Completed" : " · Still active"}
              </p>
            </div>
            <QueryStatusBadge compact status={lane.currentStatus} />
          </div>
          <ol className="mt-3 flex flex-col gap-2 border-l border-accent/12 pl-3">
            {lane.events.map((event, index) => {
              const metadata = getQueryStatusMetadata(event.status);
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
          <ActivityLaneList lanes={[viewerLane]} />
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

  const lanes = getDisplayLanes(activityData, viewerRole);
  const viewerPosition = lanes.findIndex((lane) => lane.isViewer) + 1;

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
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="text-base font-semibold text-accent">
                  {viewerRole === "writer"
                    ? "Anonymous query activity"
                    : "Query timelines"}
                </h3>
                <p className="text-sm text-accent/76">
                  {viewerRole === "writer"
                    ? `Your query is highlighted at row ${viewerPosition} of ${lanes.length} by sent date; every other row is anonymous.`
                    : "This query is highlighted in its sent-date position; other rows are anonymous."}
                </p>
              </div>
              <p className="text-xs text-accent/72">
                Updated <LocalDateTime value={activityData.asOf} />
              </p>
            </div>
            <div className="mt-4 flex flex-col gap-4">
              <ActivityLegend lanes={lanes} />
              <ActivityLaneChart activityData={activityData} lanes={lanes} />
              <div className="md:hidden">
                <ActivityLaneList lanes={lanes} />
              </div>
              <details className="mt-4 hidden rounded-[1rem] border border-accent/10 bg-white/48 p-4 md:block">
                <summary className="cursor-pointer text-sm font-semibold text-accent outline-none focus-visible:ring-[4px] focus-visible:ring-ring/30">
                  View as accessible list
                </summary>
                <div className="mt-4">
                  <ActivityLaneList lanes={lanes} />
                </div>
              </details>
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
