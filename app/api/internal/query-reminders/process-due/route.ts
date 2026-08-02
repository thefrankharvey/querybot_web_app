import { timingSafeEqual } from "node:crypto";

import {
  QUERY_REMINDER_NO_STORE_HEADERS,
  queryReminderError,
  queryReminderJson,
} from "@/app/utils/query-reminders/api.server";
import {
  DueReminderProcessorError,
  runDueReminderProcessor,
} from "@/app/utils/query-reminders/process-due.server";
import { isDueReminderProcessorEnabled } from "@/app/utils/query-safety/feature-flags.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function hasValidProcessorAuthorization(
  authorization: string | null,
  secret: string,
): boolean {
  if (!authorization?.startsWith("Bearer ")) return false;
  const suppliedSecret = authorization.slice("Bearer ".length);
  const supplied = Buffer.from(suppliedSecret);
  const expected = Buffer.from(secret);

  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

export async function POST(request: Request) {
  if (!isDueReminderProcessorEnabled()) {
    return queryReminderError(
      503,
      "QUERY_REMINDER_PROCESSOR_DISABLED",
      "The due-reminder processor is disabled",
    );
  }

  const secret = process.env.QUERY_REMINDER_PROCESSOR_SECRET?.trim();
  if (!secret) {
    return queryReminderError(
      503,
      "QUERY_REMINDER_PROCESSOR_MISCONFIGURED",
      "The due-reminder processor is unavailable",
    );
  }

  if (!hasValidProcessorAuthorization(request.headers.get("authorization"), secret)) {
    return queryReminderError(
      401,
      "QUERY_REMINDER_PROCESSOR_UNAUTHORIZED",
      "Processor authentication failed",
    );
  }

  try {
    const summary = await runDueReminderProcessor();
    return queryReminderJson({ status: "success", summary });
  } catch (error) {
    if (error instanceof DueReminderProcessorError) {
      return queryReminderError(error.status, error.code, "The due-reminder processor failed");
    }
    return queryReminderError(
      500,
      "QUERY_REMINDER_PROCESSOR_FAILED",
      "The due-reminder processor failed",
    );
  }
}

export async function GET() {
  return new Response(null, {
    status: 405,
    headers: {
      ...QUERY_REMINDER_NO_STORE_HEADERS,
      Allow: "POST",
    },
  });
}
