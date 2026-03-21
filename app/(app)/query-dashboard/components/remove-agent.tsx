"use client";

import { Trash } from "lucide-react";
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
import { Button } from "@/app/ui-primitives/button";
import { Spinner } from "@/app/ui-primitives/spinner";
import { useDeleteAgentMatch } from "@/app/hooks/use-delete-agent";
import { useProfileContext } from "@/app/(app)/context/profile-context";

interface RemoveAgentProps {
  indexId?: string | null;
  onRemoved?: (deletedAgentId: string) => void;
  label?: string;
  description?: string;
  buttonClassName?: string;
}

export function RemoveAgent({
  indexId,
  onRemoved,
  label = "Remove Agent",
  description = "This will remove the agent from your query dashboard.",
  buttonClassName,
}: RemoveAgentProps) {
  const { removeAgent } = useProfileContext();
  const { mutate: deleteAgentMatch, isPending: isDeleting } =
    useDeleteAgentMatch({
      onSuccess: (deletedAgentId) => {
        removeAgent(deletedAgentId);
        onRemoved?.(deletedAgentId);
      },
    });

  const handleRemoveAgent = () => {
    if (!indexId) return;
    deleteAgentMatch(indexId);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          size="sm"
          variant="secondary"
          className={`text-sm border-1 border-accent shadow-sm ${buttonClassName ?? "w-full"}`}
          disabled={isDeleting || !indexId}
        >
          <div className="flex items-center gap-2 text-accent">
            {isDeleting ? <Spinner className="text-accent" /> : null}
            {label}
            <Trash className="w-2 h-2" />
          </div>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-white hover:bg-gray-100">
            Back
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleRemoveAgent}
            className="text-red-500 border-red-500 border-1 bg-white hover:bg-red-500 hover:text-white"
            disabled={isDeleting || !indexId}
          >
            {isDeleting ? "Removing..." : label}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
