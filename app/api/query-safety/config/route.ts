import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { agencyHistoryEnabled } from "@/app/utils/query-safety/feature-flags.server";
import { getAgencyHistoryCapabilities } from "@/app/utils/query-safety/entitlements.server";
const headers = { "Cache-Control": "private, no-store" };
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json(
        { code: "UNAUTHORIZED" },
        { status: 401, headers },
      );
    const agencyHistory = agencyHistoryEnabled();
    return NextResponse.json(
      {
        agencyHistory,
        capabilities: agencyHistory
          ? await getAgencyHistoryCapabilities(userId)
          : { sameProjectAgencyGuard: false, allProjectsAgencyHistory: false },
      },
      { headers },
    );
  } catch {
    return NextResponse.json(
      { code: "HISTORY_UNAVAILABLE" },
      { status: 503, headers },
    );
  }
}
