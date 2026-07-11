"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Send, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { buildConversationItems } from "@/app/components/messages/conversation-items";
import { LocalDateTime } from "@/app/components/messages/local-date-time";
import { ConversationLifecycleDivider } from "@/app/components/messages/query-lifecycle";
import { useAgentReadStateMutation } from "@/app/hooks/use-message-query-lifecycle";
import { Button } from "@/app/ui-primitives/button";
import { Spinner } from "@/app/ui-primitives/spinner";
import { Textarea } from "@/app/ui-primitives/textarea";
import type {
  AgentReplyResponse,
  AgentThreadMessagesResponse,
  QueryTimelineEvent,
  WriterMessage,
  WriterMessageApiErrorResponse,
} from "@/app/utils/message-types";
import { cn } from "@/app/utils";

const MAX_LINKED_MESSAGE_PAGES = 10;

function mergeMessagePages(
  olderMessages: WriterMessage[],
  currentMessages: WriterMessage[],
) {
  const currentIds = new Set(
    currentMessages.map((message) => message.messageId),
  );
  return [
    ...olderMessages.filter((message) => !currentIds.has(message.messageId)),
    ...currentMessages,
  ];
}

function getLinkedMessageId() {
  const prefix = "#message-";
  if (!window.location.hash.startsWith(prefix)) return null;

  try {
    return decodeURIComponent(window.location.hash.slice(prefix.length));
  } catch {
    return null;
  }
}

function MessageBubble({
  message,
  writerName,
}: {
  message: WriterMessage;
  writerName: string;
}) {
  const isAgent = message.senderRole === "agent";

  return (
    <div
      className={cn(
        "flex",
        isAgent ? "justify-end pl-8 md:pl-24" : "justify-start pr-8 md:pr-24",
      )}
    >
      <article
        data-message-id={message.messageId}
        id={`message-${message.messageId}`}
        className={cn(
          "max-w-3xl scroll-mt-24 rounded-[1.25rem] px-4 py-3 shadow-[0_14px_34px_rgba(24,44,69,0.06)]",
          isAgent
            ? "border border-accent bg-accent text-white"
            : "border border-accent/10 bg-white/76 text-accent",
        )}
      >
        <div className="mb-2 flex items-center justify-between gap-4 text-xs font-medium">
          <span>{isAgent ? "You" : writerName}</span>
          {message.createdAt ? (
            <LocalDateTime
              value={message.createdAt}
              className={isAgent ? "text-white/85" : "text-accent/72"}
            />
          ) : null}
        </div>
        <p className="whitespace-pre-wrap text-sm leading-6 [overflow-wrap:anywhere]">
          {message.body}
        </p>
      </article>
    </div>
  );
}

async function getReplyErrorMessage(response: Response) {
  try {
    const body = (await response.json()) as WriterMessageApiErrorResponse;
    return body.message || "Failed to send reply";
  } catch {
    return "Failed to send reply";
  }
}

