import { NextResponse } from "next/server";

import {
  attachmentErrorResponse,
  getTrimmedString,
  invalidAttachmentRequest,
  NO_STORE_HEADERS,
} from "@/app/api/message-threads/_attachment-route-utils";
import { getValidatedSupabaseStorageUrl } from "@/app/utils/manuscript-attachment-urls.server";
import {
  getWriterAttachmentDownload,
  WriterMessageApiError,
} from "@/app/utils/message-thread-data";

export async function GET(
  request: Request,
  {
    params,
  }: { params: Promise<{ threadId: string; attachmentId: string }> },
) {
  try {
    const { threadId, attachmentId } = await params;
    const projectId = new URL(request.url).searchParams.get("projectId")?.trim() ?? "";
    const normalizedThreadId = getTrimmedString(threadId);
    const normalizedAttachmentId = getTrimmedString(attachmentId);

    if (!projectId) return invalidAttachmentRequest("projectId is required");
    if (!normalizedThreadId) return invalidAttachmentRequest("threadId is required");
    if (!normalizedAttachmentId) return invalidAttachmentRequest("attachmentId is required");

    const download = await getWriterAttachmentDownload({
      attachmentId: normalizedAttachmentId,
      routeProjectId: projectId,
      threadId: normalizedThreadId,
    });
    const target = getValidatedSupabaseStorageUrl(download.url);

    if (!target) {
      throw new WriterMessageApiError(
        "The manuscript download service returned an unsafe URL.",
        502,
        "ATTACHMENT_STORAGE_UNAVAILABLE",
      );
    }

    const response = NextResponse.redirect(target, 307);
    response.headers.set("Cache-Control", NO_STORE_HEADERS["Cache-Control"]);
    return response;
  } catch (error) {
    return attachmentErrorResponse({
      error,
      fallbackMessage: "The manuscript is not available for download.",
      viewer: "writer",
    });
  }
}
