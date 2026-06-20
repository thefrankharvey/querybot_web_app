import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { getWqhApiUrl } from "@/lib/config";

export async function PUT(req: NextRequest) {
  const controller = new AbortController();

  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await req.json();

    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return NextResponse.json(
        { error: "Request body must be a JSON object" },
        { status: 400 }
      );
    }

    const externalRes = await fetch(
      `${getWqhApiUrl().replace(/\/$/, "")}/update-agent-profile`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        cache: "no-store",
        signal: controller.signal,
      }
    );

    const data = await externalRes.json();

    return NextResponse.json(data, { status: externalRes.status });
  } catch (error) {
    console.error("UPDATE AGENT PROFILE API ERROR: ", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "UPDATE AGENT PROFILE API ERROR",
      },
      { status: 500 }
    );
  }
}
