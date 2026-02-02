"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/app/ui-primitives/dialog";
import { Checkbox } from "@/app/ui-primitives/checkbox";
import { Textarea } from "@/app/ui-primitives/textarea";
import { StarRating } from "@/app/components/star-rating";
import CopyToClipboard from "@/app/components/copy-to-clipboard";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { urlFormatter, formatEmail } from "@/app/utils";
import { KanbanCardData } from "./kanban-card";

interface KanbanDialogProps {
  card: KanbanCardData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTogglePrepQuery: (cardId: string) => void;
}

export function KanbanDialog({
  card,
  open,
  onOpenChange,
  onTogglePrepQuery,
}: KanbanDialogProps) {
  const [notes, setNotes] = useState("");

  if (!card) return null;

  const emails = formatEmail(card.email);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl bg-white">
        {/* Header Section */}
        <DialogHeader>
          <DialogTitle className="text-xl capitalize">{card.name}</DialogTitle>
          <DialogDescription className="text-base">
            {card.agency}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6">
          {/* Match Score Section */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">
              Match Score
            </label>
            <div className="flex items-center gap-2">
              <StarRating rateNum={card.normalized_score} />
              <span className="text-sm font-medium text-gray-600">
                {card.normalized_score}
              </span>
            </div>
          </div>

          {/* Prep Query Letter Checkbox */}
          <div className="flex items-center gap-3">
            <Checkbox
              id="prep-query-checkbox"
              checked={card.prepQueryLetterDone}
              onCheckedChange={() => onTogglePrepQuery(card.id)}
            />
            <label
              htmlFor="prep-query-checkbox"
              className="text-sm font-medium cursor-pointer"
            >
              Prep Query Letter
            </label>
          </div>

          {/* Preferred Contact Method */}
          {card.status && card.status !== "closed" && (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">
                Preferred Contact Method
              </label>
              <span className="text-sm text-gray-600">{card.status}</span>
            </div>
          )}

          {/* Links Section */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-semibold text-gray-700">Links</label>

            {/* Full Agent Page */}
            {card.agent_id && (
              <Link
                href={`/agent-matches/${card.agent_id}`}
                className="text-sm underline hover:text-accent flex items-center gap-2"
              >
                View Full Agent Profile
                <ExternalLink className="w-4 h-4" />
              </Link>
            )}

            {/* Email */}
            {emails && emails.length > 0 && (
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-500">Email</span>
                <div className="flex flex-wrap gap-2">
                  {emails.map((email, index) => (
                    <CopyToClipboard
                      key={index}
                      text={email}
                      className="text-sm underline"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Query Tracker */}
            {card.querytracker && urlFormatter(card.querytracker) && (
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={urlFormatter(card.querytracker) || ""}
                className="text-sm underline hover:text-accent flex items-center gap-2"
              >
                Query Tracker
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

            {/* Publishers Marketplace */}
            {card.pubmarketplace && urlFormatter(card.pubmarketplace) && (
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={urlFormatter(card.pubmarketplace) || ""}
                className="text-sm underline hover:text-accent flex items-center gap-2"
              >
                Publishers Marketplace
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

            {/* Website/Agency Site */}
            {card.website && urlFormatter(card.website) && (
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={urlFormatter(card.website) || ""}
                className="text-sm underline hover:text-accent flex items-center gap-2"
              >
                Agent Website
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>

          {/* Notes Section */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="agent-notes"
              className="text-sm font-semibold text-gray-700"
            >
              Notes
            </label>
            <Textarea
              id="agent-notes"
              placeholder="Add notes about this agent..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-24"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default KanbanDialog;
