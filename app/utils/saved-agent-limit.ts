export const FREE_SAVED_AGENT_LIMIT = 6;

export const FREE_SAVED_AGENT_LIMIT_MESSAGE =
  "You've reached your limit of free saved agents. Subscribe for unlimited.";

export function wouldExceedSavedAgentLimit(
  isSubscribed: boolean,
  savedCount: number,
  additionalCount = 1,
) {
  return !isSubscribed && savedCount + additionalCount > FREE_SAVED_AGENT_LIMIT;
}
