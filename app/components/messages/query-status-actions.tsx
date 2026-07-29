"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getQueryStatusMetadata,
  type QueryProgressLike,
} from "@/app/components/messages/query-lifecycle";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/app/ui-primitives/alert-dialog";
import { Button } from "@/app/ui-primitives/button";
import { Input } from "@/app/ui-primitives/input";
import { Spinner } from "@/app/ui-primitives/spinner";
import { Textarea } from "@/app/ui-primitives/textarea";
import {
  MessageClientApiError,
  useAgentQueryStatusTransition,
} from "@/app/hooks/use-message-query-lifecycle";
import type {
  QueryStatusCode,
  QueryStatusTransitionCode,
} from "@/app/utils/message-types";

const ACTION_LABELS: Record<QueryStatusTransitionCode, string> = {
  closed_no_response: "Close — no response",
  manuscript_requested: "Request manuscript",
  manuscript_under_review: "Mark under review",
  offer_of_representation: "Record offer",
  rejected: "Record pass",
};

function isManualTransition(
  status: QueryStatusCode,
): status is QueryStatusTransitionCode {
  return (
    status !== "query_sent" && status !== "query_viewed" && status !== "unknown"
  );
}

export function hasQueryStatusActions(progress: QueryProgressLike) {
  return progress.allowedTransitions.some(isManualTransition);
}

function getActionVariant(
  status: QueryStatusTransitionCode,
): "default" | "destructive" | "outline" {
  if (status === "rejected" || status === "closed_no_response") {
    return "destructive";
  }
  if (status === "offer_of_representation") return "default";
  return "outline";
}

function getConfirmationCopy(status: QueryStatusTransitionCode) {
  const metadata = getQueryStatusMetadata(status, "agent");

  if (status === "manuscript_requested") {
    return `This records “${metadata.label}” and shares your request message with the writer. The optional due date will appear with it.`;
  }
  if (status === "closed_no_response") {
    return "This closes the query as no response received. A later update can reopen it.";
  }
  if (status === "rejected" || status === "offer_of_representation") {
    return `This records “${metadata.label}” as the query outcome. Any message you add will appear in the conversation.`;
  }

  return `This records “${metadata.label}”. Any message you add will appear in the conversation.`;
}

function getLocalEndOfDayIso(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;

  const localEndOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);
  return Number.isNaN(localEndOfDay.getTime())
    ? null
    : localEndOfDay.toISOString();
}

