"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useProfileContext } from "@/app/(app)/context/profile-context";
import { Button } from "@/app/ui-primitives/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/app/ui-primitives/card";
import { Spinner } from "@/app/ui-primitives/spinner";

export function CreateProjectCard() {
  const router = useRouter();
  const { updateProject, refetch } = useProfileContext();
  const creationId = useRef<string | null>(null);
  const inFlight = useRef(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  async function create() {
    if (inFlight.current) return;
    inFlight.current = true;
    setCreating(true);
    setError("");
    creationId.current ??= crypto.randomUUID();
    try {
      const response = await fetch("/api/dashboard-projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: creationId.current }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok || !body?.project?.id)
        throw new Error(
          body?.error || "Unable to create your project. Try again.",
        );
      await updateProject(body.project);
      void refetch();
      creationId.current = null;
      router.push(`/projects/${body.project.id}/profile`);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to create your project. Try again.",
      );
      inFlight.current = false;
      setCreating(false);
    }
  }

  return (
    <Card className="min-h-[148px] w-full min-w-0 justify-between">
      <CardHeader>
        <CardTitle>Start a new project</CardTitle>
        <CardDescription>
          Add your manuscript details now or later.
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex-col items-stretch gap-3">
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <Button
          type="button"
          onClick={() => void create()}
          disabled={creating}
          className="w-full sm:w-auto sm:self-start"
        >
          {creating ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <Plus data-icon="inline-start" aria-hidden="true" />
          )}
          {creating ? "Creating project…" : "Create project"}
        </Button>
      </CardFooter>
    </Card>
  );
}
