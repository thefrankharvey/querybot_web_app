import type { ComponentType, ReactNode } from "react";
import {
  BookOpenCheck,
  CalendarClock,
  ChevronDown,
  CircleDotDashed,
  CircleX,
  Clock3,
  Eye,
  FilePlus2,
  Handshake,
  MessageSquareText,
  Send,
  TimerOff,
  UserRoundCheck,
} from "lucide-react";
import Link from "next/link";

import { LocalDateTime } from "@/app/components/messages/local-date-time";
import { Button } from "@/app/ui-primitives/button";
import { Separator } from "@/app/ui-primitives/separator";
import { cn } from "@/app/utils";
import {
  KNOWN_QUERY_STATUS_CODES,
  type KnownQueryStatusCode,
  type QueryNextAction,
  type QueryProgress,
  type QueryTimelineEvent,
} from "@/app/utils/message-types";

export const QUERY_STATUS_CODES = KNOWN_QUERY_STATUS_CODES;

export type QueryLifecycleStatus = KnownQueryStatusCode;
export type QueryLifecycleNextAction = QueryNextAction;
export type QueryProgressLike = QueryProgress;
export type QueryTimelineEventLike = QueryTimelineEvent;

type StatusIcon = ComponentType<{
  "aria-hidden"?: boolean;
  className?: string;
}>;

export type QueryStatusMetadata = {
  description: string;
  icon: StatusIcon;
  label: string;
  shortLabel: string;
  tone: "active" | "muted" | "negative" | "positive";
};

export const QUERY_STATUS_METADATA: Record<
  QueryLifecycleStatus,
  QueryStatusMetadata
> = {
  query_sent: {
    description: "The query has been delivered to the agent.",
    icon: Send,
    label: "Query sent",
    shortLabel: "Sent",
    tone: "active",
  },
  query_viewed: {
    description: "The agent has opened this query.",
    icon: Eye,
    label: "Viewed by agent",
    shortLabel: "Viewed",
    tone: "active",
  },
  manuscript_requested: {
    description: "The agent requested manuscript material.",
    icon: FilePlus2,
    label: "Manuscript requested",
    shortLabel: "Requested",
    tone: "active",
  },
  manuscript_under_review: {
    description: "The agent is reviewing the requested manuscript.",
    icon: BookOpenCheck,
    label: "Manuscript under review",
    shortLabel: "Under review",
    tone: "active",
  },
  rejected: {
    description: "The agent has passed on this query.",
    icon: CircleX,
    label: "Agent passed",
    shortLabel: "Passed",
    tone: "negative",
  },
  closed_no_response: {
    description: "This query closed without a recorded response.",
    icon: TimerOff,
    label: "No response recorded",
    shortLabel: "No response",
    tone: "muted",
  },
  offer_of_representation: {
    description: "The agent recorded an offer of representation.",
    icon: Handshake,
    label: "Offer received",
    shortLabel: "Offer",
    tone: "positive",
  },
};

const UNKNOWN_STATUS_METADATA: QueryStatusMetadata = {
  description: "A recognized query status is not available yet.",
  icon: CircleDotDashed,
  label: "Status unavailable",
  shortLabel: "Unavailable",
  tone: "muted",
};

export function isQueryLifecycleStatus(
  value: string,
): value is QueryLifecycleStatus {
  return QUERY_STATUS_CODES.some((code) => code === value);
}

export function getQueryStatusMetadata(
  status: string | null | undefined,
): QueryStatusMetadata {
  return status && isQueryLifecycleStatus(status)
    ? QUERY_STATUS_METADATA[status]
    : UNKNOWN_STATUS_METADATA;
}

export function getElapsedDays(
  startValue?: string | null,
  endValue?: string | null,
) {
  if (!startValue) return null;

  const start = new Date(startValue);
  const end = endValue ? new Date(endValue) : new Date();
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }

  return Math.max(
    0,
    Math.floor((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)),
  );
}

export function formatDayCount(days: number | null) {
  if (days === null) return "Duration unavailable";
  return `${days} ${days === 1 ? "day" : "days"}`;
}

function getStatusToneClass(tone: QueryStatusMetadata["tone"]) {
  switch (tone) {
    case "negative":
      return "border-accent/14 bg-accent/6 text-accent/76";
    case "positive":
      return "border-accent bg-accent text-white";
    case "active":
      return "border-accent/16 bg-accent/8 text-accent";
    default:
      return "border-accent/10 bg-white/72 text-accent/76";
  }
}

