import { WQH_API_URL } from "@/app/constants";
import { NextRequest, NextResponse } from "next/server";
import { WQH_API_URL } from "@/app/constants";

export async function GET(req: NextRequest) {
  const controller = new AbortController();

  try {
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
      `${WQH_API_URL}/get-agent?agent_id=${encodeURIComponent(agentId)}`,
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
