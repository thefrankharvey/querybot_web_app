import { ArrowLeft, Inbox, MessageSquare } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import {
  QueryStatusBadge,
  ThreadViewNavigation,
} from "@/app/components/messages/query-lifecycle";
import { LocalDateTime } from "@/app/components/messages/local-date-time";
import { Button } from "@/app/ui-primitives/button";
import { Separator } from "@/app/ui-primitives/separator";
import { isManuscriptAttachmentsEnabled } from "@/app/utils/manuscript-attachment-urls.server";
import {
  getCanonicalMessageThreadHref,
  getWriterQueryTimelineData,
  getWriterThreadMessagesData,
  isCanonicalMessagesRoute,
  WriterMessageApiError,
} from "@/app/utils/message-thread-data";
import {
  getProjectMessagesHref,
  getProjectMessageThreadHref,
} from "@/app/utils/message-routes";

import { ThreadReplyForm } from "./thread-reply-form";

export default async function WriterMessageThreadPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string; threadId: string }>;
  searchParams: Promise<{ shareManuscript?: string | string[] }>;
}) {
  const [{ projectId, threadId }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);
  let data;
  let timelineData = null;

  try {
    const [messageResult, timelineResult] = await Promise.allSettled([
      getWriterThreadMessagesData({
        limit: "50",
        routeProjectId: projectId,
        threadId,
      }),
      getWriterQueryTimelineData({
        routeProjectId: projectId,
        threadId,
      }),
    ]);

    if (messageResult.status === "rejected") throw messageResult.reason;
    data = messageResult.value;

    if (timelineResult.status === "fulfilled") {
      timelineData = timelineResult.value;
    }
  } catch (error) {
    if (error instanceof WriterMessageApiError && error.status === 401) {
      redirect("/sign-in");
    }

    throw error;
  }

  if (!data) {
    notFound();
  }

  if (
    data.project.isMessagingAvailable &&
    !isCanonicalMessagesRoute({
      project: data.project,
      routeProjectId: projectId,
    })
  ) {
    redirect(
      getCanonicalMessageThreadHref({
        project: data.project,
        threadId,
      }),
    );
  }

  const inboxHref = getProjectMessagesHref(
    data.project.projectName,
    data.project.projectId,
  );
  const conversationHref = getProjectMessageThreadHref(
    data.project.projectId,
    threadId,
  );
  const timelineHref = `${conversationHref}/timeline`;
  const queryProgress =
    timelineData?.queryProgress ??
    data.queryProgress ??
    data.thread?.queryProgress;
  const timelineEvents = timelineData?.events ?? [];

  return (
    <div className="ambient-page flex min-h-full flex-col px-4 py-6">
      <div className="ambient-orb-top" />
      <div className="ambient-orb-bottom" />
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <div className="flex flex-col gap-4">
          <Button asChild variant="ghost" size="sm" className="w-fit px-0">
            <Link href={inboxHref}>
              <ArrowLeft data-icon="inline-start" />
              Back to inbox
            </Link>
          </Button>

          <header className="glass-panel-strong flex flex-col gap-4 p-4 md:p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <p className="mb-1 flex items-center gap-2 text-sm font-medium text-accent/76">
                  <MessageSquare className="size-4" />
                  {data.project.projectName}
                </p>
                <h1 className="font-serif text-3xl font-semibold leading-tight text-accent md:text-[40px]">
                  {data.thread?.subject ?? "Message thread"}
                </h1>
                {data.thread ? (
                  <p className="mt-2 text-sm text-accent/76">
                    {data.thread.agentName}
                    {data.thread.agency ? ` · ${data.thread.agency}` : ""}
                  </p>
                ) : null}
              </div>
              {data.thread ? (
                <div className="flex shrink-0 flex-col items-start gap-2 md:items-end">
                  <QueryStatusBadge status={queryProgress?.currentCode} />
                  <p className="text-xs text-accent/72">
                    Last message{" "}
                    <LocalDateTime value={data.thread.lastMessageAt} />
                  </p>
                </div>
              ) : null}
            </div>
            <Separator />
            <ThreadViewNavigation
              activeView="conversation"
              conversationHref={conversationHref}
              timelineHref={timelineHref}
            />
          </header>

          <section
            aria-label="Conversation"
            className="glass-panel-strong flex min-w-0 flex-col gap-4 p-4 md:p-5"
          >
            {!data.project.isMessagingAvailable ? (
              <div className="flex min-h-52 flex-col items-center justify-center gap-3 rounded-[1.25rem] border border-accent/10 bg-white/60 px-5 py-10 text-center">
                <Inbox className="size-8 text-accent/55" />
                <div className="max-w-md">
                  <h3 className="text-base font-semibold text-accent">
                    Messages are not available for this project yet
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-accent/76">
                    This project needs a synced writer project before message
                    threads can load.
                  </p>
                </div>
              </div>
            ) : (
              <ThreadReplyForm
                agentName={data.thread?.agentName || "the literary agent"}
                attachmentsEnabled={isManuscriptAttachmentsEnabled()}
                initialCanWriterReply={data.canWriterReply}
                initialMessages={data.messages}
                initialNextBefore={data.nextBefore}
                initialQueryStatus={queryProgress?.currentCode ?? null}
                initialQueryVersion={queryProgress?.version ?? null}
                initialShareManuscriptOpen={
                  resolvedSearchParams.shareManuscript === "1"
                }
                initialTimelineEvents={timelineEvents}
                projectId={data.project.projectId}
                threadId={data.threadId}
              />
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
