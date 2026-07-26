import { Button } from "@/app/ui-primitives/button";
import { urlFormatter } from "@/app/utils";
import type { KanbanCardData } from "./kanban-card";
import { Activity, ExternalLink, FileUp, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSavedAgentComposeMessageHref } from "@/app/(writer-app)/agent-matches/project-scoped-agent-messaging";
import { useMemo } from "react";
import { useAgentMessagingAvailability } from "@/app/hooks/use-agent-messaging-availability";
import { normalizeAgentMessagingId } from "@/app/utils/agent-messaging-availability";
import { getProjectMessageThreadHref } from "@/app/utils/message-routes";
import { isManuscriptUploadVisible } from "@/app/utils/manuscript-attachments";

interface KanbanLinkButtonsProps {
  card: KanbanCardData;
}

export const KanbanLinkButtons = ({ card }: KanbanLinkButtonsProps) => {
  const router = useRouter();
  const agentMessagingIds = useMemo(
    () => (card.index_id ? [card.index_id] : []),
    [card.index_id],
  );
  const { availableAgentIds } =
    useAgentMessagingAvailability(agentMessagingIds);
  const isMessagingAvailable = availableAgentIds.has(
    normalizeAgentMessagingId(card.index_id),
  );
  const messageHref = card.messageThreadId
    ? getProjectMessageThreadHref(
        card.writerProjectId ?? card.projectName,
        card.messageThreadId,
      )
    : getSavedAgentComposeMessageHref({
        indexId: card.index_id,
        projectName: card.projectName,
        writerProjectId: card.writerProjectId,
      });
  const canShareManuscript =
    Boolean(card.messageThreadId && messageHref) &&
    isManuscriptUploadVisible(card.queryProgress?.currentCode);
  const shareManuscriptHref = canShareManuscript
    ? `${messageHref}?shareManuscript=1`
    : null;

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
      {(isMessagingAvailable || card.messageThreadId) && messageHref ? (
        <Button
          size="sm"
          className="text-xs shadow-lg hover:shadow-xl w-fit"
          onClick={() => {
            router.push(messageHref);
          }}
        >
          {card.messageThreadId ? (
            <Activity data-icon="inline-start" />
          ) : (
            <MessageSquare data-icon="inline-start" />
          )}
          {card.messageThreadId ? "View Query" : "Message"}
        </Button>
      ) : null}
      {shareManuscriptHref ? (
        <Button
          className="w-fit text-xs shadow-lg hover:shadow-xl"
          onClick={() => {
            router.push(shareManuscriptHref);
          }}
          size="sm"
        >
          <FileUp data-icon="inline-start" />
          Share manuscript
        </Button>
      ) : null}
      {card.index_id && (
        <Link href={`/query-dashboard/${card.index_id}`}>
          <Button size="sm" className="text-xs shadow-lg hover:shadow-xl w-fit">
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
