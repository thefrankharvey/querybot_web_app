import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { getWqhApiUrl } from "@/lib/config";

export async function GET(req: NextRequest) {
  const controller = new AbortController();

  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const lookupBy = searchParams.get("lookup_by");
    const value = searchParams.get("value");
    const withLegacyData = searchParams.get("with_legacy_data");

    if (!lookupBy || !value) {
      return NextResponse.json(
        { error: "lookup_by and value parameters are required" },
        { status: 400 }
      );
    }

    if (lookupBy !== "id" && lookupBy !== "name" && lookupBy !== "email") {
      return NextResponse.json(
        { error: 'lookup_by must be "id", "name", or "email"' },
        { status: 400 }
      );
    }

    const externalUrl = new URL(
      `${getWqhApiUrl().replace(/\/$/, "")}/get-agent-profile`
    );
    externalUrl.searchParams.set("lookup_by", lookupBy);
    externalUrl.searchParams.set("value", value);

    if (withLegacyData) {
      externalUrl.searchParams.set("with_legacy_data", withLegacyData);
    }

    const externalRes = await fetch(externalUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
      signal: controller.signal,
    });

    const data = await externalRes.json();

    return NextResponse.json(data, { status: externalRes.status });
  } catch (error) {
    console.error("GET AGENT PROFILE API ERROR: ", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "GET AGENT PROFILE API ERROR",
      },
      { status: 500 }
    );
  }
}
