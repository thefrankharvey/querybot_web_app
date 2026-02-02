import CopyToClipboard from "@/app/components/copy-to-clipboard";
import TooltipComponent from "@/app/components/tooltip";
import { AgentMatch } from "@/app/(app)/context/agent-matches-context";
import { formatEmail, urlFormatter } from "@/app/utils";
import React from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { FetchAgentResponse } from "../types";
import { COUNTRY_FLAG_LABELS } from "../constants";

const AgentContactDetails = ({
    agent,
    isSubscribed,
}: {
    agent: AgentMatch | FetchAgentResponse["agent"];
    isSubscribed: boolean;
}) => {

    return (
        <div>
            {!isSubscribed ? (
                <div className="flex flex-col gap-2 items-start">
                    <TooltipComponent
                        contentClass="text-center"
                        content="Subscribe to see contact details!"
                    >
                        <h2 className="text-xl font-bold mb-2 text-left">Contact</h2>
                        <div className="flex flex-col gap-2 items-start">
                            <div>
                                <span className="font-semibold">Email:</span> ***************
                            </div>
                            <div>
                                <span className="font-semibold">Query Tracker:</span>{" "}
                                ***************
                            </div>
                            <div>
                                <span className="font-semibold">PubMarketplace:</span>{" "}
                                ***************
                            </div>
                        </div>
                    </TooltipComponent>
                </div>
            ) : (
                <>
                    <h2 className="text-lg font-bold mb-2">Contact</h2>
                    <div className="flex flex-col gap-4 mb-4">
                        {agent.status && agent.status !== "closed" && (
                            <div className="flex flex-col gap-1">
                                <label className="font-semibold">
                                    Preferred Contact Method:
                                </label>
                                <span>{agent.status}</span>
                            </div>
                        )}
                        {agent.email && (
                            <div className="flex flex-col items-start gap-1 w-fit">
                                <label className="font-semibold">Email Address:</label>
                                <div className="flex flex-wrap gap-2 md:gap-4 underline">
                                    {formatEmail(agent.email)?.map((email, index) => {
                                        return <CopyToClipboard key={index} text={email} />;
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col gap-2">
                        {(agent.querymanager ||
                            agent.pubmarketplace ||
                            agent.querytracker) && (
                                <h2 className="text-base font-semibold">Links:</h2>
                            )}
                        {agent.querymanager && (
                            <a
                                target="_blank"
                                rel="noopener noreferrer"
                                href={urlFormatter(agent.querymanager) || ""}
                                className="underline hover:text-accent flex items-center gap-2"
                            >
                                Query Manager
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        )}
                        {agent.pubmarketplace && (
                            <a
                                target="_blank"
                                rel="noopener noreferrer"
                                href={urlFormatter(agent.pubmarketplace) || ""}
                                className="underline hover:text-accent flex items-center gap-2"
                            >
                                PubMarketplace
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        )}
                        {agent.querytracker && (
                            <a
                                target="_blank"
                                rel="noopener noreferrer"
                                href={urlFormatter(agent.querytracker) || ""}
                                className="underline hover:text-accent flex items-center gap-2"
                            >
                                Query Tracker
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        )}
                    </div>
                    <div className="flex flex-col items-start gap-1 w-fit mt-4">
                        <label className="text-base font-semibold">Agency:</label>
                        {urlFormatter(agent.website) && isSubscribed ? (
                            <Link
                                href={urlFormatter(agent.website) || ""}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <p className="flex items-center gap-2 text-base leading-relaxed text-gray-800 underline hover:text-accent">
                                    {agent.agency ? agent.agency : "Info Unavailable"}
                                    <ExternalLink className="w-4 h-4" />
                                </p>
                            </Link>
                        ) : (
                            <p className="text-base leading-relaxed text-gray-800">
                                {agent.agency ? agent.agency : "Info Unavailable"}
                            </p>
                        )}
                    </div>
                    <div className="flex flex-col items-start gap-1 w-fit mt-4">
                        <label className="text-base font-semibold">Country:</label>
                        <p className="text-base leading-relaxed text-gray-800">
                            {agent.location?.country_code ? (
                                <>
                                    <span>
                                        {
                                            COUNTRY_FLAG_LABELS[
                                                agent.location
                                                    ?.country_code as keyof typeof COUNTRY_FLAG_LABELS
                                            ]?.flag
                                        }
                                    </span>{" "}
                                    <span>
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
                    </div>
                </>
            )}
        </div>
    );
};

export default AgentContactDetails;
