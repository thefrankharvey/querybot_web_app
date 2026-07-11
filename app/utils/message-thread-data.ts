import "server-only";

import { randomUUID } from "crypto";
import { auth, currentUser } from "@clerk/nextjs/server";

import { AGENT_MATCHES_TABLE, DEFAULT_PROJECT_NAME } from "@/app/constants";
import { createServerSupabase } from "@/app/api/supabase/server";
import { getWqhApiUrl, getWqhMessagingApiSecret } from "@/lib/config";
import { clerkClient } from "@/lib/clerk-utils";
import { getAccountMetadata } from "@/lib/clerk-metadata";
import {
  getProjectMessageThreadHref,
  getProjectMessagesHref,
} from "@/app/utils/message-routes";
import type {
  AgentActivityBenchmark,
  AgentActivityResponse,
  AgentActivityViewerEvent,
  AgentActivityWindow,
  AgentMessageProfile,
  AgentMessageThread,
  AgentMessageThreadsResponse,
  AgentReplyResponse,
  AgentThreadMessagesResponse,
  AgentThreadDetailResponse,
  MessageReadState,
  MessageReadStateResponse,
  MessageSenderRole,
  MessageThreadFilters,
  QueryActorRole,
  QueryProgress,
  QueryStatusEvent,
  QueryStatusTransitionInput,
  QueryStatusTransitionResponse,
  QueryTimelineResponse,
  WriterMessage,
  WriterCreateThreadResponse,
  WriterMessageRecipientAgent,
  WriterMessageProject,
  WriterMessageThread,
  WriterMessageThreadsResponse,
  WriterReplyResponse,
  WriterThreadDetailResponse,
  WriterThreadMessagesResponse,
} from "@/app/utils/message-types";
import {
  normalizeQueryStatusCode,
  queryStatusUnlocksWriterReply,
} from "@/app/utils/message-types";
import type {
  WireAgentActivityBenchmark,
  WireAgentActivityResponse,
  WireAgentActivityViewerEvent,
  WireCreateMessageRequest,
  WireCreateMessageThreadRequest,
  WireCreateThreadResponse,
  WireMessage,
  WireMessageMutationResponse,
  WireMessageReadState,
  WireMessageThread,
  WireMessageThreadIdentity,
  WireMessageThreadsResponse,
  WireQueryProgress,
  WireQueryStatusEvent,
  WireQueryStatusTransitionResponse,
  WireQueryTimelineResponse,
  WireReadStateResponse,
  WireReadStateRequest,
  WireThreadDetailResponse,
  WireThreadMessagesResponse,
  WireQueryStatusTransitionRequest,
} from "@/app/utils/message-api-contract";
import {
  getProjectDashboardHrefById,
  normalizeRouteProjectId,
} from "@/app/utils/project-profile";
import { getProjectProfileRouteData } from "@/app/utils/project-profile-data";
import { isAgentMessagingProfileAvailable } from "@/app/utils/agent-messaging-availability";
import {
  AgentMessagingProfileError,
  ensureAgentMessagingProfile,
  fetchAgentMessagingProfileByLegacyId,
  type AgentMessagingProfileRow,
} from "@/app/utils/agent-messaging-profile.server";

type MessageThreadApiRow = WireMessageThread;
type MessageApiRow = WireMessage;
type MessageThreadsApiResponse = WireMessageThreadsResponse;
type ThreadMessagesApiResponse = WireThreadMessagesResponse;

type SuccessfulThreadMessagesApiResponse = Extract<
  ThreadMessagesApiResponse,
  { status: "success" }
>;

type ReplyApiResponse = WireMessageMutationResponse;
type CreateThreadApiResponse = WireCreateThreadResponse;

type AgentProfileApiRow = AgentMessagingProfileRow;

type SavedAgentMessageRow = {
  id: string | null;
  name: string | null;
  agency: string | null;
  index_id: string | null;
  project_name: string | null;
  writer_project_id: string | null;
};

type WriterProjectOwnerRow = {
  user_id: string | null;
  writer_project_id: string | null;
};

type WriterMessageAgentMetadata = {
  agency: string | null;
  savedAgentId: string | null;
  legacyAgentId: string | null;
  indexId: string | null;
};

type WriterMessageAgentMetadataIndex = {
  byAgentName: ReadonlyMap<string, WriterMessageAgentMetadata>;
  byAgentProfileId: ReadonlyMap<string, WriterMessageAgentMetadata>;
};

type ResolvedWriterMessageProject = {
  clerkUserId: string;
  project: WriterMessageProject;
  writerUserId: string | null;
};

type ResolvedAvailableWriterMessageProject = ResolvedWriterMessageProject & {
  project: WriterMessageProject & {
    writerProjectId: string;
    isMessagingAvailable: true;
  };
  writerUserId: string;
};

type ResolvedAgentMessageProfile = {
  agent: AgentMessageProfile;
  backendUserId: string | null;
  clerkUserId: string;
  email: string | null;
};

type ResolvedAvailableAgentMessageProfile = ResolvedAgentMessageProfile & {
  agent: AgentMessageProfile & {
    profileId: string;
    isMessagingAvailable: true;
  };
  backendUserId: string;
};

export class WriterMessageApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "WriterMessageApiError";
    this.status = status;
  }
}

export class AgentMessageApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AgentMessageApiError";
    this.status = status;
  }
}

function getString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getNullableString(value: unknown) {
  const stringValue = getString(value);
  return stringValue || null;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function getUuid(value: unknown) {
  const stringValue = getString(value);
  return UUID_PATTERN.test(stringValue) ? stringValue : null;
}

function getLookupKey(value: unknown) {
  return getString(value).toLocaleLowerCase();
}

function getProjectNameKey(projectName?: string | null) {
  const trimmed = projectName?.trim();
  return (trimmed || DEFAULT_PROJECT_NAME).toLocaleLowerCase();
}

function isSenderRole(value: string): value is MessageSenderRole {
  return value === "writer" || value === "agent";
}

function normalizeSenderRole(value: unknown): MessageSenderRole {
  const role = getString(value);
  return isSenderRole(role) ? role : "agent";
}

function normalizeNullableSenderRole(value: unknown): MessageSenderRole | null {
  const role = getString(value);
  return isSenderRole(role) ? role : null;
}

function buildWqhMessageUrl(path: string, params?: Record<string, string>) {
  const baseUrl = getWqhApiUrl().replace(/\/$/, "");
  const query = params ? new URLSearchParams(params).toString() : "";

  return `${baseUrl}${path}${query ? `?${query}` : ""}`;
}

function fetchWqhMessageApi(url: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  const messagingSecret = getWqhMessagingApiSecret();

  if (messagingSecret) {
    headers.set("X-WQH-Messaging-Key", messagingSecret);
  }

  return fetch(url, { ...init, headers });
}

async function parseApiJson<TResponse>(
  response: Response,
): Promise<TResponse | null> {
  try {
    return (await response.json()) as TResponse;
  } catch {
    return null;
  }
}

function getApiErrorMessage(body: unknown, fallback: string) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return fallback;

  const candidate = body as { status?: unknown; message?: unknown };
  return candidate.status === "error" && typeof candidate.message === "string"
    ? candidate.message
    : fallback;
}

function getNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function getBoolean(value: unknown) {
  return value === true;
}

function getRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function normalizeActorRole(value: unknown): QueryActorRole {
  const role = getString(value);
  return role === "writer" || role === "agent" || role === "system"
    ? role
    : "unknown";
}