export function QueryStatusBadge({
  compact = false,
  status,
}: {
  compact?: boolean;
  status: string | null | undefined;
}) {
  const metadata = getQueryStatusMetadata(status);
  const Icon = metadata.icon;

  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-full border font-semibold",
        compact ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm",
        getStatusToneClass(metadata.tone),
      )}
      title={metadata.description}
    >
      <Icon aria-hidden className={compact ? "size-3.5" : "size-4"} />
      {compact ? metadata.shortLabel : metadata.label}
    </span>
  );
}

function getNextActionCopy(
  nextAction: QueryLifecycleNextAction | null,
  viewerRole: "agent" | "writer",
) {
  if (!nextAction?.owner) return "No action scheduled";
  if (nextAction.owner === viewerRole) return "Your action";
  if (nextAction.owner === "agent") return "Waiting on the agent";
  if (nextAction.owner === "writer") return "Waiting on the writer";
  return "Waiting for an update";
}

export function QueryNextAction({
  compact = false,
  nextAction,
  viewerRole,
}: {
  compact?: boolean;
  nextAction: QueryLifecycleNextAction | null;
  viewerRole: "agent" | "writer";
}) {
  const copy = getNextActionCopy(nextAction, viewerRole);
  const isViewerAction = nextAction?.owner === viewerRole;
  const Icon = isViewerAction ? UserRoundCheck : Clock3;

  return (
    <div
      className={cn(
        "flex min-w-0 items-start gap-2",
        compact ? "text-xs" : "text-sm",
      )}
    >
      <Icon
        aria-hidden
        className={cn(
          "mt-0.5 shrink-0",
          compact ? "size-3.5" : "size-4",
          nextAction?.overdueAtFetch ? "text-destructive" : "text-accent/72",
        )}
      />
      <div className="min-w-0">
        <p
          className={cn(
            "font-medium",
            nextAction?.overdueAtFetch ? "text-destructive" : "text-accent/76",
          )}
        >
          {nextAction?.overdueAtFetch ? "Overdue · " : ""}
          {copy}
        </p>
        {nextAction?.dueAt ? (
          <p className="mt-0.5 text-accent/76">
            Due <LocalDateTime value={nextAction.dueAt} />
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function QueryInboxMeta({
  changedAt,
  lastMessageSenderRole,
  nextAction,
  progress,
  unreadCount,
  viewerRole,
}: {
  changedAt?: string | null;
  lastMessageSenderRole?: string | null;
  nextAction?: QueryLifecycleNextAction | null;
  progress?: QueryProgressLike | null;
  unreadCount?: number;
  viewerRole: "agent" | "writer";
}) {
  const statusChangedAt = changedAt ?? progress?.changedAt ?? null;
  const daysInStatus = getElapsedDays(statusChangedAt);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <QueryStatusBadge compact status={progress?.currentCode} />
        {unreadCount && unreadCount > 0 ? (
          <span className="inline-flex rounded-full border border-accent bg-accent px-2.5 py-1 text-xs font-semibold text-white">
            {unreadCount} unread
          </span>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-accent/76">
        {statusChangedAt ? (
          <span>
            Updated <LocalDateTime value={statusChangedAt} variant="date" />
            {daysInStatus !== null
              ? ` · ${formatDayCount(daysInStatus)} in stage`
              : ""}
          </span>
        ) : null}
        {lastMessageSenderRole ? (
          <span>
            Last message:{" "}
            {lastMessageSenderRole === viewerRole
              ? "you"
              : lastMessageSenderRole}
          </span>
        ) : null}
      </div>
      <QueryNextAction
        compact
        nextAction={nextAction ?? progress?.nextAction ?? null}
        viewerRole={viewerRole}
      />
    </div>
  );
}

function ProgressDate({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-accent/72">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-accent">
        {value ? <LocalDateTime value={value} variant="date" /> : "Not yet"}
      </p>
    </div>
  );
}

export function QueryProgressSummary({
  progress,
  viewerRole,
}: {
  progress: QueryProgressLike | null | undefined;
  viewerRole: "agent" | "writer";
}) {
  if (!progress) {
    return (
      <div className="rounded-[1rem] border border-accent/10 bg-white/56 p-4 text-sm leading-6 text-accent/76">
        Query progress is not available for this conversation yet.
      </div>
    );
  }

  const daysSinceSent = getElapsedDays(progress.sentAt);
  const daysInStatus = getElapsedDays(progress.changedAt);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-start gap-2">
        <QueryStatusBadge status={progress.currentCode} />
        <p className="text-sm leading-6 text-accent/76">
          {formatDayCount(daysInStatus)} in this stage
          {daysSinceSent !== null
            ? ` · ${formatDayCount(daysSinceSent)} since sent`
            : ""}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 rounded-[1rem] border border-accent/10 bg-white/56 p-3">
        <ProgressDate label="Sent" value={progress.sentAt} />
        <ProgressDate label="Viewed" value={progress.viewedAt} />
      </div>

      {progress.isTerminal ? (
        <div className="flex items-start gap-2 text-sm text-accent/76">
          <UserRoundCheck aria-hidden className="mt-0.5 size-4 shrink-0" />
          <p>This query is complete. The conversation remains available.</p>
        </div>
      ) : (
        <QueryNextAction
          nextAction={progress.nextAction}
          viewerRole={viewerRole}
        />
      )}
    </div>
  );
}

function getActorLabel(actorRole?: string | null) {
  if (actorRole === "agent") return "Agent";
  if (actorRole === "writer") return "Writer";
  return "System";
}

function TimelineEventItem({
  event,
  isLast,
  messageHref,
}: {
  event: QueryTimelineEventLike;
  isLast: boolean;
  messageHref?: string;
}) {
  const metadata = getQueryStatusMetadata(event.toStatus);
  const Icon = metadata.icon;
  const recordedDelay = getElapsedDays(event.occurredAt, event.recordedAt);

  return (
    <li className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3">
      <div className="flex flex-col items-center">
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full border",
            getStatusToneClass(metadata.tone),
          )}
        >
          <Icon aria-hidden className="size-4" />
        </span>
        {!isLast ? (
          <span aria-hidden className="my-1 min-h-6 w-px flex-1 bg-accent/14" />
        ) : null}
      </div>
      <div className={cn("min-w-0", isLast ? "pb-0" : "pb-5")}>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
          <p className="text-sm font-semibold text-accent">{metadata.label}</p>
          <p className="shrink-0 text-xs text-accent/72">
            Version {event.statusVersion}
          </p>
        </div>
        <dl className="mt-2 flex flex-col gap-1 text-xs leading-5 text-accent/76">
          <div className="flex flex-wrap gap-x-2">
            <dt className="font-medium text-accent/72">Occurred</dt>
            <dd>
              <LocalDateTime value={event.occurredAt} />
            </dd>
          </div>
          <div className="flex flex-wrap gap-x-2">
            <dt className="font-medium text-accent/72">Recorded</dt>
            <dd>
              <LocalDateTime value={event.recordedAt} />
              {recordedDelay && recordedDelay > 0
                ? ` · ${formatDayCount(recordedDelay)} later`
                : ""}
            </dd>
          </div>
          <div className="flex flex-wrap gap-x-2">
            <dt className="font-medium text-accent/72">By</dt>
            <dd>{getActorLabel(event.actorRole)}</dd>
          </div>
        </dl>
        {event.note ? (
          <p className="mt-2 text-sm leading-6 text-accent/72 [overflow-wrap:anywhere]">
            {event.note}
          </p>
        ) : null}
        {event.dueAt ? (
          <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-accent/76">
            <CalendarClock aria-hidden className="size-3.5" />
            Due <LocalDateTime value={event.dueAt} />
          </p>
        ) : null}
        {messageHref && event.sourceMessageId ? (
          <Link
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-accent underline decoration-accent/25 underline-offset-4 hover:decoration-accent"
            href={messageHref}
          >
            <MessageSquareText aria-hidden className="size-3.5" />
            View linked message
          </Link>
        ) : null}
      </div>
    </li>
  );
}

export function QueryTimelineList({
  emptyMessage = "No lifecycle events have been recorded yet.",
  events,
  getMessageHref,
  limit,
}: {
  emptyMessage?: string;
  events: readonly QueryTimelineEventLike[];
  getMessageHref?: (sourceMessageId: string) => string;
  limit?: number;
}) {
  const visibleEvents =
    typeof limit === "number" ? events.slice(-limit) : events;

  if (visibleEvents.length === 0) {
    return (
      <p className="rounded-[1rem] border border-accent/10 bg-white/56 p-4 text-sm leading-6 text-accent/76">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ol className="flex flex-col">
      {visibleEvents.map((event, index) => (
        <TimelineEventItem
          event={event}
          isLast={index === visibleEvents.length - 1}
          key={event.eventId}
          messageHref={
            event.sourceMessageId && getMessageHref
              ? getMessageHref(event.sourceMessageId)
              : undefined
          }
        />
      ))}
    </ol>
  );
}

export function QueryProgressRail({
  actions,
  events,
  progress,
  timelineHref,
  viewerRole,
}: {
  actions?: ReactNode;
  events: readonly QueryTimelineEventLike[];
  progress: QueryProgressLike | null | undefined;
  timelineHref: string;
  viewerRole: "agent" | "writer";
}) {
  return (
    <section
      aria-labelledby="query-progress-heading"
      className="glass-panel-strong flex flex-col gap-4 p-4"
    >
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-accent/72">
          Live query record
        </p>
        <h2
          className="mt-1 text-base font-semibold text-accent"
          id="query-progress-heading"
        >
          Query progress
        </h2>
      </div>
      <QueryProgressSummary progress={progress} viewerRole={viewerRole} />
      {actions ? (
        <>
          <Separator />
          {actions}
        </>
      ) : null}
      <Separator />
      <div>
        <h3 className="text-sm font-semibold text-accent">Recent activity</h3>
        <div className="mt-3">
          <QueryTimelineList events={events} limit={3} />
        </div>
      </div>
      <Button asChild size="sm" variant="outline">
        <Link href={timelineHref}>View agent activity</Link>
      </Button>
    </section>
  );
}

export function MobileQueryProgress({
  actions,
  events,
  progress,
  timelineHref,
  viewerRole,
}: {
  actions?: ReactNode;
  events: readonly QueryTimelineEventLike[];
  progress: QueryProgressLike | null | undefined;
  timelineHref: string;
  viewerRole: "agent" | "writer";
}) {
  return (
    <details className="glass-panel-strong group p-4 xl:hidden">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-[0.75rem] outline-none focus-visible:ring-[4px] focus-visible:ring-ring/30 [&::-webkit-details-marker]:hidden">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-accent/72">
            Query progress
          </p>
          <div className="mt-1">
            <QueryStatusBadge compact status={progress?.currentCode} />
          </div>
        </div>
        <ChevronDown
          aria-hidden
          className="size-5 shrink-0 text-accent/56 transition group-open:rotate-180"
        />
      </summary>
      <div className="mt-4 flex flex-col gap-4 border-t border-accent/10 pt-4">
        <QueryProgressSummary progress={progress} viewerRole={viewerRole} />
        {actions ? (
          <>
            <Separator />
            {actions}
          </>
        ) : null}
        <Separator />
        <div>
          <h3 className="text-sm font-semibold text-accent">Recent activity</h3>
          <div className="mt-3">
            <QueryTimelineList events={events} limit={3} />
          </div>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link href={timelineHref}>View agent activity</Link>
        </Button>
      </div>
    </details>
  );
}

export function ThreadViewNavigation({
  activeView,
  conversationHref,
  timelineHref,
}: {
  activeView: "conversation" | "timeline";
  conversationHref: string;
  timelineHref: string;
}) {
  return (
    <nav
      aria-label="Message thread views"
      className="flex flex-wrap items-center gap-2"
    >
      <Button
        asChild
        size="sm"
        variant={activeView === "conversation" ? "secondary" : "ghost"}
      >
        <Link
          aria-current={activeView === "conversation" ? "page" : undefined}
          href={conversationHref}
        >
          Conversation
        </Link>
      </Button>
      <Button
        asChild
        size="sm"
        variant={activeView === "timeline" ? "secondary" : "ghost"}
      >
        <Link
          aria-current={activeView === "timeline" ? "page" : undefined}
          href={timelineHref}
        >
          Agent activity
        </Link>
      </Button>
    </nav>
  );
}

export function ConversationLifecycleDivider({
  event,
}: {
  event: QueryTimelineEventLike;
}) {
  const metadata = getQueryStatusMetadata(event.toStatus);
  const Icon = metadata.icon;

  return (
    <div
      className="flex flex-col gap-2 py-1"
      id={`query-event-${event.eventId}`}
      role="note"
    >
      <div className="flex items-center gap-3">
        <span aria-hidden className="h-px flex-1 bg-accent/10" />
        <span className="inline-flex max-w-[80%] items-center gap-1.5 rounded-full border border-accent/10 bg-white/68 px-3 py-1.5 text-center text-xs font-medium text-accent/76">
          <Icon aria-hidden className="size-3.5 shrink-0" />
          {metadata.label} ·{" "}
          <LocalDateTime value={event.occurredAt} variant="shortDate" />
        </span>
        <span aria-hidden className="h-px flex-1 bg-accent/10" />
      </div>
      {event.note || event.dueAt ? (
        <div className="mx-auto max-w-2xl rounded-[0.9rem] border border-accent/10 bg-white/64 px-4 py-3 text-sm leading-6 text-accent/76 [overflow-wrap:anywhere]">
          {event.note ? <p>{event.note}</p> : null}
          {event.dueAt ? (
            <p
              className={
                event.note
                  ? "mt-1 text-xs font-semibold"
                  : "text-xs font-semibold"
              }
            >
              Due <LocalDateTime value={event.dueAt} />
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
