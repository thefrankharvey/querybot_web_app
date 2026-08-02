"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, Settings2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/app/ui-primitives/badge";
import { Button } from "@/app/ui-primitives/button";
import { Checkbox } from "@/app/ui-primitives/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/ui-primitives/popover";
import { Separator } from "@/app/ui-primitives/separator";
import { Spinner } from "@/app/ui-primitives/spinner";
import { Switch } from "@/app/ui-primitives/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/app/ui-primitives/tooltip";
import {
  useAgentWatchState,
  useCreateAgentWatch,
  useDeleteAgentWatch,
  useUpdateAgentWatch,
} from "@/app/hooks/use-agent-watches";
import type {
  AgentIdentityKey,
  RadarEventType,
  RadarOriginSurface,
} from "@/app/utils/personalized-radar/contracts";
import { cn } from "@/app/utils";

const EVENT_OPTIONS: Array<{ value: RadarEventType; label: string }> = [
  { value: "submission_reopened", label: "Reopened to submissions" },
  { value: "submission_closed", label: "Closed to submissions" },
  { value: "mswl_or_interest_update", label: "Interests or MSWL changed" },
  { value: "official_profile_update", label: "Official profile changed" },
  { value: "agency_change", label: "Agency changed" },
];

export function AgentWatchButton({
  agentName,
  className,
  compact = false,
  disabledReason,
  identity,
  originAgentMatchId,
  originSurface,
}: {
  agentName: string;
  className?: string;
  compact?: boolean;
  disabledReason?: string;
  identity: AgentIdentityKey;
  originAgentMatchId: string | null;
  originSurface: RadarOriginSurface;
}) {
  const state = useAgentWatchState(identity);
  const watch = state.watch;
  const [open, setOpen] = useState(false);
  const [selectedEventTypes, setSelectedEventTypes] = useState<RadarEventType[]>(
    ["submission_reopened"],
  );
  const [inAppEnabled, setInAppEnabled] = useState(true);

  useEffect(() => {
    if (!watch) return;
    setSelectedEventTypes(watch.eventTypes);
    setInAppEnabled(watch.inAppEnabled);
  }, [watch]);

  const createWatch = useCreateAgentWatch({
    originSurface,
    onSuccess: () => {
      toast.success("Agent added to Radar", {
        description: "WQH will keep watch for verified reopening updates.",
      });
    },
  });
  const updateWatch = useUpdateAgentWatch({
    originSurface,
    onSuccess: () => toast.success("Radar settings saved"),
  });
  const deleteWatch = useDeleteAgentWatch({
    originSurface,
    onSuccess: () => {
      setOpen(false);
      toast.success("Agent removed from Radar", {
        description: "Past notifications remain in your history.",
      });
    },
  });
  const isPending =
    createWatch.isPending || updateWatch.isPending || deleteWatch.isPending;
  const unavailableReason = disabledReason
    ? disabledReason
    : state.isError
      ? "Radar watch state is unavailable. Try again shortly."
      : null;

  const button = (
    <Button
      aria-label={
        unavailableReason
          ? `${agentName}: ${unavailableReason}`
          : watch
            ? `Manage Radar watch for ${agentName}`
            : `Watch ${agentName} in Radar`
      }
      aria-pressed={Boolean(watch)}
      className={cn(compact && "size-9 px-0", className)}
      disabled={Boolean(unavailableReason) || state.isLoading || isPending}
      onClick={
        watch
          ? undefined
          : (event) => {
              event.preventDefault();
              event.stopPropagation();
              createWatch.mutate({ identity, originAgentMatchId });
            }
      }
      size="sm"
      type="button"
      variant={watch ? "secondary" : "outline"}
    >
      {state.isLoading || isPending ? (
        <Spinner data-icon="inline-start" />
      ) : watch?.status === "muted" ? (
        <BellOff data-icon="inline-start" />
      ) : (
        <Bell data-icon="inline-start" />
      )}
      {compact ? <span className="sr-only">Radar</span> : watch ? "Watching" : "Watch"}
    </Button>
  );

  if (unavailableReason) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex" onClick={(event) => event.stopPropagation()}>
            {button}
          </span>
        </TooltipTrigger>
        <TooltipContent>{unavailableReason}</TooltipContent>
      </Tooltip>
    );
  }

  if (!watch) return button;

  const toggleEventType = (eventType: RadarEventType, checked: boolean) => {
    setSelectedEventTypes((current) => {
      if (checked) return current.includes(eventType) ? current : [...current, eventType];
      if (current.length === 1) return current;
      return current.filter((value) => value !== eventType);
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{button}</PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[min(360px,calc(100vw-24px))]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-semibold text-accent">Radar settings</p>
              <p className="text-sm text-accent/68">
                Choose which verified official changes matter to you.
              </p>
            </div>
            <Badge variant={watch.status === "muted" ? "outline" : "secondary"}>
              {watch.status === "muted" ? "Muted" : "Active"}
            </Badge>
          </div>

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-sm font-semibold text-accent">
              Alert categories
            </legend>
            {EVENT_OPTIONS.map((option) => {
              const entitled =
                state.capabilities?.allowedEventTypes.includes(option.value) ??
                option.value === "submission_reopened";
              const checked = selectedEventTypes.includes(option.value);
              return (
                <label
                  key={option.value}
                  className="flex min-h-8 items-center gap-2 text-sm text-accent"
                >
                  <Checkbox
                    checked={checked}
                    disabled={!entitled || (checked && selectedEventTypes.length === 1)}
                    onCheckedChange={(value) => toggleEventType(option.value, value === true)}
                  />
                  <span className="min-w-0 flex-1">{option.label}</span>
                  {entitled ? null : <Badge variant="outline">Premium</Badge>}
                </label>
              );
            })}
          </fieldset>

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-accent">In-app alerts</p>
              <p className="text-xs text-accent/60">Email remains off in this release.</p>
            </div>
            <Switch
              aria-label="Enable in-app Radar alerts"
              checked={inAppEnabled}
              onCheckedChange={setInAppEnabled}
            />
          </div>

          <Button
            disabled={isPending}
            onClick={() =>
              updateWatch.mutate({
                watchId: watch.id,
                action: "update",
                eventTypes: selectedEventTypes,
                inAppEnabled,
              })
            }
            size="sm"
            type="button"
          >
            <Settings2 data-icon="inline-start" />
            Save settings
          </Button>

          <Separator />

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              className="flex-1"
              disabled={isPending}
              onClick={() =>
                updateWatch.mutate({
                  watchId: watch.id,
                  action: watch.status === "muted" ? "unmute" : "mute",
                })
              }
              size="sm"
              type="button"
              variant="secondary"
            >
              {watch.status === "muted" ? (
                <Bell data-icon="inline-start" />
              ) : (
                <BellOff data-icon="inline-start" />
              )}
              {watch.status === "muted" ? "Unmute" : "Mute"}
            </Button>
            <Button
              className="flex-1"
              disabled={isPending}
              onClick={() => deleteWatch.mutate(watch.id)}
              size="sm"
              type="button"
              variant="outline"
            >
              <Trash2 data-icon="inline-start" />
              Stop watching
            </Button>
          </div>
          <p className="text-xs text-accent/58">
            Stopping a watch prevents new alerts. Past notifications remain in history.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}

