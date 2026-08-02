import {
  ArrowRight,
  Inbox,
  LayoutDashboard,
  MessageSquare,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { QueryStatusBadge } from "@/app/components/messages/query-lifecycle";
import { Button } from "@/app/ui-primitives/button";
import { Separator } from "@/app/ui-primitives/separator";
import {
  getCanonicalMessagesHref,
  getProjectDashboardHrefForMessages,
  getWriterMessageThreadsData,
  isCanonicalMessagesRoute,
  WriterMessageApiError,
} from "@/app/utils/message-thread-data";
import { getProjectMessageThreadHref } from "@/app/utils/message-routes";
import type { WriterMessageThread } from "@/app/utils/message-types";
import {
  NewMessageComposer,
  type SavedAgentForMessaging,
} from "./new-message-composer";

type WriterMessagesSearchParams = {
  agentId?: string | string[];
  compose?: string | string[];
};

type WriterMessagesPageData = Exclude<
  Awaited<ReturnType<typeof getWriterMessageThreadsData>>,
  null
>;

const MESSAGE_DATE_FORMATTER = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
  year: "numeric",
});

function formatMessageDate(value?: string | null) {
  if (!value) return "No date";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No date";

  return MESSAGE_DATE_FORMATTER.format(date);
}

function getSearchParamValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function getComposerHref(projectId: string) {
  return `/messages/${encodeURIComponent(projectId)}?compose=1`;
}

function mapSavedAgentForComposer(
  agent: WriterMessagesPageData["savedAgents"][number],
): SavedAgentForMessaging {
  return {
    id: agent.savedAgentId,
    legacyAgentId: agent.legacyAgentId ?? agent.indexId,
    name: agent.name,
    agency: agent.agency,
    agentProfileId: agent.agentProfileId,
  };
}

function savedAgentMatchesId(
  agent: WriterMessagesPageData["savedAgents"][number],
  agentId: string,
) {
  const normalizedAgentId = agentId.trim().toLocaleLowerCase();

  return [
    agent.savedAgentId,
    agent.legacyAgentId,
    agent.indexId,
    agent.agentProfileId,
  ].some((value) => value?.trim().toLocaleLowerCase() === normalizedAgentId);
}

function MessageThreadRow({
  routeProjectId,
  thread,
}: {
  routeProjectId: string;
  thread: WriterMessageThread;
}) {
  return (
    <Link
      href={getProjectMessageThreadHref(routeProjectId, thread.threadId)}
      className="group grid gap-4 rounded-2xl border border-accent/10 bg-white/72 px-5 py-4 text-accent shadow-sm transition-colors hover:border-accent/18 hover:bg-white md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.6fr)_auto] md:items-center"
    >
      <div className="min-w-0 text-sm text-accent/72">
        <p className="truncate font-semibold text-accent">{thread.agentName}</p>
        {thread.agency ? (
          <p className="mt-0.5 truncate">{thread.agency}</p>
        ) : null}
      </div>

      <div className="flex min-w-0 items-start gap-3">
        {thread.unreadCount > 0 ? (
          <span
            className="mt-2 size-2 shrink-0 rounded-full bg-accent"
            title={`${thread.unreadCount} unread`}
          >
            <span className="sr-only">
              {thread.unreadCount} unread{" "}
              {thread.unreadCount === 1 ? "message" : "messages"}
            </span>
          </span>
        ) : null}
        <div className="min-w-0">
          <p className="truncate text-base font-semibold">{thread.subject}</p>
          {thread.lastMessagePreview ? (
            <p className="mt-1 truncate text-sm text-accent/72">
              {thread.lastMessagePreview}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 text-sm text-accent/72 md:justify-end">
        <QueryStatusBadge
          compact
          status={thread.queryProgress?.currentCode}
          viewerRole="writer"
        />
        <time
          className="whitespace-nowrap"
          dateTime={thread.lastMessageAt ?? thread.updatedAt ?? undefined}
        >
          {formatMessageDate(thread.lastMessageAt ?? thread.updatedAt)}
        </time>
        <ArrowRight className="size-4 shrink-0 transition group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

export default async function WriterMessagesPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<WriterMessagesSearchParams>;
}) {
  const [{ projectId }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);
  const shouldShowComposer =
    getSearchParamValue(resolvedSearchParams.compose) === "1";
  const initialComposerAgentId =
    getSearchParamValue(resolvedSearchParams.agentId) ?? null;
  let data;

  try {
    data = await getWriterMessageThreadsData(projectId);
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
    redirect(getCanonicalMessagesHref(data.project));
  }

  const pageData = data as WriterMessagesPageData;
  const existingThreadByAgentProfileId = new Map(
    pageData.threads.map((thread) => [thread.agentProfileId, thread]),
  );
  const initialSavedAgent = initialComposerAgentId
    ? pageData.savedAgents.find((agent) =>
        savedAgentMatchesId(agent, initialComposerAgentId),
      )
    : null;
  const existingInitialThread = initialSavedAgent?.agentProfileId
    ? existingThreadByAgentProfileId.get(initialSavedAgent.agentProfileId)
    : null;

  if (shouldShowComposer && existingInitialThread) {
    redirect(
      getProjectMessageThreadHref(
        pageData.project.projectId,
        existingInitialThread.threadId,
      ),
    );
  }

  const savedAgents = pageData.savedAgents
    .filter(
      (agent) =>
        agent.isMessagingAvailable &&
        (!agent.agentProfileId ||
          !existingThreadByAgentProfileId.has(agent.agentProfileId)),
    )
    .map(mapSavedAgentForComposer);

  return (
    <div className="ambient-page flex min-h-full flex-col px-4 py-6">
      <div className="ambient-orb-top" />
      <div className="ambient-orb-bottom" />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <p className="mb-1 flex items-center gap-2 text-sm font-medium text-accent/76">
              <MessageSquare className="size-4" />
              Messages
            </p>
            <h1 className="truncate font-serif text-3xl font-semibold leading-tight text-accent md:text-[40px]">
              {data.project.projectName}
            </h1>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href={getProjectDashboardHrefForMessages(data.project)}>
              <LayoutDashboard data-icon="inline-start" />
              Dashboard
            </Link>
          </Button>
        </div>

        <div className="glass-panel-strong flex flex-col gap-4 p-4 md:p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-base font-semibold text-accent">Inbox</h2>
              <p className="text-sm text-accent/76">
                {data.threads.length === 1
                  ? "1 conversation"
                  : `${data.threads.length} conversations`}
              </p>
            </div>
            {pageData.project.isMessagingAvailable ? (
              <Button asChild size="sm">
                <Link href={getComposerHref(pageData.project.projectId)}>
                  <Plus data-icon="inline-start" />
                  New Message
                </Link>
              </Button>
            ) : (
              <Button disabled size="sm" type="button">
                <Plus data-icon="inline-start" />
                New Message
              </Button>
            )}
          </div>
          <Separator />

          {shouldShowComposer && pageData.project.isMessagingAvailable ? (
            <>
              <NewMessageComposer
                initialAgentId={initialComposerAgentId}
                projectId={pageData.project.projectId}
                projectName={pageData.project.projectName}
                savedAgents={savedAgents}
                writerProjectId={pageData.project.writerProjectId}
              />
              <Separator />
            </>
          ) : null}

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
          ) : data.threads.length > 0 ? (
            <div className="flex flex-col gap-2">
              {data.threads.map((thread) => (
                <MessageThreadRow
                  key={thread.threadId}
                  routeProjectId={data.project.projectId}
                  thread={thread}
                />
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
                  Conversations with agents for this project will appear here.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
