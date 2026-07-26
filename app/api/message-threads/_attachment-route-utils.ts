import { NextResponse } from "next/server";

import {
  AgentMessageApiError,
  WriterMessageApiError,
} from "@/app/utils/message-thread-data";
import type { WriterMessageApiErrorResponse } from "@/app/utils/message-types";

export const NO_STORE_HEADERS = { "Cache-Control": "no-store" } as const;

export function attachmentErrorResponse({
  error,
  fallbackMessage,
  viewer,
}: {
  error: unknown;
  fallbackMessage: string;
  viewer: "writer" | "agent";
}) {
  const isKnownError =
    viewer === "writer"
      ? error instanceof WriterMessageApiError
      : error instanceof AgentMessageApiError;
  const status = isKnownError
    ? (error as WriterMessageApiError | AgentMessageApiError).status
    : 500;
  const code = isKnownError
    ? (error as WriterMessageApiError | AgentMessageApiError).code
    : undefined;
  const message =
    isKnownError && error instanceof Error ? error.message : fallbackMessage;

  return NextResponse.json<WriterMessageApiErrorResponse>(
    { status: "error", message, ...(code ? { code } : {}) },
    { status, headers: NO_STORE_HEADERS },
  );
}

export function invalidAttachmentRequest(message: string, code?: string) {
  return NextResponse.json<WriterMessageApiErrorResponse>(
    { status: "error", message, ...(code ? { code } : {}) },
    { status: 400, headers: NO_STORE_HEADERS },
  );
}

export function attachmentFeatureDisabledResponse() {
  return NextResponse.json<WriterMessageApiErrorResponse>(
    {
      status: "error",
      code: "ATTACHMENT_FEATURE_DISABLED",
      message: "Manuscript attachments are not currently accepting new uploads.",
    },
    { status: 503, headers: NO_STORE_HEADERS },
  );
}

export async function readJsonObject(request: Request) {
  try {
    const body = (await request.json()) as unknown;
    return body && typeof body === "object" && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

export function getTrimmedString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}
