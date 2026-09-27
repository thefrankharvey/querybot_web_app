import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { parseAgencyBatchInput } from "@/app/utils/query-safety/validation";
import { agencyHistoryEnabled } from "@/app/utils/query-safety/feature-flags.server";
import { getSavedAgenciesForUser } from "@/app/utils/query-safety/agency-guard.server";
import { CONTRACT_VERSION } from "@/app/utils/query-safety/agency-guard";
import { checkAgencyHistoryRateLimit } from "@/app/utils/query-safety/rate-limit.server";
const headers = { "Cache-Control": "private, no-store" };
function error(code: string, status: number) {
  return NextResponse.json(
    { code, error: "Saved agency matches are unavailable." },
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
    if (!agencyHistoryEnabled())
      return NextResponse.json(
        {
          contractVersion: CONTRACT_VERSION,
          enabled: false,
          records: [],
          identities: {},
        },
        { headers },
      );
    if (!checkAgencyHistoryRateLimit(userId)) return error("RATE_LIMITED", 429);
    const raw = await req.text();
    if (raw.length > 40000) return error("INVALID_PAYLOAD", 400);
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return error("INVALID_PAYLOAD", 400);
    }
    const candidateIds = parseAgencyBatchInput(parsed);
    if (!candidateIds) return error("INVALID_PAYLOAD", 400);
    return NextResponse.json(
      await getSavedAgenciesForUser(userId, candidateIds),
      { headers },
    );
  } catch {
    return error("AGENCY_MATCHES_UNAVAILABLE", 503);
  }
}
