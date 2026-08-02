import "server-only";

import { createServerSupabase } from "@/app/api/supabase/server";
import {
  normalizeQueryReminder,
  normalizeQueryReminderSuggestionDismissal,
  type QueryReminder,
  type QueryReminderRow,
  type QueryReminderSuggestionDismissal,
  type QueryReminderSuggestionDismissalRow,
} from "@/app/utils/query-reminders/contracts";
import {
  compareLocalDates,
  getLocalDateForInstant,
} from "@/app/utils/query-reminders/calendar";
import {
  transitionQueryReminder,
  type QueryReminderTransitionInput,
  type QueryReminderTransitionPatch,
} from "@/app/utils/query-reminders/state-machine";
import {
  SUGGESTION_DISMISSAL_COOLDOWN_DAYS,
} from "@/app/utils/query-reminders/suggestions";
import type {
  CreateQueryReminderInput,
  QueryReminderListFilters,
} from "@/app/utils/query-reminders/validation";

const QUERY_REMINDERS_TABLE = "query_reminders";
const SUGGESTION_DISMISSALS_TABLE =
  "query_reminder_suggestion_dismissals";

export class QueryReminderPersistenceError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

function persistenceUnavailable(): QueryReminderPersistenceError {
  return new QueryReminderPersistenceError(
    500,
    "QUERY_REMINDER_STORAGE_UNAVAILABLE",
    "Reminder storage is temporarily unavailable",
  );
}

function transitionConflict(): QueryReminderPersistenceError {
  return new QueryReminderPersistenceError(
    409,
    "QUERY_REMINDER_TRANSITION_CONFLICT",
    "The reminder changed before this request completed",
  );
}

function isUniqueViolation(error: { code?: string } | null): boolean {
  return error?.code === "23505";
}

export async function hasOwnedAgentMatch(
  userId: string,
  agentMatchId: string,
): Promise<boolean> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("agent_matches")
    .select("id")
    .eq("id", agentMatchId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw persistenceUnavailable();
  return Boolean(data);
}

function matchesDueFilter(
  reminder: QueryReminder,
  dueFilter: NonNullable<QueryReminderListFilters["due"]>,
  now: Date,
): boolean {
  let today: string;
  try {
    today = getLocalDateForInstant(reminder.timezone, now);
  } catch {
    return false;
  }

  const comparison = compareLocalDates(reminder.dueOn, today);
  if (dueFilter === "due") return comparison === 0;
  if (dueFilter === "overdue") return comparison < 0;
  if (dueFilter === "due_or_overdue") return comparison <= 0;
  return comparison > 0;
}

