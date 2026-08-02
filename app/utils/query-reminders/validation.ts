import {
  QUERY_REMINDER_KINDS,
  QUERY_REMINDER_RULE_IDS,
  QUERY_REMINDER_SOURCES,
  QUERY_REMINDER_STATUSES,
  type QueryReminderKind,
  type QueryReminderRuleId,
  type QueryReminderSource,
  type QueryReminderStatus,
} from "@/app/utils/query-reminders/contracts";
import {
  isValidLocalDate,
  normalizeIanaTimeZone,
} from "@/app/utils/query-reminders/calendar";
import type { QueryReminderTransitionInput } from "@/app/utils/query-reminders/state-machine";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const MAX_QUERY_REMINDER_NOTE_LENGTH = 500;

const REMINDER_KIND_BY_RULE: Record<
  QueryReminderRuleId,
  Exclude<QueryReminderKind, "manual">
> = {
  "research-revisit-v1": "research_revisit",
  "query-check-in-30-v1": "query_check_in",
  "no-response-review-90-v1": "no_response_review",
  "material-check-in-30-v1": "requested_material_check_in",
};

export class QueryReminderValidationError extends Error {
  readonly code = "QUERY_REMINDER_INVALID_REQUEST";
}

export type CreateQueryReminderInput = {
  agentMatchId: string;
  kind: QueryReminderKind;
  dueOn: string;
  timezone: string;
  note: string | null;
  source: QueryReminderSource;
  suggestionRule: QueryReminderRuleId | null;
};

export type QueryReminderDueFilter =
  | "due"
  | "overdue"
  | "due_or_overdue"
  | "upcoming";

export type QueryReminderListFilters = {
  status?: QueryReminderStatus;
  due?: QueryReminderDueFilter;
  projectId?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function assertAllowedKeys(
  payload: Record<string, unknown>,
  allowedKeys: readonly string[],
) {
  const unknownKey = Object.keys(payload).find(
    (key) => !allowedKeys.includes(key),
  );
  if (unknownKey) {
    throw new QueryReminderValidationError(
      `Unknown request field: ${unknownKey}`,
    );
  }
}

function getRequiredString(value: unknown, fieldName: string): string {
  const result = typeof value === "string" ? value.trim() : "";
  if (!result) {
    throw new QueryReminderValidationError(`${fieldName} is required`);
  }
  return result;
}

function getUuid(value: unknown, fieldName: string): string {
  const result = getRequiredString(value, fieldName);
  if (!UUID_PATTERN.test(result)) {
    throw new QueryReminderValidationError(`${fieldName} must be a UUID`);
  }
  return result.toLowerCase();
}

function getLocalDate(value: unknown, fieldName: string): string {
  const result = getRequiredString(value, fieldName);
  if (!isValidLocalDate(result)) {
    throw new QueryReminderValidationError(
      `${fieldName} must use the YYYY-MM-DD calendar-date format`,
    );
  }
  return result;
}

function getTimezone(value: unknown): string {
  const result = getRequiredString(value, "timezone");
  const timezone = normalizeIanaTimeZone(result);
  if (!timezone) {
    throw new QueryReminderValidationError(
      "timezone must be a valid IANA timezone",
    );
  }
  return timezone;
}

function getNote(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string") {
    throw new QueryReminderValidationError("note must be a string or null");
  }

  const note = value.trim();
  if (!note) return null;
  if (note.length > MAX_QUERY_REMINDER_NOTE_LENGTH) {
    throw new QueryReminderValidationError(
      `note must be ${MAX_QUERY_REMINDER_NOTE_LENGTH} characters or fewer`,
    );
  }
  return note;
}

function getEnumValue<TValue extends string>(
  value: unknown,
  fieldName: string,
  allowedValues: readonly TValue[],
): TValue {
  const result = getRequiredString(value, fieldName) as TValue;
  if (!allowedValues.includes(result)) {
    throw new QueryReminderValidationError(
      `${fieldName} is not supported`,
    );
  }
  return result;
}

