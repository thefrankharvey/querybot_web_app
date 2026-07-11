import { NextRequest, NextResponse } from "next/server";

import {
  AgentMessageApiError,
  WriterMessageApiError,
} from "@/app/utils/message-thread-data";
import {
  isKnownQueryStatusCode,
  type AgentActivityWindow,
  type MessageThreadFilters,
  type QueryStatusTransitionCode,
  type QueryStatusTransitionInput,
  type WriterMessageApiErrorResponse,
} from "@/app/utils/message-types";

export class MessageRouteInputError extends Error {
  status = 400;
}

export function messageRouteErrorResponse(
  error: unknown,
  fallbackMessage: string,
) {
  const isMessageApiError =
    error instanceof WriterMessageApiError ||
    error instanceof AgentMessageApiError ||
    error instanceof MessageRouteInputError;
  const status = isMessageApiError ? error.status : 500;
  const message =
    isMessageApiError && error instanceof Error
      ? error.message
      : fallbackMessage;

  return NextResponse.json<WriterMessageApiErrorResponse>(
    { status: "error", message },
    { status },
  );
}

export function badMessageRequest(message: string) {
  return NextResponse.json<WriterMessageApiErrorResponse>(
    { status: "error", message },
    { status: 400 },
  );
}

export async function readMessageJsonBody(req: NextRequest) {
  try {
    const body = (await req.json()) as unknown;
    return body && typeof body === "object" && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

export function getRequiredString(value: unknown, fieldName: string): string {
  const normalized = typeof value === "string" ? value.trim() : "";

  if (!normalized) throw new MessageRouteInputError(`${fieldName} is required`);
  return normalized;
}

function getOptionalString(value: unknown, fieldName: string) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== "string") {
    throw new MessageRouteInputError(`${fieldName} must be a string or null`);
  }
  return value.trim() || null;
}

export function parseMessageThreadFilters(
  searchParams: URLSearchParams,
): MessageThreadFilters {
  const queryStatus = searchParams.get("queryStatus")?.trim();
  const terminal = searchParams.get("terminal")?.trim();
  const filters: MessageThreadFilters = {};

  if (queryStatus) {
    if (!isKnownQueryStatusCode(queryStatus)) {
      throw new MessageRouteInputError("queryStatus is not supported");
    }
    filters.queryStatus = queryStatus;
  }

  if (terminal) {
    if (terminal !== "true" && terminal !== "false") {
      throw new MessageRouteInputError("terminal must be true or false");
    }
    filters.terminal = terminal === "true";
  }

  return filters;
}

export function parseAgentActivityWindow(
  value: string | null,
): AgentActivityWindow {
  if (!value) return "90";
  if (value === "30" || value === "90" || value === "180" || value === "all") {
    return value;
  }
  throw new MessageRouteInputError("window must be 30, 90, 180, or all");
}

export function parseQueryStatusTransition(
  payload: Record<string, unknown>,
): QueryStatusTransitionInput {
  const rawToStatus = getRequiredString(payload.toStatus, "toStatus");

  if (
    !isKnownQueryStatusCode(rawToStatus) ||
    rawToStatus === "query_sent" ||
    rawToStatus === "query_viewed"
  ) {
    throw new MessageRouteInputError("toStatus is not a manual transition");
  }

  if (
    typeof payload.expectedVersion !== "number" ||
    !Number.isInteger(payload.expectedVersion) ||
    payload.expectedVersion < 1
  ) {
    throw new MessageRouteInputError(
      "expectedVersion must be a positive integer",
    );
  }

  if (
    payload.metadata !== undefined &&
    (payload.metadata === null ||
      typeof payload.metadata !== "object" ||
      Array.isArray(payload.metadata))
  ) {
    throw new MessageRouteInputError("metadata must be a JSON object");
  }

  return {
    toStatus: rawToStatus as QueryStatusTransitionCode,
    expectedVersion: payload.expectedVersion,
    idempotencyKey: getRequiredString(payload.idempotencyKey, "idempotencyKey"),
    note: getOptionalString(payload.note, "note"),
    reasonCode: getOptionalString(payload.reasonCode, "reasonCode"),
    dueAt: getOptionalString(payload.dueAt, "dueAt"),
    occurredAt: getOptionalString(payload.occurredAt, "occurredAt"),
    sourceMessageId: getOptionalString(
      payload.sourceMessageId,
      "sourceMessageId",
    ),
    metadata: payload.metadata as Record<string, unknown> | undefined,
  };
}
