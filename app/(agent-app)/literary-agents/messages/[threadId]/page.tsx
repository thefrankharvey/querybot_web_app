import { ArrowLeft, Inbox, MessageSquare } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  MobileQueryProgress,
  QueryProgressRail,
  QueryStatusBadge,
  ThreadViewNavigation,
} from "@/app/components/messages/query-lifecycle";
import { LocalDateTime } from "@/app/components/messages/local-date-time";
import { QueryStatusActions } from "@/app/components/messages/query-status-actions";
import { Button } from "@/app/ui-primitives/button";
import { Separator } from "@/app/ui-primitives/separator";
import {
  AgentMessageApiError,
  getAgentQueryTimelineData,
  getAgentThreadMessagesData,
} from "@/app/utils/message-thread-data";
import {
  getAgentMessageThreadHref,
  getAgentMessagesHref,
} from "@/app/utils/message-routes";

import { AgentThreadReplyForm } from "./thread-reply-form";

export default async function LiteraryAgentMessageThreadPage({
  params,
}: {
  params: Promise<{ threadId: string }>;
}) {
  const { threadId } = await params;
  let data;
  let timelineData = null;

  try {
    const [messageResult, timelineResult] = await Promise.allSettled([
      getAgentThreadMessagesData({
        limit: "50",
        threadId,
      }),
      getAgentQueryTimelineData(threadId),
    ]);

    if (messageResult.status === "rejected") throw messageResult.reason;
    data = messageResult.value;

    if (timelineResult.status === "fulfilled") {
      timelineData = timelineResult.value;
    }
  } catch (error) {
    if (error instanceof AgentMessageApiError && error.status === 401) {
      redirect("/literary-agents/sign-in");
    }

    throw error;
  }

  const threadProjectName = data.thread?.projectName ?? "Message thread";
  const writerName = data.thread?.writerName || "Writer unavailable";
  const lastMessageAt = data.thread?.lastMessageAt ?? data.thread?.updatedAt;
  const conversationHref = getAgentMessageThreadHref(threadId);
  const timelineHref = `${conversationHref}/timeline`;
  const queryProgress =
    timelineData?.queryProgress ??
    data.queryProgress ??
    data.thread?.queryProgress;
  const timelineEvents = timelineData?.events ?? [];
  const statusActions = queryProgress ? (
    <QueryStatusActions
      progress={queryProgress}
      threadId={threadId}
    />
  ) : null;

  return (
    <div className="ambient-page flex min-h-full flex-col px-4 py-6">
      <div className="ambient-orb-top" />
      <div className="ambient-orb-bottom" />
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <div className="flex flex-col gap-4">
          <Button asChild variant="ghost" size="sm" className="w-fit px-0">
            <Link href={getAgentMessagesHref()}>
              <ArrowLeft data-icon="inline-start" />
              Back to inbox
            </Link>
          </Button>

          <header className="glass-panel-strong flex flex-col gap-4 p-4 md:p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <p className="mb-1 flex items-center gap-2 text-sm font-medium text-accent/76">
                  <MessageSquare className="size-4" />
                  {writerName}
                </p>
                <h1 className="font-serif text-3xl font-semibold leading-tight text-accent md:text-[40px]">
                  {threadProjectName}
                </h1>
                {data.thread ? (
                  <p className="mt-2 text-sm text-accent/76">
                    {data.thread.subject}
                  </p>
                ) : null}
              </div>
              {data.thread ? (
                <div className="flex shrink-0 flex-col items-start gap-2 md:items-end">
                  <QueryStatusBadge status={queryProgress?.currentCode} />
                  <p className="text-xs text-accent/72">
                    Last message <LocalDateTime value={lastMessageAt} />
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

          <MobileQueryProgress
            actions={statusActions}
            events={timelineEvents}
            progress={queryProgress}
            timelineHref={timelineHref}
            viewerRole="agent"
          />

          <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_21rem]">
            <section
              aria-label="Conversation"
              className="glass-panel-strong flex min-w-0 flex-col gap-4 p-4 md:p-5"
            >
              {!data.agent.isMessagingAvailable ? (
                <div className="flex min-h-52 flex-col items-center justify-center gap-3 rounded-[1.25rem] border border-accent/10 bg-white/60 px-5 py-10 text-center">
                  <Inbox className="size-8 text-accent/55" />
                  <div className="max-w-md">
                    <h3 className="text-base font-semibold text-accent">
                      No messages yet
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-accent/76">
                      Conversations with writers will appear here when they
                      reach out about a project.
                    </p>
                  </div>
                </div>
              ) : (
                <AgentThreadReplyForm
                  initialMessages={data.messages}
                  initialNextBefore={data.nextBefore}
                  initialTimelineEvents={timelineEvents}
                  threadId={data.threadId}
                  writerName={writerName}
                />
              )}
            </section>
            <aside className="sticky top-6 hidden self-start xl:block">
              <QueryProgressRail
                actions={statusActions}
                events={timelineEvents}
                progress={queryProgress}
                timelineHref={timelineHref}
                viewerRole="agent"
              />
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
