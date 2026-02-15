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
}

export function RemoveAgent({ indexId, onRemoved }: RemoveAgentProps) {
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
          className="text-sm w-full border-1 border-red-500 shadow-sm"
          disabled={isDeleting || !indexId}
        >
          <div className="flex items-center gap-2 text-red-500">
            {isDeleting ? <Spinner className="text-red-500" /> : null}
            Remove Agent
            <Trash className="w-2 h-2" />
          </div>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove the agent from your query dashboard.
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
            {isDeleting ? "Removing..." : "Remove Agent"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
