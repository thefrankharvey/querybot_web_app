import { NextResponse } from "next/server";

import {
  attachmentErrorResponse,
  attachmentFeatureDisabledResponse,
  getTrimmedString,
  invalidAttachmentRequest,
  NO_STORE_HEADERS,
  readJsonObject,
} from "@/app/api/message-threads/_attachment-route-utils";
import {
  getValidatedSupabaseStorageUrl,
  isManuscriptAttachmentsEnabled,
} from "@/app/utils/manuscript-attachment-urls.server";
import {
  MANUSCRIPT_CONSENT_VERSION,
  validateManuscriptFile,
} from "@/app/utils/manuscript-attachments";
import {
  createWriterAttachmentUploadIntent,
  WriterMessageApiError,
} from "@/app/utils/message-thread-data";

const RESUMABLE_UPLOAD_PATH = "/storage/v1/upload/resumable";
const SIGNED_RESUMABLE_UPLOAD_PATH = `${RESUMABLE_UPLOAD_PATH}/sign`;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ threadId: string }> },
) {
  if (!isManuscriptAttachmentsEnabled()) {
    return attachmentFeatureDisabledResponse();
  }

  try {
    const [{ threadId }, payload] = await Promise.all([
      params,
      readJsonObject(request),
    ]);
    const normalizedThreadId = getTrimmedString(threadId);

    if (!payload) return invalidAttachmentRequest("Request body must be a JSON object");

    const projectId = getTrimmedString(payload.projectId);
    const filename = getTrimmedString(payload.filename);
    const contentType = getTrimmedString(payload.contentType);
    const consentVersion = getTrimmedString(payload.consentVersion);
    const sizeBytes = payload.sizeBytes;

    if (!projectId) return invalidAttachmentRequest("projectId is required");
    if (!normalizedThreadId) return invalidAttachmentRequest("threadId is required");
    if (consentVersion !== MANUSCRIPT_CONSENT_VERSION) {
      return invalidAttachmentRequest("A current manuscript sharing consent is required.");
    }
    if (typeof sizeBytes !== "number" || !Number.isInteger(sizeBytes)) {
      return invalidAttachmentRequest("sizeBytes must be a whole number");
    }

    const validation = validateManuscriptFile({
      name: filename,
      size: sizeBytes,
      type: contentType,
    });
    if (!validation.ok) {
      return invalidAttachmentRequest(validation.message, validation.code);
    }

    const result = await createWriterAttachmentUploadIntent({
      contentType: validation.contentType,
      consentVersion,
      filename,
      routeProjectId: projectId,
      sizeBytes,
      threadId: normalizedThreadId,
    });
    const uploadEndpoint = getValidatedSupabaseStorageUrl(
      result.upload.resumableEndpoint,
      RESUMABLE_UPLOAD_PATH,
    );

    if (
      !uploadEndpoint ||
      uploadEndpoint.search ||
      uploadEndpoint.hash ||
      (uploadEndpoint.pathname !== RESUMABLE_UPLOAD_PATH &&
        uploadEndpoint.pathname !== SIGNED_RESUMABLE_UPLOAD_PATH)
    ) {
      throw new WriterMessageApiError(
        "The manuscript upload service returned an unsafe endpoint.",
        502,
        "ATTACHMENT_STORAGE_UNAVAILABLE",
      );
    }

    // Signed upload tokens must use Supabase's signed TUS route. Normalize the
    // legacy backend handoff during a staged deployment.
    uploadEndpoint.pathname = SIGNED_RESUMABLE_UPLOAD_PATH;

    return NextResponse.json(
      {
        ...result,
        upload: { ...result.upload, resumableEndpoint: uploadEndpoint.toString() },
      },
      { status: 201, headers: NO_STORE_HEADERS },
    );
  } catch (error) {
    return attachmentErrorResponse({
      error,
      fallbackMessage: "Failed to create manuscript upload",
      viewer: "writer",
    });
  }
}
