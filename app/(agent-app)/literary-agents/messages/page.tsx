import { ArrowRight, Inbox, MessageSquare } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { QueryInboxMeta } from "@/app/components/messages/query-lifecycle";
import { LocalDateTime } from "@/app/components/messages/local-date-time";
import { Separator } from "@/app/ui-primitives/separator";
import {
  AgentMessageApiError,
  getAgentMessageThreadsData,
} from "@/app/utils/message-thread-data";
import { getAgentMessageThreadHref } from "@/app/utils/message-routes";
import type { AgentMessageThread } from "@/app/utils/message-types";

function AgentMessageThreadRow({ thread }: { thread: AgentMessageThread }) {
  const lastMessageAt = thread.lastMessageAt ?? thread.updatedAt;

  return (
    <Link
      href={getAgentMessageThreadHref(thread.threadId)}
      className="group grid gap-4 rounded-[1.25rem] border border-accent/10 bg-white/72 px-4 py-4 text-accent shadow-[0_14px_34px_rgba(24,44,69,0.06)] transition hover:-translate-y-0.5 hover:border-accent/18 hover:bg-white lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.9fr)_minmax(13rem,1fr)_auto] lg:items-center"
    >
      <div className="min-w-0">
        <p className="truncate text-base font-semibold">{thread.projectName}</p>
        {thread.lastMessagePreview ? (
          <p className="mt-1 truncate text-sm text-accent/76">
            {thread.lastMessagePreview}
          </p>
        ) : (
          <p className="mt-1 truncate text-sm text-accent/72">
            {thread.subject}
          </p>
        )}
      </div>
      <div className="min-w-0 text-sm text-accent/72">
        <p className="truncate font-medium text-accent">
          {thread.writerName || "Writer unavailable"}
        </p>
        <p className="truncate">{thread.subject}</p>
      </div>
      <QueryInboxMeta
        lastMessageSenderRole={thread.lastMessageSenderRole}
        nextAction={thread.queryProgress?.nextAction}
        progress={thread.queryProgress}
        unreadCount={thread.unreadCount}
        viewerRole="agent"
      />
      <div className="flex items-center justify-between gap-3 text-sm text-accent/76 lg:justify-end">
        <div className="flex flex-col lg:items-end">
          <span className="text-xs text-accent/72">Last message</span>
          <LocalDateTime
            fallback="No date"
            value={lastMessageAt}
            variant="date"
          />
        </div>
        <ArrowRight className="size-4 shrink-0 transition group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

export default async function LiteraryAgentMessagesPage() {
  let data;

  try {
    data = await getAgentMessageThreadsData();
  } catch (error) {
    if (error instanceof AgentMessageApiError && error.status === 401) {
      redirect("/literary-agents/sign-in");
    }

    throw error;
  }

  return (
    <div className="ambient-page flex min-h-full flex-col px-4 py-6">
      <div className="ambient-orb-top" />
      <div className="ambient-orb-bottom" />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <p className="mb-1 flex items-center gap-2 text-sm font-medium text-accent/76">
              <MessageSquare className="size-4" />
              Literary agent workspace
            </p>
            <h1 className="font-serif text-3xl font-semibold leading-tight text-accent md:text-[40px]">
              Messages
            </h1>
          </div>
        </div>

        <div className="glass-panel-strong flex flex-col gap-4 p-4 md:p-5">
          <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-base font-semibold text-accent">Inbox</h2>
              <p className="text-sm text-accent/76">
                {data.threads.length === 1
                  ? "1 conversation"
                  : `${data.threads.length} conversations`}
              </p>
            </div>
          </div>
          <Separator />

          {data.threads.length > 0 ? (
            <div className="flex flex-col gap-2">
              {data.threads.map((thread) => (
                <AgentMessageThreadRow key={thread.threadId} thread={thread} />
              ))}
            </div>
          ) : (
            <div className="flex min-h-52 flex-col items-center justify-center gap-3 rounded-[1.25rem] border border-accent/10 bg-white/60 px-5 py-10 text-center">
              <Inbox className="size-8 text-accent/55" />
              <div className="max-w-md">
                <h3 className="text-base font-semibold text-accent">
                  No messages yet
                </h3>
                <p className="mt-1 text-sm leading-6 text-accent/76">
                  Conversations with writers will appear here when they reach
                  out about a project.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