export function normalizeQueryProgress(
  progress: Partial<WireQueryProgress> | null | undefined,
): QueryProgress | null {
  if (!progress || !getString(progress.current_code)) return null;

  const rawCurrentCode = getString(progress.current_code);
  const rawAllowedTransitions = Array.isArray(progress.allowed_transitions)
    ? progress.allowed_transitions.map(getString).filter(Boolean)
    : [];
  const rawNextAction = progress.next_action;
  const rawOwner = getString(rawNextAction?.owner);

  return {
    currentCode: normalizeQueryStatusCode(rawCurrentCode),
    rawCurrentCode,
    changedAt: getString(progress.changed_at),
    version: Math.max(0, Math.trunc(getNumber(progress.version))),
    isTerminal: getBoolean(progress.is_terminal),
    sentAt: getString(progress.sent_at),
    viewedAt: getNullableString(progress.viewed_at),
    nextAction: rawNextAction
      ? {
          owner:
            rawOwner === "writer" || rawOwner === "agent"
              ? rawOwner
              : "unknown",
          rawOwner,
          dueAt: getNullableString(rawNextAction.due_at),
          overdueAtFetch: getBoolean(rawNextAction.overdue),
        }
      : null,
    allowedTransitions: rawAllowedTransitions.map(normalizeQueryStatusCode),
    rawAllowedTransitions,
  };
}

function requireQueryProgress(
  progress: Partial<WireQueryProgress> | null | undefined,
  ErrorType: typeof WriterMessageApiError | typeof AgentMessageApiError,
) {
  const normalized = normalizeQueryProgress(progress);

  if (!normalized) {
    throw new ErrorType("The messaging API did not return query progress", 502);
  }

  return normalized;
}

export function normalizeQueryStatusEvent(
  event: Partial<WireQueryStatusEvent> | null | undefined,
): QueryStatusEvent | null {
  if (!event || !getString(event.to_status)) return null;

  const rawFromStatus = getNullableString(event.from_status);
  const rawToStatus = getString(event.to_status);
  const rawActorRole = getString(event.actor_role);

  return {
    eventId: getString(event.event_id),
    threadId: getString(event.thread_id),
    statusVersion: Math.max(0, Math.trunc(getNumber(event.status_version))),
    fromStatus: rawFromStatus ? normalizeQueryStatusCode(rawFromStatus) : null,
    rawFromStatus,
    toStatus: normalizeQueryStatusCode(rawToStatus),
    rawToStatus,
    occurredAt: getString(event.occurred_at),
    recordedAt: getString(event.recorded_at),
    actorUserId: getNullableString(event.actor_user_id),
    actorRole: normalizeActorRole(rawActorRole),
    rawActorRole,
    source: getString(event.source),
    sourceMessageId: getNullableString(event.source_message_id),
    note: getNullableString(event.note),
    reasonCode: getNullableString(event.reason_code),
    dueAt: getNullableString(event.due_at),
    idempotencyKey: getNullableString(event.idempotency_key),
    metadata: getRecord(event.metadata),
  };
}

function requireQueryStatusEvent(
  event: Partial<WireQueryStatusEvent> | null | undefined,
  ErrorType: typeof WriterMessageApiError | typeof AgentMessageApiError,
) {
  const normalized = normalizeQueryStatusEvent(event);

  if (!normalized) {
    throw new ErrorType(
      "The messaging API did not return a lifecycle event",
      502,
    );
  }

  return normalized;
}

function createUnavailableProject(
  projectId: string,
  projectName: string,
  writerProjectId: string | null,
): WriterMessageProject {
  return {
    projectId,
    projectName,
    writerProjectId,
    isMessagingAvailable: false,
  };
}

function createUnavailableAgent({
  legacyAgentId,
  name,
}: {
  legacyAgentId?: string | null;
  name?: string | null;
}): AgentMessageProfile {
  return {
    profileId: null,
    legacyAgentId: legacyAgentId?.trim() || null,
    name: name?.trim() || null,
    isMessagingAvailable: false,
  };
}

function normalizeAgentProfile(
  profile: AgentProfileApiRow,
): AgentMessageProfile {
  const profileId = getUuid(profile.profile_id);

  return {
    profileId,
    legacyAgentId: getNullableString(profile.legacy_agent_id),
    name: getNullableString(profile.name),
    isMessagingAvailable: isAgentMessagingProfileAvailable(profile),
  };
}

async function fetchAgentProfileByLegacyId(legacyAgentId: string) {
  try {
    return await fetchAgentMessagingProfileByLegacyId(legacyAgentId);
  } catch (error) {
    if (error instanceof AgentMessagingProfileError) {
      throw new AgentMessageApiError(error.message, error.status);
    }

    throw error;
  }
}

async function resolveWriterMessageProject(
  routeProjectId: string,
): Promise<ResolvedWriterMessageProject | null> {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    throw new WriterMessageApiError("Unauthorized", 401);
  }

  const routeData = await getProjectProfileRouteData(routeProjectId);

  if (!routeData) {
    return null;
  }

  const profile = routeData.profile;
  const writerProjectId = profile.writerProjectId?.trim() || null;
  const isMessagingAvailable =
    routeData.source === "writer-project-api" && Boolean(writerProjectId);

  return {
    clerkUserId,
    writerUserId: isMessagingAvailable ? profile.userId : null,
    project: isMessagingAvailable
      ? {
          projectId: profile.projectId,
          projectName: profile.projectName,
          writerProjectId,
          isMessagingAvailable: true,
        }
      : createUnavailableProject(
          profile.projectId,
          profile.projectName,
          profile.savedAgentWriterProjectId ?? null,
        ),
  };
}

async function resolveAgentMessageProfile(): Promise<ResolvedAgentMessageProfile> {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    throw new AgentMessageApiError("Unauthorized", 401);
  }

  const user = await currentUser();
  const { accountType, agentId } = getAccountMetadata(user);
  const email =
    user?.primaryEmailAddress?.emailAddress ||
    user?.emailAddresses[0]?.emailAddress ||
    null;

  if (accountType !== "agent") {
    throw new AgentMessageApiError(
      "Only agent accounts can access messages",
      403,
    );
  }

  if (!agentId) {
    return {
      agent: createUnavailableAgent({}),
      backendUserId: null,
      clerkUserId,
      email,
    };
  }

  const profile = await fetchAgentProfileByLegacyId(agentId);

  if (!profile) {
    return {
      agent: createUnavailableAgent({ legacyAgentId: agentId }),
      backendUserId: null,
      clerkUserId,
      email,
    };
  }

  let resolvedProfile = profile;
  const profileId = getUuid(profile.profile_id);
  let backendUserId = getUuid(profile.user_id);

  if (profileId && !backendUserId) {
    if (!email) {
      throw new AgentMessageApiError(
        "A verified email is required to link this agent profile for messaging",
        400,
      );
    }

    try {
      resolvedProfile = await ensureAgentMessagingProfile({ email, profile });
    } catch (error) {
      if (error instanceof AgentMessagingProfileError) {
        throw new AgentMessageApiError(error.message, error.status);
      }

      throw error;
    }
    backendUserId = getUuid(resolvedProfile.user_id);
  }

  const agent = normalizeAgentProfile(resolvedProfile);

  return {
    agent,
    backendUserId,
    clerkUserId,
    email,
  };
}

function assertAvailableProject(
  resolvedProject: ResolvedWriterMessageProject,
): ResolvedAvailableWriterMessageProject {
  if (
    !resolvedProject.project.isMessagingAvailable ||
    !resolvedProject.project.writerProjectId ||
    !resolvedProject.writerUserId
  ) {
    throw new WriterMessageApiError(
      "Messages are unavailable for this project until it is synced to a writer project.",
      400,
    );
  }

  return resolvedProject as ResolvedAvailableWriterMessageProject;
}

function assertAvailableAgent(
  resolvedAgent: ResolvedAgentMessageProfile,
): ResolvedAvailableAgentMessageProfile {
  if (
    !resolvedAgent.agent.isMessagingAvailable ||
    !resolvedAgent.agent.profileId ||
    !resolvedAgent.backendUserId
  ) {
    throw new AgentMessageApiError(
      "Messages are unavailable until an agent profile is linked.",
      400,
    );
  }

  return resolvedAgent as ResolvedAvailableAgentMessageProfile;
}