export async function listOwnedQueryReminders(
  userId: string,
  filters: QueryReminderListFilters,
  now: Date = new Date(),
): Promise<QueryReminder[]> {
  const supabase = createServerSupabase();
  let agentMatchIds: string[] | null = null;

  if (filters.projectId) {
    const { data, error } = await supabase
      .from("agent_matches")
      .select("id")
      .eq("user_id", userId)
      .eq("writer_project_id", filters.projectId);

    if (error) throw persistenceUnavailable();
    agentMatchIds = (data ?? []).map((row) => String(row.id));
    if (agentMatchIds.length === 0) return [];
  }

  let query = supabase
    .from(QUERY_REMINDERS_TABLE)
    .select("*")
    .eq("user_id", userId);

  if (filters.status) {
    query = query.eq("status", filters.status);
  } else if (filters.due) {
    query = query.eq("status", "scheduled");
  }
  if (agentMatchIds) query = query.in("agent_match_id", agentMatchIds);

  const { data, error } = await query
    .order("due_on", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw persistenceUnavailable();
  const reminders = ((data ?? []) as QueryReminderRow[]).map(
    normalizeQueryReminder,
  );

  return filters.due
    ? reminders.filter((reminder) =>
        matchesDueFilter(reminder, filters.due!, now),
      )
    : reminders;
}

export async function getOwnedQueryReminder(
  userId: string,
  reminderId: string,
): Promise<QueryReminder | null> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from(QUERY_REMINDERS_TABLE)
    .select("*")
    .eq("id", reminderId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw persistenceUnavailable();
  return data ? normalizeQueryReminder(data as QueryReminderRow) : null;
}

export async function createOwnedQueryReminder(
  userId: string,
  input: CreateQueryReminderInput,
): Promise<QueryReminder | null> {
  if (!(await hasOwnedAgentMatch(userId, input.agentMatchId))) return null;

  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from(QUERY_REMINDERS_TABLE)
    .insert({
      user_id: userId,
      agent_match_id: input.agentMatchId,
      kind: input.kind,
      due_on: input.dueOn,
      timezone: input.timezone,
      note: input.note,
      status: "scheduled",
      source: input.source,
      suggestion_rule: input.suggestionRule,
    })
    .select("*")
    .single();

  if (error) {
    if (isUniqueViolation(error)) {
      throw new QueryReminderPersistenceError(
        409,
        "QUERY_REMINDER_ALREADY_SCHEDULED",
        "A scheduled reminder of this kind already exists for this saved agent",
      );
    }
    throw persistenceUnavailable();
  }

  return normalizeQueryReminder(data as QueryReminderRow);
}

function toPersistencePatch(patch: QueryReminderTransitionPatch) {
  return {
    ...(patch.status !== undefined ? { status: patch.status } : {}),
    ...(patch.dueOn !== undefined ? { due_on: patch.dueOn } : {}),
    ...(patch.timezone !== undefined ? { timezone: patch.timezone } : {}),
    ...(patch.note !== undefined ? { note: patch.note } : {}),
    ...(patch.completedAt !== undefined
      ? { completed_at: patch.completedAt }
      : {}),
    ...(patch.dismissedAt !== undefined
      ? { dismissed_at: patch.dismissedAt }
      : {}),
    ...(patch.canceledAt !== undefined
      ? { canceled_at: patch.canceledAt }
      : {}),
  };
}

export async function transitionOwnedQueryReminder(
  userId: string,
  reminderId: string,
  input: QueryReminderTransitionInput,
  occurredAt: string = new Date().toISOString(),
): Promise<QueryReminder | null> {
  const current = await getOwnedQueryReminder(userId, reminderId);
  if (!current) return null;

  const transition = transitionQueryReminder(current, input, occurredAt);
  if (transition.idempotent) return current;

  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from(QUERY_REMINDERS_TABLE)
    .update(toPersistencePatch(transition.patch))
    .eq("id", reminderId)
    .eq("user_id", userId)
    .eq("status", current.status)
    .select("*")
    .maybeSingle();

  if (error) throw persistenceUnavailable();
  if (data) return normalizeQueryReminder(data as QueryReminderRow);

  const latest = await getOwnedQueryReminder(userId, reminderId);
  if (!latest) return null;
  const retryTransition = transitionQueryReminder(latest, input, occurredAt);
  if (retryTransition.idempotent) return latest;
  throw transitionConflict();
}

export async function dismissOwnedQueryReminderSuggestion(
  userId: string,
  input: { agentMatchId: string; ruleId: string },
  dismissedAt: Date = new Date(),
): Promise<QueryReminderSuggestionDismissal | null> {
  if (!(await hasOwnedAgentMatch(userId, input.agentMatchId))) return null;

  const dismissedAtIso = dismissedAt.toISOString();
  const cooldownUntil = new Date(
    dismissedAt.getTime() + SUGGESTION_DISMISSAL_COOLDOWN_DAYS * 86_400_000,
  ).toISOString();
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from(SUGGESTION_DISMISSALS_TABLE)
    .upsert(
      {
        user_id: userId,
        agent_match_id: input.agentMatchId,
        rule_id: input.ruleId,
        dismissed_at: dismissedAtIso,
        cooldown_until: cooldownUntil,
      },
      { onConflict: "user_id,agent_match_id,rule_id" },
    )
    .select("*")
    .single();

  if (error) throw persistenceUnavailable();
  return normalizeQueryReminderSuggestionDismissal(
    data as QueryReminderSuggestionDismissalRow,
  );
}

export async function listOwnedQueryReminderSuggestionDismissals(
  userId: string,
  agentMatchId: string,
): Promise<QueryReminderSuggestionDismissal[] | null> {
  if (!(await hasOwnedAgentMatch(userId, agentMatchId))) return null;

  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from(SUGGESTION_DISMISSALS_TABLE)
    .select("*")
    .eq("user_id", userId)
    .eq("agent_match_id", agentMatchId)
    .order("dismissed_at", { ascending: false });

  if (error) throw persistenceUnavailable();
  return ((data ?? []) as QueryReminderSuggestionDismissalRow[]).map(
    normalizeQueryReminderSuggestionDismissal,
  );
}
