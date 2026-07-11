import { NextRequest, NextResponse } from "next/server";

import { transitionWriterQueryStatus } from "@/app/utils/message-thread-data";
import {
  badMessageRequest,
  getRequiredString,
  messageRouteErrorResponse,
  parseQueryStatusTransition,
  readMessageJsonBody,
} from "@/app/api/message-threads/_route-utils";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ threadId: string }> },
) {
  try {
    const { threadId } = await params;
    const body = await readMessageJsonBody(req);

    if (!body) return badMessageRequest("Request body must be a JSON object");
    if (!threadId) return badMessageRequest("threadId is required");

    const data = await transitionWriterQueryStatus({
      routeProjectId: getRequiredString(body.projectId, "projectId"),
      threadId,
      transition: parseQueryStatusTransition(body),
    });

    return NextResponse.json(data);
  } catch (error) {
    return messageRouteErrorResponse(error, "Failed to update query status");
  }
}