function savedAgentMatchesProject({
  project,
  row,
}: {
  project: WriterMessageProject;
  row: SavedAgentMessageRow;
}) {
  const writerProjectId = project.writerProjectId?.trim() || "";
  const rowWriterProjectId = row.writer_project_id?.trim() || "";
  const projectNameKey = getProjectNameKey(project.projectName);
  const rowProjectNameKey = getProjectNameKey(row.project_name);

  if (writerProjectId) {
    return rowWriterProjectId
      ? rowWriterProjectId === writerProjectId
      : rowProjectNameKey === projectNameKey;
  }

  return !rowWriterProjectId && rowProjectNameKey === projectNameKey;
}

async function fetchProjectScopedSavedAgentRows({
  clerkUserId,
  project,
}: {
  clerkUserId: string;
  project: WriterMessageProject;
}) {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from(AGENT_MATCHES_TABLE)
    .select("id,name,agency,index_id,project_name,writer_project_id")
    .eq("user_id", clerkUserId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new WriterMessageApiError(error.message, 400);
  }

  return ((data ?? []) as SavedAgentMessageRow[]).filter((row) =>
    savedAgentMatchesProject({ project, row }),
  );
}

function getSavedAgentMessageMetadata(
  rows: SavedAgentMessageRow[],
): Map<string, WriterMessageAgentMetadata> {
  const metadataByAgentName = new Map<string, WriterMessageAgentMetadata>();
  const countByAgentName = new Map<string, number>();

  for (const row of rows) {
    const agentNameKey = getLookupKey(row.name);
    if (!agentNameKey) continue;
    countByAgentName.set(
      agentNameKey,
      (countByAgentName.get(agentNameKey) ?? 0) + 1,
    );
  }

  for (const row of rows) {
    const agentNameKey = getLookupKey(row.name);
    if (
      !agentNameKey ||
      countByAgentName.get(agentNameKey) !== 1 ||
      metadataByAgentName.has(agentNameKey)
    ) {
      continue;
    }

    metadataByAgentName.set(agentNameKey, {
      agency: getNullableString(row.agency),
      savedAgentId: getNullableString(row.id),
      legacyAgentId: getNullableString(row.index_id),
      indexId: getNullableString(row.index_id),
    });
  }

  return metadataByAgentName;
}

async function fetchAgentProfileForWriterRecipient(legacyAgentId: string) {
  try {
    return await fetchAgentProfileByLegacyId(legacyAgentId);
  } catch (error) {
    if (error instanceof AgentMessageApiError) {
      throw new WriterMessageApiError(error.message, error.status);
    }

    throw error;
  }
}

function isAgentProfileAvailableForWriterMessages(
  profile: AgentProfileApiRow | null,
) {
  return isAgentMessagingProfileAvailable(profile);
}

async function resolveWriterMessageRecipientAgents(
  rows: SavedAgentMessageRow[],
): Promise<WriterMessageRecipientAgent[]> {
  const profileIds = new Map<string, Promise<AgentProfileApiRow | null>>();

  for (const row of rows) {
    const legacyAgentId = getNullableString(row.index_id);
    if (!legacyAgentId || profileIds.has(legacyAgentId)) continue;

    profileIds.set(
      legacyAgentId,
      fetchAgentProfileForWriterRecipient(legacyAgentId),
    );
  }

  const profileEntries = await Promise.all(
    Array.from(profileIds.entries()).map(
      async ([legacyAgentId, profile]) =>
        [legacyAgentId, await profile] as const,
    ),
  );
  const profileByLegacyAgentId = new Map(profileEntries);

  return rows
    .map((row) => {
      const savedAgentId = getString(row.id);
      const legacyAgentId = getNullableString(row.index_id);
      const profile = legacyAgentId
        ? (profileByLegacyAgentId.get(legacyAgentId) ?? null)
        : null;
      const agentProfileId = getNullableString(profile?.profile_id);

      return {
        savedAgentId,
        legacyAgentId,
        indexId: legacyAgentId,
        name: getString(row.name) || "Unknown agent",
        agency: getNullableString(row.agency),
        projectName: getString(row.project_name) || DEFAULT_PROJECT_NAME,
        writerProjectId: getNullableString(row.writer_project_id),
        agentProfileId,
        isMessagingAvailable: isAgentProfileAvailableForWriterMessages(profile),
      };
    })
    .filter((agent) => Boolean(agent.savedAgentId));
}

async function fetchWriterMessageRecipientAgents({
  clerkUserId,
  project,
}: {
  clerkUserId: string;
  project: WriterMessageProject;
}) {
  const rows = await fetchProjectScopedSavedAgentRows({ clerkUserId, project });
  const savedAgents = await resolveWriterMessageRecipientAgents(rows);
  const metadataByAgentName = getSavedAgentMessageMetadata(rows);
  const metadataByAgentProfileId = new Map<
    string,
    WriterMessageAgentMetadata
  >();

  for (const agent of savedAgents) {
    if (!agent.agentProfileId) continue;

    metadataByAgentProfileId.set(agent.agentProfileId, {
      agency: agent.agency,
      savedAgentId: agent.savedAgentId,
      legacyAgentId: agent.legacyAgentId,
      indexId: agent.indexId,
    });
  }

  return {
    metadataIndex: {
      byAgentName: metadataByAgentName,
      byAgentProfileId: metadataByAgentProfileId,
    } satisfies WriterMessageAgentMetadataIndex,
    savedAgents,
  };
}

function normalizeThreadActivity(thread: MessageThreadApiRow) {
  return {
    queryProgress: normalizeQueryProgress(thread.query_progress),
    unreadCount: Math.max(0, Math.trunc(getNumber(thread.unread_count))),
    lastMessageId: getNullableString(thread.last_message_id),
    lastMessageSenderRole: normalizeNullableSenderRole(
      thread.last_message_sender_role,
    ),
    lastMessageAt: getNullableString(thread.last_message_at),
    lastMessagePreview: getNullableString(thread.last_message_preview),
    lastActivityAt: getNullableString(thread.last_activity_at),
    firstOpenedAt: getNullableString(thread.first_opened_at),
    lastReadAt: getNullableString(thread.last_read_at),
    lastReadMessageId: getNullableString(thread.last_read_message_id),
    createdAt: getNullableString(thread.created_at),
    updatedAt: getNullableString(thread.updated_at),
  };
}

function normalizeThread(
  thread: MessageThreadApiRow,
  metadataIndex: WriterMessageAgentMetadataIndex,
): WriterMessageThread {
  const agentName = getString(thread.agent_name) || "Unknown agent";
  const agentProfileId = getString(thread.agent_profile_id);
  const metadata =
    metadataIndex.byAgentProfileId.get(agentProfileId) ??
    metadataIndex.byAgentName.get(getLookupKey(agentName));

  return {
    threadId: getString(thread.thread_id),
    subject: getString(thread.subject) || "Untitled message",
    writerProjectId: getString(thread.writer_project_id),
    projectName: getString(thread.project_name),
    agentProfileId,
    agentName,
    agency: metadata?.agency ?? null,
    savedAgentId: metadata?.savedAgentId ?? null,
    legacyAgentId: metadata?.legacyAgentId ?? null,
    indexId: metadata?.indexId ?? null,
    ...normalizeThreadActivity(thread),
  };
}

function normalizeAgentThread(thread: MessageThreadApiRow): AgentMessageThread {
  return {
    threadId: getString(thread.thread_id),
    subject: getString(thread.subject) || "Untitled message",
    writerProjectId: getString(thread.writer_project_id),
    projectName: getString(thread.project_name) || "Untitled project",
    agentProfileId: getString(thread.agent_profile_id),
    agentName: getNullableString(thread.agent_name),
    writerName: getNullableString(thread.writer_name),
    ...normalizeThreadActivity(thread),
  };
}

