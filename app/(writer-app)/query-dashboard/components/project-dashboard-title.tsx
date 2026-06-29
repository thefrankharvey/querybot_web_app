"use client";

import Link from "next/link";
import { FileText } from "lucide-react";

import { Button } from "@/app/ui-primitives/button";
import {
  getProjectProfileHref,
  getProjectProfileHrefById,
} from "@/app/utils/project-profile";

export function ProjectDashboardTitle({
  projectName,
  writerProjectId,
}: {
  projectName: string;
  writerProjectId: string | null;
}) {
  const displayProjectName = projectName || "Query Dashboard";
  const projectProfileHref = writerProjectId
    ? getProjectProfileHrefById(writerProjectId)
    : projectName
      ? getProjectProfileHref(projectName)
      : null;

  return (
    <span className="flex min-w-0 flex-wrap items-center gap-2">
      <span className="min-w-0 break-words">{displayProjectName}</span>
      {projectProfileHref ? (
        <Button asChild className="font-sans" size="sm" variant="outline">
          <Link href={projectProfileHref}>
            <FileText data-icon="inline-start" />
            Project profile
          </Link>
        </Button>
      ) : null}
    </span>
  );
}
