"use client";

import Link from "next/link";
import { Building2, CalendarClock, ExternalLink } from "lucide-react";

import { AgentWatchButton } from "@/app/components/personalized-radar/agent-watch-button";
import { Badge } from "@/app/ui-primitives/badge";
import { Button } from "@/app/ui-primitives/button";
import { useProfileContext } from "@/app/(writer-app)/context/profile-context";
import type { AgentChangeEvent, RadarEventType } from "@/app/utils/personalized-radar/contracts";

const EVENT_LABELS: Record<RadarEventType, string> = {
  submission_reopened: "Reopened",
  submission_closed: "Closed",
  official_profile_update: "Profile update",
  mswl_or_interest_update: "Interests update",
  agency_change: "Agency change",
};

export function AgentChangeEventCard({ event }: { event: AgentChangeEvent }) {
  const { agentsList } = useProfileContext();
  const savedAgent = agentsList?.find(
    (agent) => agent.index_id && agent.index_id === event.agent.index_id,
  );
  const occurredAt = new Date(event.occurred_at);

  return (
    <article className="glass-panel flex w-full flex-col gap-4 p-5 md:p-7">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge>{EVENT_LABELS[event.event_type]}</Badge>
            <span className="inline-flex items-center gap-1 text-xs text-accent/60">
              <CalendarClock aria-hidden />
              <time dateTime={event.occurred_at} title={occurredAt.toLocaleString()}>
                {occurredAt.toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </time>
            </span>
          </div>
          <h2 className="text-lg font-semibold text-accent">{event.headline}</h2>
          <p className="text-sm font-medium text-accent/76">
            {event.agent.name ?? "Official agent update"}
          </p>
        </div>
        <AgentWatchButton
          agentName={event.agent.name ?? "this agent"}
          compact
          identity={{
            agentProfileId: event.agent.profile_id,
            indexId: event.agent.index_id,
          }}
          originAgentMatchId={savedAgent?.id ?? null}
          originSurface="dispatch"
        />
      </div>
      {event.agent.agency_name ? (
        <p className="inline-flex items-center gap-2 text-sm text-accent/68">
          <Building2 aria-hidden />
          {event.agent.agency_name}
        </p>
      ) : null}
      <p className="text-sm leading-6 text-accent/78">{event.summary}</p>
      <Button asChild className="w-fit" size="sm" variant="secondary">
        <Link href={event.source_url} rel="noreferrer" target="_blank">
          View official source
          <ExternalLink data-icon="inline-end" />
        </Link>
      </Button>
    </article>
  );
}

