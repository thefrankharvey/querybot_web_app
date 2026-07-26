import { NextResponse } from "next/server";

import {
  attachmentErrorResponse,
  getTrimmedString,
  invalidAttachmentRequest,
  NO_STORE_HEADERS,
  readJsonObject,
} from "@/app/api/message-threads/_attachment-route-utils";
import { deleteWriterAttachment } from "@/app/utils/message-thread-data";

export async function DELETE(
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
    const reason = getTrimmedString(payload?.reason);
    const normalizedThreadId = getTrimmedString(threadId);
    const normalizedAttachmentId = getTrimmedString(attachmentId);

    if (!payload) return invalidAttachmentRequest("Request body must be a JSON object");
    if (!projectId) return invalidAttachmentRequest("projectId is required");
    if (reason !== "writer_deleted") {
      return invalidAttachmentRequest("reason must be writer_deleted");
    }
    if (!normalizedThreadId) return invalidAttachmentRequest("threadId is required");
    if (!normalizedAttachmentId) return invalidAttachmentRequest("attachmentId is required");

    return NextResponse.json(
      await deleteWriterAttachment({
        attachmentId: normalizedAttachmentId,
        routeProjectId: projectId,
        threadId: normalizedThreadId,
      }),
      { headers: NO_STORE_HEADERS },
    );
  } catch (error) {
    return attachmentErrorResponse({
      error,
      fallbackMessage: "Failed to delete manuscript",
      viewer: "writer",
    });
  }
}
