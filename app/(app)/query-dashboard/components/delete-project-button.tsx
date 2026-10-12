"use client";

import { useState } from "react";
import { Trash2, X } from "lucide-react";
import { Button } from "@/app/ui-primitives/button";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/app/ui-primitives/alert-dialog";
import { useQueryDashContext } from "../context/query-dash-context";

export function DeleteProjectButton({
  projectName,
  iconOnly = false,
  disabled = false,
}: {
  projectName: string;
  iconOnly?: boolean;
  disabled?: boolean;
}) {
  const { deleteActiveProject, isDeletingProject } = useQueryDashContext();
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!isDeletingProject) {
          setOpen(next);
          setFailed(false);
        }
      }}
    >
      <AlertDialogTrigger asChild>
        <Button
          variant={iconOnly ? "ghost" : "outline"}
          size={iconOnly ? "icon" : "sm"}
          disabled={disabled || isDeletingProject}
          aria-label="Delete project"
          title="Delete project"
        >
          {iconOnly ? (
            <X aria-hidden="true" />
          ) : (
            <>
              <Trash2 data-icon="inline-start" aria-hidden="true" />
              Delete project
            </>
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent aria-busy={isDeletingProject}>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this project?</AlertDialogTitle>
          <AlertDialogDescription className="break-words">
            Deleting &quot;{projectName}&quot; permanently removes its saved
            agents, project traits, Smart Match history, notes, and query
            progress. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {failed && (
          <p role="alert" className="text-sm text-destructive">
            Deletion could not finish. Please try again.
          </p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeletingProject}>
            Cancel
          </AlertDialogCancel>
          <Button
            variant="destructive"
            disabled={isDeletingProject}
            onClick={async () => {
              setFailed(false);
              if (await deleteActiveProject()) setOpen(false);
              else setFailed(true);
            }}
          >
            {isDeletingProject ? "Deleting..." : "Delete project"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
