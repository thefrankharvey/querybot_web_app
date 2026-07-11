import { NextRequest, NextResponse } from "next/server";

import { updateWriterThreadReadState } from "@/app/utils/message-thread-data";
import {
  badMessageRequest,
  getRequiredString,
  messageRouteErrorResponse,
  readMessageJsonBody,
} from "@/app/api/message-threads/_route-utils";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ threadId: string }> },
) {
  try {
    const { threadId } = await params;
    const body = await readMessageJsonBody(req);

    if (!body) return badMessageRequest("Request body must be a JSON object");
    if (!threadId) return badMessageRequest("threadId is required");

    const data = await updateWriterThreadReadState({
      routeProjectId: getRequiredString(body.projectId, "projectId"),
      threadId,
      throughMessageId: getRequiredString(
        body.throughMessageId,
        "throughMessageId",
      ),
    });

    return NextResponse.json(data);
  } catch (error) {
    return messageRouteErrorResponse(error, "Failed to update read state");
  }
}
