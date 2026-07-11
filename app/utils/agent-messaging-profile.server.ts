import "server-only";

import { randomUUID } from "crypto";

import { getWqhApiUrl, getWqhMessagingApiSecret } from "@/lib/config";

export type AgentMessagingProfileRow = {
  profile_id?: string | null;
  legacy_agent_id?: string | null;
  user_id?: string | null;
  name?: string | null;
  is_active?: boolean | null;
  email?: string | null;
  [key: string]: unknown;
};

type AgentProfileResponse =
  | { status: "success"; agent: AgentMessagingProfileRow }
  | { status: "error"; message?: string };

type WriterProjectsResponse =
  | {
      status: "success";
      writer_projects: Array<{ user_id?: string | null }>;
    }
  | { status: "error"; message?: string };

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class AgentMessagingProfileError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AgentMessagingProfileError";
    this.status = status;
  }
}

function getString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getUuid(value: unknown) {
  const normalized = getString(value);
  return UUID_PATTERN.test(normalized) ? normalized : null;
}

function buildMessagingUrl(path: string, params?: Record<string, string>) {
  const url = new URL(`${getWqhApiUrl().replace(/\/$/, "")}${path}`);

  for (const [key, value] of Object.entries(params ?? {})) {
    url.searchParams.set(key, value);
  }

  return url;
}

function fetchMessagingApi(url: URL, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  const messagingSecret = getWqhMessagingApiSecret();

  if (messagingSecret) {
    headers.set("X-WQH-Messaging-Key", messagingSecret);
  }

  return fetch(url, { ...init, headers, cache: "no-store" });
}

async function readJson<TResponse>(response: Response) {
  try {
    return (await response.json()) as TResponse;
  } catch {
    return null;
  }
}

function getErrorMessage(body: unknown, fallback: string) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return fallback;
  }

  const message = (body as { message?: unknown }).message;
  return typeof message === "string" && message.trim() ? message : fallback;
}

export async function fetchAgentMessagingProfileByLegacyId(
  legacyAgentId: string,
) {
  const response = await fetchMessagingApi(
    buildMessagingUrl("/get-agent-profile", {
      lookup_by: "id",
      value: legacyAgentId,
      with_legacy_data: "true",
    }),
  );
  const body = await readJson<AgentProfileResponse>(response);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok || body?.status !== "success") {
    throw new AgentMessagingProfileError(
      getErrorMessage(body, "Failed to fetch agent profile"),
      response.status || 502,
    );
  }

  return body.agent;
}

async function resolveMessagingUserId(email: string) {
  const response = await fetchMessagingApi(
    buildMessagingUrl("/get-writer-projects", { email }),
  );
  const body = await readJson<WriterProjectsResponse>(response);

  if (!response.ok || body?.status !== "success") {
    throw new AgentMessagingProfileError(
      getErrorMessage(body, "Failed to resolve the agent messaging user"),
      response.status || 502,
    );
  }

  return (
    body.writer_projects
      .map((project) => getUuid(project.user_id))
      .find((userId): userId is string => Boolean(userId)) ?? randomUUID()
  );
}

export async function ensureAgentMessagingProfile({
  email,
  profile,
}: {
  email: string | null;
  profile: AgentMessagingProfileRow;
}) {
  if (getUuid(profile.user_id)) {
    return profile;
  }

  const profileId = getUuid(profile.profile_id);
  if (!profileId) {
    throw new AgentMessagingProfileError(
      "Agent profile is missing a valid profile ID",
      502,
    );
  }

  const normalizedEmail = getString(email);
  if (!normalizedEmail) {
    throw new AgentMessagingProfileError(
      "A verified email is required to link this agent profile for messaging",
      400,
    );
  }

  const userId = await resolveMessagingUserId(normalizedEmail);
  const response = await fetchMessagingApi(
    buildMessagingUrl("/claim-agent-profile"),
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: normalizedEmail,
        profile_id: profileId,
        user_id: userId,
      }),
    },
  );
  const body = await readJson<AgentProfileResponse>(response);

  if (!response.ok || body?.status !== "success") {
    throw new AgentMessagingProfileError(
      getErrorMessage(body, "Failed to claim agent profile"),
      response.status || 502,
    );
  }

  if (!getUuid(body.agent.user_id)) {
    throw new AgentMessagingProfileError(
      "Agent profile claim did not return a valid messaging user ID",
      502,
    );
  }

  return body.agent;
}
