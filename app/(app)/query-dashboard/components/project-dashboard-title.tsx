"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Pencil, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/app/ui-primitives/button";
import { Input } from "@/app/ui-primitives/input";
import { cn } from "@/app/utils";
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
import { useAgentMatches } from "@/app/(app)/context/agent-matches-context";
import { useProfileContext } from "@/app/(app)/context/profile-context";
import { useQueryDashContext } from "../context/query-dash-context";

export function ProjectDashboardTitle({
  projectName,
}: {
  projectName: string;
}) {
  const {
    dashboardProjectId,
    activeWriterProjectId,
    deleteActiveProject,
    isDeletingProject,
  } = useQueryDashContext();
  const { updateProject } = useProfileContext();
  const matches = useAgentMatches();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [name, setName] = useState(projectName);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const editButtonRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef(false);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  useEffect(() => {
    if (!isEditing && !isSaving && restoreFocusRef.current) {
      editButtonRef.current?.focus();
      restoreFocusRef.current = false;
    }
  }, [isEditing, isSaving]);

  function finishEditing() {
    restoreFocusRef.current = true;
    setIsEditing(false);
    setError("");
  }

  async function rename() {
    if (isSaving) return;
    if (!name.trim()) {
      setError("Enter a project name.");
      inputRef.current?.focus();
      return;
    }
    if (name.trim() === projectName) {
      finishEditing();
      return;
    }
    setIsSaving(true);
    setError("");
    try {
      const response = await fetch(
        `/api/dashboard-projects/${dashboardProjectId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectName: name.trim() }),
        },
      );
      const body = await response.json();
      if (!response.ok)
        throw new Error(body.error || "Unable to rename project.");
      await updateProject(body.project);
      const savedForm = matches.formData;
      const savedProject = savedForm?.save_project;
      if (
        savedForm &&
        dashboardProjectId &&
        (savedProject?.dashboardProjectId === dashboardProjectId ||
          (!savedProject?.dashboardProjectId &&
            matches.writerProjectId === activeWriterProjectId &&
            matches.projectName === projectName))
      ) {
        matches.saveProjectName(body.project.project_name);
        matches.saveFormData({
          ...savedForm,
          project_name: body.project.project_name,
          save_project: {
            dashboardProjectId,
            writerProjectId: body.project.writer_project_id,
            projectName: body.project.project_name,
          },
        });
      }
      finishEditing();
      toast.success("Project renamed.");
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to rename project.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <span className="relative flex min-w-0 items-center gap-1">
      <span className="relative min-w-0" data-invalid={Boolean(error)}>
        <span
          aria-hidden={isEditing}
          title={projectName}
          className={cn(
            "block truncate border border-transparent px-1.5 transition-opacity duration-200 ease-in-out motion-reduce:transition-none",
            isEditing ? "opacity-0" : "opacity-100",
          )}
        >
          {projectName || "Query Dashboard"}
        </span>
        {dashboardProjectId && (
          <Input
            ref={inputRef}
            id="dashboard-project-name"
            aria-label="Project name"
            className={cn(
              "absolute inset-0 h-full rounded-md border-accent bg-white px-1.5 py-0 shadow-none transition-opacity duration-200 ease-in-out focus-visible:border-accent focus-visible:ring-0 motion-reduce:transition-none",
              isEditing ? "opacity-100" : "pointer-events-none opacity-0",
            )}
            style={{ font: "inherit", letterSpacing: "inherit" }}
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setError("");
            }}
            onKeyDown={(event) => {
              if (event.nativeEvent.isComposing) return;
              if (event.key === "Enter") {
                event.preventDefault();
                void rename();
              } else if (event.key === "Escape" && !isSaving) {
                event.preventDefault();
                finishEditing();
              }
            }}
            maxLength={120}
            required
            inert={!isEditing}
            tabIndex={isEditing ? 0 : -1}
            readOnly={isSaving}
            aria-hidden={!isEditing}
            aria-busy={isSaving}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "project-name-error" : "project-name-help"}
          />
        )}
      </span>
      {dashboardProjectId && (
        <>
          <span id="project-name-help" className="sr-only">
            Press Enter to save or Escape to cancel.
          </span>
          <Button
            ref={editButtonRef}
            type="button"
            variant="ghost"
            size="icon"
            className="relative hover:bg-accent/10 focus-visible:bg-accent/10 motion-reduce:transition-none"
            aria-label={isEditing ? "Save project name" : "Rename project"}
            title={isEditing ? "Save project name" : "Rename project"}
            disabled={isSaving || isDeletingProject}
            onClick={() => {
              if (isEditing) {
                void rename();
              } else {
                setName(projectName);
                setError("");
                setIsEditing(true);
              }
            }}
          >
            <span
              aria-hidden="true"
              className={cn(
                "absolute transition-opacity duration-200 motion-reduce:transition-none",
                isEditing ? "opacity-0" : "opacity-100",
              )}
            >
              <Pencil />
            </span>
            <span
              aria-hidden="true"
              className={cn(
                "absolute transition-opacity duration-200 motion-reduce:transition-none",
                isEditing ? "opacity-100" : "opacity-0",
              )}
            >
              <Check />
            </span>
          </Button>
          <AlertDialog
            open={isConfirmingDelete}
            onOpenChange={(open) => {
              if (!isDeletingProject && !isEditing) setIsConfirmingDelete(open);
            }}
          >
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-accent/10 focus-visible:bg-accent/10 motion-reduce:transition-none"
                aria-label={isEditing ? "Cancel rename" : "Delete project"}
                title={isEditing ? "Cancel rename" : "Delete project"}
                disabled={isSaving || isDeletingProject}
                onClick={(event) => {
                  if (isEditing) {
                    event.preventDefault();
                    finishEditing();
                  }
                }}
              >
                <X />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this project?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete &quot;{projectName}&quot; and
                  all agents associated with it? This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeletingProject}>
                  Cancel
                </AlertDialogCancel>
                <Button
                  variant="destructive"
                  disabled={isDeletingProject}
                  onClick={async () => {
                    if (await deleteActiveProject())
                      setIsConfirmingDelete(false);
                  }}
                >
                  {isDeletingProject
                    ? "Deleting..."
                    : "Delete project and agents"}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          {error && (
            <span
              id="project-name-error"
              role="alert"
              className="absolute top-full left-1.5 mt-1 font-sans text-sm font-normal text-destructive"
            >
              {error}
            </span>
          )}
        </>
      )}
    </span>
  );
}
