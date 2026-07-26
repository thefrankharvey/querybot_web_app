"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Upload } from "tus-js-client";

import {
  buildManuscriptTusOptions,
  getAttachmentErrorAction,
  MANUSCRIPT_CONSENT_VERSION,
  validateManuscriptFile,
} from "@/app/utils/manuscript-attachments";
import type {
  AttachmentMutationResponse,
  AttachmentUploadIntentResponse,
  MessageAttachment,
  WriterMessageApiErrorResponse,
} from "@/app/utils/message-types";

export type ManuscriptUploadPhase =
  | "idle"
  | "confirming"
  | "creating_intent"
  | "uploading"
  | "finalizing"
  | "ready"
  | "cancelling"
  | "error";

export type ManuscriptUploadError = {
  code?: string;
  message: string;
};

type FailedStage = "intent" | "upload" | "finalize" | "delete" | null;

async function readResponseError(
  response: Response,
  fallback: string,
): Promise<ManuscriptUploadError> {
  try {
    const body = (await response.json()) as WriterMessageApiErrorResponse;
    return {
      code: body.code,
      message: body.message?.trim() || fallback,
    };
  } catch {
    return { message: fallback };
  }
}

export function useManuscriptAttachmentUpload({
  projectId,
  threadId,
}: {
  projectId: string;
  threadId: string;
}) {
  const [phase, setPhase] = useState<ManuscriptUploadPhase>("idle");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [attachment, setAttachment] = useState<MessageAttachment | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<ManuscriptUploadError | null>(null);
  const attachmentRef = useRef<MessageAttachment | null>(null);
  const failedStageRef = useRef<FailedStage>(null);
  const mountedRef = useRef(true);
  const operationIdRef = useRef(0);
  const shouldCleanupOnUnmountRef = useRef(true);
  const uploadRef = useRef<Upload | null>(null);

  const attachmentUrl = useCallback(
    (attachmentId: string) =>
      `/api/message-threads/${encodeURIComponent(threadId)}/attachments/${encodeURIComponent(attachmentId)}`,
    [threadId],
  );

  const setCurrentAttachment = useCallback(
    (nextAttachment: MessageAttachment | null) => {
      attachmentRef.current = nextAttachment;
      if (mountedRef.current) setAttachment(nextAttachment);
    },
    [],
  );

  const deleteRemoteAttachment = useCallback(
    async (attachmentId: string, keepalive = false) => {
      const response = await fetch(attachmentUrl(attachmentId), {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, reason: "writer_deleted" }),
        cache: "no-store",
        keepalive,
      });

      if (!response.ok && response.status !== 404 && response.status !== 410) {
        throw await readResponseError(response, "The manuscript could not be removed.");
      }
    },
    [attachmentUrl, projectId],
  );

  const setUploadError = useCallback(
    (nextError: ManuscriptUploadError, stage: FailedStage) => {
      failedStageRef.current = stage;
      if (!mountedRef.current) return;
      setError(nextError);
      setPhase("error");
    },
    [],
  );

  const finalizeUpload = useCallback(
    async (attachmentId: string, operationId: number) => {
      if (operationId !== operationIdRef.current) return;
      setPhase("finalizing");

      try {
        const response = await fetch(
          `${attachmentUrl(attachmentId)}/finalize`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ projectId }),
            cache: "no-store",
          },
        );

        if (!response.ok) {
          throw await readResponseError(
            response,
            "The manuscript could not be verified.",
          );
        }

        const result = (await response.json()) as AttachmentMutationResponse;
        if (operationId !== operationIdRef.current || !mountedRef.current) return;
        setCurrentAttachment(result.attachment);
        failedStageRef.current = null;
        uploadRef.current = null;
        setProgress(100);
        setError(null);
        setPhase("ready");
      } catch (finalizeError) {
        if (operationId !== operationIdRef.current) return;
        setUploadError(
          finalizeError && typeof finalizeError === "object" && "message" in finalizeError
            ? (finalizeError as ManuscriptUploadError)
            : { message: "The manuscript could not be verified." },
          "finalize",
        );
      }
    },
    [attachmentUrl, projectId, setCurrentAttachment, setUploadError],
  );

  const startTusUpload = useCallback(
    async (
      file: File,
      intent: AttachmentUploadIntentResponse,
      operationId: number,
    ) => {
      const { Upload: TusUpload } = await import("tus-js-client");
      if (operationId !== operationIdRef.current || !mountedRef.current) return;

      setPhase("uploading");
      const upload = new TusUpload(file, {
        ...buildManuscriptTusOptions(intent),
        onProgress(bytesUploaded, bytesTotal) {
          if (operationId !== operationIdRef.current || !mountedRef.current) return;
          const nextProgress =
            bytesTotal > 0 ? Math.min(100, (bytesUploaded / bytesTotal) * 100) : 0;
          setProgress(nextProgress);
        },
        onError() {
          if (operationId !== operationIdRef.current) return;
          setUploadError(
            {
              code: "ATTACHMENT_UPLOAD_INTERRUPTED",
              message: "Upload interrupted. Try again.",
            },
            "upload",
          );
        },
        onSuccess() {
          void finalizeUpload(intent.attachment.attachmentId, operationId);
        },
      });

      uploadRef.current = upload;
      upload.start();
    },
    [finalizeUpload, setUploadError],
  );

  const createIntentAndUpload = useCallback(
    async (file: File, operationId = operationIdRef.current) => {
      const validation = validateManuscriptFile(file);
      if (!validation.ok) {
        setUploadError(
          { code: validation.code, message: validation.message },
          "intent",
        );
        return;
      }

      setError(null);
      setProgress(0);
      setPhase("creating_intent");
      failedStageRef.current = null;

      try {
        const response = await fetch(
          `/api/message-threads/${encodeURIComponent(threadId)}/attachments/upload-intents`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              projectId,
              filename: file.name,
              contentType: validation.contentType,
              sizeBytes: file.size,
              consentVersion: MANUSCRIPT_CONSENT_VERSION,
            }),
            cache: "no-store",
          },
        );

        if (!response.ok) {
          throw await readResponseError(
            response,
            "The manuscript upload could not be started.",
          );
        }

        const intent = (await response.json()) as AttachmentUploadIntentResponse;
        if (operationId !== operationIdRef.current || !mountedRef.current) {
          if (intent.attachment?.attachmentId) {
            void deleteRemoteAttachment(intent.attachment.attachmentId, true).catch(
              () => undefined,
            );
          }
          return;
        }
        setCurrentAttachment(intent.attachment);
        await startTusUpload(file, intent, operationId);
      } catch (intentError) {
        if (operationId !== operationIdRef.current) return;
        setUploadError(
          intentError && typeof intentError === "object" && "message" in intentError
            ? (intentError as ManuscriptUploadError)
            : { message: "The manuscript upload could not be started." },
          "intent",
        );
      }
    },
    [
      deleteRemoteAttachment,
      projectId,
      setCurrentAttachment,
      setUploadError,
      startTusUpload,
      threadId,
    ],
  );

  const selectFile = useCallback(
    async (file: File | null | undefined) => {
      if (!file) return;

      const validation = validateManuscriptFile(file);
      const previousAttachment = attachmentRef.current;
      operationIdRef.current += 1;
      const operationId = operationIdRef.current;
      shouldCleanupOnUnmountRef.current = true;

      if (uploadRef.current) {
        await uploadRef.current.abort();
        uploadRef.current = null;
      }
      if (previousAttachment?.attachmentId) {
        try {
          await deleteRemoteAttachment(previousAttachment.attachmentId);
        } catch {
          // Replacement can continue; backend retention cleans abandoned intents.
        }
      }
      if (operationId !== operationIdRef.current || !mountedRef.current) return;

      setCurrentAttachment(null);
      if (!validation.ok) {
        setSelectedFile(null);
        setUploadError(
          { code: validation.code, message: validation.message },
          "intent",
        );
        return;
      }

      setSelectedFile(file);
      setCurrentAttachment(null);
      setProgress(0);
      setError(null);
      setPhase("confirming");
    },
    [deleteRemoteAttachment, setCurrentAttachment, setUploadError],
  );

  const dismissConfirmation = useCallback(() => {
    if (phase !== "confirming") return;
    operationIdRef.current += 1;
    setSelectedFile(null);
    setError(null);
    setPhase("idle");
  }, [phase]);

  const confirmUpload = useCallback(() => {
    if (!selectedFile || phase !== "confirming") return;
    void createIntentAndUpload(selectedFile);
  }, [createIntentAndUpload, phase, selectedFile]);

  const remove = useCallback(async () => {
    const currentAttachment = attachmentRef.current;
    operationIdRef.current += 1;
    const operationId = operationIdRef.current;
    setPhase("cancelling");
    setError(null);

    try {
      if (uploadRef.current) {
        await uploadRef.current.abort();
        uploadRef.current = null;
      }
      if (currentAttachment?.attachmentId) {
        await deleteRemoteAttachment(currentAttachment.attachmentId);
      }
      if (operationId !== operationIdRef.current || !mountedRef.current) return;
      setCurrentAttachment(null);
      setSelectedFile(null);
      setProgress(0);
      shouldCleanupOnUnmountRef.current = true;
      failedStageRef.current = null;
      setPhase("idle");
    } catch (removeError) {
      if (operationId !== operationIdRef.current) return;
      setUploadError(
        removeError && typeof removeError === "object" && "message" in removeError
          ? (removeError as ManuscriptUploadError)
          : { message: "The manuscript could not be removed." },
        "delete",
      );
    }
  }, [deleteRemoteAttachment, setCurrentAttachment, setUploadError]);

  const retry = useCallback(async () => {
    if (!selectedFile || phase !== "error") return;

    const action = getAttachmentErrorAction(error?.code);
    const operationId = operationIdRef.current;

    if (
      action === "choose_file" ||
      action === "refresh" ||
      action === "unavailable"
    ) {
      return;
    }

    if (failedStageRef.current === "delete") {
      void remove();
      return;
    }

    if (action === "restart" || failedStageRef.current === "intent") {
      const currentAttachment = attachmentRef.current;
      if (currentAttachment?.attachmentId) {
        try {
          await deleteRemoteAttachment(currentAttachment.attachmentId);
        } catch {
          // The backend cleanup job handles an already-expired intent.
        }
      }
      setCurrentAttachment(null);
      void createIntentAndUpload(selectedFile, operationId);
      return;
    }

    if (failedStageRef.current === "finalize" && attachmentRef.current) {
      void finalizeUpload(attachmentRef.current.attachmentId, operationId);
      return;
    }

    if (uploadRef.current) {
      setError(null);
      setPhase("uploading");
      uploadRef.current.start();
      return;
    }

    void createIntentAndUpload(selectedFile, operationId);
  }, [
    createIntentAndUpload,
    deleteRemoteAttachment,
    error?.code,
    finalizeUpload,
    phase,
    remove,
    selectedFile,
    setCurrentAttachment,
  ]);

  const markSent = useCallback(() => {
    operationIdRef.current += 1;
    uploadRef.current = null;
    attachmentRef.current = null;
    shouldCleanupOnUnmountRef.current = false;
    failedStageRef.current = null;
    setAttachment(null);
    setSelectedFile(null);
    setProgress(0);
    setError(null);
    setPhase("idle");
  }, []);

  const markSending = useCallback(() => {
    if (attachmentRef.current?.attachmentId) {
      shouldCleanupOnUnmountRef.current = false;
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      operationIdRef.current += 1;
      if (uploadRef.current) void uploadRef.current.abort();
      const unsentAttachment = attachmentRef.current;
      if (
        shouldCleanupOnUnmountRef.current &&
        unsentAttachment?.attachmentId
      ) {
        void deleteRemoteAttachment(unsentAttachment.attachmentId, true).catch(
          () => undefined,
        );
      }
    };
  }, [deleteRemoteAttachment]);

  const isBusy =
    phase === "creating_intent" ||
    phase === "uploading" ||
    phase === "finalizing" ||
    phase === "cancelling";

  return {
    attachment,
    confirmUpload,
    dismissConfirmation,
    error,
    isBusy,
    markSent,
    markSending,
    phase,
    progress,
    readyAttachment: phase === "ready" ? attachment : null,
    remove,
    retry,
    selectFile,
    selectedFile,
  };
}

export type ManuscriptAttachmentUploadController = ReturnType<
  typeof useManuscriptAttachmentUpload
>;
