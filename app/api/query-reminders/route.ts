import { auth } from "@clerk/nextjs/server";

import {
  queryReminderError,
  queryReminderErrorResponse,
  queryReminderJson,
  readQueryReminderJson,
} from "@/app/utils/query-reminders/api.server";
import {
  createOwnedQueryReminder,
  listOwnedQueryReminders,
} from "@/app/utils/query-reminders/repository.server";
import {
  parseCreateQueryReminderInput,
  parseQueryReminderListFilters,
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
    const filters = parseQueryReminderListFilters(
      new URL(request.url).searchParams,
    );
    const reminders = await listOwnedQueryReminders(userId, filters);
    return queryReminderJson({ reminders });
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
    const input = parseCreateQueryReminderInput(
      await readQueryReminderJson(request),
    );
    const reminder = await createOwnedQueryReminder(userId, input);

    if (!reminder) {
      return queryReminderError(
        404,
        "QUERY_REMINDER_AGENT_MATCH_NOT_FOUND",
        "Saved agent not found",
      );
    }

    return queryReminderJson({ reminder }, 201);
  } catch (error) {
    return queryReminderErrorResponse(error);
  }
}
