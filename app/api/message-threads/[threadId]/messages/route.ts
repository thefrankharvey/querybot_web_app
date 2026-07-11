import { NextRequest, NextResponse } from "next/server";

import {
  getWriterThreadMessagesData,
  sendWriterThreadReply,
  WriterMessageApiError,
} from "@/app/utils/message-thread-data";
import type { WriterMessageApiErrorResponse } from "@/app/utils/message-types";

function getErrorResponse(error: unknown, fallbackMessage: string) {
  const status = error instanceof WriterMessageApiError ? error.status : 500;
  const message = error instanceof Error ? error.message : fallbackMessage;

  return NextResponse.json<WriterMessageApiErrorResponse>(
    {
      status: "error",
      message,
    },
    { status },
  );
}

async function readJsonBody(req: NextRequest) {
  try {
    return (await req.json()) as unknown;
  } catch {
    return null;
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ threadId: string }> },
) {
  try {
    const { threadId } = await params;
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId")?.trim();

    if (!projectId) {
      return NextResponse.json<WriterMessageApiErrorResponse>(
        {
          status: "error",
          message: "projectId is required",
        },
        { status: 400 },
      );
    }

    if (!threadId) {
      return NextResponse.json<WriterMessageApiErrorResponse>(
        {
          status: "error",
          message: "threadId is required",
        },
        { status: 400 },
      );
    }

    const data = await getWriterThreadMessagesData({
      before: searchParams.get("before"),
      limit: searchParams.get("limit") ?? "50",
      routeProjectId: projectId,
      threadId,
    });

    if (!data) {
      return NextResponse.json<WriterMessageApiErrorResponse>(
        {
          status: "error",
          message: "Project not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return getErrorResponse(error, "Failed to fetch thread messages");
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ threadId: string }> },
) {
  try {
    const { threadId } = await params;
    const body = await readJsonBody(req);

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json<WriterMessageApiErrorResponse>(
        {
          status: "error",
          message: "Request body must be a JSON object",
        },
        { status: 400 },
      );
    }

    const payload = body as { projectId?: unknown; body?: unknown };
    const projectId =
      typeof payload.projectId === "string" ? payload.projectId.trim() : "";
    const replyBody =
      typeof payload.body === "string" ? payload.body.trim() : "";

    if (!projectId) {
      return NextResponse.json<WriterMessageApiErrorResponse>(
        {
          status: "error",
          message: "projectId is required",
        },
        { status: 400 },
      );
    }

    if (!threadId) {
      return NextResponse.json<WriterMessageApiErrorResponse>(
        {
          status: "error",
          message: "threadId is required",
        },
        { status: 400 },
      );
    }

    if (!replyBody) {
      return NextResponse.json<WriterMessageApiErrorResponse>(
        {
          status: "error",
          message: "Reply body is required",
        },
        { status: 400 },
      );
    }

    const data = await sendWriterThreadReply({
      body: replyBody,
      routeProjectId: projectId,
      threadId,
    });

    return NextResponse.json(data);
  } catch (error) {
    return getErrorResponse(error, "Failed to send reply");
  }
}
