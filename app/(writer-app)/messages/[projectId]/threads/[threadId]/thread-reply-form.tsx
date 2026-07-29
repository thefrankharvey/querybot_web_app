"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Clock3, Send, X } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  buildConversationItems,
  mergeMessagePages,
} from "@/app/components/messages/conversation-items";
import { ManuscriptAttachmentPicker } from "@/app/components/messages/manuscript-attachment-picker";
import { MessageAttachmentCard } from "@/app/components/messages/message-attachment-card";
import {
  ConversationColumnsHeader,
  ConversationItemRow,
  MessageBubbleFrame,
} from "@/app/components/messages/message-bubble";
import { ConversationLifecycleDivider } from "@/app/components/messages/query-lifecycle";
import { useManuscriptAttachmentUpload } from "@/app/hooks/use-manuscript-attachment-upload";
import { useWriterReadStateMutation } from "@/app/hooks/use-message-query-lifecycle";
import { Button } from "@/app/ui-primitives/button";
import { Spinner } from "@/app/ui-primitives/spinner";
import { Textarea } from "@/app/ui-primitives/textarea";
import type {
  AttachmentMutationResponse,
  QueryStatusCode,
  WriterMessage,
  WriterMessageApiErrorResponse,
  QueryTimelineEvent,
  WriterReplyResponse,
  WriterThreadMessagesResponse,
} from "@/app/utils/message-types";
import {
  canSendMessage,
  getAttachmentErrorAction,
  isManuscriptUploadVisible,
} from "@/app/utils/manuscript-attachments";

const MAX_LINKED_MESSAGE_PAGES = 10;

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
  onDeleteAttachment,
  projectId,
}: {
  message: WriterMessage;
  onDeleteAttachment: (attachmentId: string) => Promise<void>;
  projectId: string;
}) {
  const isWriter = message.senderRole === "writer";

  return (
    <ConversationItemRow>
      <MessageBubbleFrame
        createdAt={message.createdAt}
        id={message.messageId}
        isOwnMessage={isWriter}
        senderLabel={isWriter ? "You" : "Agent"}
      >
        {message.body.trim() ? (
          <p className="whitespace-pre-wrap text-sm leading-6 [overflow-wrap:anywhere]">
            {message.body}
          </p>
        ) : null}
        {message.attachments.map((attachment) => (
          <MessageAttachmentCard
            attachment={attachment}
            key={attachment.attachmentId}
            onDelete={
              isWriter && attachment.status === "attached"
                ? () => onDeleteAttachment(attachment.attachmentId)
                : undefined
            }
            projectId={projectId}
            threadId={message.threadId}
            viewerRole="writer"
          />
        ))}
      </MessageBubbleFrame>
    </ConversationItemRow>
  );
}

async function getReplyError(response: Response) {
  try {
    const body = (await response.json()) as WriterMessageApiErrorResponse;
    return {
      code: body.code,
      message: body.message || "Failed to send reply",
    };
  } catch {
    return { message: "Failed to send reply" };
  }
}

async function getReplyErrorMessage(response: Response) {
  return (await getReplyError(response)).message;
}