function getClerkUserDisplayName(user: {
  emailAddresses: Array<{ emailAddress: string; id: string }>;
  firstName: string | null;
  lastName: string | null;
  primaryEmailAddressId: string | null;
  username: string | null;
}) {
  const fullName = [user.firstName, user.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  if (fullName) return fullName;
  if (user.username?.trim()) return user.username.trim();

  return (
    user.emailAddresses.find((email) => email.id === user.primaryEmailAddressId)
      ?.emailAddress ??
    user.emailAddresses[0]?.emailAddress ??
    null
  );
}

async function enrichAgentThreadWriterNames(
  threads: AgentMessageThread[],
): Promise<AgentMessageThread[]> {
  const unresolvedProjectIds = Array.from(
    new Set(
      threads
        .filter((thread) => !thread.writerName)
        .map((thread) => thread.writerProjectId)
        .filter(Boolean),
    ),
  );
  if (unresolvedProjectIds.length === 0) return threads;

  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from(AGENT_MATCHES_TABLE)
    .select("user_id,writer_project_id")
    .in("writer_project_id", unresolvedProjectIds);

  if (error) return threads;

  const ownerByProjectId = new Map<string, string>();
  for (const row of (data ?? []) as WriterProjectOwnerRow[]) {
    const writerProjectId = getString(row.writer_project_id);
    const clerkUserId = getString(row.user_id);
    if (
      writerProjectId &&
      clerkUserId &&
      !ownerByProjectId.has(writerProjectId)
    ) {
      ownerByProjectId.set(writerProjectId, clerkUserId);
    }
  }

  const clerkUserIds = Array.from(new Set(ownerByProjectId.values()));
  if (clerkUserIds.length === 0) return threads;

  try {
    const userPages = await Promise.all(
      Array.from({ length: Math.ceil(clerkUserIds.length / 100) }, (_, index) =>
        clerkClient.users.getUserList({
          limit: 100,
          userId: clerkUserIds.slice(index * 100, (index + 1) * 100),
        }),
      ),
    );
    const writerNameByClerkUserId = new Map(
      userPages
        .flatMap((page) => page.data)
        .map((user) => [user.id, getClerkUserDisplayName(user)] as const)
        .filter((entry): entry is readonly [string, string] =>
          Boolean(entry[1]),
        ),
    );

    return threads.map((thread) => {
      if (thread.writerName) return thread;
      const ownerId = ownerByProjectId.get(thread.writerProjectId);
      return {
        ...thread,
        writerName: ownerId
          ? (writerNameByClerkUserId.get(ownerId) ?? null)
          : null,
      };
    });
  } catch {
    return threads;
  }
}

function normalizeMessage(message: MessageApiRow): WriterMessage {
  const messageId = getString(message.message_id) || getString(message.id);

  return {
    messageId,
    threadId: getString(message.thread_id),
    senderUserId: getString(message.sender_user_id),
    senderRole: normalizeSenderRole(message.sender_role),
    body: getString(message.body),
    createdAt: getString(message.created_at),
  };
}

async function fetchThreadRows(
  resolvedProject: ResolvedAvailableWriterMessageProject,
  filters: MessageThreadFilters = {},
) {
  const params: Record<string, string> = {
    user_id: resolvedProject.writerUserId,
    role: "writer",
    writer_project_id: resolvedProject.project.writerProjectId,
  };

  if (filters.queryStatus) params.query_status = filters.queryStatus;
  if (typeof filters.terminal === "boolean") {
    params.terminal = String(filters.terminal);
  }

  const response = await fetchWqhMessageApi(
    buildWqhMessageUrl("/message-threads", params),
    {
      cache: "no-store",
    },
  );
  const body = await parseApiJson<MessageThreadsApiResponse>(response);

  if (!response.ok || body?.status !== "success") {
    throw new WriterMessageApiError(
      getApiErrorMessage(body, "Failed to fetch message threads"),
      response.status || 502,
    );
  }

  return body.threads;
}

async function fetchAgentThreadRows(
  resolvedAgent: ResolvedAvailableAgentMessageProfile,
  filters: MessageThreadFilters = {},
) {
  const params: Record<string, string> = {
    user_id: resolvedAgent.backendUserId,
    role: "agent",
    profile_id: resolvedAgent.agent.profileId,
  };

  if (filters.queryStatus) params.query_status = filters.queryStatus;
  if (typeof filters.terminal === "boolean") {
    params.terminal = String(filters.terminal);
  }

  const response = await fetchWqhMessageApi(
    buildWqhMessageUrl("/message-threads", params),
    {
      cache: "no-store",
    },
  );
  const body = await parseApiJson<MessageThreadsApiResponse>(response);

  if (!response.ok || body?.status !== "success") {
    throw new AgentMessageApiError(
      getApiErrorMessage(body, "Failed to fetch message threads"),
      response.status || 502,
    );
  }

  return body.threads;
}

async function fetchMessageRows({
  before,
  limit,
  resolvedProject,
  threadId,
}: {
  before?: string | null;
  limit?: string | null;
  resolvedProject: ResolvedAvailableWriterMessageProject;
  threadId: string;
}) {
  const params: Record<string, string> = {
    user_id: resolvedProject.writerUserId,
    role: "writer",
  };

  if (limit) params.limit = limit;
  if (before) params.before = before;

  const response = await fetchWqhMessageApi(
    buildWqhMessageUrl(
      `/message-threads/${encodeURIComponent(threadId)}/messages`,
      params,
    ),
    { cache: "no-store" },
  );
  const body = await parseApiJson<ThreadMessagesApiResponse>(response);

  if (!response.ok || body?.status !== "success") {
    throw new WriterMessageApiError(
      getApiErrorMessage(body, "Failed to fetch thread messages"),
      response.status || 502,
    );
  }

  return body;
}

async function hasAgentRespondedToWriterThread({
  firstPage,
  resolvedProject,
  threadId,
}: {
  firstPage?: SuccessfulThreadMessagesApiResponse;
  resolvedProject: ResolvedAvailableWriterMessageProject;
  threadId: string;
}) {
  let before: string | null = null;
  let page =
    firstPage ??
    (await fetchMessageRows({
      before,
      limit: "100",
      resolvedProject,
      threadId,
    }));

  while (true) {
    if (
      page.messages.some(
        (message) => getString(message.sender_role) === "agent",
      )
    ) {
      return true;
    }

    const nextBefore = getNullableString(page.next_before);

    if (!nextBefore || nextBefore === before) {
      return false;
    }

    before = nextBefore;
    page = await fetchMessageRows({
      before,
      limit: "100",
      resolvedProject,
      threadId,
    });
  }
}

async function fetchAgentMessageRows({
  before,
  limit,
  resolvedAgent,
  threadId,
}: {
  before?: string | null;
  limit?: string | null;
  resolvedAgent: ResolvedAvailableAgentMessageProfile;
  threadId: string;
}) {
  const params: Record<string, string> = {
    user_id: resolvedAgent.backendUserId,
    role: "agent",
    profile_id: resolvedAgent.agent.profileId,
  };

  if (limit) params.limit = limit;
  if (before) params.before = before;

  const response = await fetchWqhMessageApi(
    buildWqhMessageUrl(
      `/message-threads/${encodeURIComponent(threadId)}/messages`,
      params,
    ),
    { cache: "no-store" },
  );
  const body = await parseApiJson<ThreadMessagesApiResponse>(response);

  if (!response.ok || body?.status !== "success") {
    throw new AgentMessageApiError(
      getApiErrorMessage(body, "Failed to fetch thread messages"),
      response.status || 502,
    );
  }

  return body;
}

type BackendMessageIdentity = {
  userId: string;
  role: MessageSenderRole;
  profileId?: string;
};

function getIdentitySearchParams(identity: BackendMessageIdentity) {
  const params: Record<string, string> = {
    user_id: identity.userId,
    role: identity.role,
  };

  if (identity.profileId) params.profile_id = identity.profileId;
  return params;
}

function getIdentityBody(
  identity: BackendMessageIdentity,
): WireMessageThreadIdentity {
  return {
    user_id: identity.userId,
    role: identity.role,
    ...(identity.profileId ? { profile_id: identity.profileId } : {}),
  };
}

async function fetchThreadDetail(
  threadId: string,
  identity: BackendMessageIdentity,
  ErrorType: typeof WriterMessageApiError | typeof AgentMessageApiError,
) {
  const response = await fetchWqhMessageApi(
    buildWqhMessageUrl(
      `/message-threads/${encodeURIComponent(threadId)}`,
      getIdentitySearchParams(identity),
    ),
    { cache: "no-store" },
  );
  const body = await parseApiJson<WireThreadDetailResponse>(response);

  if (!response.ok || body?.status !== "success") {
    throw new ErrorType(
      getApiErrorMessage(body, "Failed to fetch message thread"),
      response.status || 502,
    );
  }

  return body;
}

function assertWriterThreadMatchesProject(
  thread: Partial<WireMessageThread>,
  resolvedProject: ResolvedAvailableWriterMessageProject,
) {
  const actualProjectId = getString(thread.writer_project_id);
  const expectedProjectId = resolvedProject.project.writerProjectId;

  if (!actualProjectId || actualProjectId !== expectedProjectId) {
    throw new WriterMessageApiError(
      "Message thread was not found in this project",
      404,
    );
  }
}

async function assertWriterThreadInProject(
  threadId: string,
  resolvedProject: ResolvedAvailableWriterMessageProject,
) {
  const body = await fetchThreadDetail(
    threadId,
    writerIdentity(resolvedProject),
    WriterMessageApiError,
  );
  assertWriterThreadMatchesProject(body.thread, resolvedProject);
  return body;
}

async function fetchQueryTimeline(
  threadId: string,
  identity: BackendMessageIdentity,
  ErrorType: typeof WriterMessageApiError | typeof AgentMessageApiError,
) {
  const response = await fetchWqhMessageApi(
    buildWqhMessageUrl(
      `/message-threads/${encodeURIComponent(threadId)}/timeline`,
      getIdentitySearchParams(identity),
    ),
    { cache: "no-store" },
  );
  const body = await parseApiJson<WireQueryTimelineResponse>(response);

  if (!response.ok || body?.status !== "success") {
    throw new ErrorType(
      getApiErrorMessage(body, "Failed to fetch query timeline"),
      response.status || 502,
    );
  }

  return body;
}

async function putThreadReadState(
  threadId: string,
  throughMessageId: string,
  identity: BackendMessageIdentity,
  ErrorType: typeof WriterMessageApiError | typeof AgentMessageApiError,
) {
  const requestBody: WireReadStateRequest = {
    ...getIdentityBody(identity),
    through_message_id: throughMessageId,
  };
  const response = await fetchWqhMessageApi(
    buildWqhMessageUrl(
      `/message-threads/${encodeURIComponent(threadId)}/read-state`,
    ),
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
      cache: "no-store",
    },
  );
  const body = await parseApiJson<WireReadStateResponse>(response);

  if (!response.ok || body?.status !== "success") {
    throw new ErrorType(
      getApiErrorMessage(body, "Failed to update thread read state"),
      response.status || 502,
    );
  }

  return body;
}

