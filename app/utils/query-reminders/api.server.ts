import "server-only";

import { NextResponse } from "next/server";

import { QueryReminderTransitionError } from "@/app/utils/query-reminders/state-machine";
import { QueryReminderValidationError } from "@/app/utils/query-reminders/validation";
import { QueryReminderPersistenceError } from "@/app/utils/query-reminders/repository.server";

export const QUERY_REMINDER_NO_STORE_HEADERS = {
  "Cache-Control": "private, no-store",
} as const;

export type QueryReminderApiErrorBody = {
  status: "error";
  code: string;
  message: string;
};

export function queryReminderJson<TBody>(body: TBody, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: QUERY_REMINDER_NO_STORE_HEADERS,
  });
}

export function queryReminderError(
  status: number,
  code: string,
  message: string,
) {
  return queryReminderJson<QueryReminderApiErrorBody>(
    { status: "error", code, message },
    status,
  );
}

export function queryReminderErrorResponse(error: unknown) {
  if (error instanceof QueryReminderValidationError) {
    return queryReminderError(400, error.code, error.message);
  }
  if (error instanceof QueryReminderTransitionError) {
    return queryReminderError(409, error.code, error.message);
  }
  if (error instanceof QueryReminderPersistenceError) {
    return queryReminderError(error.status, error.code, error.message);
  }

  return queryReminderError(
    500,
    "QUERY_REMINDER_INTERNAL_ERROR",
    "The reminder request could not be completed",
  );
}

export async function readQueryReminderJson(request: Request) {
  try {
    return (await request.json()) as unknown;
  } catch {
    throw new QueryReminderValidationError("Request body must be valid JSON");
  }
}