export function ThreadReplyForm({
  agentName,
  attachmentsEnabled,
  initialCanWriterReply,
  initialMessages,
  initialNextBefore,
  initialQueryStatus,
  initialQueryVersion,
  initialShareManuscriptOpen,
  initialTimelineEvents,
  projectId,
  threadId,
}: {
  agentName: string;
  attachmentsEnabled: boolean;
  initialCanWriterReply: boolean;
  initialMessages: WriterMessage[];
  initialNextBefore: string | null;
  initialQueryStatus: QueryStatusCode | null;
  initialQueryVersion: number | null;
  initialShareManuscriptOpen: boolean;
  initialTimelineEvents: QueryTimelineEvent[];
  projectId: string;
  threadId: string;
}) {
  const router = useRouter();
  const uploadController = useManuscriptAttachmentUpload({
    projectId,
    threadId,
  });
  const uploadAttachment = uploadController.attachment;
  const uploadErrorCode = uploadController.error?.code;
  const uploadPhase = uploadController.phase;
  const removeUpload = uploadController.remove;
  const conversationRef = useRef<HTMLDivElement>(null);
  const lastReadMessageIdRef = useRef<string | null>(null);
  const queryVersionRef = useRef(initialQueryVersion);
  const { mutate: markRead } = useWriterReadStateMutation({
    projectId,
    threadId,
  });
  const [messages, setMessages] = useState(initialMessages);
  const [timelineEvents, setTimelineEvents] = useState(initialTimelineEvents);
  const [nextBefore, setNextBefore] = useState(initialNextBefore);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [olderMessagesError, setOlderMessagesError] = useState<string | null>(
    null,
  );
  const [canWriterReply, setCanWriterReply] = useState(initialCanWriterReply);
  const [queryStatus, setQueryStatus] = useState(initialQueryStatus);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const trimmedDraft = draft.trim();
  const isWaitingForAgent = !canWriterReply;
  const showManuscriptUpload = isManuscriptUploadVisible(
    queryStatus,
    attachmentsEnabled,
  );
  const canSend = canSendMessage({
    attachmentReady: Boolean(uploadController.readyAttachment),
    body: trimmedDraft,
    canReply: canWriterReply,
    isBusy: isSending || uploadController.isBusy,
  });
  const conversationItems = useMemo(
    () => buildConversationItems(messages, timelineEvents),
    [messages, timelineEvents],
  );

  useEffect(() => {
    setMessages((currentMessages) =>
      mergeMessagePages(currentMessages, initialMessages),
    );
    setCanWriterReply(initialCanWriterReply);
    setQueryStatus(initialQueryStatus);
    setTimelineEvents(initialTimelineEvents);
    queryVersionRef.current = initialQueryVersion;
  }, [
    initialCanWriterReply,
    initialMessages,
    initialQueryStatus,
    initialQueryVersion,
    initialTimelineEvents,
  ]);

  useEffect(() => {
    if (uploadErrorCode === "ATTACHMENT_INVALID_QUERY_STATUS") {
      router.refresh();
    }
  }, [router, uploadErrorCode]);

  useEffect(() => {
    if (
      !showManuscriptUpload &&
      uploadAttachment &&
      uploadPhase !== "cancelling"
    ) {
      void removeUpload();
    }
  }, [
    removeUpload,
    showManuscriptUpload,
    uploadAttachment,
    uploadPhase,
  ]);

  const fetchOlderMessages = useCallback(
    async (before: string) => {
      const messagesUrl =
        `/api/message-threads/${encodeURIComponent(threadId)}/messages?` +
        new URLSearchParams({
          before,
          projectId,
          limit: "50",
        }).toString();
      const response = await fetch(messagesUrl, { cache: "no-store" });

      if (!response.ok) {
        throw new Error(await getReplyErrorMessage(response));
      }

      return (await response.json()) as WriterThreadMessagesResponse;
    },
    [projectId, threadId],
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
          },
        );
      },
      { threshold: [0.01, 1] },
    );

    for (const element of messageElements) observer.observe(element);
    return () => observer.disconnect();
  }, [markRead, messages]);

  useEffect(() => {
    if (!isWaitingForAgent) {
      return;
    }

    let isActive = true;
    const messagesUrl =
      `/api/message-threads/${encodeURIComponent(threadId)}/messages?` +
      new URLSearchParams({
        projectId,
        limit: "50",
      }).toString();

    const checkForAgentResponse = async () => {
      try {
        const response = await fetch(messagesUrl, { cache: "no-store" });

        if (!response.ok) {
          return;
        }

        const result = (await response.json()) as WriterThreadMessagesResponse;

        if (!isActive) {
          return;
        }

        setMessages(result.messages);
        setCanWriterReply(result.canWriterReply);
        setQueryStatus(result.queryProgress?.currentCode ?? null);
        if (
          result.queryProgress &&
          result.queryProgress.version !== queryVersionRef.current
        ) {
          queryVersionRef.current = result.queryProgress.version;
          router.refresh();
        }
      } catch {
        // Keep the current thread visible and try again on the next refresh.
      }
    };

    const handleFocus = () => {
      void checkForAgentResponse();
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void checkForAgentResponse();
      }
    };
    const intervalId = window.setInterval(() => {
      void checkForAgentResponse();
    }, 15_000);

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isActive = false;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isWaitingForAgent, projectId, router, threadId]);

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

  const deleteSentAttachment = useCallback(
    async (messageId: string, attachmentId: string) => {
      const response = await fetch(
        `/api/message-threads/${encodeURIComponent(threadId)}/attachments/${encodeURIComponent(attachmentId)}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId, reason: "writer_deleted" }),
          cache: "no-store",
        },
      );

      if (!response.ok) throw new Error(await getReplyErrorMessage(response));

      const result = (await response.json()) as AttachmentMutationResponse;
      setMessages((currentMessages) =>
        currentMessages.map((message) =>
          message.messageId === messageId
            ? {
                ...message,
                attachments: message.attachments.map((messageAttachment) =>
                  messageAttachment.attachmentId === attachmentId
                    ? result.attachment
                    : messageAttachment,
                ),
              }
            : message,
        ),
      );
    },
    [projectId, threadId],
  );

  const handleSend = async () => {
    if (!canSend) return;

    setIsSending(true);
    setError(null);
    uploadController.markSending();

    try {
      const response = await fetch(
        `/api/message-threads/${encodeURIComponent(threadId)}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projectId,
            body: trimmedDraft,
            attachmentIds: uploadController.readyAttachment
              ? [uploadController.readyAttachment.attachmentId]
              : [],
          }),
        },
      );

      if (!response.ok) {
        const replyError = await getReplyError(response);
        const action = getAttachmentErrorAction(replyError.code);
        if (uploadController.readyAttachment) {
          if (replyError.code === "ATTACHMENT_INVALID_QUERY_STATUS") {
            await uploadController.remove();
            router.refresh();
          } else if (
            action === "restart" ||
            action === "refresh" ||
            action === "unavailable"
          ) {
            uploadController.markSent();
            router.refresh();
          }
        }
        throw new Error(replyError.message);
      }

      const result = (await response.json()) as WriterReplyResponse;
      setMessages((currentMessages) => [...currentMessages, result.message]);
      const lifecycleEvent = result.event;
      if (lifecycleEvent) {
        setTimelineEvents((currentEvents) => [
          ...currentEvents,
          lifecycleEvent,
        ]);
      }
      setDraft("");
      setQueryStatus(result.queryProgress.currentCode);
      uploadController.markSent();
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
      <div className="flex flex-col">
        <ConversationColumnsHeader />
        {nextBefore || olderMessagesError ? (
          <ConversationItemRow>
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
          </ConversationItemRow>
        ) : null}
        <div
          aria-live="polite"
          className="flex flex-col"
          ref={conversationRef}
          role="log"
        >
          {conversationItems.length > 0 ? (
            conversationItems.map((item) =>
              item.kind === "event" ? (
                <ConversationLifecycleDivider
                  event={item.event}
                  key={item.id}
                  viewerRole="writer"
                />
              ) : (
                <MessageBubble
                  key={item.id}
                  message={item.message}
                  onDeleteAttachment={(attachmentId) =>
                    deleteSentAttachment(item.message.messageId, attachmentId)
                  }
                  projectId={projectId}
                />
              ),
            )
          ) : (
            <ConversationItemRow>
              <div className="rounded-[1.25rem] border border-accent/10 bg-white/60 px-5 py-8 text-center text-sm text-accent/76">
                No messages were returned for this thread.
              </div>
            </ConversationItemRow>
          )}
        </div>
      </div>

      <ConversationItemRow>
        <div className="rounded-[1.25rem] border border-accent/10 bg-white/76 p-4 shadow-[0_14px_34px_rgba(24,44,69,0.06)]">
          {isWaitingForAgent ? (
            <div className="flex items-start gap-3" role="status">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-accent/10 bg-accent/6 text-accent/68">
                <Clock3 aria-hidden className="size-4" />
              </span>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold text-accent">
                  Waiting for the agent
                </p>
                <p className="text-sm leading-6 text-accent/76">
                  Your query is with the agent. You’ll be able to respond after
                  they reply or request material.
                </p>
              </div>
            </div>
          ) : (
            <>
              <Textarea
                aria-label="Reply"
                disabled={isSending || uploadController.isBusy}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Type your reply..."
                value={draft}
              />
              {showManuscriptUpload ? (
                <ManuscriptAttachmentPicker
                  agentName={agentName}
                  controller={uploadController}
                  disabled={isSending}
                  initialOpen={initialShareManuscriptOpen}
                />
              ) : null}
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
                    if (uploadController.readyAttachment) {
                      void uploadController.remove();
                    }
                  }}
                  disabled={
                    isSending ||
                    uploadController.isBusy ||
                    (draft.length === 0 && !uploadController.readyAttachment)
                  }
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
            </>
          )}
        </div>
      </ConversationItemRow>
    </div>
  );
}
