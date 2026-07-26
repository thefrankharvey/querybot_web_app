import type {
  WireMessageAttachment,
  WireMessageAttachmentStatus,
} from "@/app/utils/message-api-contract";
import type {
  AttachmentUploadIntentResponse,
  MessageAttachment,
  MessageAttachmentStatus,
  QueryStatusCode,
} from "@/app/utils/message-types";

export const MAX_MANUSCRIPT_BYTES = 25 * 1024 * 1024;
export const MANUSCRIPT_TUS_CHUNK_SIZE_BYTES = 6 * 1024 * 1024;
export const MANUSCRIPT_CONSENT_VERSION = "manuscript-share-v1";
export const MANUSCRIPT_ACCEPT =
  ".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export const ALLOWED_MANUSCRIPT_TYPES = {
  pdf: "application/pdf",
  docx:
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
} as const;

export const MANUSCRIPT_CONSENT_COPY = {
  title: (agentName: string) => `Share manuscript with ${agentName}?`,
  storage:
    "Write Query Hook will securely store this file and make it available only to you and the literary agent in this conversation.",
  retention:
    "You can delete it at any time. Otherwise, the stored file is deleted 90 days after this query reaches a final status. Deleting it cannot recall a copy the agent already downloaded.",
} as const;

const KNOWN_ATTACHMENT_STATUSES = new Set<WireMessageAttachmentStatus>([
  "pending_upload",
  "ready",
  "attached",
  "expired",
  "failed",
  "deleted",
]);

export type ManuscriptValidationResult =
  | {
      ok: true;
      contentType: (typeof ALLOWED_MANUSCRIPT_TYPES)[keyof typeof ALLOWED_MANUSCRIPT_TYPES];
    }
  | {
      ok: false;
      code:
        | "ATTACHMENT_INVALID_REQUEST"
        | "ATTACHMENT_TOO_LARGE"
        | "ATTACHMENT_UNSUPPORTED_TYPE";
      message: string;
    };

function getString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getNullableString(value: unknown) {
  return getString(value) || null;
}

function normalizeAttachmentStatus(
  value: unknown,
): MessageAttachmentStatus {
  return typeof value === "string" &&
    KNOWN_ATTACHMENT_STATUSES.has(value as WireMessageAttachmentStatus)
    ? (value as MessageAttachmentStatus)
    : "deleted";
}

export function normalizeMessageAttachment(
  attachment: Partial<WireMessageAttachment> | null | undefined,
): MessageAttachment {
  const sizeBytes = attachment?.size_bytes;

  return {
    attachmentId: getString(attachment?.attachment_id),
    threadId: getString(attachment?.thread_id),
    messageId: getNullableString(attachment?.message_id),
    filename: getString(attachment?.filename) || "Manuscript",
    contentType: getString(attachment?.content_type),
    sizeBytes:
      typeof sizeBytes === "number" &&
      Number.isFinite(sizeBytes) &&
      sizeBytes >= 0
        ? sizeBytes
        : 0,
    status: normalizeAttachmentStatus(attachment?.status),
    createdAt: getString(attachment?.created_at),
    deletedAt: getNullableString(attachment?.deleted_at),
  };
}

export function validateManuscriptFile(file: {
  name: string;
  size: number;
  type?: string;
}): ManuscriptValidationResult {
  if (!Number.isFinite(file.size) || file.size <= 0) {
    return {
      ok: false,
      code: "ATTACHMENT_INVALID_REQUEST",
      message: "Choose a non-empty PDF or DOCX manuscript.",
    };
  }

  if (file.size > MAX_MANUSCRIPT_BYTES) {
    return {
      ok: false,
      code: "ATTACHMENT_TOO_LARGE",
      message: "Manuscripts must be 25 MB or smaller.",
    };
  }

  const filename = file.name.trim().toLocaleLowerCase();
  const extension = filename.endsWith(".pdf")
    ? "pdf"
    : filename.endsWith(".docx")
      ? "docx"
      : null;

  if (!extension) {
    return {
      ok: false,
      code: "ATTACHMENT_UNSUPPORTED_TYPE",
      message: "Upload a PDF or DOCX manuscript.",
    };
  }

  const contentType = ALLOWED_MANUSCRIPT_TYPES[extension];
  const browserType = file.type?.trim().toLocaleLowerCase();

  if (browserType && browserType !== contentType) {
    return {
      ok: false,
      code: "ATTACHMENT_UNSUPPORTED_TYPE",
      message: "Upload a PDF or DOCX manuscript.",
    };
  }

  return { ok: true, contentType };
}

