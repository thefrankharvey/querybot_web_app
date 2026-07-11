import type {
  QueryTimelineEvent,
  WriterMessage,
} from "@/app/utils/message-types";

export type ConversationItem =
  | { id: string; kind: "event"; event: QueryTimelineEvent }
  | { id: string; kind: "message"; message: WriterMessage };

function getTimestamp(value: string) {
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

export function buildConversationItems(
  messages: readonly WriterMessage[],
  events: readonly QueryTimelineEvent[],
): ConversationItem[] {
  const messageIds = new Set(messages.map((message) => message.messageId));
  const sourcedEvents = new Map<string, QueryTimelineEvent[]>();
  const chronologicalItems: ConversationItem[] = [];
  const seenEventIds = new Set<string>();

  for (const event of events) {
    if (seenEventIds.has(event.eventId)) continue;
    seenEventIds.add(event.eventId);

    if (event.sourceMessageId && messageIds.has(event.sourceMessageId)) {
      const linkedEvents = sourcedEvents.get(event.sourceMessageId) ?? [];
      linkedEvents.push(event);
      sourcedEvents.set(event.sourceMessageId, linkedEvents);
      continue;
    }

    chronologicalItems.push({
      event,
      id: `event-${event.eventId}`,
      kind: "event",
    });
  }

  for (const message of messages) {
    const linkedEvents = sourcedEvents.get(message.messageId) ?? [];
    for (const event of linkedEvents.sort(
      (left, right) => left.statusVersion - right.statusVersion,
    )) {
      chronologicalItems.push({
        event,
        id: `event-${event.eventId}`,
        kind: "event",
      });
    }

    chronologicalItems.push({
      id: `message-${message.messageId}`,
      kind: "message",
      message,
    });
  }

  return chronologicalItems.sort((left, right) => {
    const leftTime = getTimestamp(
      left.kind === "event" ? left.event.occurredAt : left.message.createdAt,
    );
    const rightTime = getTimestamp(
      right.kind === "event" ? right.event.occurredAt : right.message.createdAt,
    );

    if (leftTime !== rightTime) return leftTime - rightTime;
    if (left.kind === right.kind) {
      return left.kind === "event" && right.kind === "event"
        ? left.event.statusVersion - right.event.statusVersion
        : 0;
    }

    return left.kind === "event" ? -1 : 1;
  });
}
