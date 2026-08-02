"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    cn,
    formatDisplayString,
    formatGenres,
    capitalizeFirstCharacter,
} from "@/app/utils";
import { AgentMatch } from "@/app/(writer-app)/context/agent-matches-context";
import { Skeleton } from "@/app/ui-primitives/skeleton";
import TooltipComponent from "@/app/components/tooltip";
import { useProfileContext } from "@/app/(writer-app)/context/profile-context";
import { Heart, MessageSquare } from "lucide-react";
import { normalizeAndDedup } from "@/app/utils/string-utils";
import { Spinner } from "@/app/ui-primitives/spinner";
import type { SaveAgentPayload } from "@/app/types";
import { ALL_COUNTRY_FLAG_LABELS, DEFAULT_PROJECT_NAME } from "@/app/constants";
import {
    FitRatingBadge,
    getFitRatingFromScore,
} from "@/app/components/fit-rating-badge";
import { Button } from "@/app/ui-primitives/button";
import {
    getSavedAgentForProject,
    getWriterAgentLegacyId,
    mapWriterAgentMatchToSaveAgentPayload,
} from "../project-scoped-agent-messaging";
import type { WriterMessageThread } from "@/app/utils/message-types";
import { getProjectScope } from "@/app/utils/project-scope";
import { createAgencyGuardResult } from "@/app/utils/query-safety/agency-guard";
import {
    AgencyGuardBadge,
    AgencyGuardDetailsDialog,
} from "@/app/components/query-safety/agency-guard";
import { getProjectDashboardHref } from "@/app/utils/project-dashboard-summary";
import { getProjectMessageThreadHref } from "@/app/utils/message-routes";
import { captureQuerySafetyEvent } from "@/app/utils/query-safety/product-analytics.client";
import { QueryRoundSelect } from "@/app/(writer-app)/query-dashboard/components/query-round-control";
import {
    getQueryRoundSelection,
    getQueryRoundState,
    type QueryRoundSelection,
} from "@/app/utils/query-rounds";
import { toast } from "sonner";
import { useQuerySafetyConfig } from "@/app/hooks/use-query-safety-config";
import { AgentWatchButton } from "@/app/components/personalized-radar/agent-watch-button";