export function buildManuscriptTusOptions(
  intent: AttachmentUploadIntentResponse,
) {
  return {
    endpoint: intent.upload.resumableEndpoint,
    chunkSize: intent.upload.chunkSizeBytes,
    retryDelays: [0, 3_000, 5_000, 10_000, 20_000],
    headers: { "x-signature": intent.upload.token },
    metadata: {
      bucketName: intent.upload.bucket,
      objectName: intent.upload.objectPath,
      contentType: intent.attachment.contentType,
      cacheControl: "0",
    },
    storeFingerprintForResuming: false,
    removeFingerprintOnSuccess: true,
    uploadDataDuringCreation: true,
  };
}

export function formatFileSize(sizeBytes: number) {
  const safeBytes =
    Number.isFinite(sizeBytes) && sizeBytes > 0 ? sizeBytes : 0;

  if (safeBytes < 1024) return `${safeBytes} B`;

  const units = ["KB", "MB", "GB"] as const;
  let value = safeBytes;
  let unitIndex = -1;

  do {
    value /= 1024;
    unitIndex += 1;
  } while (value >= 1024 && unitIndex < units.length - 1);

  const precision = value >= 10 ? 0 : 1;
  return `${value.toFixed(precision)} ${units[unitIndex]}`;
}

export function isManuscriptUploadVisible(
  queryStatus: QueryStatusCode | null | undefined,
  enabled = true,
) {
  return (
    enabled &&
    (queryStatus === "manuscript_requested" ||
      queryStatus === "manuscript_under_review")
  );
}

export function isAttachmentDownloadable(attachment: MessageAttachment) {
  return attachment.status === "attached" && Boolean(attachment.attachmentId);
}

export function canSendMessage({
  attachmentReady,
  body,
  canReply,
  isBusy,
}: {
  attachmentReady: boolean;
  body: string;
  canReply: boolean;
  isBusy: boolean;
}) {
  return canReply && !isBusy && (body.trim().length > 0 || attachmentReady);
}

export type ManuscriptAttachmentErrorAction =
  | "choose_file"
  | "restart"
  | "refresh"
  | "retry"
  | "unavailable";

export function getAttachmentErrorAction(
  code: string | null | undefined,
): ManuscriptAttachmentErrorAction {
  switch (code) {
    case "ATTACHMENT_INVALID_FILENAME":
    case "ATTACHMENT_INVALID_REQUEST":
    case "ATTACHMENT_TOO_LARGE":
    case "ATTACHMENT_UNSUPPORTED_TYPE":
    case "ATTACHMENT_CONTENT_MISMATCH":
      return "choose_file";
    case "ATTACHMENT_UPLOAD_EXPIRED":
      return "restart";
    case "ATTACHMENT_INVALID_QUERY_STATUS":
    case "ATTACHMENT_INVALID_STATE":
    case "ATTACHMENT_ALREADY_ATTACHED":
      return "refresh";
    case "ATTACHMENT_STORAGE_UNAVAILABLE":
    case "ATTACHMENT_RATE_LIMITED":
      return "retry";
    case "ATTACHMENT_DELETED":
    case "ATTACHMENT_NOT_FOUND":
    case "ATTACHMENT_FORBIDDEN":
      return "unavailable";
    default:
      return "retry";
  }
}
