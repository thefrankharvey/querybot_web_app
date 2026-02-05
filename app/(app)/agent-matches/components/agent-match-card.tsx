"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
    cn,
    formatDisplayString,
    formatGenres,
    capitalizeFirstCharacter,
} from "@/app/utils";
import { AgentMatch } from "@/app/(app)/context/agent-matches-context";
import { Skeleton } from "@/app/ui-primitives/skeleton";
import TooltipComponent from "@/app/components/tooltip";
import AnimatedScoreDisplay from "@/app/components/animated-score-display";
import { useProfileContext } from "@/app/(app)/context/profile-context";
import { Heart, Save } from "lucide-react";
import { normalizeAndDedup } from "@/app/utils/string-utils";
import { Button } from "@/app/ui-primitives/button";
import { Spinner } from "@/app/ui-primitives/spinner";
import { SaveAgentPayload } from "@/app/types";
import { COUNTRY_FLAG_LABELS } from "@/app/constants";

export const AgentMatchCard = ({
    agent,
    index,
    id,
    isSubscribed,
    isLoading,
    onSaveAgent,
    savingAgentId,
}: {
    agent: AgentMatch;
    isSubscribed?: boolean;
    index: number;
    id: string;
    isLoading: boolean;
    onSaveAgent?: (payload: SaveAgentPayload) => void;
    savingAgentId?: string | null;
}) => {
    const { agentsList } = useProfileContext();
    const [isHovered, setIsHovered] = useState(false);
    const isDisabled = index > 2 && !isSubscribed;
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

    const isAlreadySaved = agentsList?.some((a) => a.index_id === agent.agent_id);

    const handleSaveClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (onSaveAgent && !isAlreadySaved) {
            const payload: SaveAgentPayload = {
                name: agent.name,
                email: agent.email || null,
                agency: agent.agency || null,
                agency_url: agent.website || null,
                index_id: agent.agent_id || null,
                query_tracker: agent.querytracker || null,
                pub_marketplace: agent.pubmarketplace || null,
                match_score: agent.normalized_score || null,
            };
            onSaveAgent(payload);
        }
    };

    return (
        <div
            id={id}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={cn(
                "bg-white rounded-lg p-4 py-8 md:p-8 w-full shadow-md hover:cursor-pointer",
                isDisabled
                    ? "opacity-60"
                    : "hover:shadow-2xl transition-shadow duration-300",
            )}
        >
            <div className="flex flex-col gap-4">
                <Link
                    href={isDisabled ? "#" : `/agent-matches/${index}`}
                    className="block w-full h-full"
                >
                    <div className="flex flex-col gap-4">
                        <div className="flex justify-between">
                            <Skeleton isLoading={isLoading} className="w-1/2 h-6">
                                <h2 className="text-xl font-bold capitalize">{agent.name}</h2>
                            </Skeleton>
                            {onSaveAgent && (
                                <div>
                                    {!isSubscribed ? (
                                        <TooltipComponent
                                            className="w-full"
                                            contentClass="text-left w-[200px]"
                                            content="Subscribe to activate save agent feature!"
                                        >
                                            <div>
                                                <div className="flex items-center justify-center gap-2">
                                                    <Save className="w-6 h-6" />
                                                </div>
                                            </div>
                                        </TooltipComponent>
                                    ) : (
                                        agentsList && agentsList?.find(
                                            (a) => a.index_id === agent.agent_id,
                                        ) ? (
                                            <Heart className="w-6 h-6 text-accent" />
                                        ) :
                                            (<div onClick={handleSaveClick}>
                                                <TooltipComponent
                                                    className="w-full"
                                                    contentClass="text-left w-[200px]"
                                                    content="Save agent to your query dashboard"
                                                >
                                                    <div className="flex items-center justify-center gap-2">
                                                        {savingAgentId === agent.agent_id ? (
                                                            <Spinner className="w-6 h-6" />
                                                        ) : (
                                                            <Save className="w-6 h-6" />
                                                        )}
                                                    </div>
                                                </TooltipComponent>
                                            </div>)
                                    )}
                                </div>
                            )}
                        </div>
                        <Skeleton isLoading={isLoading} className="w-20 h-6">
                            <div className="flex flex-col items-start gap-1 w-fit">
                                <TooltipComponent
                                    className="text-left"
                                    content="Our 5-star score measures agent fit using your search query data points. Giving you an accurate idea of agent match potential."
                                >
                                    <label className="text-sm font-semibold cursor-pointer">
                                        Match Score:
                                    </label>
                                    <AnimatedScoreDisplay
                                        score={agent.normalized_score}
                                        isHovered={isHovered}
                                    />
                                </TooltipComponent>
                            </div>
                        </Skeleton>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold cursor-pointer">
                            Country:
                        </label>
                        <Skeleton isLoading={isLoading} className="h-6 w-full">
                            <p className="text-sm">
                                {agent.location?.country_code ? (
                                    <>
                                        <span>
                                            {
                                                COUNTRY_FLAG_LABELS[
                                                    agent.location
                                                        ?.country_code as keyof typeof COUNTRY_FLAG_LABELS
                                                ]?.flag
                                            }
                                        </span>
                                        <span className="ml-1">
                                            {
                                                COUNTRY_FLAG_LABELS[
                                                    agent.location
                                                        ?.country_code as keyof typeof COUNTRY_FLAG_LABELS
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
                            <label className="text-sm font-semibold cursor-pointer">
                                Agency:
                            </label>
                            <Skeleton isLoading={isLoading} className="h-[60px] w-full">
                                <div className="flex flex-wrap gap-1">
                                    {dedupedGenreMatches
                                        ? dedupedGenreMatches.map((genre: string) =>
                                            formatGenres(genre)
                                                .slice(0, 8)
                                                .map((genre: string) => (
                                                    <div
                                                        key={genre}
                                                        className="bg-gray-100 px-2 py-1 text-sm rounded-md"
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
                            <label className="text-sm font-semibold cursor-pointer">
                                Top Genres:
                            </label>
                            <Skeleton isLoading={isLoading} className="h-[60px] w-full">
                                <div className="flex flex-wrap gap-1">
                                    {agent.genres
                                        ? formatGenres(agent.genres)
                                            .slice(0, 5)
                                            .map((genre: string) => (
                                                <div
                                                    key={genre}
                                                    className="bg-gray-100 px-2 py-1 text-sm rounded-md"
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
                            <label className="text-sm font-semibold cursor-pointer">
                                Matching Themes:
                            </label>
                            <Skeleton isLoading={isLoading} className="h-[60px] w-full">
                                <div className="flex flex-wrap gap-1">
                                    {dedupedThemeMatches
                                        ? dedupedThemeMatches.slice(0, 8).map((theme: string) => (
                                            <div
                                                key={theme}
                                                className="bg-gray-100 px-2 py-1 text-sm rounded-md"
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
                                <label className="text-sm font-semibold cursor-pointer">
                                    Favorites:
                                </label>
                                <Skeleton isLoading={isLoading} className="h-[60px] w-full">
                                    <p className="text-sm line-clamp-3">
                                        {agent.favorites
                                            ? capitalizeFirstCharacter(
                                                formatDisplayString(agent.favorites)
                                            )
                                            : "Info Unavailable"}
                                    </div>
                                </Skeleton>
                            </div>
                        ) : (
                            agent.favorites && (
                                <div className="flex flex-col gap-1">
                                    <label className="text-sm font-semibold cursor-pointer">
                                        Favorites:
                                    </label>
                                    <Skeleton isLoading={isLoading} className="h-[60px] w-full">
                                        <p className="text-sm line-clamp-3">
                                            {agent.favorites
                                                ? capitalizeFirstCharacter(
                                                    formatDisplayString(agent.favorites),
                                                )
                                                : "Info Unavailable"}
                                        </p>
                                    </Skeleton>
                                </div>
                            )
                        )}
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default AgentMatchCard;
