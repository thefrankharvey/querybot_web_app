"use client";

import { useState } from "react";
import { Download, FileText, Trash2 } from "lucide-react";

import { Button } from "@/app/ui-primitives/button";
import { Spinner } from "@/app/ui-primitives/spinner";
import {
  formatFileSize,
  isAttachmentDownloadable,
} from "@/app/utils/manuscript-attachments";
import type { MessageAttachment } from "@/app/utils/message-types";

export function MessageAttachmentCard({
  attachment,
  onDelete,
  projectId,
  threadId,
  viewerRole,
}: {
  attachment: MessageAttachment;
  onDelete?: () => Promise<void> | void;
  projectId?: string;
  threadId: string;
  viewerRole: "writer" | "agent";
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const downloadable = isAttachmentDownloadable(attachment);
  const isReady = attachment.status === "ready";
  const isUnavailable = !downloadable && !isReady;
  const downloadHref =
    viewerRole === "writer"
      ? `/api/message-threads/${encodeURIComponent(threadId)}/attachments/${encodeURIComponent(attachment.attachmentId)}/download?${new URLSearchParams({ projectId: projectId ?? "" }).toString()}`
      : `/api/agent-message-threads/${encodeURIComponent(threadId)}/attachments/${encodeURIComponent(attachment.attachmentId)}/download`;

  const handleDelete = async () => {
    if (!onDelete || isDeleting) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      await onDelete();
    } catch (error) {
      setDeleteError(
        error instanceof Error
          ? error.message
          : "The manuscript could not be removed.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="mt-3 flex min-w-0 flex-col gap-3 rounded-xl border border-border bg-background/95 p-3 text-foreground shadow-sm">
      <div className="flex min-w-0 items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <FileText aria-hidden className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p
            className="text-sm font-medium [overflow-wrap:anywhere]"
            title={attachment.filename}
          >
            {attachment.filename}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {isReady
              ? `Ready to send · ${formatFileSize(attachment.sizeBytes)}`
              : isUnavailable
                ? "File no longer available."
                : formatFileSize(attachment.sizeBytes)}
          </p>
        </div>
      </div>

      {downloadable || onDelete ? (
        <div className="flex flex-wrap justify-end gap-2">
          {onDelete ? (
            <Button
              disabled={isDeleting}
              onClick={() => void handleDelete()}
              size="sm"
              type="button"
              variant="ghost"
            >
              {isDeleting ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <Trash2 data-icon="inline-start" />
              )}
              {isReady ? "Remove" : "Delete file"}
            </Button>
          ) : null}
          {downloadable ? (
            <Button asChild size="sm" variant="outline">
              <a download href={downloadHref}>
                <Download data-icon="inline-start" />
                Download
              </a>
            </Button>
          ) : null}
        </div>
      ) : null}

      {deleteError ? (
        <p className="text-sm text-destructive" role="alert">
          {deleteError}
        </p>
      ) : null}
    </div>
  );
}
