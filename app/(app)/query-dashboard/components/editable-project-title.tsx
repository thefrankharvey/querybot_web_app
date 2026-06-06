"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Pencil, X } from "lucide-react";
import { Input } from "@/app/ui-primitives/input";
import { Button } from "@/app/ui-primitives/button";
import { useQueryDashContext } from "../context/query-dash-context";

export function EditableProjectTitle({ projectName }: { projectName: string }) {
  const { renameActiveProject } = useQueryDashContext();
  const [isEditing, setIsEditing] = useState(false);
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

  if (!isEditing) {
    return (
      <span className="flex items-center gap-2">
        {projectName || "Query Dashboard"}
        {projectName && (
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
        className="h-12 w-auto min-w-[280px] max-w-[480px] font-serif text-xl font-semibold leading-tight text-accent selection:bg-accent/15 selection:text-accent md:text-[32px]"
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
