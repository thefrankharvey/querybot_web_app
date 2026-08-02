export const QUERY_REMINDER_KINDS = [
  "manual",
  "research_revisit",
  "query_check_in",
  "no_response_review",
  "requested_material_check_in",
] as const;

export const QUERY_REMINDER_STATUSES = [
  "scheduled",
  "completed",
  "dismissed",
  "canceled",
] as const;

export const QUERY_REMINDER_SOURCES = [
  "manual",
  "accepted_suggestion",
] as const;

export const QUERY_REMINDER_RULE_IDS = [
  "research-revisit-v1",
  "query-check-in-30-v1",
  "no-response-review-90-v1",
  "material-check-in-30-v1",
] as const;

export type QueryReminderKind = (typeof QUERY_REMINDER_KINDS)[number];
export type QueryReminderStatus = (typeof QUERY_REMINDER_STATUSES)[number];
export type QueryReminderSource = (typeof QUERY_REMINDER_SOURCES)[number];
export type QueryReminderRuleId = (typeof QUERY_REMINDER_RULE_IDS)[number];

export type QueryReminder = {
  id: string;
  agentMatchId: string;
  kind: QueryReminderKind;
  dueOn: string;
  timezone: string;
  note: string | null;
  status: QueryReminderStatus;
  source: QueryReminderSource;
  suggestionRule: QueryReminderRuleId | null;
  completedAt: string | null;
  dismissedAt: string | null;
  canceledAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type QueryReminderRow = {
  id: string;
  user_id: string;
  agent_match_id: string;
  kind: QueryReminderKind;
  due_on: string;
  timezone: string;
  note: string | null;
  status: QueryReminderStatus;
  source: QueryReminderSource;
  suggestion_rule: QueryReminderRuleId | null;
  completed_at: string | null;
  dismissed_at: string | null;
  canceled_at: string | null;
  created_at: string;
  updated_at: string;
};

export type QueryReminderSuggestionDismissal = {
  agentMatchId: string;
  ruleId: QueryReminderRuleId;
  dismissedAt: string;
  cooldownUntil: string;
};

export type QueryReminderSuggestionDismissalRow = {
  id: string;
  user_id: string;
  agent_match_id: string;
  rule_id: QueryReminderRuleId;
  dismissed_at: string;
  cooldown_until: string;
  created_at: string;
  updated_at: string;
};

export function normalizeQueryReminder(row: QueryReminderRow): QueryReminder {
  return {
    id: row.id,
    agentMatchId: row.agent_match_id,
    kind: row.kind,
    dueOn: row.due_on,
    timezone: row.timezone,
    note: row.note,
    status: row.status,
    source: row.source,
    suggestionRule: row.suggestion_rule,
    completedAt: row.completed_at,
    dismissedAt: row.dismissed_at,
    canceledAt: row.canceled_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function normalizeQueryReminderSuggestionDismissal(
  row: QueryReminderSuggestionDismissalRow,
): QueryReminderSuggestionDismissal {
  return {
    agentMatchId: row.agent_match_id,
    ruleId: row.rule_id,
    dismissedAt: row.dismissed_at,
    cooldownUntil: row.cooldown_until,
  };
}
