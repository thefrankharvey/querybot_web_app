"use client";

import { useState } from "react";
import { Pencil, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/app/ui-primitives/button";
import { Input } from "@/app/ui-primitives/input";
import { Field, FieldLabel } from "@/app/ui-primitives/field";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/app/ui-primitives/dialog";
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

  async function rename(event: React.FormEvent) {
    event.preventDefault();
    if (isSaving || !name.trim()) return;
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
      setIsEditing(false);
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
    <span className="flex min-w-0 items-center gap-1">
      <span className="min-w-0 break-words">
        {projectName || "Query Dashboard"}
      </span>
      {dashboardProjectId && (
        <>
          <Dialog
            open={isEditing}
            onOpenChange={(open) => {
              if (isSaving) return;
              setIsEditing(open);
              if (open) {
                setName(projectName);
                setError("");
              }
            }}
          >
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Rename project"
                title="Rename project"
              >
                <Pencil />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Rename project</DialogTitle>
                <DialogDescription>
                  Update the name everywhere this project appears.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={rename} className="flex flex-col gap-4">
                <Field data-invalid={Boolean(error)}>
                  <FieldLabel htmlFor="dashboard-project-name">
                    Project name
                  </FieldLabel>
                  <Input
                    id="dashboard-project-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    maxLength={120}
                    required
                    autoFocus
                    disabled={isSaving}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? "project-name-error" : undefined}
                  />
                  {error && (
                    <p
                      id="project-name-error"
                      role="alert"
                      className="text-sm text-destructive"
                    >
                      {error}
                    </p>
                  )}
                </Field>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSaving}
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSaving || !name.trim()}>
                    {isSaving ? "Saving..." : "Save name"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <AlertDialog
            open={isConfirmingDelete}
            onOpenChange={(open) => {
              if (!isDeletingProject) setIsConfirmingDelete(open);
            }}
          >
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Delete project"
                title="Delete project"
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
        </>
      )}
    </span>
  );
}
