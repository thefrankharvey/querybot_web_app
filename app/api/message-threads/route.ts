import { NextRequest, NextResponse } from "next/server";

import {
  createWriterMessageThread,
  getWriterMessageThreadsData,
} from "@/app/utils/message-thread-data";
import type {
  WriterCreateThreadResponse,
  WriterMessageApiErrorResponse,
} from "@/app/utils/message-types";
import {
  messageRouteErrorResponse,
  parseMessageThreadFilters,
  readMessageJsonBody,
} from "@/app/api/message-threads/_route-utils";

export async function GET(req: NextRequest) {
  try {
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

    const data = await getWriterMessageThreadsData(
      projectId,
      parseMessageThreadFilters(searchParams),
    );

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
    return messageRouteErrorResponse(error, "Failed to fetch message threads");
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await readMessageJsonBody(req);

    if (!body) {
      return NextResponse.json<WriterMessageApiErrorResponse>(
        {
          status: "error",
          message: "Request body must be a JSON object",
        },
        { status: 400 },
      );
    }

    const payload = body as {
      agentId?: unknown;
      body?: unknown;
      projectId?: unknown;
      subject?: unknown;
    };
    const projectId =
      typeof payload.projectId === "string" ? payload.projectId.trim() : "";
    const agentId =
      typeof payload.agentId === "string" ? payload.agentId.trim() : "";
    const subject =
      typeof payload.subject === "string" ? payload.subject.trim() : "";
    const messageBody =
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

    if (!agentId) {
      return NextResponse.json<WriterMessageApiErrorResponse>(
        {
          status: "error",
          message: "agentId is required",
        },
        { status: 400 },
      );
    }

    if (!subject) {
      return NextResponse.json<WriterMessageApiErrorResponse>(
        {
          status: "error",
          message: "Subject is required",
        },
        { status: 400 },
      );
    }

    if (!messageBody) {
      return NextResponse.json<WriterMessageApiErrorResponse>(
        {
          status: "error",
          message: "Message body is required",
        },
        { status: 400 },
      );
    }

    const data = await createWriterMessageThread({
      agentId,
      body: messageBody,
      routeProjectId: projectId,
      subject,
    });

    return NextResponse.json<WriterCreateThreadResponse>(data, {
      status: data.status === "success" ? 201 : 200,
    });
  } catch (error) {
    return messageRouteErrorResponse(error, "Failed to create message thread");
  }
}