async function postQueryStatusTransition(
  threadId: string,
  transition: QueryStatusTransitionInput,
  identity: BackendMessageIdentity,
  ErrorType: typeof WriterMessageApiError | typeof AgentMessageApiError,
) {
  const requestBody: WireQueryStatusTransitionRequest = {
    ...getIdentityBody(identity),
    to_status: transition.toStatus,
    expected_version: transition.expectedVersion,
    idempotency_key: transition.idempotencyKey?.trim() || randomUUID(),
    note: transition.note ?? null,
    reason_code: transition.reasonCode ?? null,
    due_at: transition.dueAt ?? null,
    occurred_at: transition.occurredAt ?? null,
    source_message_id: transition.sourceMessageId ?? null,
    metadata: transition.metadata ?? {},
  };
  const response = await fetchWqhMessageApi(
    buildWqhMessageUrl(
      `/message-threads/${encodeURIComponent(threadId)}/query-status-transitions`,
    ),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
      cache: "no-store",
    },
  );
  const body = await parseApiJson<WireQueryStatusTransitionResponse>(response);

  if (!response.ok || body?.status !== "success") {
    throw new ErrorType(
      getApiErrorMessage(body, "Failed to update query status"),
      response.status || 502,
    );
  }

  return body;
}

async function fetchAgentActivity(
  threadId: string,
  window: AgentActivityWindow,
  identity: BackendMessageIdentity,
  ErrorType: typeof WriterMessageApiError | typeof AgentMessageApiError,
) {
  const response = await fetchWqhMessageApi(
    buildWqhMessageUrl(
      `/message-threads/${encodeURIComponent(threadId)}/agent-activity`,
      {
        ...getIdentitySearchParams(identity),
        window,
      },
    ),
    { cache: "no-store" },
  );
  const body = await parseApiJson<WireAgentActivityResponse>(response);

  if (!response.ok || body?.status !== "success") {
    throw new ErrorType(
      getApiErrorMessage(body, "Failed to fetch agent activity"),
      response.status || 502,
    );
  }

  return body;
}

function normalizeMessageReadState(
  readState: Partial<WireMessageReadState>,
): MessageReadState {
  return {
    threadId: getString(readState.thread_id),
    participantRole: normalizeSenderRole(readState.participant_role),
    firstOpenedAt: getNullableString(readState.first_opened_at),
    lastReadAt: getNullableString(readState.last_read_at),
    lastReadMessageId: getNullableString(readState.last_read_message_id),
  };
}

function normalizeTimelineResponse(
  body: Extract<WireQueryTimelineResponse, { status: "success" }>,
  ErrorType: typeof WriterMessageApiError | typeof AgentMessageApiError,
): QueryTimelineResponse {
  return {
    status: "success",
    threadId: getString(body.thread_id),
    queryProgress: requireQueryProgress(body.query_progress, ErrorType),
    events: body.events
      .map(normalizeQueryStatusEvent)
      .filter((event): event is QueryStatusEvent => Boolean(event)),
  };
}

function normalizeReadStateResponse(
  body: Extract<WireReadStateResponse, { status: "success" }>,
  ErrorType: typeof WriterMessageApiError | typeof AgentMessageApiError,
): MessageReadStateResponse {
  return {
    status: "success",
    readState: normalizeMessageReadState(body.read_state),
    event: normalizeQueryStatusEvent(body.event),
    queryProgress: requireQueryProgress(body.query_progress, ErrorType),
  };
}

function normalizeTransitionResponse(
  body: Extract<WireQueryStatusTransitionResponse, { status: "success" }>,
  ErrorType: typeof WriterMessageApiError | typeof AgentMessageApiError,
): QueryStatusTransitionResponse {
  return {
    status: "success",
    event: requireQueryStatusEvent(body.event, ErrorType),
    queryProgress: requireQueryProgress(body.query_progress, ErrorType),
  };
}

function normalizeActivityBenchmark(
  benchmark: WireAgentActivityBenchmark | null,
): AgentActivityBenchmark | null {
  if (!benchmark) return null;

  return {
    sampleSize: Math.max(0, Math.trunc(getNumber(benchmark.sample_size))),
    medianDays: typeof benchmark.median === "number" ? benchmark.median : null,
    p25Days: typeof benchmark.p25 === "number" ? benchmark.p25 : null,
    p75Days: typeof benchmark.p75 === "number" ? benchmark.p75 : null,
  };
}

function normalizeActivityViewerEvent(
  event: WireAgentActivityViewerEvent,
): AgentActivityViewerEvent {
  const rawFromStatus = getNullableString(event.from_status);
  const rawToStatus = getString(event.to_status);
  const rawActorRole = getString(event.actor_role);

  return {
    statusVersion: Math.max(0, Math.trunc(getNumber(event.status_version))),
    fromStatus: rawFromStatus ? normalizeQueryStatusCode(rawFromStatus) : null,
    rawFromStatus,
    toStatus: normalizeQueryStatusCode(rawToStatus),
    rawToStatus,
    occurredAt: getString(event.occurred_at),
    recordedAt: getString(event.recorded_at),
    actorRole: normalizeActorRole(rawActorRole),
    rawActorRole,
    source: getString(event.source),
    dueAt: getNullableString(event.due_at),
  };
}

