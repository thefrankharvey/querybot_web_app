"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BellRing, ExternalLink, Settings2 } from "lucide-react";
import { toast } from "sonner";

import { useProfileContext } from "@/app/(writer-app)/context/profile-context";
import { AgentWatchButton } from "@/app/components/personalized-radar/agent-watch-button";
import { Alert, AlertDescription, AlertTitle } from "@/app/ui-primitives/alert";
import { Badge } from "@/app/ui-primitives/badge";
import { Button } from "@/app/ui-primitives/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/app/ui-primitives/select";
import { Spinner } from "@/app/ui-primitives/spinner";
import { Switch } from "@/app/ui-primitives/switch";
import {
  AgentWatchLookupProvider,
  useAgentWatches,
} from "@/app/hooks/use-agent-watches";
import {
  useRadarPreferences,
  useUpdateRadarPreferences,
} from "@/app/hooks/use-radar-preferences";
import type { NotificationPreferences } from "@/app/utils/personalized-radar/preferences";

const TIMEZONE_OPTIONS = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Australia/Sydney",
  "UTC",
] as const;

export function RadarSettings() {
  const { agentsList } = useProfileContext();
  const watches = useAgentWatches();
  const preferences = useRadarPreferences();
  const updatePreferences = useUpdateRadarPreferences();
  const [draft, setDraft] = useState<NotificationPreferences | null>(null);

  useEffect(() => {
    if (preferences.data?.preferences) setDraft(preferences.data.preferences);
  }, [preferences.data?.preferences]);

  const watchItems = useMemo(
    () =>
      (watches.data?.watches ?? []).map((watch) => ({
        watch,
        savedAgent: agentsList?.find(
          (agent) => watch.indexId && agent.index_id === watch.indexId,
        ),
      })),
    [agentsList, watches.data?.watches],
  );
  const identities = useMemo(
    () =>
      watchItems.map(({ watch }) => ({
        agentProfileId: watch.agentProfileId,
        indexId: watch.indexId,
      })),
    [watchItems],
  );

  if (watches.isLoading || preferences.isLoading || !draft) {
    return (
      <div className="flex min-h-60 items-center justify-center" role="status">
        <Spinner className="size-8" />
        <span className="sr-only">Loading Radar settings</span>
      </div>
    );
  }

  if (watches.isError || preferences.isError) {
    return (
      <Alert role="alert" variant="destructive">
        <AlertTitle>Radar settings could not load</AlertTitle>
        <AlertDescription>Try refreshing this page in a moment.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="glass-panel flex flex-col gap-5 p-5 md:p-7" aria-labelledby="radar-delivery-title">
        <div>
          <h2 className="text-xl font-semibold text-accent" id="radar-delivery-title">
            In-app delivery
          </h2>
          <p className="mt-1 text-sm text-accent/68">
            These controls apply to all Radar watches and Smart Reminder notifications.
          </p>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-accent">Radar alerts</p>
            <p className="text-sm text-accent/62">Create alerts for eligible watched-agent changes.</p>
          </div>
          <Switch
            aria-label="Enable Radar in-app alerts"
            checked={draft.watchInAppEnabled}
            onCheckedChange={(checked) =>
              setDraft((current) => current ? { ...current, watchInAppEnabled: checked } : current)
            }
          />
        </div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-accent">Query reminders</p>
            <p className="text-sm text-accent/62">Keep due Smart Reminders in the same notification center.</p>
          </div>
          <Switch
            aria-label="Enable reminder in-app alerts"
            checked={draft.reminderInAppEnabled}
            onCheckedChange={(checked) =>
              setDraft((current) => current ? { ...current, reminderInAppEnabled: checked } : current)
            }
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-accent" htmlFor="radar-timezone">
            Timezone
          </label>
          <Select
            value={draft.timezone}
            onValueChange={(timezone) =>
              setDraft((current) => current ? { ...current, timezone } : current)
            }
          >
            <SelectTrigger id="radar-timezone" className="w-full sm:w-[280px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Notification timezone</SelectLabel>
                {TIMEZONE_OPTIONS.map((timezone) => (
                  <SelectItem key={timezone} value={timezone}>{timezone}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <Alert variant="muted">
          <AlertTitle>Email digest is not active yet</AlertTitle>
          <AlertDescription>
            Email remains off until the in-app event pipeline passes its reliability gates and a transactional provider is reviewed.
          </AlertDescription>
        </Alert>
        <Button
          className="w-fit"
          disabled={updatePreferences.isPending}
          onClick={() =>
            updatePreferences.mutate(
              { ...draft, digestFrequency: "off", emailEnabled: false },
              {
                onSuccess: ({ preferences: saved }) => {
                  setDraft(saved);
                  toast.success("Notification preferences saved");
                },
              },
            )
          }
          type="button"
        >
          {updatePreferences.isPending ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <Settings2 data-icon="inline-start" />
          )}
          Save preferences
        </Button>
      </section>

      <section className="flex flex-col gap-4" aria-labelledby="radar-watches-title">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-accent" id="radar-watches-title">
              Watched agents
            </h2>
            <p className="mt-1 text-sm text-accent/68">
              {watchItems.length} of {watches.data?.capabilities.maxActiveWatches ?? 0} watches used.
            </p>
          </div>
          <Button asChild size="sm" variant="secondary">
            <Link href="/dispatch?scope=watched">
              Open watched Dispatch
              <ExternalLink data-icon="inline-end" />
            </Link>
          </Button>
        </div>

        {watchItems.length ? (
          <AgentWatchLookupProvider identities={identities}>
            <div className="flex flex-col gap-3">
              {watchItems.map(({ watch, savedAgent }) => (
                <article
                  key={watch.id}
                  className="glass-panel flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold capitalize text-accent">
                        {savedAgent?.name ?? "Agent no longer saved"}
                      </h3>
                      <Badge variant={watch.status === "muted" ? "outline" : "secondary"}>
                        {watch.status === "muted" ? "Muted" : "Active"}
                      </Badge>
                    </div>
                    <p className="text-sm text-accent/62">
                      {savedAgent?.agency ?? `${watch.eventTypes.length} alert categories selected`}
                    </p>
                  </div>
                  <AgentWatchButton
                    agentName={savedAgent?.name ?? "this agent"}
                    identity={{ agentProfileId: watch.agentProfileId, indexId: watch.indexId }}
                    originAgentMatchId={savedAgent?.id ?? watch.originAgentMatchId}
                    originSurface="query_dashboard"
                  />
                </article>
              ))}
            </div>
          </AgentWatchLookupProvider>
        ) : (
          <div className="glass-panel flex min-h-44 flex-col items-center justify-center gap-3 p-6 text-center">
            <BellRing aria-hidden className="size-8 text-accent/58" />
            <p className="font-semibold text-accent">No agents watched yet</p>
            <Button asChild size="sm"><Link href="/smart-match">Find agents</Link></Button>
          </div>
        )}
      </section>
    </div>
  );
}

