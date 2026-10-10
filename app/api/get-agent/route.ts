import { getWqhApiUrl } from "@/lib/config";
import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getWriterEmail, getWqhHistoryHeaders } from "@/lib/wqh-history-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get("agent_id");
    if (!agentId) return NextResponse.json({ error: "agent_id parameter is required" }, { status: 400 });
    const url = new URL(`${getWqhApiUrl().replace(/\/$/, "")}/get-agent`);
    url.searchParams.set("agent_id", agentId);
    const projectId = searchParams.get("writer_project_id");
    let headers: Record<string, string> = { "Content-Type": "application/json" };
    if (projectId) {
      const user = await currentUser();
      if (!user || user.id !== userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      const email = getWriterEmail(user);
      if (!email) return NextResponse.json({ error: "An email address is required" }, { status: 422 });
      const historyHeaders = getWqhHistoryHeaders();
      if (!historyHeaders) return NextResponse.json({ error: "Smart Match service is not configured" }, { status: 503 });
      headers = { ...headers, ...historyHeaders };
      url.searchParams.set("writer_project_id", projectId);
      url.searchParams.set("email", email);
    }
    const response = await fetch(url, { method: "GET", headers, cache: "no-store", signal: AbortSignal.timeout(30000) });
    return NextResponse.json(await response.json(), { status: response.status, headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("GET AGENT API ERROR:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Unable to load agent details" }, { status: 502 });
  }
}
