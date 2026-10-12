"use client";

import { useState, type MouseEvent } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useProfileContext } from "@/app/(app)/context/profile-context";
import { Button } from "@/app/ui-primitives/button";
import { Spinner } from "@/app/ui-primitives/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/app/ui-primitives/tooltip";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/app/ui-primitives/popover";
import { FREE_SAVED_AGENT_LIMIT_MESSAGE } from "@/app/utils/saved-agent-limit";

export function AgentSaveButton({
  onSave,
  label = "Save Agent",
  description = "Save agent to your dashboard",
  iconOnly = false,
  disabled = false,
  saving = false,
  agentId,
}: {
  onSave: (event: MouseEvent<HTMLButtonElement>) => void;
  label?: string;
  description?: string;
  iconOnly?: boolean;
  disabled?: boolean;
  saving?: boolean;
  agentId?: string | null;
}) {
  const {
    isFreeSaveLimitReached,
    limitRejectedAgentId,
    isLoading,
    isError,
    agentsList,
  } = useProfileContext();
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [dismissedRejection, setDismissedRejection] = useState<string | null>(null);
  const wasRejected = Boolean(
    agentId &&
      limitRejectedAgentId === agentId &&
      dismissedRejection !== agentId,
  );
  const showLimit = (isFreeSaveLimitReached && pinned) || wasRejected;

  return (
    <Popover
      open={showLimit}
      onOpenChange={(open) => {
        setPinned(open);
        if (!open) setDismissedRejection(limitRejectedAgentId);
      }}
    >
      <Tooltip open={!showLimit && hovered} onOpenChange={setHovered}>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant={
                isFreeSaveLimitReached
                  ? "unavailable"
                  : iconOnly
                    ? "ghost"
                    : "default"
              }
              size={iconOnly ? "icon" : "default"}
              aria-label={label}
              aria-disabled={isFreeSaveLimitReached || undefined}
              disabled={disabled || saving || isLoading || isError || !agentsList}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                if (isFreeSaveLimitReached) {
                  setHovered(false);
                  setPinned(true);
                  return;
                }
                setDismissedRejection(null);
                onSave(event);
              }}
            >
              {saving ? (
                <Spinner className={iconOnly ? "size-7" : undefined} />
              ) : (
                <Heart
                  aria-hidden="true"
                  data-icon="inline-start"
                  className={iconOnly ? "size-7" : undefined}
                />
              )}
              {!iconOnly && <span>{label}</span>}
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          align="end"
          sideOffset={8}
          className="max-w-[calc(100vw-2rem)] w-72 p-4 text-sm leading-relaxed text-left motion-reduce:animate-none"
        >
          {isFreeSaveLimitReached ? FREE_SAVED_AGENT_LIMIT_MESSAGE : description}
        </TooltipContent>
      </Tooltip>
      <PopoverContent
        surface="solid"
        side="bottom"
        align="end"
        sideOffset={8}
        className="max-w-[calc(100vw-2rem)] text-sm leading-relaxed motion-reduce:animate-none"
        aria-label="Free saved agent limit"
        onCloseAutoFocus={() => {
          setHovered(false);
        }}
        onClick={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
      >
        You&apos;ve reached your limit of free saved agents.{" "}
        <Link
          href="/subscribe"
          className="font-medium underline underline-offset-4 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Subscribe for unlimited.
        </Link>
      </PopoverContent>
    </Popover>
  );
}
