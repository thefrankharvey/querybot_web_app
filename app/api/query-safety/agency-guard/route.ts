import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { parseAgencyGuardInput } from "@/app/utils/query-safety/validation";
import { agencyHistoryEnabled } from "@/app/utils/query-safety/feature-flags.server";
import {
  AgencyGuardError,
  getAgencyGuardForUser,
} from "@/app/utils/query-safety/agency-guard.server";
import { checkAgencyHistoryRateLimit } from "@/app/utils/query-safety/rate-limit.server";
const headers = { "Cache-Control": "private, no-store" };
function error(code: string, status: number) {
  return NextResponse.json(
    {
      code,
      error:
        code === "NOT_FOUND"
          ? "Saved project or agent not found."
          : code === "CAPABILITY_REQUIRED"
            ? "All-project history requires a subscription."
            : "Agency history is unavailable for this request.",
    },
    {
      status,
      headers: {
        ...headers,
        ...(status === 429 ? { "Retry-After": "60" } : {}),
      },
    },
  );
}
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return error("UNAUTHORIZED", 401);
    if (!agencyHistoryEnabled()) return error("FEATURE_DISABLED", 404);
    if (!checkAgencyHistoryRateLimit(userId)) return error("RATE_LIMITED", 429);
    const raw = await req.text();
    if (raw.length > 8192) return error("INVALID_PAYLOAD", 400);
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return error("INVALID_PAYLOAD", 400);
    }
    const input = parseAgencyGuardInput(parsed);
    if (!input) return error("INVALID_PAYLOAD", 400);
    return NextResponse.json(await getAgencyGuardForUser(userId, input), {
      headers,
    });
  } catch (cause) {
    return cause instanceof AgencyGuardError
      ? error(cause.code, cause.status)
      : error("HISTORY_UNAVAILABLE", 503);
  }
}