function normalizeAgentActivityResponse(
  body: Extract<WireAgentActivityResponse, { status: "success" }>,
  ErrorType: typeof WriterMessageApiError | typeof AgentMessageApiError,
): AgentActivityResponse {
  const statusCounts = body.summary?.status_counts;

  return {
    status: "success",
    threadId: getString(body.thread_id),
    asOf: getString(body.as_of),
    scope: {
      source: getString(body.scope.source),
      agentProfileId: getString(body.scope.agent_profile_id),
      window: body.scope.window,
      windowDays:
        typeof body.scope.window_days === "number"
          ? body.scope.window_days
          : null,
      from: getNullableString(body.scope.from),
      to: getString(body.scope.to),
    },
    privacy: {
      minimumSampleSize: Math.max(
        0,
        Math.trunc(getNumber(body.privacy.minimum_sample_size)),
      ),
      cohortSize:
        typeof body.privacy.cohort_size === "number"
          ? Math.max(0, Math.trunc(body.privacy.cohort_size))
          : null,
      detailsAvailable: getBoolean(body.privacy.details_available),
      suppressionReason:
        body.privacy.suppression_reason === "minimum_sample_size"
          ? "minimum_sample_size"
          : null,
    },
    viewerQuery: {
      queryProgress: requireQueryProgress(
        body.viewer_query.query_progress,
        ErrorType,
      ),
      events: body.viewer_query.events.map(normalizeActivityViewerEvent),
    },
    summary: body.summary
      ? {
          totalQueries: Math.max(
            0,
            Math.trunc(getNumber(body.summary.total_queries)),
          ),
          activeQueries: Math.max(
            0,
            Math.trunc(getNumber(body.summary.active_queries)),
          ),
          terminalQueries: Math.max(
            0,
            Math.trunc(getNumber(body.summary.terminal_queries)),
          ),
          statusCounts: {
            query_sent: Math.max(
              0,
              Math.trunc(getNumber(statusCounts?.query_sent)),
            ),
            query_viewed: Math.max(
              0,
              Math.trunc(getNumber(statusCounts?.query_viewed)),
            ),
            manuscript_requested: Math.max(
              0,
              Math.trunc(getNumber(statusCounts?.manuscript_requested)),
            ),
            manuscript_under_review: Math.max(
              0,
              Math.trunc(getNumber(statusCounts?.manuscript_under_review)),
            ),
            rejected: Math.max(
              0,
              Math.trunc(getNumber(statusCounts?.rejected)),
            ),
            closed_no_response: Math.max(
              0,
              Math.trunc(getNumber(statusCounts?.closed_no_response)),
            ),
            offer_of_representation: Math.max(
              0,
              Math.trunc(getNumber(statusCounts?.offer_of_representation)),
            ),
          },
          priorSentStillActive: Math.max(
            0,
            Math.trunc(getNumber(body.summary.prior_sent_still_active)),
          ),
          durations: {
            timeToFirstView: normalizeActivityBenchmark(
              body.summary.durations.time_to_first_view_days,
            ),
            timeToTerminal: normalizeActivityBenchmark(
              body.summary.durations.time_to_terminal_days,
            ),
          },
        }
      : null,
    lanes: body.lanes.map((lane) => ({
      laneId: getString(lane.lane_id),
      sentOn: getString(lane.sent_on),
      currentStatus: normalizeQueryStatusCode(lane.current_status),
      rawCurrentStatus: getString(lane.current_status),
      isTerminal: getBoolean(lane.is_terminal),
      lastStatusOn: getString(lane.last_status_on),
      events: lane.events.map((event) => ({
        status: normalizeQueryStatusCode(event.status),
        rawStatus: getString(event.status),
        occurredOn: getString(event.occurred_on),
        elapsedDays:
          typeof event.elapsed_days === "number" ? event.elapsed_days : null,
      })),
    })),
  };
}

function writerIdentity(
  resolvedProject: ResolvedAvailableWriterMessageProject,
): BackendMessageIdentity {
  return { userId: resolvedProject.writerUserId, role: "writer" };
}

function agentIdentity(
  resolvedAgent: ResolvedAvailableAgentMessageProfile,
): BackendMessageIdentity {
  return {
    userId: resolvedAgent.backendUserId,
    role: "agent",
    profileId: resolvedAgent.agent.profileId,
  };
}

export async function getWriterMessageThreadsData(
  routeProjectId: string,
  filters: MessageThreadFilters = {},
): Promise<WriterMessageThreadsResponse | null> {
  const resolvedProject = await resolveWriterMessageProject(routeProjectId);

  if (!resolvedProject) {
    return null;
  }

  if (!resolvedProject.project.isMessagingAvailable) {
    const { savedAgents } = await fetchWriterMessageRecipientAgents({
      clerkUserId: resolvedProject.clerkUserId,
      project: resolvedProject.project,
    });

    return {
      status: "success",
      project: resolvedProject.project,
      threads: [],
      savedAgents,
    };
  }

  const availableProject = assertAvailableProject(resolvedProject);
  const [threadRows, recipientAgents] = await Promise.all([
    fetchThreadRows(availableProject, filters),
    fetchWriterMessageRecipientAgents({
      clerkUserId: availableProject.clerkUserId,
      project: availableProject.project,
    }),
  ]);

  return {
    status: "success",
    project: availableProject.project,
    threads: threadRows
      .map((thread) => normalizeThread(thread, recipientAgents.metadataIndex))
      .filter((thread) => Boolean(thread.threadId)),
    savedAgents: recipientAgents.savedAgents,
  };
}

export async function getWriterThreadMessagesData({
  before,
  limit,
  routeProjectId,
  threadId,
}: {
  before?: string | null;
  limit?: string | null;
  routeProjectId: string;
  threadId: string;
}): Promise<
  | (WriterThreadMessagesResponse & {
      threads: WriterMessageThread[];
      thread: WriterMessageThread | null;
    })
  | null
> {
  const resolvedProject = await resolveWriterMessageProject(routeProjectId);

  if (!resolvedProject) {
    return null;
  }

  if (!resolvedProject.project.isMessagingAvailable) {
    return {
      status: "success",
      project: resolvedProject.project,
      threadId,
      messages: [],
      canWriterReply: false,
      nextBefore: null,
      queryProgress: null,
      threads: [],
      thread: null,
    };
  }

  const availableProject = assertAvailableProject(resolvedProject);
  const [threadRows, messageRows, recipientAgents] = await Promise.all([
    fetchThreadRows(availableProject),
    fetchMessageRows({
      before,
      limit,
      resolvedProject: availableProject,
      threadId,
    }),
    fetchWriterMessageRecipientAgents({
      clerkUserId: availableProject.clerkUserId,
      project: availableProject.project,
    }),
  ]);
  const threads = threadRows
    .map((thread) => normalizeThread(thread, recipientAgents.metadataIndex))
    .filter((thread) => Boolean(thread.threadId));
  const thread = threads.find((item) => item.threadId === threadId) ?? null;
  if (!thread) {
    throw new WriterMessageApiError(
      "Message thread was not found in this project",
      404,
    );
  }
  const canWriterReply =
    queryStatusUnlocksWriterReply(messageRows.query_progress.current_code) ||
    (await hasAgentRespondedToWriterThread({
      firstPage: before ? undefined : messageRows,
      resolvedProject: availableProject,
      threadId,
    }));

  return {
    status: "success",
    project: availableProject.project,
    threadId: messageRows.thread_id || threadId,
    messages: messageRows.messages.map(normalizeMessage),
    canWriterReply,
    nextBefore: messageRows.next_before,
    queryProgress: normalizeQueryProgress(messageRows.query_progress),
    threads,
    thread,
  };
}

