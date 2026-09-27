"use client";

import { useRef, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/app/ui-primitives/alert-dialog";
import { useSavedAgencyCheck } from "./agency-history-provider";
import {
  findSavedAgencyMatches,
  type AgencyCandidate,
} from "@/app/utils/query-safety/agency-guard";

export function useAgencySaveConfirmation(candidate: AgencyCandidate) {
  const { index, isChecking } = useSavedAgencyCheck();
  const [open, setOpen] = useState(false);
  const pendingSave = useRef<(() => void) | null>(null);
  const trigger = useRef<HTMLElement | null>(null);

  function requestSave(save: () => void, element: HTMLElement) {
    if (isChecking || pendingSave.current) return;
    if (index && findSavedAgencyMatches(index, candidate).projects.length > 0) {
      pendingSave.current = save;
      trigger.current = element;
      setOpen(true);
    } else {
      // Agency warnings are advisory; an unavailable check does not block saving.
      save();
    }
  }

  const confirmation = (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) pendingSave.current = null;
        setOpen(next);
      }}
    >
      <AlertDialogContent
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          trigger.current?.focus();
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle className="sr-only">Save agent?</AlertDialogTitle>
          <AlertDialogDescription>
            You currently have another agent from this agency saved. Do you want
            to continue?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row justify-end">
          <AlertDialogCancel className="bg-white! hover:bg-gray-100!">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              const save = pendingSave.current;
              pendingSave.current = null;
              setOpen(false);
              save?.();
            }}
          >
            Save Anyway
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return { requestSave, isChecking, confirmation };
}
