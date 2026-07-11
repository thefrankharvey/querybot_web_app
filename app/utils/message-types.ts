export const KNOWN_QUERY_STATUS_CODES = [
  "query_sent",
  "query_viewed",
  "manuscript_requested",
  "manuscript_under_review",
  "rejected",
  "closed_no_response",
  "offer_of_representation",
] as const;

export type KnownQueryStatusCode = (typeof KNOWN_QUERY_STATUS_CODES)[number];
export type QueryStatusCode = KnownQueryStatusCode | "unknown";
export type QueryStatusTransitionCode = Exclude<
  KnownQueryStatusCode,
  "query_sent" | "query_viewed"
>;
export type MessageSenderRole = "writer" | "agent";
export type QueryActorRole = MessageSenderRole | "system" | "unknown";
export type QueryNextActionOwner = MessageSenderRole | "unknown";
export type AgentActivityWindow = "30" | "90" | "180" | "all";

export type MessageThreadFilters = {
  queryStatus?: KnownQueryStatusCode;
  terminal?: boolean;
};

export function isKnownQueryStatusCode(
  value: unknown,
): value is KnownQueryStatusCode {
  return (
    typeof value === "string" &&
    (KNOWN_QUERY_STATUS_CODES as readonly string[]).includes(value)
  );
}

export function normalizeQueryStatusCode(value: unknown): QueryStatusCode {
  return isKnownQueryStatusCode(value) ? value : "unknown";
}

const WRITER_REPLY_UNLOCKING_STATUS_CODES: readonly QueryStatusCode[] = [
  "manuscript_requested",
  "manuscript_under_review",
  "offer_of_representation",
];

export function queryStatusUnlocksWriterReply(value: unknown) {
  const status = normalizeQueryStatusCode(value);
  return WRITER_REPLY_UNLOCKING_STATUS_CODES.includes(status);
}

export type QueryNextAction = {
  owner: QueryNextActionOwner;
  rawOwner: string;
  dueAt: string | null;
  overdueAtFetch: boolean;
};

/**
 * Canonical lifecycle snapshot used by the UI.
 *
 * Backend-derived `days_*` and `as_of` fields are intentionally omitted. They
 * become stale in caches; consumers should derive elapsed time from timestamps.
 */
export type QueryProgress = {
  currentCode: QueryStatusCode;
  rawCurrentCode: string;
  changedAt: string;
  version: number;
  isTerminal: boolean;
  sentAt: string;
  viewedAt: string | null;
  nextAction: QueryNextAction | null;
  allowedTransitions: QueryStatusCode[];
  rawAllowedTransitions: string[];
};

export type QueryStatusEvent = {
  eventId: string;
  threadId: string;
  statusVersion: number;
  fromStatus: QueryStatusCode | null;
  rawFromStatus: string | null;
  toStatus: QueryStatusCode;
  rawToStatus: string;
  occurredAt: string;
  recordedAt: string;
  actorUserId: string | null;
  actorRole: QueryActorRole;
  rawActorRole: string;
  source: string;
  sourceMessageId: string | null;
  note: string | null;
  reasonCode: string | null;
  dueAt: string | null;
  idempotencyKey: string | null;
  metadata: Record<string, unknown>;
};

export type QueryTimelineEvent = QueryStatusEvent;

