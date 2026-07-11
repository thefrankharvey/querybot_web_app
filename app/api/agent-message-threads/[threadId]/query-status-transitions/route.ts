import { NextRequest, NextResponse } from "next/server";

import { transitionAgentQueryStatus } from "@/app/utils/message-thread-data";
import {
  badMessageRequest,
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

    return NextResponse.json(
      await transitionAgentQueryStatus({
        threadId,
        transition: parseQueryStatusTransition(body),
      }),
    );
  } catch (error) {
    return messageRouteErrorResponse(error, "Failed to update query status");
  }
}
