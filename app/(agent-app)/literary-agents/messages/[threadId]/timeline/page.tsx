import { ArrowLeft, History, MessageSquare } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  QueryProgressSummary,
  QueryStatusBadge,
  QueryTimelineList,
  ThreadViewNavigation,
} from "@/app/components/messages/query-lifecycle";
import { LocalDateTime } from "@/app/components/messages/local-date-time";
import { QueryStatusActions } from "@/app/components/messages/query-status-actions";
import { Button } from "@/app/ui-primitives/button";
import { Separator } from "@/app/ui-primitives/separator";
import {
  AgentMessageApiError,
  getAgentMessageThreadDetailData,
  getAgentQueryTimelineData,
} from "@/app/utils/message-thread-data";
import {
  getAgentMessageThreadHref,
  getAgentMessagesHref,
} from "@/app/utils/message-routes";

export default async function AgentQueryTimelinePage({
  params,
}: {
  params: Promise<{ threadId: string }>;
}) {
  const { threadId } = await params;
  let detailData;
  let timelineData;

  try {
    [detailData, timelineData] = await Promise.all([
      getAgentMessageThreadDetailData(threadId),
      getAgentQueryTimelineData(threadId),
    ]);
  } catch (error) {
    if (error instanceof AgentMessageApiError && error.status === 401) {
      redirect("/literary-agents/sign-in");
    }

    throw error;
  }

  const writerName = detailData.thread.writerName || "Writer unavailable";
  const conversationHref = getAgentMessageThreadHref(threadId);
  const timelineHref = `${conversationHref}/timeline`;
  return (
    <div className="ambient-page flex min-h-full flex-col px-4 py-6">
      <div className="ambient-orb-top" />
      <div className="ambient-orb-bottom" />
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <Button asChild className="w-fit px-0" size="sm" variant="ghost">
          <Link href={getAgentMessagesHref()}>
            <ArrowLeft data-icon="inline-start" />
            Back to inbox
          </Link>
        </Button>

        <header className="glass-panel-strong flex flex-col gap-4 p-4 md:p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <p className="mb-1 flex items-center gap-2 text-sm font-medium text-accent/76">
                <MessageSquare aria-hidden className="size-4" />
                {writerName}
              </p>
              <h1 className="font-serif text-3xl font-semibold leading-tight text-accent md:text-[40px]">
                {detailData.thread.projectName}
              </h1>
              <p className="mt-2 text-sm text-accent/76">
                {detailData.thread.subject}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-start gap-2 md:items-end">
              <QueryStatusBadge
                status={timelineData.queryProgress.currentCode}
                viewerRole="agent"
              />
              <p className="text-xs text-accent/72">
                Updated{" "}
                <LocalDateTime value={timelineData.queryProgress.changedAt} />
              </p>
            </div>
          </div>
          <Separator />
          <ThreadViewNavigation
            activeView="timeline"
            conversationHref={conversationHref}
            timelineHref={timelineHref}
            viewerRole="agent"
          />
        </header>

        <section
          aria-labelledby="personal-timeline-heading"
          className="glass-panel-strong p-4 md:p-6"
        >
          <div className="flex flex-col gap-1">
            <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-accent/72">
              <History aria-hidden className="size-3.5" />
              Exact, audited record
            </p>
            <h2
              className="text-xl font-semibold text-accent"
              id="personal-timeline-heading"
            >
              Query progress
            </h2>
            <p className="text-sm leading-6 text-accent/76">
              Occurred and recorded timestamps are shown separately so later
              updates remain transparent.
            </p>
          </div>
          <Separator className="my-5" />
          <div className="grid items-start gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]">
            <div className="flex flex-col gap-5 rounded-[1.1rem] border border-accent/10 bg-white/52 p-4">
              <QueryProgressSummary
                progress={timelineData.queryProgress}
                viewerRole="agent"
              />
              <Separator />
              <QueryStatusActions
                progress={timelineData.queryProgress}
                threadId={threadId}
              />
            </div>
            <QueryTimelineList
              events={timelineData.events}
              getMessageHref={(sourceMessageId) =>
                `${conversationHref}#message-${encodeURIComponent(sourceMessageId)}`
              }
              viewerRole="agent"
            />
          </div>
        </section>
      </div>
    </div>
  );
}
