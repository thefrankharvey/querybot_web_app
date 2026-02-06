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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/ui-primitives/select";
import { StarRating } from "@/app/components/star-rating";
import CopyToClipboard from "@/app/components/copy-to-clipboard";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { urlFormatter, formatEmail } from "@/app/utils";
import { KanbanCardData, FitRating, FIT_RATING_CONFIG } from "./kanban-card";
import { Button } from "@/app/ui-primitives/button";

interface KanbanDialogProps {
  card: KanbanCardData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTogglePrepQuery: (cardId: string) => void;
  onFitRatingChange: (cardId: string, rating: FitRating) => void;
}

export function KanbanDialog({
  card,
  open,
  onOpenChange,
  onTogglePrepQuery,
  onFitRatingChange,
}: KanbanDialogProps) {
  const [notes, setNotes] = useState("");

  if (!card) return null;

  const emails = formatEmail(card.email);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl bg-white">
        {/* Header Section */}
        <DialogHeader>
          <div className="flex gap-2 justify-between mt-6">
            <div className="flex flex-col gap-1">
              <DialogTitle className="text-xl capitalize">{card.name}</DialogTitle>
              <DialogDescription className="text-base">
                {card.agency}
              </DialogDescription>
            </div>
            {/* Match Score Section */}
            {card.match_score != null && (
              <div className="flex flex-col gap-1">
                <label className="text-sm text-right font-semibold text-gray-700">
                  Match Score
                </label>
                <div className="flex items-center gap-2">
                  <StarRating rateNum={card.match_score} />
                  <span className="text-sm font-medium text-gray-600">
                    {card.match_score}
                  </span>
                </div>
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2">
            {/* Fit Rating Section */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">
                Fit Rating
              </label>
              <Select
                value={card.fitRating}
                onValueChange={(value: FitRating) =>
                  onFitRatingChange(card.id, value)
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(FIT_RATING_CONFIG) as FitRating[]).map((key) => (
                    <SelectItem key={key} value={key}>
                      <span className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: FIT_RATING_CONFIG[key].color }}
                        />
                        {FIT_RATING_CONFIG[key].label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Query Letter Ready Checkbox */}
            <div className="flex items-start gap-3" onClick={() => onTogglePrepQuery(card.id)}>
              <Checkbox
                id="prep-query-checkbox"
                className="data-[state=checked]:bg-blue-accent data-[state=checked]:border-blue-accent data-[state=checked]:text-white cursor-pointer"
                checked={card.prepQueryLetterDone}
                onCheckedChange={() => onTogglePrepQuery(card.id)}
              />
              <label
                htmlFor="prep-query-checkbox"
                className="text-sm font-medium cursor-pointer"
              >
                Query Letter Ready
              </label>
            </div>
          </div>

          {/* Preferred Contact Method - hardcoded for now */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">
              Preferred Contact Method
            </label>
            <span className="text-sm text-gray-600">Query via email</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {card.query_tracker && urlFormatter(card.query_tracker) && (
              <Button
                className="text-sm shadow-lg hover:shadow-xl w-fit"
                onClick={() => {
                  window.open(urlFormatter(card.query_tracker) || "", "_blank");
                }}
              >
                Query Tracker
                <ExternalLink className="w-4 h-4" />
              </Button>
            )}
            {card.pub_marketplace && urlFormatter(card.pub_marketplace) && (
              <Button
                className="text-sm shadow-lg hover:shadow-xl w-fit"
                onClick={() => {
                  window.open(urlFormatter(card.pub_marketplace) || "", "_blank");
                }}
              >
                PubMarketplace
                <ExternalLink className="w-4 h-4" />
              </Button>
            )}
            {card.index_id && (
              <Link
                href={`/query-dashboard/${card.index_id}`}
              >
                <Button
                  className="text-sm shadow-lg hover:shadow-xl w-fit"
                >
                  Agent Profile
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </Link>
            )}
            {card.agency_url && urlFormatter(card.agency_url) && (
              <Button
                className="text-sm shadow-lg hover:shadow-xl w-fit"
                onClick={() => {
                  window.open(urlFormatter(card.agency_url) || "", "_blank");
                }}
              >
                Agency Website
                <ExternalLink className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">Email</label>
            {emails && emails.length > 0 && (
              <div className="flex flex-col gap-1">
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
