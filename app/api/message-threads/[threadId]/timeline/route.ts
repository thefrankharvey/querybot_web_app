import { NextRequest, NextResponse } from "next/server";

import { getWriterQueryTimelineData } from "@/app/utils/message-thread-data";
import {
  badMessageRequest,
  messageRouteErrorResponse,
} from "@/app/api/message-threads/_route-utils";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ threadId: string }> },
) {
  try {
    const { threadId } = await params;
    const projectId = new URL(req.url).searchParams.get("projectId")?.trim();

    if (!projectId) return badMessageRequest("projectId is required");
    if (!threadId) return badMessageRequest("threadId is required");

    const data = await getWriterQueryTimelineData({
      routeProjectId: projectId,
      threadId,
    });

    if (!data) {
      return NextResponse.json(
        { status: "error", message: "Project not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return messageRouteErrorResponse(error, "Failed to fetch query timeline");
  }
}
