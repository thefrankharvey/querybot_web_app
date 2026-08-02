import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

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
import {
  AgencyGuardServiceError,
  getAgencyGuardForUser,
} from "@/app/utils/query-safety/agency-guard.server";
import { getQuerySafetyFeatureFlags } from "@/app/utils/query-safety/feature-flags.server";

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
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json<WriterMessageApiErrorResponse>(
        { status: "error", message: "Unauthorized" },
        { status: 401, headers: { "Cache-Control": "private, no-store" } },
      );
    }

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
      safetyAcknowledgement?: unknown;
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

    const acknowledgement =
      payload.safetyAcknowledgement &&
      typeof payload.safetyAcknowledgement === "object" &&
      !Array.isArray(payload.safetyAcknowledgement)
        ? (payload.safetyAcknowledgement as Record<string, unknown>)
        : null;
    const acknowledgedResultVersion =
      typeof acknowledgement?.resultVersion === "string"
        ? acknowledgement.resultVersion.trim()
        : "";
    const unavailableAccepted = acknowledgement?.unavailableAccepted === true;

    if (getQuerySafetyFeatureFlags().composerGuard) {
      try {
        const guard = await getAgencyGuardForUser({
          input: { candidateRecordId: agentId },
          userId,
        });
        const needsAcknowledgement =
          guard.status === "warning" ||
          guard.status === "possible_match" ||
          guard.liveDataStatus !== "available";
        const hasCurrentAcknowledgement =
          acknowledgedResultVersion === guard.resultVersion ||
          (guard.liveDataStatus === "unavailable" && unavailableAccepted);

        if (needsAcknowledgement && !hasCurrentAcknowledgement) {
          return NextResponse.json(
            {
              status: "error",
              code: "AGENCY_GUARD_CONFIRMATION_REQUIRED",
              message: "Review agency query history before continuing.",
              agencyGuard: guard,
            },
            {
              status: 409,
              headers: { "Cache-Control": "private, no-store" },
            },
          );
        }
      } catch (error) {
        if (
          error instanceof AgencyGuardServiceError &&
          error.code === "AGENCY_GUARD_UNAVAILABLE" &&
          unavailableAccepted
        ) {
          // The writer deliberately chose to continue after an unavailable check.
        } else if (
          error instanceof AgencyGuardServiceError &&
          error.code === "INVALID_AGENCY_CANDIDATE"
        ) {
          // No agency identity means there is no same-agency assertion to make.
        } else if (error instanceof AgencyGuardServiceError) {
          return NextResponse.json(
            {
              status: "error",
              code: error.code,
              message: error.message,
            },
            {
              status: error.status,
              headers: { "Cache-Control": "private, no-store" },
            },
          );
        } else {
          throw error;
        }
      }
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
