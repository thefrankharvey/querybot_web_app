"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  BellRing,
  CalendarCheck,
  CheckCheck,
  ExternalLink,
  Inbox,
  MailOpen,
  RotateCcw,
  Settings2,
  Trash2,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/app/ui-primitives/alert";
import { Badge } from "@/app/ui-primitives/badge";
import { Button } from "@/app/ui-primitives/button";
import { Spinner } from "@/app/ui-primitives/spinner";
import {
  useMarkAllNotificationsRead,
  useNotificationAction,
  useNotifications,
} from "@/app/hooks/use-notifications";
import type { UserNotification } from "@/app/utils/personalized-radar/notifications";
import { captureRadarEvent } from "@/app/utils/personalized-radar/product-analytics.client";
import { cn } from "@/app/utils";

function groupNotifications(notifications: UserNotification[]) {
  const groups = new Map<string, UserNotification[]>();
  for (const notification of notifications) {
    const label = new Date(notification.occurredAt).toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    const group = groups.get(label) ?? [];
    group.push(notification);
    groups.set(label, group);
  }
  return Array.from(groups);
}

function NotificationItem({
  notification,
  onAction,
  pending,
}: {
  notification: UserNotification;
  onAction: (action: "read" | "unread" | "archive") => void;
  pending: boolean;
}) {
  const isUnread = notification.readAt === null;
  const occurredAt = new Date(notification.occurredAt);
  const Icon =
    notification.kind === "query_reminder_due" ? CalendarCheck : BellRing;

  return (
    <article
      className={cn(
        "glass-panel flex flex-col gap-4 p-4 md:flex-row md:items-start md:p-5",
        isUnread && "border-accent/24 bg-white/90",
      )}
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent/8 text-accent">
        <Icon aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <Badge variant={notification.kind === "agent_watch_event" ? "default" : "secondary"}>
            {notification.kind === "agent_watch_event" ? "Radar" : "Reminder"}
          </Badge>
          {isUnread ? <Badge variant="outline">Unread</Badge> : null}
          <time
            className="text-xs text-accent/58"
            dateTime={notification.occurredAt}
            title={occurredAt.toLocaleString()}
          >
            {occurredAt.toLocaleTimeString(undefined, {
              hour: "numeric",
              minute: "2-digit",
            })}
          </time>
        </div>
        <h2 className="font-semibold text-accent">{notification.title}</h2>
        <p className="mt-1 text-sm leading-6 text-accent/72">
          {notification.summary}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild size="sm">
            <Link
              href={notification.targetHref}
              onClick={() => {
                if (isUnread) onAction("read");
              }}
            >
              Open
              <ExternalLink data-icon="inline-end" />
            </Link>
          </Button>
          <Button
            disabled={pending}
            onClick={() => onAction(isUnread ? "read" : "unread")}
            size="sm"
            type="button"
            variant="secondary"
          >
            {isUnread ? (
              <MailOpen data-icon="inline-start" />
            ) : (
              <RotateCcw data-icon="inline-start" />
            )}
            Mark {isUnread ? "read" : "unread"}
          </Button>
          <Button
            disabled={pending}
            onClick={() => onAction("archive")}
            size="sm"
            type="button"
            variant="ghost"
          >
            <Trash2 data-icon="inline-start" />
            Archive
          </Button>
          {notification.kind === "agent_watch_event" ? (
            <Button asChild size="sm" variant="ghost">
              <Link href="/radar">
                <Settings2 data-icon="inline-start" />
                Manage watch
              </Link>
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function NotificationCenter() {
  const [status, setStatus] = useState<"all" | "unread">("all");
  const query = useNotifications(status);
  const action = useNotificationAction();
  const markAll = useMarkAllNotificationsRead();
  const notifications = useMemo(() => {
    const byId = new Map<string, UserNotification>();
    for (const page of query.data?.pages ?? []) {
      for (const notification of page.notifications) {
        if (!byId.has(notification.id)) byId.set(notification.id, notification);
      }
    }
    return Array.from(byId.values());
  }, [query.data]);
  const groups = useMemo(() => groupNotifications(notifications), [notifications]);
  const firstPage = query.data?.pages[0];

  useEffect(() => {
    captureRadarEvent("notification_center_opened", { channel: "in_app" });
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <Button
            aria-pressed={status === "all"}
            onClick={() => setStatus("all")}
            size="sm"
            type="button"
            variant={status === "all" ? "default" : "secondary"}
          >
            All
          </Button>
          <Button
            aria-pressed={status === "unread"}
            onClick={() => setStatus("unread")}
            size="sm"
            type="button"
            variant={status === "unread" ? "default" : "secondary"}
          >
            Unread
            {firstPage?.unreadCount ? (
              <Badge variant="outline">{firstPage.unreadCount}</Badge>
            ) : null}
          </Button>
        </div>
        <Button
          disabled={!firstPage?.unreadCount || !firstPage.asOf || markAll.isPending}
          onClick={() => {
            if (firstPage?.asOf) markAll.mutate(firstPage.asOf);
          }}
          size="sm"
          type="button"
          variant="secondary"
        >
          {markAll.isPending ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <CheckCheck data-icon="inline-start" />
          )}
          Mark all read
        </Button>
      </div>

      {query.isError ? (
        <Alert role="alert" variant="destructive">
          <AlertTitle>Notifications could not refresh</AlertTitle>
          <AlertDescription>
            {query.error instanceof Error ? query.error.message : "Try again shortly."}
          </AlertDescription>
        </Alert>
      ) : null}

      {query.isLoading ? (
        <div className="flex min-h-60 items-center justify-center" role="status">
          <Spinner className="size-8" />
          <span className="sr-only">Loading notifications</span>
        </div>
      ) : null}

      {!query.isLoading && !query.isError && notifications.length === 0 ? (
        <div className="glass-panel flex min-h-60 flex-col items-center justify-center gap-3 p-8 text-center">
          <Inbox aria-hidden className="size-8 text-accent/58" />
          <h2 className="text-xl font-semibold text-accent">
            {status === "unread" ? "You’re all caught up" : "No notifications yet"}
          </h2>
          <p className="max-w-md text-sm text-accent/68">
            Radar alerts and due query reminders will stay here across devices.
          </p>
          <Button asChild size="sm" variant="secondary">
            <Link href="/dispatch?scope=watched">Open watched Dispatch</Link>
          </Button>
        </div>
      ) : null}

      {groups.map(([label, items]) => (
        <section key={label} aria-labelledby={`notification-group-${items[0].id}`}>
          <h2
            className="mb-3 text-sm font-semibold text-accent/70"
            id={`notification-group-${items[0].id}`}
          >
            {label}
          </h2>
          <div className="flex flex-col gap-3">
            {items.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                pending={action.isPending && action.variables?.notificationId === notification.id}
                onAction={(nextAction) =>
                  action.mutate({ notificationId: notification.id, action: nextAction })
                }
              />
            ))}
          </div>
        </section>
      ))}

      {query.hasNextPage ? (
        <Button
          className="self-center"
          disabled={query.isFetchingNextPage}
          onClick={() => void query.fetchNextPage()}
          type="button"
          variant="secondary"
        >
          {query.isFetchingNextPage ? <Spinner data-icon="inline-start" /> : null}
          {query.isFetchingNextPage ? "Loading…" : "Load older notifications"}
        </Button>
      ) : null}
    </div>
  );
}
