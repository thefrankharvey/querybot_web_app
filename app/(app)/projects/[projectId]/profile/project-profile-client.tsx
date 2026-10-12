"use client";

import { DeleteProjectButton } from "@/app/(app)/query-dashboard/components/delete-project-button";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, Pencil, ScanSearch } from "lucide-react";
import { toast } from "sonner";
import { useClerkUser } from "@/app/hooks/use-clerk-user";
import { useProfileContext } from "@/app/(app)/context/profile-context";
import { useUnsavedProjectChanges } from "@/app/hooks/use-unsaved-project-changes";
import { ProjectProfileDetails } from "@/app/components/projects/project-profile-details";
import { ProjectProfileEditor } from "@/app/components/projects/project-profile-editor";
import { Button } from "@/app/ui-primitives/button";
import { Skeleton } from "@/app/ui-primitives/skeleton";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/app/ui-primitives/empty";
import { Alert, AlertTitle, AlertDescription } from "@/app/ui-primitives/alert";
import {
  profileTraits,
  hasProjectProfileTraits,
  type ProjectProfile,
} from "@/app/utils/project-profile";
import type { DashboardProject } from "@/app/types";
import type { RestoredSmartMatchForm } from "@/app/utils/smart-match-restore";

export function ProjectProfileClient({
  project,
}: {
  project: DashboardProject;
}) {
  const { user } = useClerkUser();
  const { refetch: refetchProjects } = useProfileContext();
  const queryClient = useQueryClient();
  const queryKey = ["project-profile", user?.id, project.id];
  const url = `/api/dashboard-projects/${project.id}/profile`;
  const query = useQuery({
    queryKey,
    enabled: Boolean(user?.id),
    retry: 1,
    staleTime: 0,
    queryFn: async () => {
      const response = await fetch(url, { cache: "no-store" });
      const body = await response.json();
      if (!response.ok || !body.profile)
        throw new Error(body.error || "Unable to load project traits.");
      return body.profile as ProjectProfile;
    },
  });
  const isEmpty = query.data
    ? !hasProjectProfileTraits(query.data.form)
    : false;
  const [draft, setDraft] = useState<RestoredSmartMatchForm | null>(null);
  const [revision, setRevision] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [conflict, setConflict] = useState(false);
  const [baseline, setBaseline] = useState("");
  const dirty =
    draft !== null && JSON.stringify(profileTraits(draft)) !== baseline;
  useUnsavedProjectChanges(dirty);

  function edit() {
    if (!query.data) return;
    setDraft(structuredClone(query.data.form));
    setRevision(query.data.revision);
    setBaseline(JSON.stringify(profileTraits(query.data.form)));
    setSaveError("");
    setConflict(false);
  }

  async function save() {
    if (!draft || saving) return;
    setSaving(true);
    setSaveError("");
    setConflict(false);
    try {
      const response = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expected_revision: revision,
          traits: profileTraits(draft),
        }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok || !body?.profile) {
        setConflict(response.status === 409);
        throw new Error(
          body?.error || "Unable to save project traits. Try again.",
        );
      }
      queryClient.setQueryData(queryKey, body.profile as ProjectProfile);
      setDraft(null);
      toast.success("Project traits saved.");
      // Refresh the existing project picker after a legacy link is attached.
      void refetchProjects();
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "Unable to save project traits. Try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function reloadSaved() {
    if (
      dirty &&
      !window.confirm(
        "Discard your draft and load the latest saved project traits?",
      )
    )
      return;
    const result = await query.refetch();
    if (result.data && !result.error) {
      setDraft(structuredClone(result.data.form));
      setRevision(result.data.revision);
      setBaseline(JSON.stringify(profileTraits(result.data.form)));
      setSaveError("");
      setConflict(false);
    } else
      toast.error("Unable to reload project traits. Your draft is still here.");
  }

  return (
    <section
      aria-labelledby="project-profile-heading"
      className="flex w-full flex-col gap-8 rounded-3xl border border-panel-border bg-surface-strong p-5 shadow-sm md:p-8"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex max-w-xl flex-col gap-2">
          <h2
            id="project-profile-heading"
            className="font-serif text-2xl font-semibold text-accent"
          >
            {draft
              ? isEmpty
                ? "Create project profile"
                : "Edit project traits"
              : "Project profile"}
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            These traits will be used the next time you run Smart Match.
          </p>
        </div>
        {!draft && (
          <div className="flex flex-wrap items-center gap-2">
            {query.data && (
              <Button
                variant={isEmpty ? "default" : "outline"}
                size="sm"
                onClick={edit}
              >
                <Pencil data-icon="inline-start" aria-hidden="true" />
                {isEmpty ? "Create Profile" : "Edit traits"}
              </Button>
            )}
            <DeleteProjectButton projectName={project.project_name} />
          </div>
        )}
      </div>
      {saveError && (
        <Alert>
          <AlertTitle>Traits could not be saved</AlertTitle>
          <AlertDescription>{saveError}</AlertDescription>
          {conflict && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="self-start"
              onClick={() => void reloadSaved()}
            >
              Load saved traits
            </Button>
          )}
        </Alert>
      )}
      {draft ? (
        <ProjectProfileEditor
          form={draft}
          setForm={(update) =>
            setDraft((current) =>
              current
                ? typeof update === "function"
                  ? update(current)
                  : update
                : current,
            )
          }
          saving={saving}
          saveLabel={isEmpty ? "Save profile" : "Save changes"}
          onSave={save}
          onCancel={() => {
            if (
              !dirty ||
              window.confirm("Discard your unsaved project trait changes?")
            ) {
              setDraft(null);
              setSaveError("");
            }
          }}
        />
      ) : query.isError ? (
        <Alert>
          <AlertTitle>Project traits could not load</AlertTitle>
          <AlertDescription>{query.error.message}</AlertDescription>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="self-start"
            onClick={() => void query.refetch()}
          >
            Try again
          </Button>
        </Alert>
      ) : query.data ? (
        <>
          {!isEmpty ? (
            <ProjectProfileDetails profile={query.data} />
          ) : (
            <Empty aria-labelledby="empty-profile-title">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <BookOpen aria-hidden="true" />
                </EmptyMedia>
                <EmptyTitle id="empty-profile-title">
                  Your project profile is currently empty
                </EmptyTitle>
                <EmptyDescription>
                  Select Create Profile to add your manuscript details, or run a
                  Smart Match search for this project to populate its traits.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button asChild variant="outline">
                  <Link
                    href={`/smart-match?project=${encodeURIComponent(project.id)}`}
                  >
                    <ScanSearch data-icon="inline-start" aria-hidden="true" />
                    Run Smart Match
                  </Link>
                </Button>
              </EmptyContent>
            </Empty>
          )}
          {query.data.updatedAt && (
            <p className="pt-2 text-xs text-muted-foreground">
              Last saved{" "}
              {new Intl.DateTimeFormat(undefined, {
                dateStyle: "medium",
              }).format(new Date(query.data.updatedAt))}
            </p>
          )}
        </>
      ) : (
        <div
          role="status"
          aria-label="Loading project traits"
          className="flex flex-col gap-6"
        >
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-16 w-full" />
        </div>
      )}
    </section>
  );
}
