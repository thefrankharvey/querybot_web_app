import { auth } from "@clerk/nextjs/server";

import {
  queryReminderError,
  queryReminderErrorResponse,
  queryReminderJson,
  readQueryReminderJson,
} from "@/app/utils/query-reminders/api.server";
import {
  dismissOwnedQueryReminderSuggestion,
  listOwnedQueryReminderSuggestionDismissals,
} from "@/app/utils/query-reminders/repository.server";
import {
  isUuid,
  parseSuggestionDismissalInput,
} from "@/app/utils/query-reminders/validation";

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return queryReminderError(
      401,
      "QUERY_REMINDER_UNAUTHORIZED",
      "Authentication is required",
    );
  }

  try {
    const agentMatchId = new URL(request.url).searchParams
      .get("agentMatchId")
      ?.trim()
      .toLowerCase();
    if (!agentMatchId || !isUuid(agentMatchId)) {
      return queryReminderError(
        400,
        "QUERY_REMINDER_INVALID_REQUEST",
        "agentMatchId must be a UUID",
      );
    }

    const dismissals = await listOwnedQueryReminderSuggestionDismissals(
      userId,
      agentMatchId,
    );
    if (!dismissals) {
      return queryReminderError(
        404,
        "QUERY_REMINDER_AGENT_MATCH_NOT_FOUND",
        "Saved agent not found",
      );
    }

    return queryReminderJson({ dismissals });
  } catch (error) {
    return queryReminderErrorResponse(error);
  }
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return queryReminderError(
      401,
      "QUERY_REMINDER_UNAUTHORIZED",
      "Authentication is required",
    );
  }

  try {
    const input = parseSuggestionDismissalInput(
      await readQueryReminderJson(request),
    );
    const dismissal = await dismissOwnedQueryReminderSuggestion(userId, input);

    if (!dismissal) {
      return queryReminderError(
        404,
        "QUERY_REMINDER_AGENT_MATCH_NOT_FOUND",
        "Saved agent not found",
      );
    }

    return queryReminderJson({ dismissal }, 201);
  } catch (error) {
    return queryReminderErrorResponse(error);
  }
}