export async function getAgentMessageThreadsData(
  filters: MessageThreadFilters = {},
): Promise<AgentMessageThreadsResponse> {
  const resolvedAgent = await resolveAgentMessageProfile();

  if (!resolvedAgent.agent.isMessagingAvailable) {
    return {
      status: "success",
      agent: resolvedAgent.agent,
      threads: [],
    };
  }

  const availableAgent = assertAvailableAgent(resolvedAgent);
  const threadRows = await fetchAgentThreadRows(availableAgent, filters);

  const threads = threadRows
    .map(normalizeAgentThread)
    .filter((thread) => Boolean(thread.threadId));

  return {
    status: "success",
    agent: availableAgent.agent,
    threads: await enrichAgentThreadWriterNames(threads),
  };
}

export async function getAgentThreadMessagesData({
  before,
  limit,
  threadId,
}: {
  before?: string | null;
  limit?: string | null;
  threadId: string;
}): Promise<
  AgentThreadMessagesResponse & {
    threads: AgentMessageThread[];
    thread: AgentMessageThread | null;
  }
> {
  const resolvedAgent = await resolveAgentMessageProfile();

  if (!resolvedAgent.agent.isMessagingAvailable) {
    return {
      status: "success",
      agent: resolvedAgent.agent,
      threadId,
      messages: [],
      nextBefore: null,
      queryProgress: null,
      threads: [],
      thread: null,
    };
  }

  const availableAgent = assertAvailableAgent(resolvedAgent);
  const [threadRows, messageRows] = await Promise.all([
    fetchAgentThreadRows(availableAgent),
    fetchAgentMessageRows({
      before,
      limit,
      resolvedAgent: availableAgent,
      threadId,
    }),
  ]);
  const threads = await enrichAgentThreadWriterNames(
    threadRows
      .map(normalizeAgentThread)
      .filter((thread) => Boolean(thread.threadId)),
  );
  const thread = threads.find((item) => item.threadId === threadId) ?? null;

  return {
    status: "success",
    agent: availableAgent.agent,
    threadId: messageRows.thread_id || threadId,
    messages: messageRows.messages.map(normalizeMessage),
    nextBefore: messageRows.next_before,
    queryProgress: normalizeQueryProgress(messageRows.query_progress),
    threads,
    thread,
  };
}

export async function getWriterMessageThreadDetailData({
  routeProjectId,
  threadId,
}: {
  routeProjectId: string;
  threadId: string;
}): Promise<WriterThreadDetailResponse | null> {
  const resolvedProject = await resolveWriterMessageProject(routeProjectId);

  if (!resolvedProject) return null;

  const availableProject = assertAvailableProject(resolvedProject);
  const [body, recipientAgents] = await Promise.all([
    assertWriterThreadInProject(threadId, availableProject),
    fetchWriterMessageRecipientAgents({
      clerkUserId: availableProject.clerkUserId,
      project: availableProject.project,
    }),
  ]);
  const queryProgress = requireQueryProgress(
    body.query_progress,
    WriterMessageApiError,
  );
  const thread = normalizeThread(
    { ...body.thread, query_progress: body.query_progress },
    recipientAgents.metadataIndex,
  );

  return {
    status: "success",
    project: availableProject.project,
    thread,
    queryProgress,
  };
}

export async function getAgentMessageThreadDetailData(
  threadId: string,
): Promise<AgentThreadDetailResponse> {
  const resolvedAgent = await resolveAgentMessageProfile();
  const availableAgent = assertAvailableAgent(resolvedAgent);
  const body = await fetchThreadDetail(
    threadId,
    agentIdentity(availableAgent),
    AgentMessageApiError,
  );
  const queryProgress = requireQueryProgress(
    body.query_progress,
    AgentMessageApiError,
  );
  const [thread] = await enrichAgentThreadWriterNames([
    normalizeAgentThread({
      ...body.thread,
      query_progress: body.query_progress,
    }),
  ]);

  return {
    status: "success",
    agent: availableAgent.agent,
    thread,
    queryProgress,
  };
}

export async function getWriterQueryTimelineData({
  routeProjectId,
  threadId,
}: {
  routeProjectId: string;
  threadId: string;
}): Promise<QueryTimelineResponse | null> {
  const resolvedProject = await resolveWriterMessageProject(routeProjectId);

  if (!resolvedProject) return null;

  const availableProject = assertAvailableProject(resolvedProject);
  await assertWriterThreadInProject(threadId, availableProject);
  const body = await fetchQueryTimeline(
    threadId,
    writerIdentity(availableProject),
    WriterMessageApiError,
  );

  return normalizeTimelineResponse(body, WriterMessageApiError);
}

export async function getAgentQueryTimelineData(
  threadId: string,
): Promise<QueryTimelineResponse> {
  const resolvedAgent = assertAvailableAgent(
    await resolveAgentMessageProfile(),
  );
  const body = await fetchQueryTimeline(
    threadId,
    agentIdentity(resolvedAgent),
    AgentMessageApiError,
  );

  return normalizeTimelineResponse(body, AgentMessageApiError);
}

export async function updateWriterThreadReadState({
  routeProjectId,
  threadId,
  throughMessageId,
}: {
  routeProjectId: string;
  threadId: string;
  throughMessageId: string;
}): Promise<MessageReadStateResponse> {
  const resolvedProject = await resolveWriterMessageProject(routeProjectId);

  if (!resolvedProject) {
    throw new WriterMessageApiError("Project not found", 404);
  }

  const availableProject = assertAvailableProject(resolvedProject);
  await assertWriterThreadInProject(threadId, availableProject);
  const body = await putThreadReadState(
    threadId,
    throughMessageId,
    writerIdentity(availableProject),
    WriterMessageApiError,
  );

  return normalizeReadStateResponse(body, WriterMessageApiError);
}

export async function updateAgentThreadReadState({
  threadId,
  throughMessageId,
}: {
  threadId: string;
  throughMessageId: string;
}): Promise<MessageReadStateResponse> {
  const resolvedAgent = assertAvailableAgent(
    await resolveAgentMessageProfile(),
  );
  const body = await putThreadReadState(
    threadId,
    throughMessageId,
    agentIdentity(resolvedAgent),
    AgentMessageApiError,
  );

  return normalizeReadStateResponse(body, AgentMessageApiError);
}

export async function transitionWriterQueryStatus({
  routeProjectId,
  threadId,
  transition,
}: {
  routeProjectId: string;
  threadId: string;
  transition: QueryStatusTransitionInput;
}): Promise<QueryStatusTransitionResponse> {
  const resolvedProject = await resolveWriterMessageProject(routeProjectId);

  if (!resolvedProject) {
    throw new WriterMessageApiError("Project not found", 404);
  }

  const availableProject = assertAvailableProject(resolvedProject);
  await assertWriterThreadInProject(threadId, availableProject);
  const body = await postQueryStatusTransition(
    threadId,
    transition,
    writerIdentity(availableProject),
    WriterMessageApiError,
  );

  return normalizeTransitionResponse(body, WriterMessageApiError);
}

export async function transitionAgentQueryStatus({
  threadId,
  transition,
}: {
  threadId: string;
  transition: QueryStatusTransitionInput;
}): Promise<QueryStatusTransitionResponse> {
  const resolvedAgent = assertAvailableAgent(
    await resolveAgentMessageProfile(),
  );
  const body = await postQueryStatusTransition(
    threadId,
    transition,
    agentIdentity(resolvedAgent),
    AgentMessageApiError,
  );

  return normalizeTransitionResponse(body, AgentMessageApiError);
}

export async function getWriterAgentActivityData({
  routeProjectId,
  threadId,
  window = "90",
}: {
  routeProjectId: string;
  threadId: string;
  window?: AgentActivityWindow;
}): Promise<AgentActivityResponse | null> {
  const resolvedProject = await resolveWriterMessageProject(routeProjectId);

  if (!resolvedProject) return null;

  const availableProject = assertAvailableProject(resolvedProject);
  await assertWriterThreadInProject(threadId, availableProject);
  const body = await fetchAgentActivity(
    threadId,
    window,
    writerIdentity(availableProject),
    WriterMessageApiError,
  );

  return normalizeAgentActivityResponse(body, WriterMessageApiError);
}

