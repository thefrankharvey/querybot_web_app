import { Button } from "@/app/ui-primitives/button";
import { urlFormatter } from "@/app/utils";
import { KanbanCardData } from "./kanban-card";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

interface KanbanLinkButtonsProps {
    card: KanbanCardData;
}

export const KanbanLinkButtons = ({ card }: KanbanLinkButtonsProps) => {
    return (
        <div className="flex gap-3 flex-wrap">
            {card.query_tracker && urlFormatter(card.query_tracker) && (
                <Button
                    size="sm"
                    className="text-xs shadow-lg hover:shadow-xl w-fit"
                    onClick={() => {
                        window.open(urlFormatter(card.query_tracker) || "", "_blank");
                    }}
                >
                    Query Tracker
                    <ExternalLink className="w-2 h-2" />
                </Button>
            )}
            {card.pub_marketplace && urlFormatter(card.pub_marketplace) && (
                <Button
                    size="sm"
                    className="text-xs shadow-lg hover:shadow-xl w-fit"
                    onClick={() => {
                        window.open(urlFormatter(card.pub_marketplace) || "", "_blank");
                    }}
                >
                    PubMarketplace
                    <ExternalLink className="w-2 h-2" />
                </Button>
            )}
            {card.index_id && (
                <Link
                    href={`/query-dashboard/${card.index_id}`}
                >
                    <Button
                        size="sm"
                        className="text-xs shadow-lg hover:shadow-xl w-fit"
                    >
                        Agent Profile
                        <ExternalLink className="w-3 h-3" />
                    </Button>
                </Link>
            )}
            {card.agency_url && urlFormatter(card.agency_url) && (
                <Button
                    size="sm"
                    className="text-xs shadow-lg hover:shadow-xl w-fit"
                    onClick={() => {
                        window.open(urlFormatter(card.agency_url) || "", "_blank");
                    }}
                >
                    Agency Website
                    <ExternalLink className="w-2 h-2" />
                </Button>
            )}
        </div>
    );
};