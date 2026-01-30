import { WQH_API_URL } from "@/app/constants";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { SlushFeed } from "@/app/types";
import { flattenAndSortFeed } from "@/app/utils/dispatch-utils";

export async function GET(req: NextRequest) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 1 minute timeout

  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = searchParams.get("limit") || "10";
    const offset = searchParams.get("offset") || "0";

    const externalRes = await fetch(
      `${WQH_API_URL}/recent-activity?limit=${limit}&offset=${offset}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        cache: "no-store",
      },
    );

    const data: SlushFeed = await externalRes.json();
    const flattenedFeed = flattenAndSortFeed(data);

    return NextResponse.json(flattenedFeed, { status: externalRes.status });
  } catch (error) {
    console.error("Dispatch feed API error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch dispatch feed",
      },
      { status: 500 },
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