export async function getAgentActivityData({
  threadId,
  window = "90",
}: {
  threadId: string;
  window?: AgentActivityWindow;
}): Promise<AgentActivityResponse> {
  const resolvedAgent = assertAvailableAgent(
    await resolveAgentMessageProfile(),
  );
  const body = await fetchAgentActivity(
    threadId,
    window,
    agentIdentity(resolvedAgent),
    AgentMessageApiError,
  );

  return normalizeAgentActivityResponse(body, AgentMessageApiError);
}

function isSelectedWriterMessageRecipient({
  agentId,
  recipient,
}: {
  agentId: string;
  recipient: WriterMessageRecipientAgent;
}) {
  return [
    recipient.savedAgentId,
    recipient.legacyAgentId,
    recipient.indexId,
    recipient.agentProfileId,
  ].some((value) => value === agentId);
}

export async function createWriterMessageThread({
  agentId,
  body,
  routeProjectId,
  subject,
}: {
  agentId: string;
  body: string;
  routeProjectId: string;
  subject: string;
}): Promise<WriterCreateThreadResponse> {
  const normalizedAgentId = agentId.trim();
  const normalizedBody = body.trim();
  const normalizedSubject = subject.trim();

  if (!normalizedAgentId) {
    throw new WriterMessageApiError("agentId is required", 400);
  }

  if (!normalizedSubject) {
    throw new WriterMessageApiError("Subject is required", 400);
  }

  if (!normalizedBody) {
    throw new WriterMessageApiError("Message body is required", 400);
  }

  const resolvedProject = await resolveWriterMessageProject(routeProjectId);

  if (!resolvedProject) {
    throw new WriterMessageApiError("Project not found", 404);
  }

  const availableProject = assertAvailableProject(resolvedProject);
  const { savedAgents } = await fetchWriterMessageRecipientAgents({
    clerkUserId: availableProject.clerkUserId,
    project: availableProject.project,
  });
  const recipient = savedAgents.find((savedAgent) =>
    isSelectedWriterMessageRecipient({
      agentId: normalizedAgentId,
      recipient: savedAgent,
    }),
  );

  if (!recipient) {
    throw new WriterMessageApiError(
      "Selected agent is not saved for this project.",
      400,
    );
  }

  if (!recipient.agentProfileId) {
    throw new WriterMessageApiError(
      "Selected agent does not have a messaging profile.",
      400,
    );
  }

  if (!recipient.isMessagingAvailable) {
    throw new WriterMessageApiError(
      "Selected agent is not available for messaging.",
      400,
    );
  }

  const requestBody: WireCreateMessageThreadRequest = {
    user_id: availableProject.writerUserId,
    writer_project_id: availableProject.project.writerProjectId,
    agent_profile_id: recipient.agentProfileId,
    subject: normalizedSubject,
    body: normalizedBody,
  };
  const response = await fetchWqhMessageApi(
    buildWqhMessageUrl("/message-threads"),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      cache: "no-store",
    },
  );
  const responseBody = await parseApiJson<CreateThreadApiResponse>(response);

  if (response.status === 409 && responseBody?.status === "error") {
    const duplicateThreadId = getNullableString(responseBody.thread_id);

    if (duplicateThreadId) {
      return {
        status: "duplicate",
        threadId: duplicateThreadId,
        message: responseBody.message || "Message thread already exists",
        duplicate: true,
      };
    }
  }

  const threadId =
    responseBody?.status === "success" ? getString(responseBody.thread_id) : "";

  if (!response.ok || responseBody?.status !== "success" || !threadId) {
    throw new WriterMessageApiError(
      getApiErrorMessage(responseBody, "Failed to create message thread"),
      response.status || 502,
    );
  }

  return {
    status: "success",
    threadId,
    message: normalizeMessage({
      ...responseBody.message,
      thread_id: responseBody.message.thread_id ?? threadId,
    }),
    event: requireQueryStatusEvent(responseBody.event, WriterMessageApiError),
    queryProgress: requireQueryProgress(
      responseBody.query_progress,
      WriterMessageApiError,
    ),
  };
}

export async function sendAgentThreadReply({
  body,
  threadId,
}: {
  body: string;
  threadId: string;
}): Promise<AgentReplyResponse> {
  const resolvedAgent = await resolveAgentMessageProfile();
  const availableAgent = assertAvailableAgent(resolvedAgent);
  const requestBody: WireCreateMessageRequest = {
    user_id: availableAgent.backendUserId,
    role: "agent",
    profile_id: availableAgent.agent.profileId,
    body: body.trim(),
  };
  const response = await fetchWqhMessageApi(
    buildWqhMessageUrl(
      `/message-threads/${encodeURIComponent(threadId)}/messages`,
    ),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      cache: "no-store",
    },
  );
  const responseBody = await parseApiJson<ReplyApiResponse>(response);

  if (!response.ok || responseBody?.status !== "success") {
    throw new AgentMessageApiError(
      getApiErrorMessage(responseBody, "Failed to send reply"),
      response.status || 502,
    );
  }

  return {
    status: "success",
    message: normalizeMessage(responseBody.message),
    event: normalizeQueryStatusEvent(responseBody.event),
    queryProgress: requireQueryProgress(
      responseBody.query_progress,
      AgentMessageApiError,
    ),
  };
}

export async function sendWriterThreadReply({
  body,
  routeProjectId,
  threadId,
}: {
  body: string;
  routeProjectId: string;
  threadId: string;
}): Promise<WriterReplyResponse> {
  const resolvedProject = await resolveWriterMessageProject(routeProjectId);

  if (!resolvedProject) {
    throw new WriterMessageApiError("Project not found", 404);
  }

  const availableProject = assertAvailableProject(resolvedProject);
  const threadDetail = await assertWriterThreadInProject(
    threadId,
    availableProject,
  );
  const canWriterReply =
    queryStatusUnlocksWriterReply(threadDetail.query_progress.current_code) ||
    (await hasAgentRespondedToWriterThread({
      resolvedProject: availableProject,
      threadId,
    }));

  if (!canWriterReply) {
    throw new WriterMessageApiError(
      "Please wait for the agent to respond or update the query status before sending another message.",
      409,
    );
  }

  const requestBody: WireCreateMessageRequest = {
    user_id: availableProject.writerUserId,
    role: "writer",
    body: body.trim(),
  };
  const response = await fetchWqhMessageApi(
    buildWqhMessageUrl(
      `/message-threads/${encodeURIComponent(threadId)}/messages`,
    ),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      cache: "no-store",
    },
  );
  const responseBody = await parseApiJson<ReplyApiResponse>(response);

  if (!response.ok || responseBody?.status !== "success") {
    throw new WriterMessageApiError(
      getApiErrorMessage(responseBody, "Failed to send reply"),
      response.status || 502,
    );
  }

  return {
    status: "success",
    message: normalizeMessage(responseBody.message),
    event: normalizeQueryStatusEvent(responseBody.event),
    queryProgress: requireQueryProgress(
      responseBody.query_progress,
      WriterMessageApiError,
    ),
  };
}

export function getCanonicalMessagesHref(project: WriterMessageProject) {
  return getProjectMessagesHref(project.projectName, project.projectId);
}

export function getCanonicalMessageThreadHref({
  project,
  threadId,
}: {
  project: WriterMessageProject;
  threadId: string;
}) {
  return getProjectMessageThreadHref(project.projectId, threadId);
}

export function isCanonicalMessagesRoute({
  project,
  routeProjectId,
}: {
  project: WriterMessageProject;
  routeProjectId: string;
}) {
  return normalizeRouteProjectId(routeProjectId) === project.projectId;
}

export function getProjectDashboardHrefForMessages(
  project: WriterMessageProject,
) {
  return project.writerProjectId
    ? getProjectDashboardHrefById(project.writerProjectId)
    : getProjectDashboardHrefById(project.projectId);
}
