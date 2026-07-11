import { NextRequest, NextResponse } from "next/server";

import { updateAgentThreadReadState } from "@/app/utils/message-thread-data";
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

    return NextResponse.json(
      await updateAgentThreadReadState({
        threadId,
        throughMessageId: getRequiredString(
          body.throughMessageId,
          "throughMessageId",
        ),
      }),
    );
  } catch (error) {
    return messageRouteErrorResponse(error, "Failed to update read state");
  }
}
