import "server-only";

function readBooleanFlag(name: string, defaultValue: boolean): boolean {
  const value = process.env[name]?.trim().toLowerCase();
  if (!value) return defaultValue;
  if (value === "true") return true;
  if (value === "false") return false;
  return defaultValue;
}

export type QuerySafetyFeatureFlags = {
  agencyHistory: boolean;
  composerGuard: boolean;
  queryRounds: boolean;
  manualReminders: boolean;
  researchRevisitSuggestion: boolean;
  queryCheckInSuggestion: boolean;
  noResponseReviewSuggestion: boolean;
  materialCheckInSuggestion: boolean;
  dueReminderProcessor: boolean;
};

export function getQuerySafetyFeatureFlags(): QuerySafetyFeatureFlags {
  return {
    agencyHistory: readBooleanFlag(
      "QUERY_SAFETY_AGENCY_HISTORY_ENABLED",
      true,
    ),
    composerGuard: readBooleanFlag(
      "QUERY_SAFETY_COMPOSER_GUARD_ENABLED",
      true,
    ),
    queryRounds: readBooleanFlag("QUERY_SAFETY_ROUNDS_ENABLED", true),
    manualReminders: readBooleanFlag(
      "QUERY_SAFETY_MANUAL_REMINDERS_ENABLED",
      true,
    ),
    researchRevisitSuggestion: readBooleanFlag(
      "QUERY_SAFETY_RESEARCH_REVISIT_ENABLED",
      true,
    ),
    queryCheckInSuggestion: readBooleanFlag(
      "QUERY_SAFETY_QUERY_CHECK_IN_ENABLED",
      true,
    ),
    noResponseReviewSuggestion: readBooleanFlag(
      "QUERY_SAFETY_NO_RESPONSE_REVIEW_ENABLED",
      true,
    ),
    materialCheckInSuggestion: readBooleanFlag(
      "QUERY_SAFETY_MATERIAL_CHECK_IN_ENABLED",
      true,
    ),
    dueReminderProcessor: readBooleanFlag(
      "QUERY_REMINDER_DUE_PROCESSOR_ENABLED",
      false,
    ),
  };
}

export function isDueReminderProcessorEnabled(): boolean {
  return getQuerySafetyFeatureFlags().dueReminderProcessor;
}
