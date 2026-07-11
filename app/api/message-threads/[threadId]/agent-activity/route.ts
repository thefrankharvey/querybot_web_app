import { NextRequest, NextResponse } from "next/server";

import { getWriterAgentActivityData } from "@/app/utils/message-thread-data";
import {
  badMessageRequest,
  messageRouteErrorResponse,
  parseAgentActivityWindow,
} from "@/app/api/message-threads/_route-utils";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ threadId: string }> },
) {
  try {
    const { threadId } = await params;
    const searchParams = new URL(req.url).searchParams;
    const projectId = searchParams.get("projectId")?.trim();

    if (!projectId) return badMessageRequest("projectId is required");
    if (!threadId) return badMessageRequest("threadId is required");

    const data = await getWriterAgentActivityData({
      routeProjectId: projectId,
      threadId,
      window: parseAgentActivityWindow(searchParams.get("window")),
    });

    if (!data) {
      return NextResponse.json(
        { status: "error", message: "Project not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return messageRouteErrorResponse(error, "Failed to fetch agent activity");
  }
}
