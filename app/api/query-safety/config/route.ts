import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { getQuerySafetyFeatureFlags } from "@/app/utils/query-safety/feature-flags.server";

const NO_STORE_HEADERS = { "Cache-Control": "private, no-store" } as const;

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { code: "UNAUTHORIZED", error: "Unauthorized" },
      { status: 401, headers: NO_STORE_HEADERS },
    );
  }

  const flags = getQuerySafetyFeatureFlags();
  return NextResponse.json(
    {
      features: {
        agencyHistory: flags.agencyHistory,
        queryRounds: flags.queryRounds,
        manualReminders: flags.manualReminders,
        suggestionRules: {
          "research-revisit-v1": flags.researchRevisitSuggestion,
          "query-check-in-30-v1": flags.queryCheckInSuggestion,
          "no-response-review-90-v1": flags.noResponseReviewSuggestion,
          "material-check-in-30-v1": flags.materialCheckInSuggestion,
        },
      },
    },
    { headers: NO_STORE_HEADERS },
  );
}