export function parseCreateQueryReminderInput(
  value: unknown,
): CreateQueryReminderInput {
  if (!isRecord(value)) {
    throw new QueryReminderValidationError(
      "Request body must be a JSON object",
    );
  }

  assertAllowedKeys(value, [
    "agentMatchId",
    "kind",
    "dueOn",
    "timezone",
    "note",
    "source",
    "suggestionRule",
  ]);

  const source =
    value.source === undefined
      ? "manual"
      : getEnumValue(value.source, "source", QUERY_REMINDER_SOURCES);
  const suggestionRule =
    value.suggestionRule === undefined || value.suggestionRule === null
      ? null
      : getEnumValue(
          value.suggestionRule,
          "suggestionRule",
          QUERY_REMINDER_RULE_IDS,
        );

  if (source === "accepted_suggestion" && !suggestionRule) {
    throw new QueryReminderValidationError(
      "suggestionRule is required for an accepted suggestion",
    );
  }
  if (source === "manual" && suggestionRule) {
    throw new QueryReminderValidationError(
      "suggestionRule is only valid for an accepted suggestion",
    );
  }

  const kind = getEnumValue(value.kind, "kind", QUERY_REMINDER_KINDS);
  if (
    suggestionRule &&
    REMINDER_KIND_BY_RULE[suggestionRule] !== kind
  ) {
    throw new QueryReminderValidationError(
      "kind does not match the accepted suggestion rule",
    );
  }

  return {
    agentMatchId: getUuid(value.agentMatchId, "agentMatchId"),
    kind,
    dueOn: getLocalDate(value.dueOn, "dueOn"),
    timezone: getTimezone(value.timezone),
    note: getNote(value.note),
    source,
    suggestionRule,
  };
}

export function parseQueryReminderTransitionInput(
  value: unknown,
): QueryReminderTransitionInput {
  if (!isRecord(value)) {
    throw new QueryReminderValidationError(
      "Request body must be a JSON object",
    );
  }

  const action = getRequiredString(value.action, "action");

  if (action === "complete" || action === "dismiss" || action === "cancel") {
    assertAllowedKeys(value, ["action"]);
    return { action };
  }

  if (action === "snooze") {
    assertAllowedKeys(value, ["action", "dueOn", "timezone"]);
    return {
      action,
      dueOn: getLocalDate(value.dueOn, "dueOn"),
      timezone: getTimezone(value.timezone),
    };
  }

  if (action === "reschedule") {
    assertAllowedKeys(value, ["action", "dueOn", "timezone", "note"]);
    const input: QueryReminderTransitionInput = {
      action,
      dueOn: getLocalDate(value.dueOn, "dueOn"),
      timezone: getTimezone(value.timezone),
    };
    if (Object.hasOwn(value, "note")) {
      input.note = getNote(value.note);
    }
    return input;
  }

  throw new QueryReminderValidationError("action is not supported");
}

export function parseSuggestionDismissalInput(value: unknown): {
  agentMatchId: string;
  ruleId: QueryReminderRuleId;
} {
  if (!isRecord(value)) {
    throw new QueryReminderValidationError(
      "Request body must be a JSON object",
    );
  }
  assertAllowedKeys(value, ["agentMatchId", "ruleId"]);

  return {
    agentMatchId: getUuid(value.agentMatchId, "agentMatchId"),
    ruleId: getEnumValue(value.ruleId, "ruleId", QUERY_REMINDER_RULE_IDS),
  };
}

export function parseQueryReminderListFilters(
  searchParams: URLSearchParams,
): QueryReminderListFilters {
  const rawStatus = searchParams.get("status")?.trim();
  const rawDue = searchParams.get("due")?.trim();
  const projectId = searchParams.get("projectId")?.trim();
  const filters: QueryReminderListFilters = {};

  if (rawStatus) {
    filters.status = getEnumValue(
      rawStatus,
      "status",
      QUERY_REMINDER_STATUSES,
    );
  }

  if (rawDue) {
    filters.due = getEnumValue(rawDue, "due", [
      "due",
      "overdue",
      "due_or_overdue",
      "upcoming",
    ] as const);
  }

  if (projectId) filters.projectId = projectId;
  return filters;
}

export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}
