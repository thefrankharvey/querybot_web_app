import { getWqhApiUrl } from "@/lib/config";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  const controller = new AbortController();

  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse agent_id from query parameters
    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get("agent_id");

    if (!agentId) {
      return NextResponse.json(
        { error: "agent_id parameter is required" },
        { status: 400 }
      );
    }

    const externalRes = await fetch(
      `${getWqhApiUrl()}/get-agent?agent_id=${encodeURIComponent(agentId)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      }
    );

    const data = await externalRes.json();

    return NextResponse.json(data, { status: externalRes.status });
  } catch (error) {
    console.error("GET AGENT API ERROR: ", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "GET AGENT API ERROR" },
      { status: 500 }
    );
  }
}
