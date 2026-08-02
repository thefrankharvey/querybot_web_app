import {
  QUERY_REMINDER_RULE_IDS,
  type QueryReminderKind,
  type QueryReminderRuleId,
} from "@/app/utils/query-reminders/contracts";
import {
  addCalendarDays,
  compareLocalDates,
  differenceInCalendarDays,
  isValidLocalDate,
} from "@/app/utils/query-reminders/calendar";

export const SUGGESTION_DISMISSAL_COOLDOWN_DAYS = 30;

export type QueryReminderSuggestion = {
  ruleId: QueryReminderRuleId;
  kind: Exclude<QueryReminderKind, "manual">;
  suggestedDueOn: string;
  presetDueOns: string[];
  explanation: string;
};

export type ReminderSuggestionLifecycle =
  | "research"
  | "active_query"
  | "active_material"
  | "terminal";

export type ReminderSuggestionDismissalInput = {
  ruleId: QueryReminderRuleId;
  dismissedAt: string;
  cooldownUntil?: string | null;
};

export type ReminderSuggestionInput = {
  today: string;
  evaluatedAt: string;
  lifecycle: ReminderSuggestionLifecycle;
  querySentOn?: string | null;
  materialRequestedOn?: string | null;
  liveNextActionDueOn?: string | null;
  scheduledKinds?: readonly QueryReminderKind[];
  dismissals?: readonly ReminderSuggestionDismissalInput[];
  enabledRuleIds?: readonly QueryReminderRuleId[];
};

const ALL_RULES = new Set<QueryReminderRuleId>(QUERY_REMINDER_RULE_IDS);

function isDismissalActive(
  dismissal: ReminderSuggestionDismissalInput | undefined,
  evaluatedAt: string,
): boolean {
  if (!dismissal) return false;

  const evaluatedTimestamp = Date.parse(evaluatedAt);
  const dismissedTimestamp = Date.parse(dismissal.dismissedAt);
  if (
    Number.isNaN(evaluatedTimestamp) ||
    Number.isNaN(dismissedTimestamp)
  ) {
    return false;
  }

  const cooldownTimestamp = dismissal.cooldownUntil
    ? Date.parse(dismissal.cooldownUntil)
    : dismissedTimestamp + SUGGESTION_DISMISSAL_COOLDOWN_DAYS * 86_400_000;

  return !Number.isNaN(cooldownTimestamp) && evaluatedTimestamp <= cooldownTimestamp;
}

function isRedundantWithLiveNextAction(
  liveNextActionDueOn: string | null | undefined,
  suggestedDueOn: string,
): boolean {
  return Boolean(
    liveNextActionDueOn &&
      isValidLocalDate(liveNextActionDueOn) &&
      compareLocalDates(liveNextActionDueOn, suggestedDueOn) <= 0,
  );
}

export function getQueryReminderSuggestions(
  input: ReminderSuggestionInput,
): QueryReminderSuggestion[] {
  if (!isValidLocalDate(input.today) || input.lifecycle === "terminal") {
    return [];
  }

  const scheduledKinds = new Set(input.scheduledKinds ?? []);
  const dismissals = new Map(
    (input.dismissals ?? []).map((dismissal) => [dismissal.ruleId, dismissal]),
  );
  const enabledRules = new Set(input.enabledRuleIds ?? ALL_RULES);
  const suggestions: QueryReminderSuggestion[] = [];

  const addSuggestion = (suggestion: QueryReminderSuggestion) => {
    if (!enabledRules.has(suggestion.ruleId)) return;
    if (scheduledKinds.has(suggestion.kind)) return;
    if (
      isDismissalActive(dismissals.get(suggestion.ruleId), input.evaluatedAt)
    ) {
      return;
    }
    if (
      suggestion.ruleId !== "research-revisit-v1" &&
      isRedundantWithLiveNextAction(
        input.liveNextActionDueOn,
        suggestion.suggestedDueOn,
      )
    ) {
      return;
    }

    suggestions.push(suggestion);
  };

  if (input.lifecycle === "research") {
    addSuggestion({
      ruleId: "research-revisit-v1",
      kind: "research_revisit",
      suggestedDueOn: addCalendarDays(input.today, 14),
      presetDueOns: [7, 14, 30].map((days) =>
        addCalendarDays(input.today, days),
      ),
      explanation: "Consider revisiting this agent after more research.",
    });
  }

  if (
    input.lifecycle === "active_query" &&
    input.querySentOn &&
    isValidLocalDate(input.querySentOn)
  ) {
    const elapsedDays = differenceInCalendarDays(
      input.today,
      input.querySentOn,
    );

    if (elapsedDays >= 30) {
      addSuggestion({
        ruleId: "query-check-in-30-v1",
        kind: "query_check_in",
        suggestedDueOn: input.today,
        presetDueOns: [input.today],
        explanation:
          "Review the agency guidelines before deciding whether to check in.",
      });
    }

    if (elapsedDays >= 90) {
      addSuggestion({
        ruleId: "no-response-review-90-v1",
        kind: "no_response_review",
        suggestedDueOn: input.today,
        presetDueOns: [input.today],
        explanation:
          "Review the outstanding query and consider whether to keep tracking it.",
      });
    }
  }

  if (
    input.lifecycle === "active_material" &&
    input.materialRequestedOn &&
    isValidLocalDate(input.materialRequestedOn) &&
    differenceInCalendarDays(input.today, input.materialRequestedOn) >= 30
  ) {
    addSuggestion({
      ruleId: "material-check-in-30-v1",
      kind: "requested_material_check_in",
      suggestedDueOn: input.today,
      presetDueOns: [input.today],
      explanation:
        "Review the material request and the agency guidelines before deciding on next steps.",
    });
  }

  return suggestions;
}