type MessageThreadActivity = {
  queryProgress: QueryProgress | null;
  unreadCount: number;
  lastMessageId: string | null;
  lastMessageSenderRole: MessageSenderRole | null;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  lastActivityAt: string | null;
  firstOpenedAt: string | null;
  lastReadAt: string | null;
  lastReadMessageId: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type WriterMessageThread = MessageThreadActivity & {
  threadId: string;
  subject: string;
  writerProjectId: string;
  projectName: string;
  agentProfileId: string;
  agentName: string;
  agency: string | null;
  savedAgentId: string | null;
  legacyAgentId: string | null;
  indexId: string | null;
};

export function getWriterThreadsByAgentIdentifier(
  threads: readonly WriterMessageThread[],
): ReadonlyMap<string, WriterMessageThread[]> {
  const index = new Map<string, WriterMessageThread[]>();

  for (const thread of threads) {
    const identifiers = new Set(
      [
        thread.savedAgentId,
        thread.legacyAgentId,
        thread.indexId,
        thread.agentProfileId,
      ]
        .map((identifier) => identifier?.trim() || "")
        .filter(Boolean),
    );

    for (const identifier of identifiers) {
      const existing = index.get(identifier);

      if (existing) {
        existing.push(thread);
      } else {
        index.set(identifier, [thread]);
      }
    }
  }

  return index;
}

export type AgentMessageThread = MessageThreadActivity & {
  threadId: string;
  subject: string;
  writerProjectId: string;
  projectName: string;
  agentProfileId: string;
  agentName: string | null;
  writerName: string | null;
};

export type WriterMessage = {
  messageId: string;
  threadId: string;
  senderUserId: string;
  senderRole: MessageSenderRole;
  body: string;
  createdAt: string;
};

export type WriterMessageProject = {
  projectId: string;
  projectName: string;
  writerProjectId: string | null;
  isMessagingAvailable: boolean;
};

export type WriterMessageRecipientAgent = {
  savedAgentId: string;
  legacyAgentId: string | null;
  indexId: string | null;
  name: string;
  agency: string | null;
  projectName: string;
  writerProjectId: string | null;
  agentProfileId: string | null;
  isMessagingAvailable: boolean;
};

export type AgentMessageProfile = {
  profileId: string | null;
  legacyAgentId: string | null;
  name: string | null;
  isMessagingAvailable: boolean;
};

export type WriterMessageThreadsResponse = {
  status: "success";
  project: WriterMessageProject;
  threads: WriterMessageThread[];
  savedAgents: WriterMessageRecipientAgent[];
};

export type AgentMessageThreadsResponse = {
  status: "success";
  agent: AgentMessageProfile;
  threads: AgentMessageThread[];
};

export type WriterThreadMessagesResponse = {
  status: "success";
  project: WriterMessageProject;
  threadId: string;
  messages: WriterMessage[];
  canWriterReply: boolean;
  nextBefore: string | null;
  queryProgress: QueryProgress | null;
};

export type AgentThreadMessagesResponse = {
  status: "success";
  agent: AgentMessageProfile;
  threadId: string;
  messages: WriterMessage[];
  nextBefore: string | null;
  queryProgress: QueryProgress | null;
};

export type WriterThreadDetailResponse = {
  status: "success";
  project: WriterMessageProject;
  thread: WriterMessageThread;
  queryProgress: QueryProgress;
};

export type AgentThreadDetailResponse = {
  status: "success";
  agent: AgentMessageProfile;
  thread: AgentMessageThread;
  queryProgress: QueryProgress;
};

export type MessageMutationResponse = {
  status: "success";
  message: WriterMessage;
  event: QueryStatusEvent | null;
  queryProgress: QueryProgress;
};

export type WriterReplyResponse = MessageMutationResponse;
export type AgentReplyResponse = MessageMutationResponse;

export type WriterCreateThreadResponse =
  | {
      status: "success";
      threadId: string;
      message: WriterMessage;
      event: QueryStatusEvent;
      queryProgress: QueryProgress;
      duplicate?: false;
    }
  | {
      status: "duplicate";
      threadId: string;
      message: string;
      duplicate: true;
    };

export type MessageReadState = {
  threadId: string;
  participantRole: MessageSenderRole;
  firstOpenedAt: string | null;
  lastReadAt: string | null;
  lastReadMessageId: string | null;
};

export type MessageReadStateResponse = {
  status: "success";
  readState: MessageReadState;
  event: QueryStatusEvent | null;
  queryProgress: QueryProgress;
};

export type QueryStatusTransitionInput = {
  toStatus: QueryStatusTransitionCode;
  expectedVersion: number;
  idempotencyKey?: string;
  note?: string | null;
  reasonCode?: string | null;
  dueAt?: string | null;
  occurredAt?: string | null;
  sourceMessageId?: string | null;
  metadata?: Record<string, unknown>;
};

export type QueryStatusTransitionResponse = {
  status: "success";
  event: QueryStatusEvent;
  queryProgress: QueryProgress;
};

export type QueryTimelineResponse = {
  status: "success";
  threadId: string;
  queryProgress: QueryProgress;
  events: QueryStatusEvent[];
};

export type AgentActivityViewerEvent = {
  statusVersion: number;
  fromStatus: QueryStatusCode | null;
  rawFromStatus: string | null;
  toStatus: QueryStatusCode;
  rawToStatus: string;
  occurredAt: string;
  recordedAt: string;
  actorRole: QueryActorRole;
  rawActorRole: string;
  source: string;
  dueAt: string | null;
};

export type AgentActivityBenchmark = {
  sampleSize: number;
  medianDays: number | null;
  p25Days: number | null;
  p75Days: number | null;
};

export type AgentActivityLaneEvent = {
  status: QueryStatusCode;
  rawStatus: string;
  occurredOn: string;
  elapsedDays: number | null;
};

export type AgentActivityLane = {
  laneId: string;
  sentOn: string;
  currentStatus: QueryStatusCode;
  rawCurrentStatus: string;
  isTerminal: boolean;
  lastStatusOn: string;
  events: AgentActivityLaneEvent[];
};

export type AgentActivitySummary = {
  totalQueries: number;
  activeQueries: number;
  terminalQueries: number;
  statusCounts: Record<KnownQueryStatusCode, number>;
  priorSentStillActive: number;
  durations: {
    timeToFirstView: AgentActivityBenchmark | null;
    timeToTerminal: AgentActivityBenchmark | null;
  };
};

export type AgentActivityResponse = {
  status: "success";
  threadId: string;
  /** Response freshness marker; display-only and never written back. */
  asOf: string;
  scope: {
    source: string;
    agentProfileId: string;
    window: AgentActivityWindow;
    windowDays: number | null;
    from: string | null;
    to: string;
  };
  privacy: {
    minimumSampleSize: number;
    cohortSize: number | null;
    detailsAvailable: boolean;
    suppressionReason: "minimum_sample_size" | null;
  };
  viewerQuery: {
    queryProgress: QueryProgress;
    events: AgentActivityViewerEvent[];
  };
  summary: AgentActivitySummary | null;
  lanes: AgentActivityLane[];
};

export type WriterMessageApiErrorResponse = {
  status: "error";
  message: string;
};