function QueryStatusActionButtons({
  allowedTransitions,
  error,
  isPending,
  onSelect,
}: {
  allowedTransitions: QueryStatusTransitionCode[];
  error: string | null;
  isPending: boolean;
  onSelect: (
    status: QueryStatusTransitionCode,
    trigger: HTMLButtonElement,
  ) => void;
}) {
  if (allowedTransitions.length === 0) {
    return (
      <p className="text-sm leading-6 text-accent/76">
        No status updates are available.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-semibold text-accent">Update query</p>
      <div className="flex flex-wrap gap-2">
        {allowedTransitions.map((status) => {
          const metadata = getQueryStatusMetadata(status);
          const Icon = metadata.icon;

          return (
            <Button
              disabled={isPending}
              key={status}
              onClick={(event) => onSelect(status, event.currentTarget)}
              size="sm"
              type="button"
              variant={getActionVariant(status)}
            >
              <Icon data-icon="inline-start" />
              {ACTION_LABELS[status]}
            </Button>
          );
        })}
      </div>
      {error ? (
        <p className="text-sm leading-6 text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function QueryStatusActions({
  progress,
  threadId,
}: {
  progress: QueryProgressLike;
  threadId: string;
}) {
  const router = useRouter();
  const mutation = useAgentQueryStatusTransition({ threadId });
  const [selectedStatus, setSelectedStatus] =
    useState<QueryStatusTransitionCode | null>(null);
  const [dueDate, setDueDate] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);
  const allowedTransitions =
    progress.allowedTransitions.filter(isManualTransition);
  const restoreTriggerFocus = () => {
    requestAnimationFrame(() => lastTriggerRef.current?.focus());
  };

  const handleConfirm = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (!selectedStatus || mutation.isPending) return;

    setError(null);

    try {
      await mutation.mutateAsync({
        dueAt: dueDate ? getLocalEndOfDayIso(dueDate) : null,
        expectedVersion: progress.version,
        note: note.trim() || null,
        toStatus: selectedStatus,
      });
      setSelectedStatus(null);
      setDueDate("");
      setNote("");
      router.refresh();
      restoreTriggerFocus();
    } catch (transitionError) {
      if (
        transitionError instanceof MessageClientApiError &&
        transitionError.status === 409
      ) {
        setError(
          "The query changed while this view was open. We refreshed the latest status; please review it and try again.",
        );
        setSelectedStatus(null);
        router.refresh();
        restoreTriggerFocus();
        return;
      }

      setError(
        transitionError instanceof Error
          ? transitionError.message
          : "The status could not be updated.",
      );
    }
  };
  const requestDetailsRequired = selectedStatus === "manuscript_requested";
  const showDueDate =
    selectedStatus === "manuscript_requested" ||
    selectedStatus === "manuscript_under_review";

  return (
    <>
      <QueryStatusActionButtons
        allowedTransitions={allowedTransitions}
        error={error}
        isPending={mutation.isPending}
        onSelect={(status, trigger) => {
          lastTriggerRef.current = trigger;
          setError(null);
          setDueDate("");
          setNote("");
          setSelectedStatus(status);
        }}
      />

      <AlertDialog
        onOpenChange={(open) => {
          if (!open && !mutation.isPending) {
            setSelectedStatus(null);
            setDueDate("");
            setNote("");
            restoreTriggerFocus();
          }
        }}
        open={selectedStatus !== null}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-accent">
              {selectedStatus
                ? ACTION_LABELS[selectedStatus]
                : "Update query status"}
            </AlertDialogTitle>
            <AlertDialogDescription className="leading-6 text-accent/76">
              {selectedStatus
                ? getConfirmationCopy(selectedStatus)
                : "Confirm this lifecycle update."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col gap-4">
            {showDueDate ? (
              <div className="flex flex-col gap-1.5">
                <label
                  className="text-sm font-semibold text-accent"
                  htmlFor="query-status-due-date"
                >
                  {selectedStatus === "manuscript_requested"
                    ? "Writer due date (optional)"
                    : "Review target date (optional)"}
                </label>
                <Input
                  id="query-status-due-date"
                  onChange={(event) => setDueDate(event.target.value)}
                  type="date"
                  value={dueDate}
                />
              </div>
            ) : null}
            <div className="flex flex-col gap-1.5">
              <label
                className="text-sm font-semibold text-accent"
                htmlFor="query-status-note"
              >
                {requestDetailsRequired
                  ? "Request message"
                  : "Message to writer (optional)"}
              </label>
              <Textarea
                aria-describedby="query-status-note-help"
                id="query-status-note"
                maxLength={4000}
                onChange={(event) => setNote(event.target.value)}
                placeholder={
                  requestDetailsRequired
                    ? "Describe what material you need and how the writer should send it."
                    : "Add a message for the writer."
                }
                required={requestDetailsRequired}
                value={note}
              />
              <p
                className="text-xs leading-5 text-accent/72"
                id="query-status-note-help"
              >
                Appears in the conversation and is also recorded in query
                history.
              </p>
            </div>
          </div>
          {error ? (
            <p className="text-sm leading-6 text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={mutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <Button
              disabled={
                mutation.isPending ||
                (requestDetailsRequired && note.trim().length === 0)
              }
              onClick={handleConfirm}
              type="button"
              variant="solid"
            >
              {mutation.isPending ? (
                <Spinner data-icon="inline-start" />
              ) : null}
              {selectedStatus === "manuscript_requested"
                ? "Share request"
                : "Confirm update"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
