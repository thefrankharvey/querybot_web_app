import type { ReactNode } from "react";

import { LocalDateTime } from "@/app/components/messages/local-date-time";
import { cn } from "@/app/utils";

const CONVERSATION_COLUMNS =
  "grid md:grid-cols-[12rem_minmax(0,1fr)] lg:grid-cols-[13.5rem_minmax(0,1fr)]";

export function ConversationColumnsHeader() {
  return (
    <div
      aria-hidden
      className={cn(CONVERSATION_COLUMNS, "hidden md:grid")}
    >
      <div className="border-r border-accent/10 pb-3 pr-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent/56">
          Activity
        </p>
      </div>
      <div className="pb-3 pl-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent/56">
          Messages
        </p>
      </div>
    </div>
  );
}

export function ConversationItemRow({
  activity,
  children,
  className,
  id,
}: {
  activity?: ReactNode;
  children?: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <div className={cn(CONVERSATION_COLUMNS, className)} id={id}>
      <div
        className={cn(
          "min-w-0 md:border-r md:border-accent/10 md:pr-5",
          activity ? "pb-1 pt-2 md:py-3" : "hidden md:block",
        )}
      >
        {activity}
      </div>
      <div className="min-w-0 py-2 md:py-3 md:pl-6">{children}</div>
    </div>
  );
}

export function MessageBubbleFrame({
  children,
  createdAt,
  id,
  isOwnMessage,
  senderLabel,
}: {
  children: ReactNode;
  createdAt?: string | null;
  id?: string;
  isOwnMessage: boolean;
  senderLabel: string;
}) {
  return (
    <div
      className={cn(
        "flex",
        isOwnMessage
          ? "justify-end pl-6 sm:pl-12 lg:pl-20"
          : "justify-start pr-6 sm:pr-12 lg:pr-20",
      )}
    >
      <article
        className={cn(
          "max-w-3xl scroll-mt-24 rounded-[1.35rem] px-4 py-3 shadow-[0_12px_30px_rgba(24,44,69,0.055)]",
          isOwnMessage
            ? "border border-accent bg-accent text-white"
            : "border border-accent/10 bg-white/82 text-accent",
        )}
        data-message-id={id}
        id={id ? `message-${id}` : undefined}
      >
        <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-5 gap-y-1 text-xs font-medium">
          <span>{senderLabel}</span>
          {createdAt ? (
            <LocalDateTime
              className={
                isOwnMessage ? "text-white/78" : "text-accent/58"
              }
              value={createdAt}
            />
          ) : null}
        </div>
        {children}
      </article>
    </div>
  );
}
