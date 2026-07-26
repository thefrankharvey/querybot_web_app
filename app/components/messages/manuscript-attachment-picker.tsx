"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  FileText,
  FileUp,
  RotateCcw,
  X,
} from "lucide-react";

import type { ManuscriptAttachmentUploadController } from "@/app/hooks/use-manuscript-attachment-upload";
import { Button } from "@/app/ui-primitives/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/ui-primitives/dialog";
import { Progress } from "@/app/ui-primitives/progress";
import { Spinner } from "@/app/ui-primitives/spinner";
import { cn } from "@/app/utils";
import {
  formatFileSize,
  getAttachmentErrorAction,
  MANUSCRIPT_ACCEPT,
  MANUSCRIPT_CONSENT_COPY,
} from "@/app/utils/manuscript-attachments";

function getPhaseLabel(
  phase: ManuscriptAttachmentUploadController["phase"],
  progress: number,
) {
  switch (phase) {
    case "creating_intent":
      return "Preparing secure upload…";
    case "uploading":
      return `Uploading… ${Math.floor(progress / 10) * 10}%`;
    case "finalizing":
      return "Securely verifying manuscript…";
    case "cancelling":
      return "Removing manuscript…";
    default:
      return "";
  }
}

export function ManuscriptAttachmentPicker({
  agentName,
  controller,
  disabled = false,
  initialOpen = false,
}: {
  agentName: string;
  controller: ManuscriptAttachmentUploadController;
  disabled?: boolean;
  initialOpen?: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(initialOpen);
  const [isDragging, setIsDragging] = useState(false);
  const recipientName = agentName.trim() || "this literary agent";
  const {
    attachment,
    confirmUpload,
    dismissConfirmation,
    error,
    isBusy,
    phase,
    progress,
    remove,
    retry,
    selectFile,
    selectedFile,
  } = controller;
  const showFileState = Boolean(selectedFile || attachment);
  const phaseLabel = getPhaseLabel(phase, progress);
  const errorAction = getAttachmentErrorAction(error?.code);
  const canRetry = errorAction === "retry" || errorAction === "restart";
  const filename = selectedFile?.name || attachment?.filename || "Manuscript";
  const fileSize = selectedFile?.size ?? attachment?.sizeBytes ?? 0;

  const chooseFile = () => fileInputRef.current?.click();

  const handleDialogOpenChange = (open: boolean) => {
    if (!open && isBusy) return;

    setIsDialogOpen(open);
    setIsDragging(false);
    if (!open && phase === "confirming") dismissConfirmation();
  };

  return (
    <div className="mt-3 flex flex-col gap-3">
      <input
        accept={MANUSCRIPT_ACCEPT}
        aria-describedby="manuscript-attachment-help"
        className="sr-only"
        disabled={disabled || isBusy || phase === "ready"}
        id="manuscript-attachment-input"
        onChange={(event) => {
          const file = event.currentTarget.files?.[0] ?? null;
          event.currentTarget.value = "";
          if (file) {
            setIsDialogOpen(true);
            void selectFile(file);
          }
        }}
        ref={fileInputRef}
        type="file"
      />

      {!showFileState ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p
            className="text-xs leading-5 text-muted-foreground"
            id="manuscript-attachment-help"
          >
            The agent requested your manuscript. Share one PDF or DOCX, up to
            25 MB.
          </p>
          <Button
            disabled={disabled || isBusy}
            onClick={() => setIsDialogOpen(true)}
            size="sm"
            type="button"
          >
            <FileUp data-icon="inline-start" />
            Share manuscript
          </Button>
        </div>
      ) : (
        <div className="flex min-w-0 flex-col gap-3 rounded-xl border border-border bg-background/80 p-3">
          <div className="flex min-w-0 items-start justify-between gap-3">
            <div className="min-w-0">
              <p
                className="text-sm font-medium [overflow-wrap:anywhere]"
                title={selectedFile?.name || attachment?.filename}
              >
                {filename}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {formatFileSize(fileSize)}
              </p>
            </div>
            {phase !== "confirming" ? (
              <Button
                aria-label="Remove manuscript"
                disabled={phase === "cancelling"}
                onClick={() => void remove()}
                size="sm"
                type="button"
                variant="ghost"
              >
                {phase === "cancelling" ? (
                  <Spinner data-icon="inline-start" />
                ) : (
                  <X data-icon="inline-start" />
                )}
                Remove
              </Button>
            ) : null}
          </div>

          {isBusy ? (
            <div className="flex flex-col gap-2">
              <Progress
                aria-label="Manuscript upload progress"
                value={phase === "finalizing" ? 100 : progress}
              />
              <p
                aria-live="polite"
                className="text-xs text-muted-foreground"
                role="status"
              >
                {phaseLabel}
              </p>
            </div>
          ) : null}

          {phase === "ready" ? (
            <div
              className="flex items-center gap-2 text-xs font-medium text-accent"
              role="status"
            >
              <CheckCircle2 aria-hidden className="size-4" />
              Ready to send securely in this conversation.
            </div>
          ) : null}

          {error ? (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-destructive" role="alert">
                {error.message}
              </p>
              <div className="flex flex-wrap gap-2">
                {canRetry ? (
                  <Button
                    onClick={() => void retry()}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    <RotateCcw data-icon="inline-start" />
                    Try again
                  </Button>
                ) : null}
                <Button
                  onClick={chooseFile}
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  Choose another file
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      )}

      <Dialog
        onOpenChange={handleDialogOpenChange}
        open={isDialogOpen}
      >
        <DialogContent
          onEscapeKeyDown={(event) => {
            if (isBusy) event.preventDefault();
          }}
          onInteractOutside={(event) => {
            if (isBusy) event.preventDefault();
          }}
          showCloseButton={!isBusy}
        >
          <DialogHeader>
            <DialogTitle>Share your manuscript</DialogTitle>
            <DialogDescription>
              Upload the manuscript requested by {recipientName}. It will be
              attached to your next reply.
            </DialogDescription>
          </DialogHeader>

          {!showFileState ? (
            <div
              className={cn(
                "flex min-h-56 flex-col items-center justify-center gap-4 rounded-2xl border border-dashed px-6 py-8 text-center transition-colors",
                isDragging
                  ? "border-accent bg-accent/10"
                  : "border-accent/25 bg-white/55",
              )}
              onDragEnter={(event) => {
                event.preventDefault();
                if (!disabled && !isBusy) setIsDragging(true);
              }}
              onDragLeave={(event) => {
                event.preventDefault();
                if (
                  !event.relatedTarget ||
                  !event.currentTarget.contains(event.relatedTarget as Node)
                ) {
                  setIsDragging(false);
                }
              }}
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = "copy";
                if (!disabled && !isBusy) setIsDragging(true);
              }}
              onDrop={(event) => {
                event.preventDefault();
                setIsDragging(false);
                if (disabled || isBusy) return;

                const file = event.dataTransfer.files?.[0] ?? null;
                void selectFile(file);
              }}
            >
              <span className="flex size-14 items-center justify-center rounded-full bg-accent/8 text-accent">
                <FileUp aria-hidden className="size-6" />
              </span>
              <div className="flex flex-col gap-1">
                <p className="font-medium text-accent">
                  Drag and drop your manuscript here
                </p>
                <p className="text-sm text-muted-foreground">
                  PDF or DOCX · 25 MB maximum
                </p>
              </div>
              <Button
                disabled={disabled || isBusy}
                onClick={chooseFile}
                type="button"
                variant="outline"
              >
                <FileUp data-icon="inline-start" />
                Choose file
              </Button>
            </div>
          ) : (
            <div className="flex min-w-0 flex-col gap-4">
              <div className="flex min-w-0 items-center gap-3 rounded-xl border border-accent/12 bg-white/65 p-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent/8 text-accent">
                  <FileText aria-hidden className="size-5" />
                </span>
                <div className="min-w-0">
                  <p
                    className="truncate text-sm font-medium text-accent"
                    title={filename}
                  >
                    {filename}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(fileSize)}
                  </p>
                </div>
              </div>

              {phase === "confirming" ? (
                <div className="flex flex-col gap-3 rounded-xl bg-accent/5 p-4 text-sm leading-6 text-muted-foreground">
                  <p className="font-medium text-accent">
                    {MANUSCRIPT_CONSENT_COPY.title(recipientName)}
                  </p>
                  <p>{MANUSCRIPT_CONSENT_COPY.storage}</p>
                  <p>{MANUSCRIPT_CONSENT_COPY.retention}</p>
                  <p>
                    Read our{" "}
                    <Link
                      className="font-medium text-accent underline underline-offset-4"
                      href="/legal/privacy-policy"
                    >
                      privacy policy
                    </Link>
                    .
                  </p>
                </div>
              ) : null}

              {isBusy ? (
                <div className="flex flex-col gap-2">
                  <Progress
                    aria-label="Manuscript upload progress"
                    value={phase === "finalizing" ? 100 : progress}
                  />
                  <p
                    aria-live="polite"
                    className="text-sm text-muted-foreground"
                    role="status"
                  >
                    {phaseLabel}
                  </p>
                </div>
              ) : null}

              {phase === "ready" ? (
                <div
                  className="flex items-center gap-2 rounded-xl bg-accent/8 p-3 text-sm font-medium text-accent"
                  role="status"
                >
                  <CheckCircle2 aria-hidden className="size-5" />
                  Upload complete. Your manuscript is ready to send.
                </div>
              ) : null}

              {error ? (
                <div className="flex flex-col gap-3">
                  <p className="text-sm text-destructive" role="alert">
                    {error.message}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {canRetry ? (
                      <Button
                        onClick={() => void retry()}
                        size="sm"
                        type="button"
                        variant="outline"
                      >
                        <RotateCcw data-icon="inline-start" />
                        Try again
                      </Button>
                    ) : null}
                    <Button
                      onClick={chooseFile}
                      size="sm"
                      type="button"
                      variant="ghost"
                    >
                      Choose another file
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {error && !showFileState ? (
            <p className="text-sm text-destructive" role="alert">
              {error.message}
            </p>
          ) : null}

          {phase === "confirming" ? (
            <DialogFooter>
              <Button
                onClick={() => handleDialogOpenChange(false)}
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
              <Button onClick={confirmUpload} type="button">
                Share with {recipientName}
              </Button>
            </DialogFooter>
          ) : null}

          {isBusy ? (
            <DialogFooter>
              <Button
                disabled={phase === "cancelling"}
                onClick={() => void remove()}
                type="button"
                variant="outline"
              >
                {phase === "cancelling" ? (
                  <Spinner data-icon="inline-start" />
                ) : (
                  <X data-icon="inline-start" />
                )}
                Cancel upload
              </Button>
            </DialogFooter>
          ) : null}

          {phase === "ready" ? (
            <DialogFooter>
              <Button
                onClick={() => void remove()}
                type="button"
                variant="outline"
              >
                Remove
              </Button>
              <Button onClick={() => setIsDialogOpen(false)} type="button">
                Add to reply
              </Button>
            </DialogFooter>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
