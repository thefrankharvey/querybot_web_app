import { auth } from "@clerk/nextjs/server";

import {
  queryReminderError,
  queryReminderErrorResponse,
  queryReminderJson,
  readQueryReminderJson,
} from "@/app/utils/query-reminders/api.server";
import { transitionOwnedQueryReminder } from "@/app/utils/query-reminders/repository.server";
import {
  isUuid,
  parseQueryReminderTransitionInput,
} from "@/app/utils/query-reminders/validation";

type ReminderRouteContext = {
  params: Promise<{ reminderId: string }>;
};

async function getReminderId(context: ReminderRouteContext) {
  const { reminderId } = await context.params;
  return reminderId.trim().toLowerCase();
}

export async function PATCH(request: Request, context: ReminderRouteContext) {
  const { userId } = await auth();
  if (!userId) {
    return queryReminderError(
      401,
      "QUERY_REMINDER_UNAUTHORIZED",
      "Authentication is required",
    );
  }

  try {
    const reminderId = await getReminderId(context);
    if (!isUuid(reminderId)) {
      return queryReminderError(
        400,
        "QUERY_REMINDER_INVALID_REQUEST",
        "reminderId must be a UUID",
      );
    }

    const input = parseQueryReminderTransitionInput(
      await readQueryReminderJson(request),
    );
    const reminder = await transitionOwnedQueryReminder(
      userId,
      reminderId,
      input,
    );

    if (!reminder) {
      return queryReminderError(
        404,
        "QUERY_REMINDER_NOT_FOUND",
        "Reminder not found",
      );
    }

    return queryReminderJson({ reminder });
  } catch (error) {
    return queryReminderErrorResponse(error);
  }
}

export async function DELETE(_request: Request, context: ReminderRouteContext) {
  const { userId } = await auth();
  if (!userId) {
    return queryReminderError(
      401,
      "QUERY_REMINDER_UNAUTHORIZED",
      "Authentication is required",
    );
  }

  try {
    const reminderId = await getReminderId(context);
    if (!isUuid(reminderId)) {
      return queryReminderError(
        400,
        "QUERY_REMINDER_INVALID_REQUEST",
        "reminderId must be a UUID",
      );
    }

    const reminder = await transitionOwnedQueryReminder(userId, reminderId, {
      action: "cancel",
    });

    if (!reminder) {
      return queryReminderError(
        404,
        "QUERY_REMINDER_NOT_FOUND",
        "Reminder not found",
      );
    }

    return queryReminderJson({ reminder });
  } catch (error) {
    return queryReminderErrorResponse(error);
  }
}