export const AgentMatchCard = ({
    agent,
    index,
    id,
    isSubscribed,
    isLoading,
    onSaveAgent,
    savingAgentId,
    onMessageAgent,
    messagingAgentId,
    isMessagingAvailable,
    tourTarget,
    projectName,
    writerProjectId,
    writerThreads = [],
    liveHistoryStatus = "available",
}: {
    agent: AgentMatch;
    isSubscribed?: boolean;
    index: number;
    id: string;
    isLoading: boolean;
    onSaveAgent?: (payload: SaveAgentPayload) => Promise<unknown> | unknown;
    savingAgentId?: string | null;
    onMessageAgent?: (agent: AgentMatch) => Promise<void> | void;
    messagingAgentId?: string | null;
    isMessagingAvailable: boolean;
    tourTarget?: string;
    projectName?: string;
    writerProjectId?: string | null;
    writerThreads?: readonly WriterMessageThread[];
    liveHistoryStatus?: "loading" | "available" | "unavailable";
}) => {
    const { agentsList } = useProfileContext();
    const safetyConfig = useQuerySafetyConfig();
    const agencyHistoryEnabled =
        safetyConfig.data?.features.agencyHistory === true;
    const queryRoundsEnabled =
        safetyConfig.data?.features.queryRounds === true;
    const legacyAgentId = getWriterAgentLegacyId(agent);
    const savedAgent = getSavedAgentForProject(agentsList, {
        legacyAgentId,
        projectName,
        writerProjectId,
    });
    const [queryRoundSelection, setQueryRoundSelection] =
        useState<QueryRoundSelection>("unassigned");
    const [isQueryRoundSaving, setIsQueryRoundSaving] = useState(false);
    const isDisabled = index >= 6 && !isSubscribed;
    const fitRating = getFitRatingFromScore(agent.normalized_score);
    const agentMatchSkeletonClass =
        "border-white/50 bg-[linear-gradient(135deg,rgba(245,249,250,0.92),rgba(224,233,236,0.86))] shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]";
    const genreMatches = [
        ...(agent.match_hits?.direct.genres || []),
        ...(agent.match_hits?.cluster.genres || []),
    ];
    const dedupedGenreMatches = normalizeAndDedup(genreMatches);
    const themeMatches = [
        ...(agent.match_hits?.direct.themes || []),
        ...(agent.match_hits?.cluster.themes || []),
    ];
    const dedupedThemeMatches = normalizeAndDedup(themeMatches);
    const threadsBySavedAgent = useMemo(() => {
        const index = new Map<string, WriterMessageThread>();
        for (const thread of writerThreads) {
            for (const identifier of [
                thread.savedAgentId,
                thread.legacyAgentId,
                thread.indexId,
            ]) {
                if (identifier && !index.has(identifier)) {
                    index.set(identifier, thread);
                }
            }
        }
        return index;
    }, [writerThreads]);
    const agencyGuard = useMemo(() => {
        const scope = getProjectScope({ projectName, writerProjectId });
        const guard = createAgencyGuardResult({
            candidate: {
                agencyId: agent.agency_identity?.agency_id ?? null,
                agencyName:
                    agent.agency_identity?.agency_name ?? agent.agency ?? null,
                agencyUrl:
                    agent.agency_identity?.agency_url ?? agent.website ?? null,
            },
            candidateRecordId: savedAgent?.id,
            history: (agentsList ?? []).map((savedAgent) => {
                const savedScope = getProjectScope({
                    projectName: savedAgent.project_name,
                    writerProjectId: savedAgent.writer_project_id,
                });
                const thread =
                    threadsBySavedAgent.get(savedAgent.id) ??
                    (savedAgent.index_id
                        ? threadsBySavedAgent.get(savedAgent.index_id) ?? null
                        : null);
                return {
                    recordId: savedAgent.id,
                    indexId: savedAgent.index_id,
                    agentName: savedAgent.name,
                    agencyId: savedAgent.agency_id,
                    agencyName: savedAgent.agency,
                    agencyUrl: savedAgent.agency_url,
                    projectName: savedScope.projectName,
                    projectScopeKey: savedScope.key,
                    columnName: savedAgent.column_name,
                    querySentDate: savedAgent.query_sent_date,
                    pagesRequestedDate: savedAgent.pages_requested_date,
                    rejectedDate: savedAgent.rejected_date,
                    offerDate: savedAgent.offer_date,
                    liveStatus: thread?.queryProgress?.currentCode ?? null,
                    liveChangedAt: thread?.queryProgress?.changedAt ?? null,
                    liveSentAt: thread?.queryProgress?.sentAt ?? null,
                    href: thread
                        ? getProjectMessageThreadHref(
                            savedScope.writerProjectId ?? savedScope.projectName,
                            thread.threadId,
                        )
                        : getProjectDashboardHref(
                            savedScope.projectName,
                            savedScope.writerProjectId,
                        ),
                };
            }),
            scopeKey: scope.key,
        });

        return {
            ...guard,
            scope,
            liveDataStatus:
                liveHistoryStatus === "loading"
                    ? ("partial" as const)
                    : liveHistoryStatus === "unavailable"
                        ? ("unavailable" as const)
                        : ("available" as const),
        };
    }, [
        agent.agency,
        agent.agency_identity,
        agent.website,
        agentsList,
        liveHistoryStatus,
        projectName,
        savedAgent?.id,
        threadsBySavedAgent,
        writerProjectId,
    ]);
    useEffect(() => {
        if (!agencyHistoryEnabled || agencyGuard.status === "clear") return;
        const count = agencyGuard.records.length;
        captureQuerySafetyEvent("agency_guard_rendered", {
            warningStatus: agencyGuard.status,
            matchMethod: agencyGuard.agency.matchMethod,
            countBucket:
                count === 0
                    ? "0"
                    : count === 1
                        ? "1"
                        : count <= 5
                            ? "2_5"
                            : "6_plus",
            scope: "same_project",
            originSurface: "agent_card",
        });
    }, [
        agencyGuard.agency.matchMethod,
        agencyGuard.records.length,
        agencyGuard.status,
        agencyHistoryEnabled,
    ]);

    useEffect(() => {
        if (!savedAgent) {
            setQueryRoundSelection("unassigned");
            return;
        }

        setQueryRoundSelection(
            getQueryRoundSelection({
                queryOnHold: savedAgent.query_on_hold === true,
                queryRound: savedAgent.query_round ?? null,
            }),
        );
    }, [savedAgent]);

    const isAlreadySaved = Boolean(savedAgent);
    const savedProjectName =
        savedAgent?.project_name?.trim() || DEFAULT_PROJECT_NAME;
    const currentProjectName = projectName?.trim() || DEFAULT_PROJECT_NAME;
    const detailsHref = isDisabled ? null : `/agent-matches/${index}`;
    const isSavePending = Boolean(legacyAgentId && savingAgentId === legacyAgentId);
    const isMessagePending = Boolean(
        legacyAgentId && messagingAgentId === legacyAgentId
    );
    const isMessageDisabled =
        isDisabled ||
        isLoading ||
        isSavePending ||
        isMessagePending ||
        !isMessagingAvailable ||
        !legacyAgentId ||
        !onMessageAgent;

    const handleSaveClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (onSaveAgent && !isAlreadySaved && !isSavePending) {
            onSaveAgent(mapWriterAgentMatchToSaveAgentPayload(agent));
        }
    };

    const handleMessageClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (!onMessageAgent || isMessageDisabled) return;

        onMessageAgent(agent);
    };

    const handleQueryRoundChange = async (selection: QueryRoundSelection) => {
        if (!savedAgent || isQueryRoundSaving) return;

        const previousSelection = queryRoundSelection;
        const nextState = getQueryRoundState(selection);
        setQueryRoundSelection(selection);
        setIsQueryRoundSaving(true);

        try {
            const response = await fetch(
                `/api/agent-match-records/${encodeURIComponent(savedAgent.id)}`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(nextState),
                },
            );

            if (!response.ok) {
                const payload = (await response.json().catch(() => null)) as
                    | { error?: string }
                    | null;
                throw new Error(payload?.error || "The Query Round could not be saved.");
            }

            captureQuerySafetyEvent("query_round_changed", {
                originSurface: "agent_card",
                roundNumber: nextState.queryRound ?? 0,
                scope: selection,
            });
        } catch (error) {
            setQueryRoundSelection(previousSelection);
            toast.error("Query Round restored", {
                description:
                    error instanceof Error
                        ? error.message
                        : "The update did not sync. Please try again.",
            });
        } finally {
            setIsQueryRoundSaving(false);
        }
    };

    const renderMessageButton = () => (
        <Button
            type="button"
            variant="secondary"
            size="sm"
            className="w-full border-accent/18 text-accent shadow-sm"
            onClick={handleMessageClick}
            disabled={isMessageDisabled}
            aria-label={`Message ${agent.name}`}
        >
            {isMessagePending ? (
                <Spinner className="text-accent" data-icon="inline-start" />
            ) : (
                <MessageSquare data-icon="inline-start" />
            )}
            <span>{isMessagePending ? "Opening..." : "Message"}</span>
        </Button>
    );

    const saveControl = isDisabled ? (
        <TooltipComponent
            className="w-full"
            contentClass="text-center w-[250px]"
            content="Subscribe to save all agent matches!"
        >
            <span className="flex items-center justify-center gap-2">
                <Heart className="h-7 w-7 text-accent" />
            </span>
        </TooltipComponent>
    ) : savedAgent ? (
        <TooltipComponent
            asChild
            className="inline-flex"
            contentClass="text-left w-[220px]"
            content={`Agent saved for ${savedProjectName}`}
        >
            <span tabIndex={0}>
                <Heart className="h-7 w-7 fill-[#1D4A4E] text-[#1D4A4E]" />
            </span>
        </TooltipComponent>
    ) : (
        <TooltipComponent
            asChild
            className="inline-flex"
            contentClass="text-left w-[200px]"
            content={`Save agent to your ${currentProjectName} dashboard`}
        >
            <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-accent transition-colors hover:bg-accent/8 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={handleSaveClick}
                disabled={isSavePending || isLoading}
                aria-label={`Save ${agent.name} to ${currentProjectName}`}
            >
                {isSavePending ? (
                    <Spinner className="h-7 w-7 text-accent" />
                ) : (
                    <Heart className="h-7 w-7 text-accent" />
                )}
            </button>
        </TooltipComponent>
    );

    const detailContent = (
        <div className="flex flex-col gap-4">
            <Skeleton
                isLoading={isLoading}
                className={cn("h-11 w-28", agentMatchSkeletonClass)}
            >
                <TooltipComponent
                    asChild
                    className="flex w-fit flex-col items-start gap-1 text-left"
                    content="We analyze agent profiles against your search to estimate how well each agent matches your needs."
                >
                    <div>
                        <label className="cursor-pointer text-sm font-semibold">
                            Fit Rating:
                        </label>
                        <FitRatingBadge rating={fitRating} variant="agent" />
                    </div>
                </TooltipComponent>
            </Skeleton>
            <Skeleton
                isLoading={isLoading}
                className={cn("h-6 w-1/2", agentMatchSkeletonClass)}
            >
                {agent.status && agent.status !== "closed" ? (
                    <span className="w-fit rounded-full border border-accent bg-accent px-3 py-1 text-xs font-semibold text-white">
                        Open to Submissions
                    </span>
                ) : null}
            </Skeleton>
            <div className="flex flex-col gap-1">
                <label className="cursor-pointer text-sm font-semibold">
                    Agency:
                </label>
                <Skeleton
                    isLoading={isLoading}
                    className={cn("h-6 w-full", agentMatchSkeletonClass)}
                >
                    <p className="text-sm text-accent/78">
                        {agent.agency ? agent.agency : "Info Unavailable"}
                    </p>
                </Skeleton>
            </div>
            <div className="flex flex-col gap-1">
                <label className="cursor-pointer text-sm font-semibold">
                    Country:
                </label>
                <Skeleton
                    isLoading={isLoading}
                    className={cn("h-6 w-full", agentMatchSkeletonClass)}
                >
                    <p className="text-sm text-accent/78">
                        {agent.location?.country_code ? (
                            <>
                                <span>
                                    {
                                        ALL_COUNTRY_FLAG_LABELS[
                                            agent.location
                                                ?.country_code as keyof typeof ALL_COUNTRY_FLAG_LABELS
                                        ]?.flag
                                    }
                                </span>
                                <span className="ml-1">
                                    {
                                        ALL_COUNTRY_FLAG_LABELS[
                                            agent.location
                                                ?.country_code as keyof typeof ALL_COUNTRY_FLAG_LABELS
                                        ]?.label
                                    }
                                </span>
                            </>
                        ) : (
                            "Info Unavailable"
                        )}
                    </p>
                </Skeleton>
            </div>
            {dedupedGenreMatches.length > 0 ? (
                <div className="flex flex-col gap-1">
                    <label className="cursor-pointer text-sm font-semibold">
                        Matching Genres:
                    </label>
                    <Skeleton
                        isLoading={isLoading}
                        className={cn("h-[60px] w-full", agentMatchSkeletonClass)}
                    >
                        <div className="flex flex-wrap gap-1">
                            {dedupedGenreMatches
                                ? dedupedGenreMatches.map((genre: string) =>
                                    formatGenres(genre)
                                        .slice(0, 8)
                                        .map((genre: string) => (
                                            <div
                                                key={genre}
                                                className="surface-tag px-2 py-1 text-sm"
                                            >
                                                {genre}
                                            </div>
                                        ))
                                )
                                : "Info Unavailable"}
                        </div>
                    </Skeleton>
                </div>
            ) : (
                <div className="flex flex-col gap-1">
                    <label className="cursor-pointer text-sm font-semibold">
                        Top Genres:
                    </label>
                    <Skeleton
                        isLoading={isLoading}
                        className={cn("h-[60px] w-full", agentMatchSkeletonClass)}
                    >
                        <div className="flex flex-wrap gap-1">
                            {agent.genres
                                ? formatGenres(agent.genres)
                                    .slice(0, 5)
                                    .map((genre: string) => (
                                        <div
                                            key={genre}
                                            className="surface-tag px-2 py-1 text-sm"
                                        >
                                            {genre}
                                        </div>
                                    ))
                                : "Info Unavailable"}
                        </div>
                    </Skeleton>
                </div>
            )}
            {dedupedThemeMatches && dedupedThemeMatches.length > 0 ? (
                <div className="flex flex-col gap-1">
                    <label className="cursor-pointer text-sm font-semibold">
                        Matching Themes:
                    </label>
                    <Skeleton isLoading={isLoading} className="h-[60px] w-full">
                        <div className="flex flex-wrap gap-1">
                            {dedupedThemeMatches
                                ? dedupedThemeMatches.slice(0, 8).map((theme: string) => (
                                    <div
                                        key={theme}
                                        className="surface-tag px-2 py-1 text-sm"
                                    >
                                        {theme}
                                    </div>
                                ))
                                : "Info Unavailable"}
                        </div>
                    </Skeleton>
                </div>
            ) : (
                agent.favorites && (
                    <div className="flex flex-col gap-1">
                        <label className="cursor-pointer text-sm font-semibold">
                            Favorites:
                        </label>
                        <Skeleton
                            isLoading={isLoading}
                            className={cn("h-[60px] w-full", agentMatchSkeletonClass)}
                        >
                            <p className="line-clamp-3 text-sm text-accent/78">
                                {agent.favorites
                                    ? capitalizeFirstCharacter(
                                        formatDisplayString(agent.favorites)
                                    )
                                    : "Info Unavailable"}
                            </p>
                        </Skeleton>
                    </div>
                )
            )}
        </div>
    );

    return (
        <div
            data-tour-target={tourTarget}
            id={id}
            className={cn(
                "glass-panel flex w-full flex-col p-4 py-8 md:p-8",
                isDisabled
                    ? "opacity-60"
                    : "transition-all duration-300 hover:-translate-y-1 hover:cursor-pointer hover:shadow-[0_28px_72px_rgba(24,44,69,0.14)]"
            )}
        >
            <div className="flex h-full flex-col gap-4">
                <div className="flex items-start justify-between gap-4">
                    <Skeleton
                        isLoading={isLoading}
                        className={cn("h-6 w-1/2", agentMatchSkeletonClass)}
                    >
                        {detailsHref ? (
                            <Link
                                href={detailsHref}
                                className="block min-w-0 text-xl font-bold capitalize text-accent transition-colors hover:text-accent/82"
                            >
                                {agent.name}
                            </Link>
                        ) : (
                            <h2 className="text-xl font-bold capitalize text-accent">
                                {agent.name}
                            </h2>
                        )}
                    </Skeleton>
                    <div className="flex shrink-0 items-center gap-1">
                        <AgentWatchButton
                            agentName={agent.name}
                            compact
                            disabledReason={
                                savedAgent
                                    ? undefined
                                    : "Save this agent before adding them to Radar."
                            }
                            identity={{
                                agentProfileId: null,
                                indexId: legacyAgentId,
                            }}
                            originAgentMatchId={savedAgent?.id ?? null}
                            originSurface="agent_card"
                        />
                        {saveControl}
                    </div>
                </div>
                {agencyHistoryEnabled &&
                (agencyGuard.status !== "clear" ||
                    agencyGuard.liveDataStatus !== "available") ? (
                    <AgencyGuardDetailsDialog
                        guard={agencyGuard}
                        originSurface="agent_card"
                    >
                        <Button
                            className="w-fit"
                            size="sm"
                            type="button"
                            variant="ghost"
                        >
                            <AgencyGuardBadge guard={agencyGuard} />
                        </Button>
                    </AgencyGuardDetailsDialog>
                ) : null}
                {queryRoundsEnabled && savedAgent && !isDisabled ? (
                    <div
                        className="flex flex-col gap-1"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <label
                            className="text-sm font-semibold text-accent"
                            htmlFor={`discovery-query-round-${savedAgent.id}`}
                        >
                            Query Round
                        </label>
                        <QueryRoundSelect
                            disabled={isQueryRoundSaving}
                            id={`discovery-query-round-${savedAgent.id}`}
                            onValueChange={(selection) => {
                                void handleQueryRoundChange(selection);
                            }}
                            {...getQueryRoundState(queryRoundSelection)}
                        />
                        <p className="text-xs text-accent/58">
                            Plans query order without changing fit or query status.
                        </p>
                    </div>
                ) : null}
                {detailsHref ? (
                    <Link
                        href={detailsHref}
                        className="block flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
                        aria-label={`View details for ${agent.name}`}
                    >
                        {detailContent}
                    </Link>
                ) : (
                    <div className="block flex-1">{detailContent}</div>
                )}
                {isMessagingAvailable ? (
                    <div className="pt-2">
                        {isDisabled ? (
                            <TooltipComponent
                                asChild
                                className="block w-full"
                                contentClass="text-center w-[250px]"
                                content="Subscribe to message all agent matches!"
                            >
                                <span tabIndex={0} className="block w-full">
                                    {renderMessageButton()}
                                </span>
                            </TooltipComponent>
                        ) : (
                            renderMessageButton()
                        )}
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default AgentMatchCard;