export function AgentThreadReplyForm({
  initialMessages,
  initialNextBefore,
  initialTimelineEvents,
  threadId,
  writerName,
}: {
  initialMessages: WriterMessage[];
  initialNextBefore: string | null;
  initialTimelineEvents: QueryTimelineEvent[];
  threadId: string;
  writerName: string;
}) {
  const router = useRouter();
  const conversationRef = useRef<HTMLDivElement>(null);
  const lastReadMessageIdRef = useRef<string | null>(null);
  const { mutate: markRead } = useAgentReadStateMutation({ threadId });
  const [messages, setMessages] = useState(initialMessages);
  const [timelineEvents, setTimelineEvents] = useState(initialTimelineEvents);
  const [nextBefore, setNextBefore] = useState(initialNextBefore);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [olderMessagesError, setOlderMessagesError] = useState<string | null>(
    null,
  );
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const trimmedDraft = draft.trim();
  const canSend = useMemo(
    () => trimmedDraft.length > 0 && !isSending,
    [isSending, trimmedDraft],
  );
  const conversationItems = useMemo(
    () => buildConversationItems(messages, timelineEvents),
    [messages, timelineEvents],
  );

  useEffect(() => {
    setMessages((currentMessages) =>
      mergeMessagePages(currentMessages, initialMessages),
    );
    setTimelineEvents(initialTimelineEvents);
  }, [initialMessages, initialTimelineEvents]);

  const fetchOlderMessages = useCallback(
    async (before: string) => {
      const messagesUrl =
        `/api/agent-message-threads/${encodeURIComponent(threadId)}/messages?` +
        new URLSearchParams({ before, limit: "50" }).toString();
      const response = await fetch(messagesUrl, { cache: "no-store" });

      if (!response.ok) {
        throw new Error(await getReplyErrorMessage(response));
      }

      return (await response.json()) as AgentThreadMessagesResponse;
    },
    [threadId],
  );

  const handleLoadOlder = async () => {
    if (!nextBefore || isLoadingOlder) return;
    setIsLoadingOlder(true);
    setOlderMessagesError(null);

    try {
      const result = await fetchOlderMessages(nextBefore);
      setMessages((currentMessages) =>
        mergeMessagePages(result.messages, currentMessages),
      );
      setNextBefore(result.nextBefore);
    } catch (loadError) {
      setOlderMessagesError(
        loadError instanceof Error
          ? loadError.message
          : "Older messages could not be loaded.",
      );
    } finally {
      setIsLoadingOlder(false);
    }
  };

  useEffect(() => {
    const linkedMessageId = getLinkedMessageId();
    if (!linkedMessageId) return;

    const existingTarget = document.getElementById(
      `message-${linkedMessageId}`,
    );
    if (existingTarget) {
      existingTarget.scrollIntoView({ block: "center" });
      return;
    }

    if (!initialNextBefore) return;
    let isActive = true;

    const loadLinkedMessage = async () => {
      setIsLoadingOlder(true);
      setOlderMessagesError(null);
      let cursor: string | null = initialNextBefore;
      let accumulatedMessages = initialMessages;

      try {
        for (
          let page = 0;
          cursor && page < MAX_LINKED_MESSAGE_PAGES;
          page += 1
        ) {
          const previousCursor: string = cursor;
          const result = await fetchOlderMessages(cursor);
          accumulatedMessages = mergeMessagePages(
            result.messages,
            accumulatedMessages,
          );
          cursor = result.nextBefore;

          if (
            accumulatedMessages.some(
              (message) => message.messageId === linkedMessageId,
            ) ||
            cursor === previousCursor
          ) {
            break;
          }
        }

        if (!isActive) return;
        setMessages(accumulatedMessages);
        setNextBefore(cursor);
        requestAnimationFrame(() => {
          document
            .getElementById(`message-${linkedMessageId}`)
            ?.scrollIntoView({ block: "center" });
        });
      } catch (loadError) {
        if (!isActive) return;
        setOlderMessagesError(
          loadError instanceof Error
            ? loadError.message
            : "The linked message could not be loaded.",
        );
      } finally {
        if (isActive) setIsLoadingOlder(false);
      }
    };

    void loadLinkedMessage();
    return () => {
      isActive = false;
    };
  }, [fetchOlderMessages, initialMessages, initialNextBefore]);

  useEffect(() => {
    const container = conversationRef.current;
    if (!container || typeof IntersectionObserver === "undefined") return;

    const messageElements = Array.from(
      container.querySelectorAll<HTMLElement>("[data-message-id]"),
    );
    const messageOrder = new Map(
      messages.map((message, index) => [message.messageId, index]),
    );
    const observer = new IntersectionObserver(
      (entries) => {
        let latestVisibleMessageId: string | null = null;
        let latestVisibleIndex = -1;

        for (const entry of entries) {
          if (!entry.isIntersecting || entry.intersectionRatio < 0.01) continue;
          const messageId = (entry.target as HTMLElement).dataset.messageId;
          if (!messageId) continue;
          const index = messageOrder.get(messageId) ?? -1;
          if (index > latestVisibleIndex) {
            latestVisibleIndex = index;
            latestVisibleMessageId = messageId;
          }
        }

        if (
          !latestVisibleMessageId ||
          latestVisibleMessageId === lastReadMessageIdRef.current
        ) {
          return;
        }

        lastReadMessageIdRef.current = latestVisibleMessageId;
        markRead(
          { throughMessageId: latestVisibleMessageId },
          {
            onError: () => {
              if (lastReadMessageIdRef.current === latestVisibleMessageId) {
                lastReadMessageIdRef.current = null;
              }
            },
            onSuccess: (result) => {
              const lifecycleEvent = result.event;
              if (!lifecycleEvent) return;

              setTimelineEvents((currentEvents) =>
                currentEvents.some(
                  (event) => event.eventId === lifecycleEvent.eventId,
                )
                  ? currentEvents
                  : [...currentEvents, lifecycleEvent],
              );
              router.refresh();
            },
          },
        );
      },
      { threshold: [0.01, 1] },
    );

    for (const element of messageElements) observer.observe(element);
    return () => observer.disconnect();
  }, [markRead, messages, router]);

  useEffect(() => {
    const refreshProgress = () => router.refresh();
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") refreshProgress();
    };
    const intervalId = window.setInterval(refreshProgress, 60_000);

    window.addEventListener("focus", refreshProgress);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", refreshProgress);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [router]);

  const handleSend = async () => {
    if (!canSend) return;

    setIsSending(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/agent-message-threads/${encodeURIComponent(threadId)}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            body: trimmedDraft,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(await getReplyErrorMessage(response));
      }

      const result = (await response.json()) as AgentReplyResponse;
      setMessages((currentMessages) => [...currentMessages, result.message]);
      const lifecycleEvent = result.event;
      if (lifecycleEvent) {
        setTimelineEvents((currentEvents) => [
          ...currentEvents,
          lifecycleEvent,
        ]);
      }
      setDraft("");
      router.refresh();
    } catch (sendError) {
      setError(
        sendError instanceof Error ? sendError.message : "Failed to send reply",
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {nextBefore || olderMessagesError ? (
        <div className="flex flex-col items-center gap-2">
          {nextBefore ? (
            <Button
              disabled={isLoadingOlder}
              onClick={handleLoadOlder}
              size="sm"
              type="button"
              variant="outline"
            >
              {isLoadingOlder ? <Spinner data-icon="inline-start" /> : null}
              {isLoadingOlder ? "Loading…" : "Load older messages"}
            </Button>
          ) : null}
          {olderMessagesError ? (
            <p className="text-sm text-destructive" role="alert">
              {olderMessagesError}
            </p>
          ) : null}
        </div>
      ) : null}
      <div
        aria-live="polite"
        className="flex flex-col gap-3"
        ref={conversationRef}
        role="log"
      >
        {conversationItems.length > 0 ? (
          conversationItems.map((item) =>
            item.kind === "event" ? (
              <ConversationLifecycleDivider event={item.event} key={item.id} />
            ) : (
              <MessageBubble
                key={item.id}
                message={item.message}
                writerName={writerName}
              />
            ),
          )
        ) : (
          <div className="rounded-[1.25rem] border border-accent/10 bg-white/60 px-5 py-8 text-center text-sm text-accent/76">
            No messages were returned for this thread.
          </div>
        )}
      </div>

      <div className="rounded-[1.25rem] border border-accent/10 bg-white/76 p-4 shadow-[0_14px_34px_rgba(24,44,69,0.06)]">
        <Textarea
          aria-label="Reply"
          disabled={isSending}
          minLength={1}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Type your reply..."
          value={draft}
        />
        {error ? (
          <p className="mt-3 text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setDraft("");
              setError(null);
            }}
            disabled={isSending || draft.length === 0}
          >
            <X data-icon="inline-start" />
            Cancel
          </Button>
          <Button type="button" onClick={handleSend} disabled={!canSend}>
            {isSending ? (
              <Spinner className="text-white" data-icon="inline-start" />
            ) : (
              <Send data-icon="inline-start" />
            )}
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
