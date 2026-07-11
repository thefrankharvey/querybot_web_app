import { NextRequest, NextResponse } from "next/server";

import { getAgentMessageThreadsData } from "@/app/utils/message-thread-data";
import {
  messageRouteErrorResponse,
  parseMessageThreadFilters,
} from "@/app/api/message-threads/_route-utils";

export async function GET(req: NextRequest) {
  try {
    const filters = parseMessageThreadFilters(new URL(req.url).searchParams);
    return NextResponse.json(await getAgentMessageThreadsData(filters));
  } catch (error) {
    return messageRouteErrorResponse(error, "Failed to fetch message threads");
  }
}
