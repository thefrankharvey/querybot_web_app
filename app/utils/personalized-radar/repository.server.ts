import "server-only";

import { createServerSupabase } from "@/app/api/supabase/server";
import {
  getAgentIdentityKey,
  normalizeAgentWatch,
  type AgentWatch,
  type AgentWatchRow,
  type RadarWatchCapabilities,
  type WatchLookupRequestKey,
  type WatchLookupResult,
} from "@/app/utils/personalized-radar/contracts";
import { RadarIdentityError, verifyRadarAgentIdentity } from "@/app/utils/personalized-radar/identity.server";
import type {
  CreateAgentWatchInput,
  UpdateAgentWatchInput,
} from "@/app/utils/personalized-radar/validation";

const AGENT_WATCHES_TABLE = "agent_watches";

export class RadarPersistenceError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

function storageUnavailable() {
  return new RadarPersistenceError(
    500,
    "RADAR_STORAGE_UNAVAILABLE",
    "Radar storage is temporarily unavailable",
  );
}

function mapCreateError(error: { code?: string; message?: string } | null) {
  const message = error?.message ?? "";
  if (message.includes("RADAR_WATCH_LIMIT_REACHED")) {
    return new RadarPersistenceError(
      403,
      "RADAR_WATCH_LIMIT_REACHED",
      "Your current plan's watch limit has been reached",
    );
  }
  if (
    message.includes("RADAR_ORIGIN_NOT_FOUND") ||
    message.includes("RADAR_ORIGIN_IDENTITY_MISMATCH")
  ) {
    return new RadarPersistenceError(
      404,
      "RADAR_AGENT_MATCH_NOT_FOUND",
      "Saved agent not found",
    );
  }
  return storageUnavailable();
}

export async function listOwnedAgentWatches(
  userId: string,
  status: "active" | "muted" | "all",
): Promise<AgentWatch[]> {
  const supabase = createServerSupabase();
  let query = supabase
    .from(AGENT_WATCHES_TABLE)
    .select("*")
    .eq("user_id", userId)
    .neq("status", "deleted");
  if (status !== "all") query = query.eq("status", status);

  const { data, error } = await query.order("updated_at", {
    ascending: false,
  });
  if (error) throw storageUnavailable();
  return ((data ?? []) as AgentWatchRow[]).map(normalizeAgentWatch);
}

export async function createOwnedAgentWatch(
  userId: string,
  input: CreateAgentWatchInput,
  capabilities: RadarWatchCapabilities,
): Promise<{ watch: AgentWatch; created: boolean }> {
  let identityExists: boolean;
  try {
    identityExists = await verifyRadarAgentIdentity(input);
  } catch (error) {
    if (error instanceof RadarIdentityError) {
      throw new RadarPersistenceError(
        503,
        "RADAR_IDENTITY_UNAVAILABLE",
        "Agent identity verification is temporarily unavailable",
      );
    }
    throw error;
  }
  if (!identityExists) {
    throw new RadarPersistenceError(
      404,
      "RADAR_AGENT_NOT_FOUND",
      "Agent not found",
    );
  }

  const supabase = createServerSupabase();
  const { data: before, error: beforeError } = await supabase
    .from(AGENT_WATCHES_TABLE)
    .select("id")
    .eq("user_id", userId)
    .neq("status", "deleted");
  if (beforeError) throw storageUnavailable();
  const beforeIds = new Set((before ?? []).map((row) => String(row.id)));

  const { data, error } = await supabase.rpc("create_agent_watch", {
    p_user_id: userId,
    p_agent_profile_id: input.agentProfileId,
    p_index_id: input.indexId,
    p_origin_agent_match_id: input.originAgentMatchId,
    p_origin_surface: input.originSurface,
    p_event_types: input.eventTypes,
    p_in_app_enabled: input.inAppEnabled,
    p_email_digest_enabled: input.emailDigestEnabled,
    p_max_active_watches: capabilities.maxActiveWatches,
  });
  if (error) throw mapCreateError(error);
  const row = (Array.isArray(data) ? data[0] : data) as AgentWatchRow | null;
  if (!row) throw storageUnavailable();
  return { watch: normalizeAgentWatch(row), created: !beforeIds.has(row.id) };
}

export async function lookupOwnedAgentWatches(
  userId: string,
  identities: WatchLookupRequestKey[],
): Promise<WatchLookupResult[]> {
  const watches = await listOwnedAgentWatches(userId, "all");
  const byProfile = new Map<string, AgentWatch>();
  const byIndex = new Map<string, AgentWatch>();
  for (const watch of watches) {
    if (watch.agentProfileId) byProfile.set(watch.agentProfileId, watch);
    if (watch.indexId) byIndex.set(watch.indexId, watch);
  }

  return identities.map((identity) => ({
    ...identity,
    watch:
      (identity.agentProfileId
        ? byProfile.get(identity.agentProfileId)
        : undefined) ??
      (identity.indexId ? byIndex.get(identity.indexId) : undefined) ??
      null,
  }));
}

async function getOwnedWatch(userId: string, watchId: string) {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from(AGENT_WATCHES_TABLE)
    .select("*")
    .eq("id", watchId)
    .eq("user_id", userId)
    .neq("status", "deleted")
    .maybeSingle();
  if (error) throw storageUnavailable();
  return data ? normalizeAgentWatch(data as AgentWatchRow) : null;
}

export async function updateOwnedAgentWatch(
  userId: string,
  watchId: string,
  input: UpdateAgentWatchInput,
): Promise<AgentWatch | null> {
  const current = await getOwnedWatch(userId, watchId);
  if (!current) return null;
  const patch =
    input.action === "mute"
      ? { status: "muted", muted_at: new Date().toISOString() }
      : input.action === "unmute"
        ? { status: "active", muted_at: null }
        : {
            event_types: input.eventTypes,
            in_app_enabled: input.inAppEnabled,
            email_digest_enabled: input.emailDigestEnabled,
          };
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from(AGENT_WATCHES_TABLE)
    .update(patch)
    .eq("id", watchId)
    .eq("user_id", userId)
    .neq("status", "deleted")
    .select("*")
    .maybeSingle();
  if (error) throw storageUnavailable();
  return data ? normalizeAgentWatch(data as AgentWatchRow) : null;
}

export async function deleteOwnedAgentWatch(
  userId: string,
  watchId: string,
): Promise<boolean> {
  const supabase = createServerSupabase();
  const deletedAt = new Date().toISOString();
  const { data, error } = await supabase
    .from(AGENT_WATCHES_TABLE)
    .update({
      status: "deleted",
      deleted_at: deletedAt,
      muted_at: null,
      in_app_enabled: false,
      email_digest_enabled: false,
    })
    .eq("id", watchId)
    .eq("user_id", userId)
    .neq("status", "deleted")
    .select("id")
    .maybeSingle();
  if (error) throw storageUnavailable();
  return Boolean(data);
}

