import { NextResponse } from "next/server";

import { getAgentMessageThreadDetailData } from "@/app/utils/message-thread-data";
import {
  badMessageRequest,
  messageRouteErrorResponse,
} from "@/app/api/message-threads/_route-utils";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ threadId: string }> },
) {
  try {
    const { threadId } = await params;

    if (!threadId) return badMessageRequest("threadId is required");
    return NextResponse.json(await getAgentMessageThreadDetailData(threadId));
  } catch (error) {
    return messageRouteErrorResponse(error, "Failed to fetch message thread");
  }
}
