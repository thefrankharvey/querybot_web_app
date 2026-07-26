import { NextResponse } from "next/server";

import {
  attachmentErrorResponse,
  getTrimmedString,
  invalidAttachmentRequest,
  NO_STORE_HEADERS,
  readJsonObject,
} from "@/app/api/message-threads/_attachment-route-utils";
import { finalizeWriterAttachment } from "@/app/utils/message-thread-data";

export async function POST(
  request: Request,
  {
    params,
  }: { params: Promise<{ threadId: string; attachmentId: string }> },
) {
  try {
    const [{ threadId, attachmentId }, payload] = await Promise.all([
      params,
      readJsonObject(request),
    ]);
    const projectId = getTrimmedString(payload?.projectId);
    const normalizedThreadId = getTrimmedString(threadId);
    const normalizedAttachmentId = getTrimmedString(attachmentId);

    if (!payload) return invalidAttachmentRequest("Request body must be a JSON object");
    if (!projectId) return invalidAttachmentRequest("projectId is required");
    if (!normalizedThreadId) return invalidAttachmentRequest("threadId is required");
    if (!normalizedAttachmentId) return invalidAttachmentRequest("attachmentId is required");

    return NextResponse.json(
      await finalizeWriterAttachment({
        attachmentId: normalizedAttachmentId,
        routeProjectId: projectId,
        threadId: normalizedThreadId,
      }),
      { headers: NO_STORE_HEADERS },
    );
  } catch (error) {
    return attachmentErrorResponse({
      error,
      fallbackMessage: "Failed to finalize manuscript upload",
      viewer: "writer",
    });
  }
}
