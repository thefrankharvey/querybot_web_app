"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Check, Pencil, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/app/ui-primitives/alert-dialog";
import { Input } from "@/app/ui-primitives/input";
import { Button } from "@/app/ui-primitives/button";
import { useQueryDashContext } from "../context/query-dash-context";

export function EditableProjectTitle({ projectName }: { projectName: string }) {
  const { renameActiveProject, deleteActiveProject, isDeletingProject } =
    useQueryDashContext();
  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [draft, setDraft] = useState(projectName);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const startEditing = () => {
    setDraft(projectName);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setDraft(projectName);
    setIsEditing(false);
  };

  const saveEditing = async () => {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === projectName) {
      cancelEditing();
      return;
    }
    setIsSaving(true);
    try {
      await renameActiveProject(trimmed);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProject = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const deleted = await deleteActiveProject();
    if (deleted) {
      setDeleteDialogOpen(false);
    }
  };

  if (!isEditing) {
    return (
      <span className="flex items-center gap-2">
        {projectName || "Query Dashboard"}
        {projectName && (
          <>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={startEditing}
              aria-label="Rename project"
              className="size-9 text-accent/60 hover:text-accent"
            >
              <Pencil className="h-5 w-5" />
            </Button>
            <AlertDialog
              open={deleteDialogOpen}
              onOpenChange={(open) => {
                if (!isDeletingProject) {
                  setDeleteDialogOpen(open);
                }
              }}
            >
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Delete project"
                  className="size-9 text-accent/60 hover:text-accent"
                  disabled={isDeletingProject}
                >
                  <X className="h-5 w-5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete project?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete {projectName} and remove all
                    saved agents from this project. This action cannot be
                    undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    className="bg-white hover:bg-gray-100"
                    disabled={isDeletingProject}
                  >
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteProject}
                    className="text-red-500 border-red-500 border-1 bg-white hover:bg-red-500 hover:text-white"
                    disabled={isDeletingProject}
                  >
                    {isDeletingProject ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </span>
    );
  }

  return (
    <span className="flex items-center gap-2">
      <Input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            void saveEditing();
          } else if (e.key === "Escape") {
            e.preventDefault();
            cancelEditing();
          }
        }}
        disabled={isSaving}
        className="h-12 w-auto min-w-[280px] max-w-[480px] font-serif text-xl font-semibold leading-tight text-accent selection:bg-accent selection:text-white md:text-[32px]"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => void saveEditing()}
        disabled={isSaving}
        aria-label="Save project name"
        className="size-9 text-accent/60 hover:text-accent"
      >
        <Check className="h-5 w-5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={cancelEditing}
        disabled={isSaving}
        aria-label="Cancel rename"
        className="size-9 text-accent/60 hover:text-accent"
      >
        <X className="h-5 w-5" />
      </Button>
    </span>
  );
}
